-- Migration: Create finance tables for persistent financial dashboard data
-- Tables: finance_expenses, finance_approvals, finance_budgets, finance_audit_trail
-- Also: Alter finance_invoices to match the dashboard's ClientInvoice interface

-- ============================================================
-- 1) CREATE or ALTER finance_invoices to match the dashboard data model
-- ============================================================
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

-- Add columns in case the table already existed with a different schema
ALTER TABLE public.finance_invoices
  ADD COLUMN IF NOT EXISTS "invoiceNumber" text,
  ADD COLUMN IF NOT EXISTS client text,
  ADD COLUMN IF NOT EXISTS package text DEFAULT 'Performance Growth Retainer',
  ADD COLUMN IF NOT EXISTS "monthlyServiceFeeZar" numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "clientMediaSpendZar" numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paymentStatus" text DEFAULT 'Awaiting Payment',
  ADD COLUMN IF NOT EXISTS "dueDate" text,
  ADD COLUMN IF NOT EXISTS "verifiedAt" text,
  ADD COLUMN IF NOT EXISTS "verifiedBy" text;

-- Backfill invoiceNumber from invoice_number for existing rows
UPDATE public.finance_invoices
  SET "invoiceNumber" = invoice_number
  WHERE "invoiceNumber" IS NULL AND invoice_number IS NOT NULL;

-- Make columns NOT NULL after backfill (safe: only new inserts enforce)
-- We keep them nullable so existing rows don't break

-- ============================================================
-- 2) CREATE finance_expenses
-- ============================================================
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

-- RLS: Allow authenticated users full access (finance dashboard is role-gated at app level)
ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_expenses_auth_all" ON public.finance_expenses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 3) CREATE finance_approvals
-- ============================================================
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

ALTER TABLE public.finance_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_approvals_auth_all" ON public.finance_approvals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4) CREATE finance_budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  dept text NOT NULL,
  budget numeric(12,2) NOT NULL DEFAULT 0,
  actual numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_budgets_auth_all" ON public.finance_budgets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5) CREATE finance_audit_trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.finance_audit_trail (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  time text NOT NULL,
  actor text NOT NULL,
  action text NOT NULL,
  detail text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.finance_audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_audit_trail_auth_all" ON public.finance_audit_trail
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6) RLS policy for finance_invoices (ensure dashboard can read/write)
-- ============================================================
-- Drop existing if any to avoid conflict, then recreate
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'finance_invoices' AND policyname = 'finance_invoices_auth_all'
  ) THEN
    ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "finance_invoices_auth_all" ON public.finance_invoices
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 7) Update triggers for updated_at on new tables
-- ============================================================
CREATE TRIGGER trig_finance_expenses_update
  BEFORE UPDATE ON public.finance_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trig_finance_approvals_update
  BEFORE UPDATE ON public.finance_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trig_finance_budgets_update
  BEFORE UPDATE ON public.finance_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
