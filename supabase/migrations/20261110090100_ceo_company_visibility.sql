-- CEO company-wide visibility, granted explicitly.
--
-- Before: anyone whose job title was "CEO" (or the ceo@ mailbox) counted as the
-- CEO, and the CEO counted as a full administrator.
-- After: the CEO is whoever holds an explicit 'ceo' row in user_roles. The CEO
-- may READ every department's records but is not an administrator, so approvals,
-- payroll changes, user management and deletions stay with their owners.

CREATE OR REPLACE FUNCTION public.msp_is_ceo(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _uid AND ur.role = 'ceo' AND coalesce(p.is_active, true)
  )
$$;

-- Administrators no longer include the CEO.
CREATE OR REPLACE FUNCTION public.msp_is_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _uid AND coalesce(p.is_active, true) AND (
      p.role_tier = 'root_admin'
      OR lower(p.email) LIKE 'superadmin@%'
      OR lower(p.email) LIKE 'admin@%'
      OR (p.role_tier <> 'manager' AND EXISTS (
            SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'))
    ))
$$;

REVOKE EXECUTE ON FUNCTION public.msp_is_ceo(uuid), public.msp_is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.msp_is_ceo(uuid), public.msp_is_admin(uuid) TO authenticated, service_role;

-- Read-only CEO policies (SELECT only; no insert/update/delete).
DROP POLICY IF EXISTS "leave_select_ceo" ON public.leave_requests;
CREATE POLICY "leave_select_ceo" ON public.leave_requests FOR SELECT TO authenticated
  USING (public.msp_is_ceo(auth.uid()));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'hr_employees','hr_vacancies','hr_applicants','hr_leave','hr_training',
    'hr_attendance','hr_reviews','hr_documents','hr_announcements','hr_letters','hr_audit',
    'hr_integrations','hr_payroll_records','hr_relations','hr_talent','hr_timesheets',
    'finance_invoices','finance_expenses','finance_approvals','finance_budgets','finance_audit_trail'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_ceo_read', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.msp_is_ceo(auth.uid()))',
        t || '_ceo_read', t);
    END IF;
  END LOOP;
END $$;

-- Grant the CEO role to Mavis Muchena's CEO account.
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'ceo'::public.app_role
FROM public.profiles p
WHERE lower(p.email) = 'ceo@mavisstrategicpartners.co.za'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'ceo'
  );
