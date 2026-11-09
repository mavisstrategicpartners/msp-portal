-- =====================================================================
-- MSP PORTAL — ROLE-BASED ACCESS HARDENING
-- =====================================================================
-- REVIEW BEFORE APPLYING. Run in the Supabase SQL editor (or `supabase db
-- push`) after the matching app code is deployed.
--
-- What this does
--   1. Managers stop being database "admins". The old sync_admin_role
--      trigger gave every role_tier = 'manager' account the admin role,
--      which unlocked admin-only data and staff management.
--      -> PREVIEW who loses the auto-granted admin role:
--         SELECT p.email, p.full_name, p.job_title, p.department
--           FROM public.user_roles ur JOIN public.profiles p ON p.id = ur.user_id
--          WHERE ur.role = 'admin' AND p.role_tier = 'manager';
--      Anyone in that list who SHOULD stay an administrator must be set to
--      role_tier = 'root_admin' (Manage Staff -> Superadmin) afterwards.
--   2. Adds role helper functions that mirror src/lib/roles.ts.
--   3. HR (and admins) keep access to leave requests and declarations,
--      which they previously reached only through the admin role.
--   4. Turns on row-level security for the HR tables (including payroll)
--      and sales_deals, which currently have none, so only the owning
--      department and administrators can read or change them.
--   5. Replaces the "every signed-in user can do anything" policies on the
--      finance tables with Finance + CEO/GM + administrators.
--   6. Stops users from changing their own role tier, department, job
--      title or active status (they can still edit name, phone, email).
--
-- Server code that uses the service-role key (staff management, the /api
-- handlers) bypasses these policies by design and is checked in code.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Managers are not administrators
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_admin_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role_tier = 'root_admin' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF TG_OP = 'UPDATE' AND OLD.role_tier = 'root_admin' THEN
    -- Demoted from root admin: remove the admin role it implied.
    DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  RETURN NEW;
END $$;

-- Remove the admin role that the old trigger auto-granted to managers.
DELETE FROM public.user_roles ur
 USING public.profiles p
 WHERE ur.user_id = p.id
   AND ur.role = 'admin'
   AND p.role_tier = 'manager';

-- ---------------------------------------------------------------------
-- 2. Role helpers (mirror src/lib/roles.ts)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.msp_is_ceo(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND (
      lower(p.email) = 'ceo@mavisstrategicpartners.co.za'
      OR lower(coalesce(p.job_title, '')) IN ('ceo', 'chief executive officer')
      OR (lower(coalesce(p.department::text, '')) = 'ceo' AND p.role_tier = 'root_admin')
    ))
$$;

CREATE OR REPLACE FUNCTION public.msp_is_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.msp_is_ceo(_uid) OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND coalesce(p.is_active, true) AND (
      p.role_tier = 'root_admin'
      OR lower(p.email) LIKE 'superadmin@%'
      OR lower(p.email) LIKE 'admin@%'
      OR (p.role_tier <> 'manager' AND EXISTS (
            SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'))
    ))
$$;

CREATE OR REPLACE FUNCTION public.msp_is_gm(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND (
      lower(p.email) = 'general.manager@mavisstrategicpartners.co.za'
      OR lower(coalesce(p.job_title, '')) LIKE '%general manager%'
      OR lower(coalesce(p.job_title, '')) LIKE '%managing director%'
      OR lower(coalesce(p.job_title, '')) IN ('gm', 'md')
    ))
$$;

CREATE OR REPLACE FUNCTION public.msp_is_hr(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND coalesce(p.is_active, true) AND (
      lower(coalesce(p.department::text, '')) LIKE '%human resources%'
      OR lower(coalesce(p.department::text, '')) = 'hr'
      OR lower(coalesce(p.job_title, '')) ~ '\mhr\M'
      OR lower(coalesce(p.job_title, '')) LIKE '%people & culture%'
    ))
$$;

CREATE OR REPLACE FUNCTION public.msp_is_finance(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND coalesce(p.is_active, true) AND (
      lower(p.email) LIKE 'finance%'
      OR lower(coalesce(p.department::text, '')) LIKE '%finance%'
      OR lower(coalesce(p.department::text, '')) LIKE '%accounting%'
      OR lower(coalesce(p.job_title, '')) LIKE '%finance%'
      OR lower(coalesce(p.job_title, '')) LIKE '%accountant%'
      OR lower(coalesce(p.job_title, '')) LIKE '%billing%'
    ))
$$;

CREATE OR REPLACE FUNCTION public.msp_is_sales(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND coalesce(p.is_active, true) AND (
      lower(p.email) LIKE 'sales@%'
      OR lower(coalesce(p.department::text, '')) LIKE '%sales%'
      OR lower(coalesce(p.department::text, '')) LIKE '%business development%'
      OR lower(coalesce(p.job_title, '')) LIKE '%sales%'
      OR lower(coalesce(p.job_title, '')) LIKE '%business development%'
    ))
$$;

REVOKE EXECUTE ON FUNCTION public.msp_is_ceo(uuid), public.msp_is_admin(uuid), public.msp_is_gm(uuid),
  public.msp_is_hr(uuid), public.msp_is_finance(uuid), public.msp_is_sales(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.msp_is_ceo(uuid), public.msp_is_admin(uuid), public.msp_is_gm(uuid),
  public.msp_is_hr(uuid), public.msp_is_finance(uuid), public.msp_is_sales(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------
-- 3. HR keeps access to leave requests and declarations
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "leave_select_hr" ON public.leave_requests;
CREATE POLICY "leave_select_hr" ON public.leave_requests FOR SELECT TO authenticated
  USING (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()));
DROP POLICY IF EXISTS "leave_update_hr" ON public.leave_requests;
CREATE POLICY "leave_update_hr" ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()))
  WITH CHECK (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()));
DROP POLICY IF EXISTS "decl_select_hr" ON public.employee_declarations;
CREATE POLICY "decl_select_hr" ON public.employee_declarations FOR SELECT TO authenticated
  USING (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 4. HR tables (incl. payroll): HR + administrators only
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'hr_employees','hr_vacancies','hr_applicants','hr_leave','hr_learner_leave','hr_training',
    'hr_attendance','hr_reviews','hr_documents','hr_announcements','hr_letters','hr_audit',
    'hr_integrations','hr_payroll_records','hr_relations','hr_talent','hr_timesheets','hr_folder_settings'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_hr_admin_all', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
           USING (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()))
           WITH CHECK (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()))',
        t || '_hr_admin_all', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 5. Finance tables: Finance, CEO, GM and administrators only
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'finance_invoices','finance_expenses','finance_approvals','finance_budgets','finance_audit_trail'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_auth_all', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_finance_access', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
           USING (public.msp_is_finance(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()))
           WITH CHECK (public.msp_is_finance(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()))',
        t || '_finance_access', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 6. Sales deals: Sales, GM and administrators only
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.sales_deals') IS NOT NULL THEN
    ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "sales_deals_sales_access" ON public.sales_deals;
    CREATE POLICY "sales_deals_sales_access" ON public.sales_deals FOR ALL TO authenticated
      USING (public.msp_is_sales(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()))
      WITH CHECK (public.msp_is_sales(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()));
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 7. Users cannot raise their own permissions
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_permissions() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- auth.uid() is NULL for server-side (service-role) admin operations.
  IF auth.uid() IS NULL OR public.msp_is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.role_tier := 'staff';
    RETURN NEW;
  END IF;
  IF NEW.role_tier IS DISTINCT FROM OLD.role_tier
     OR NEW.department IS DISTINCT FROM OLD.department
     OR NEW.job_title IS DISTINCT FROM OLD.job_title
     OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Only administrators can change role, department, job title or account status';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_protect_permissions ON public.profiles;
CREATE TRIGGER profiles_protect_permissions BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_permissions();

COMMIT;
