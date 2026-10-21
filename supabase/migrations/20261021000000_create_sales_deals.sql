-- 2026-10-21 – sales_deals table (live for SalesDashboard)
CREATE TABLE IF NOT EXISTS public.sales_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    stage TEXT NOT NULL,               -- New, Contacted, Qualified, Discovery, Proposal Sent, Won, Lost
    lead_quality TEXT NOT NULL,        -- Hot, Warm, Cold
    estimated_value NUMERIC NOT NULL,
    assigned_salesperson TEXT,
    follow_up_date DATE,
    proposal_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.sales_deals_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sales_deals_timestamp
BEFORE UPDATE ON public.sales_deals
FOR EACH ROW EXECUTE FUNCTION public.sales_deals_set_timestamp();

-- Optional seed data (won't run if table already populated)
INSERT INTO public.sales_deals (business_name, contact_person, stage, lead_quality, estimated_value, assigned_salesperson, follow_up_date, proposal_status, notes)
VALUES
  ('Retail SA', 'Dumisani Khumalo', 'Proposal Sent', 'Hot', 48000, 'Sales Executive', '2026-10-14', 'Sent', 'Requires Meta performance ads + GHL WhatsApp CRM setup.'),
  ('Pretoria Precision Engineering', 'Johan van der Merwe', 'Discovery', 'Warm', 35000, 'Sales Executive', '2026-10-15', 'Draft', 'Discussed custom website redesign and Google Ads lead gen.'),
  ('Zambezi Logistics Group', 'Farai Moyo', 'Won', 'Hot', 60000, 'Sales Executive', '2026-10-10', 'Accepted', 'Contract signed! Handed over to Operations for 2-day onboarding intake.'),
  ('Cape Coastal Hospitality', 'Anika Patel', 'Contacted', 'Warm', 28000, 'Sales Executive', '2026-10-13', 'Draft', 'Inbound lead from Meta ads. Follow-up consultation scheduled.')
ON CONFLICT DO NOTHING;
