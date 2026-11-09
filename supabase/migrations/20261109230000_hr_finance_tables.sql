-- Creates the HR and Finance tables the dashboards read and write.
-- Structure only: no sample rows. Access is restricted from the start:
-- HR tables -> HR + administrators; Finance tables -> Finance, GM/CEO + administrators.

CREATE TABLE IF NOT EXISTS public.hr_employees (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    employment_type TEXT,
    join_date DATE,
    manager TEXT,
    gender TEXT,
    age_band TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_vacancies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT,
    type TEXT,
    location TEXT,
    posted DATE,
    applicants INTEGER DEFAULT 0,
    status TEXT,
    salary TEXT,
    description TEXT,
    requirements JSONB,
    tags JSONB,
    closes DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_applicants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    vacancy TEXT,
    stage TEXT,
    score INTEGER,
    applied DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_leave (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    "from" DATE,
    "to" DATE,
    days INTEGER,
    status TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_training (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    mode TEXT,
    duration TEXT,
    enrolled INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_attendance (
    id TEXT PRIMARY KEY,
    learner_id TEXT,
    learner_name TEXT,
    sponsor TEXT,
    host TEXT,
    mentor TEXT,
    mentor_phone TEXT,
    contact TEXT,
    date DATE,
    status TEXT,
    leave_flags JSONB,
    check_in TEXT,
    check_out TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_reviews (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    period TEXT,
    overall NUMERIC,
    goals_met INTEGER,
    goals_total INTEGER,
    feedback TEXT,
    pip BOOLEAN DEFAULT FALSE,
    promotion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    employee_name TEXT,
    name TEXT,
    type TEXT,
    size INTEGER,
    access TEXT,
    uploaded DATE,
    data_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    posted DATE,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_letters (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    generated DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_audit (
    id TEXT PRIMARY KEY,
    at TEXT,
    actor TEXT,
    action TEXT,
    target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    status TEXT,
    last_sync TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_payroll_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    employee TEXT,
    basic_salary NUMERIC,
    sales_amount NUMERIC,
    sales_percent NUMERIC,
    incentive NUMERIC,
    gift NUMERIC,
    uif NUMERIC,
    loan NUMERIC,
    advance_salary NUMERIC,
    period TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_relations (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    severity TEXT,
    date DATE,
    status TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_talent (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    role TEXT,
    potential TEXT,
    readiness TEXT,
    successor_for TEXT,
    idp_progress INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_timesheets (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    date DATE,
    clock_in TEXT,
    clock_out TEXT,
    projects JSONB,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TABLE IF NOT EXISTS public.finance_invoices (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "invoiceNumber" text,
  client text,
  package text DEFAULT 'Performance Growth Retainer',
  "monthlyServiceFeeZar" numeric(12,2) DEFAULT 0,
  "clientMediaSpendZar" numeric(12,2) DEFAULT 0,
  "paymentStatus" text DEFAULT 'Awaiting Payment',
  "dueDate" text,
  "verifiedAt" text,
  "verifiedBy" text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_expenses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category text NOT NULL DEFAULT 'Operations & Office',
  vendor text NOT NULL,
  "amountZar" numeric(12,2) NOT NULL DEFAULT 0,
  date text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  status text NOT NULL DEFAULT 'Pending Approval' CHECK (status IN ('Paid', 'Pending Approval', 'Scheduled')),
  "approvedBy" text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_approvals (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  department text NOT NULL DEFAULT 'Operations',
  "requestedBy" text NOT NULL,
  "amountZar" numeric(12,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Operational' CHECK (category IN ('Software', 'Contractor', 'Equipment', 'Client Refund', 'Operational')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Declined')),
  date text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  notes text DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  dept text NOT NULL,
  budget numeric(12,2) NOT NULL DEFAULT 0,
  actual numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_audit_trail (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  time text NOT NULL,
  actor text NOT NULL,
  action text NOT NULL,
  detail text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['finance_invoices','finance_expenses','finance_approvals','finance_budgets'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trig_' || t || '_update', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_timestamp()', 'trig_' || t || '_update', t);
  END LOOP;
END $$;

-- HR tables: HR + administrators only
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'hr_employees','hr_vacancies','hr_applicants','hr_leave','hr_training',
    'hr_attendance','hr_reviews','hr_documents','hr_announcements','hr_letters','hr_audit',
    'hr_integrations','hr_payroll_records','hr_relations','hr_talent','hr_timesheets'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_hr_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()))
         WITH CHECK (public.msp_is_hr(auth.uid()) OR public.msp_is_admin(auth.uid()))',
      t || '_hr_admin_all', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
END $$;

-- Finance tables: Finance, GM/CEO and administrators only
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'finance_invoices','finance_expenses','finance_approvals','finance_budgets','finance_audit_trail'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_finance_access', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (public.msp_is_finance(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()))
         WITH CHECK (public.msp_is_finance(auth.uid()) OR public.msp_is_gm(auth.uid()) OR public.msp_is_admin(auth.uid()))',
      t || '_finance_access', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
END $$;
