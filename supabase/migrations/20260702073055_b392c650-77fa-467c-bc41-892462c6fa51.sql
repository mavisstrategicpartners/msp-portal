
-- =========================================================
-- PART 1: ROLE TIERS
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.role_tier AS ENUM ('root_admin','manager','staff','intern');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_tier public.role_tier NOT NULL DEFAULT 'staff';

-- Seed: any existing admin -> manager, then override root admins by email
UPDATE public.profiles p
   SET role_tier = 'manager'
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin');

UPDATE public.profiles
   SET role_tier = 'root_admin'
 WHERE lower(email) IN ('info@kupsintegratedsolutions.co.za', 'sipo@kupsintegratedsolutions.co.za', 'yanga@kupsintegratedsolutions.co.za')
    OR lower(full_name) LIKE '%sipo kupiso%'
    OR lower(full_name) LIKE '%yanga mdede%';

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_role_tier(_user_id uuid)
RETURNS public.role_tier LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role_tier FROM public.profiles WHERE id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.is_root_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role_tier = 'root_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_above(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role_tier IN ('root_admin','manager'))
$$;

-- Keep user_roles in sync so existing admin checks keep working
CREATE OR REPLACE FUNCTION public.sync_admin_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role_tier IN ('root_admin','manager') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_sync_admin_role ON public.profiles;
CREATE TRIGGER profiles_sync_admin_role AFTER INSERT OR UPDATE OF role_tier ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_admin_role();

-- Backfill user_roles for existing managers/root admins
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM public.profiles WHERE role_tier IN ('root_admin','manager')
  ON CONFLICT (user_id, role) DO NOTHING;

-- =========================================================
-- PART 2: NEW DEPARTMENTS
-- =========================================================
ALTER TYPE public.department ADD VALUE IF NOT EXISTS 'Graphics Team';
ALTER TYPE public.department ADD VALUE IF NOT EXISTS 'Marketing Team';
ALTER TYPE public.department ADD VALUE IF NOT EXISTS 'IT Department';

-- =========================================================
-- PART 3: NEW TOOLS (WHM, Domains.co.za)
-- =========================================================
INSERT INTO public.tools (slug, name, category, what_it_is, why_we_use, how_to_use, who_uses, login_url, admin_only, sort_order)
VALUES
  ('whm', 'WHM (WebHost Manager)', 'Admin/Infra',
   'Server-side hosting control panel used to manage client and company web hosting accounts, cPanel users, DNS zones, and SSL.',
   'Central place to provision hosting for new client websites and manage existing accounts.',
   'The WHM login URL is server-specific — save your panel URL in the tool card the first time you use it, then the Open button will jump you straight in.',
   'Root Admins, IT Department', NULL, true, 90),
  ('domains-co-za', 'Domain Shop — domains.co.za', 'Admin/Infra',
   'South African domain registrar we use for buying and managing client and company domains.',
   'One consistent place to register .co.za and international domains, manage renewals, and set nameservers.',
   'Sign in with the shared Kups account, search a domain, buy it, then hand off DNS to WHM or the client''s host.',
   'Root Admins, IT Department', 'https://domains.co.za', true, 91)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category = EXCLUDED.category,
  what_it_is = EXCLUDED.what_it_is, why_we_use = EXCLUDED.why_we_use,
  how_to_use = EXCLUDED.how_to_use, who_uses = EXCLUDED.who_uses,
  login_url = EXCLUDED.login_url, admin_only = EXCLUDED.admin_only;

-- =========================================================
-- PART 4: MONTHLY REPORTS MODULE
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.report_type AS ENUM ('growth_strategy','ads_performance','seo_gbp','website_spec');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM ('draft','internal_review','sent_to_client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  account_manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active_package text,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_read_all_auth" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_write_managers" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.is_manager_or_above(auth.uid()));
CREATE POLICY "clients_update_managers" ON public.clients FOR UPDATE TO authenticated
  USING (public.is_manager_or_above(auth.uid())) WITH CHECK (public.is_manager_or_above(auth.uid()));
CREATE POLICY "clients_delete_root_admin" ON public.clients FOR DELETE TO authenticated
  USING (public.is_root_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  report_type public.report_type NOT NULL,
  title text NOT NULL,
  reporting_month date NOT NULL,
  reporting_period_start date,
  reporting_period_end date,
  prepared_by_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  prepared_by_name text,
  status public.report_status NOT NULL DEFAULT 'draft',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS monthly_reports_client_idx ON public.monthly_reports(client_id, reporting_month DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_reports TO authenticated;
GRANT ALL ON public.monthly_reports TO service_role;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_read_all_auth" ON public.monthly_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports_write_managers" ON public.monthly_reports FOR INSERT TO authenticated
  WITH CHECK (public.is_manager_or_above(auth.uid()));
CREATE POLICY "reports_update_managers" ON public.monthly_reports FOR UPDATE TO authenticated
  USING (public.is_manager_or_above(auth.uid())) WITH CHECK (public.is_manager_or_above(auth.uid()));
CREATE POLICY "reports_delete_root_admin" ON public.monthly_reports FOR DELETE TO authenticated
  USING (public.is_root_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS clients_touch ON public.clients;
CREATE TRIGGER clients_touch BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS reports_touch ON public.monthly_reports;
CREATE TRIGGER reports_touch BEFORE UPDATE ON public.monthly_reports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- PART 5: SEED CLIENTS + REPORTS
-- =========================================================
INSERT INTO public.clients (id, name, industry, active_package, contact_name, contact_email, notes)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Imigidi Authentic African Events', 'Events & Equipment Hire', 'Social Media + Ads', 'Imigidi Team', 'info@imigidi.co.za', 'Equipment hire (B2B) plus authentic African event experiences (B2C).'),
  ('22222222-2222-2222-2222-222222222222', 'Makurung Process Solutions (Pty) Ltd', 'Mining Engineering / EPC', 'SEO + Website Build', 'Makurung Team', 'info@makurung.co.za', 'Mining plant optimisation, mineral processing, EPC solutions, tailings retreatment.')
ON CONFLICT (id) DO NOTHING;

-- Report 1: Imigidi Growth Strategy (May 2026)
INSERT INTO public.monthly_reports (client_id, report_type, title, reporting_month, prepared_by_name, status, data)
VALUES ('11111111-1111-1111-1111-111111111111', 'growth_strategy',
  'Imigidi Growth Strategy: Equipment Hire & Content Audit', '2026-05-01', 'Kups Strategy Team', 'sent_to_client',
  '{
    "prepared_for": "Imigidi Authentic African Events",
    "introduction": "This report reviews Imigidi''s current social and content presence, benchmarks against the equipment-hire market, and lays out a three-phase roadmap to unlock growth across both B2B equipment hire and B2C event experiences.",
    "doing_well": [
      "Strong visual aesthetics and consistent brand palette across posts",
      "Educational ''Did You Know'' post series is performing above baseline engagement",
      "Authentic cultural storytelling that competitors cannot easily replicate"
    ],
    "missing_opportunities": [
      "Zero equipment-hire content — the entire hire inventory is invisible on social",
      "Low posting frequency (~1/day) with a 1.6/10 average engagement score",
      "No dedicated B2B / corporate content stream",
      "Generic captions and hashtag stacks — no keyword-led discoverability"
    ],
    "market_context": "The SA equipment-hire market splits cleanly into B2B (corporate, agencies, planners) and B2C (weddings, private functions, DIY events). Key competitors include MPR Hiring, Tentworx, and Party Hire Hub — all of whom lead with inventory-first content and clear pricing tiers.",
    "roadmap": [
      {"title": "Phase 1 — Inventory Visibility (Weeks 1-4)", "actions": [
        "Launch an ''Inventory Spotlight'' series covering each hire category (tents, decor, sound, tables)",
        "Publish clear pricing tiers and logistics/delivery zones",
        "Shoot behind-the-scenes warehouse content to build trust"]},
      {"title": "Phase 2 — Content Pillars (Weeks 5-12)", "actions": [
        "Monday: Corporate & B2B feature",
        "Wednesday: Equipment Spotlight",
        "Friday: Luxury Social event highlight",
        "Weekend: BTS setup / breakdown reels"]},
      {"title": "Phase 3 — Paid Meta Ads (Month 3+)", "actions": [
        "Equipment-hire lead campaign targeting B2B event planners and agencies",
        "DIY / small-function campaign targeting B2C audiences 25-44",
        "Retarget site + engager audiences with catalogue-style ads"]}
    ],
    "next_steps": [
      "Approve final inventory list with photos and pricing tiers",
      "Book warehouse and setup photo/video shoot",
      "Sign off on the content-mix shift and Phase 1 posting calendar"
    ]
  }'::jsonb);

-- Report 2: Imigidi Ads Performance (April 2026)
INSERT INTO public.monthly_reports (client_id, report_type, title, reporting_month, reporting_period_start, reporting_period_end, prepared_by_name, status, data)
VALUES ('11111111-1111-1111-1111-111111111111', 'ads_performance',
  'Imigidi — Ads Performance Report (April 2026)', '2026-04-01', '2026-04-01','2026-04-30', 'Manus AI', 'sent_to_client',
  '{
    "executive_summary": "April delivered 78 total leads at a blended CPL of R45.49 across two campaigns. The main April Leads campaign performed strongly (R46.56 CPL, 4.89% CTR). Facebook drove 79.6% of impressions and 71% of leads, but Instagram delivered a slightly cheaper cost per action in the small-volume ad sets. Female audiences 25-44 dominated results.",
    "campaigns": [
      {"name": "Imigidi April Leads", "spend": 3492.19, "leads": 75, "cpl": 46.56, "impressions": 61642, "reach": 26185, "clicks": 3017, "ctr": 4.89, "cpm": 56.65},
      {"name": "Imigidi Events (paused)", "spend": 55.51, "leads": 3, "cpl": 18.50, "impressions": 1020, "reach": 812, "clicks": 34, "ctr": 3.33, "cpm": 54.42}
    ],
    "ad_sets": [
      {"name": "April Leads - Copy 2", "spend": 1670.55, "leads": 40, "cpl": 41.76, "impressions": 29020, "ctr": 5.10},
      {"name": "April Leads", "spend": 766.88, "leads": 19, "cpl": 40.36, "impressions": 13502, "ctr": 4.88},
      {"name": "April Leads - Copy 3", "spend": 686.83, "leads": 11, "cpl": 62.44, "impressions": 12180, "ctr": 4.71},
      {"name": "April Leads - Copy", "spend": 367.93, "leads": 5, "cpl": 73.59, "impressions": 6940, "ctr": 4.42}
    ],
    "platform_split": {"facebook_impressions_pct": 79.6, "instagram_impressions_pct": 20.4, "facebook_leads": 53, "instagram_leads": 22, "facebook_cpm": 53.56, "instagram_cpm": 68.74},
    "device_split": [
      {"device": "Android Smartphone", "impressions": 36518, "leads": 48},
      {"device": "iPhone", "impressions": 25060, "leads": 27},
      {"device": "Tablet", "impressions": 64, "leads": 0}
    ],
    "demographics": {
      "gender": [{"label": "Female", "impressions_pct": 89.6, "leads": 68, "cpl": 45.72}, {"label": "Male", "impressions_pct": 10.4, "leads": 7, "cpl": 52.60}],
      "age": [
        {"bracket": "18-24", "leads": 5, "cpl": 31.57},
        {"bracket": "25-34", "leads": 23, "cpl": 42.10},
        {"bracket": "35-44", "leads": 24, "cpl": 46.80},
        {"bracket": "45-54", "leads": 15, "cpl": 78.01},
        {"bracket": "55+", "leads": 8, "cpl": 62.30}
      ]
    },
    "recommendations": "1) Launch a dedicated corporate/B2B campaign next month with new creative angles. 2) Reallocate budget toward 25-44 and 45-54 brackets — highest volume with acceptable CPL. 3) Refresh Instagram creative to close the CPM gap vs Facebook. 4) Support paid with a 4-post/week organic content mix (Corporate / Equipment / Luxury / BTS) to lift retargeting pool quality."
  }'::jsonb);

-- Report 3: Makurung SEO + GBP (April 2026)
INSERT INTO public.monthly_reports (client_id, report_type, title, reporting_month, reporting_period_start, reporting_period_end, prepared_by_name, status, data)
VALUES ('22222222-2222-2222-2222-222222222222', 'seo_gbp',
  'Makurung Process Solutions — SEO & GBP Report (April 2026)', '2026-04-01','2026-04-01','2026-04-30','Kups SEO Team','sent_to_client',
  '{
    "executive_summary": "April was a foundational month: we completed SEO prep, optimised the Google Business Profile, delivered keyword research across four intent groups, ran a manual visibility check, and locked the website SEO structure ready for the developer.",
    "business_overview": "Makurung Process Solutions specialises in mining plant optimisation, mineral processing engineering, EPC mining solutions, tailings retreatment, and plant maintenance / shutdown support across Limpopo and greater SA.",
    "gbp_actions": [
      "Verified business ownership and confirmed NAP consistency",
      "Populated all service categories with correct EPC / mining descriptions",
      "Added 12 project and equipment photos",
      "Wrote optimised business description with primary keywords",
      "Enabled messaging and set service radius"
    ],
    "gbp_metrics": {"total_interactions": 414, "direction_requests": 291, "website_clicks": 109, "phone_calls": 14, "bookings": 0},
    "keywords": {
      "core_industry": ["mining plant optimisation","mineral processing engineering","EPC mining","tailings retreatment","plant maintenance mining"],
      "service_based": ["shutdown support mining","plant commissioning","process plant design","metallurgical services","equipment overhaul mining"],
      "customer_intent": ["mining consultant near me","who does plant optimisation in Limpopo","EPC contractor for mining","tailings dam consultant","plant shutdown company"],
      "location_based": ["mining engineering Limpopo","Polokwane mining services","EPC mining South Africa","tailings services Northern Cape","mining consultant Gauteng"]
    },
    "visibility_check": "Manual SERP check for ''mining plant optimisation Limpopo'' — Makurung appeared on page 1 under the ''Key Players in Limpopo Optimisation'' cluster. No paid competition on the exact phrase.",
    "issues_identified": [
      "No verified Search Console access yet",
      "No live rank tracking in place",
      "Website SEO structure not yet implemented on live site",
      "Booking system not active on GBP",
      "Technical SEO items pending developer execution"
    ],
    "next_actions": {
      "google_business_profile": ["Enable booking system","Weekly photo posts","Solicit 5 new reviews"],
      "website_seo": ["Deploy new page structure","Publish 4 service pillar pages","Add schema markup"],
      "technical_seo": ["Search Console verification","XML sitemap","Fix crawl errors","CWV pass"]
    },
    "final_summary": "Foundation is now in place. May focus: convert the visibility we''ve built on GBP into website traffic and inbound EPC enquiries by shipping the technical SEO work and pillar content."
  }'::jsonb);

-- Report 4: Makurung Website Spec
INSERT INTO public.monthly_reports (client_id, report_type, title, reporting_month, prepared_by_name, status, data)
VALUES ('22222222-2222-2222-2222-222222222222', 'website_spec',
  'Makurung — Website Development Content Spec', '2026-05-01', 'Kups Web Team', 'internal_review',
  '{
    "website_type": "Corporate Mining Engineering + Lead Generation Platform",
    "primary_objective": "Generate qualified EPC and plant-optimisation enquiries while positioning Makurung as the leading mining process solutions provider in Limpopo and greater SA.",
    "navigation": ["Home","About Us","Services","Projects / Case Studies","Industries","Media Centre","Careers / Vacancies","Contact"],
    "pages": [
      {"name": "Home", "h1": "Engineering the Future of Mining in Africa",
       "body": "Company overview, value statement, services preview, featured 40TPH Tailings Retreatment Plant project for Black River Investment, industry focus, why choose us, conversion section, contact summary.",
       "ctas": ["Request a Consultation","View Projects","Download Company Profile"],
       "sections": [
         {"label": "Company Overview", "body": "Makurung Process Solutions is a South African mining engineering firm delivering plant optimisation, mineral processing, and turnkey EPC mining solutions."},
         {"label": "Featured Project", "body": "40TPH Tailings Retreatment Plant delivered for Black River Investment — full EPC scope, on time and to spec."},
         {"label": "Why Choose Us", "body": "Deep in-country experience, EPC end-to-end capability, strong safety record, and a track record on complex tailings and shutdown projects."}
       ]},
      {"name": "About Us", "h1": "Built by Engineers, Trusted by Miners",
       "body": "Team, credentials, safety commitment, and community-impact story.", "ctas": ["Meet the Team"], "sections": []},
      {"name": "Services", "h1": "End-to-End Mining Process Solutions",
       "body": "Plant Optimisation, Mineral Processing Engineering, EPC Mining Solutions, Tailings Retreatment, Plant Maintenance & Shutdown Support.", "ctas": ["Get a Scope Quote"], "sections": []},
      {"name": "Projects / Case Studies", "h1": "Selected Projects",
       "body": "Filterable grid of past project case studies with metrics and outcomes.", "ctas": ["Discuss Your Project"], "sections": []},
      {"name": "Industries", "h1": "Industries We Serve",
       "body": "Gold, Platinum, Chrome, Coal, Diamonds, and Industrial Minerals.", "ctas": [], "sections": []},
      {"name": "Media Centre", "h1": "News, Insights & Downloads",
       "body": "News & Updates, Technical Blog, Annual Reports, Press Releases, Downloads — each article with meta title, meta description, OG image, and schema.",
       "ctas": ["Subscribe to Updates"], "sections": [
         {"label": "News & Updates", "body": "Company and industry news feed."},
         {"label": "Technical Blog", "body": "Long-form engineering insights."},
         {"label": "Annual Reports", "body": "PDF downloads of annual reports."},
         {"label": "Press Releases", "body": "Official press releases."},
         {"label": "Downloads", "body": "Brochures, capability statements, spec sheets."}
       ]},
      {"name": "Careers / Vacancies", "h1": "Build Your Career at Makurung",
       "body": "Landing page copy, filterable job listings (title, location, type, closing date, description, requirements, apply button), online application form (name, contact, CV upload, cover letter, role selector), career info page, careers SEO targets.",
       "ctas": ["Apply Now","Submit Speculative CV"], "sections": []},
      {"name": "Contact", "h1": "Talk to Our Engineering Team",
       "body": "Phone, email, office address, enquiry form, and embedded map.", "ctas": ["Send Enquiry"], "sections": []}
    ],
    "technical_seo": {
      "mobile_responsive": true, "fast_loading": true, "seo_friendly_urls": true,
      "meta_titles_descriptions": true, "internal_linking": true, "schema_markup": true, "image_alt_tags": true
    },
    "url_structure": [
      "/","/about","/services","/services/plant-optimisation","/services/mineral-processing","/services/epc-mining","/services/tailings-retreatment","/services/maintenance-shutdown",
      "/projects","/projects/[slug]","/industries","/media","/media/news","/media/blog","/media/reports","/media/press","/media/downloads",
      "/careers","/careers/[slug]","/contact"
    ]
  }'::jsonb);
