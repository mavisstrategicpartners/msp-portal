-- Migration: Create finance_invoices table
-- File: supabase/migrations/20261020000000_create_finance_invoices.sql
CREATE TABLE public.finance_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  invoice_number text NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  status text NOT NULL CHECK (status IN ('draft','sent','paid','overdue')),
  due_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_finance_invoices_update
  BEFORE UPDATE ON public.finance_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Seed example invoice (optional)
INSERT INTO public.finance_invoices (client_id, invoice_number, amount, status, due_date)
SELECT c.id, 'INV-001', 15000.00, 'sent', (now() + interval '30 days')::date
FROM public.clients c
WHERE c.name ILIKE '%sample%'
LIMIT 1;
