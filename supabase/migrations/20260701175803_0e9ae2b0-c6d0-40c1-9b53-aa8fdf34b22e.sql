
-- 1. TOOLS: add columns + reseed with real login URLs and categories
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS login_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS admin_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- clear existing tool rows so seed order matches prompt B
DELETE FROM public.tools;

INSERT INTO public.tools (slug, name, category, login_url, admin_only, what_it_is, why_we_use, how_to_use, who_uses, sort_order) VALUES
('gohighlevel','GoHighLevel (GHL)','CRM','https://app.gohighlevel.com/',false,
 'All-in-one CRM, pipeline, automation and client-messaging platform.',
 'One brain for every client: leads, follow-ups, bookings, dashboards.',
 'Create a sub-account per client, build pipeline stages, connect lead sources, then wire follow-up automations and reporting.',
 'Ops, CRM, Sales, Delivery', 1),
('meta-business','Meta Business Suite','Ads & Social','https://business.facebook.com/',false,
 'Central hub for Facebook + Instagram Pages, ad accounts and pixels.',
 'Owns the client''s FB/IG business assets and access.',
 'Add client Business, verify domain, share Page + ad account + pixel access, then plan content and ads.',
 'Ops, Social Media, Media Buyers', 2),
('meta-ads','Meta Ads Manager','Ads','https://adsmanager.facebook.com/',false,
 'Meta''s campaign builder for Facebook + Instagram ads.',
 'Where every Meta campaign is launched, tuned and reported on.',
 'Pick objective, build audiences, write 3 ad variations, test pixel, launch, review Day 2 and Day 7.',
 'Media Buyers, Ops', 3),
('google-ads','Google Ads Manager','Ads','https://ads.google.com/',false,
 'Google''s Search, Display, YouTube and Performance Max ads platform.',
 'Captures active-intent search demand for client offers.',
 'Set objective, choose campaign type, load keywords + creative, connect conversion tracking, launch.',
 'Media Buyers, Ops', 4),
('google-analytics','Google Analytics','Analytics','https://analytics.google.com/',false,
 'Website + app traffic and behaviour analytics (GA4).',
 'Source of truth for site sessions, sources and conversions.',
 'Install via GTM, set up conversions, review Acquisition + Engagement + Conversions monthly.',
 'Ops, Delivery, Reporting', 5),
('search-console','Google Search Console','SEO','https://search.google.com/search-console',false,
 'Google''s SEO health console for indexing, coverage and queries.',
 'Confirms that SEO changes are being crawled and improving rankings.',
 'Verify site, submit sitemap, monitor Coverage + Performance monthly, fix indexing errors.',
 'SEO, Delivery', 6),
('tag-manager','Google Tag Manager','Tracking','https://tagmanager.google.com/',false,
 'Container for installing pixels and tracking tags without dev work.',
 'Fast, standard way to deploy Analytics, Meta Pixel and conversion tags.',
 'Create container, install container on site, add tags (GA4, Meta Pixel), test in preview, publish.',
 'Delivery, Media Buyers', 7),
('gmb','Google Business Profile','Local SEO','https://business.google.com/',false,
 'The client''s Google Maps + Search listing.',
 'Biggest local-SEO lever for SME clients — reviews, calls, direction requests.',
 'Verify listing, fill categories/services/photos, post weekly, respond to reviews within 24 hours.',
 'SEO, Social Media, Ops', 8),
('tiktok-ads','TikTok Ads Manager','Ads','https://ads.tiktok.com/',false,
 'TikTok''s campaign builder for in-feed and Spark ads.',
 'Cheap reach + high-intent for younger audiences and creator-led offers.',
 'Set objective, install TikTok Pixel, upload creative variants, target broadly, review at Day 3.',
 'Media Buyers', 9),
('zoho-books','Zoho Books','Finance','https://books.zoho.com/',false,
 'Accounting, invoicing and expense tracker.',
 'Where every invoice, quote and payment is recorded for the company.',
 'Create the client, send invoice/quote, record payment, reconcile monthly.',
 'Admin, Finance', 10),
('slack','Slack','Internal Comms','https://slack.com/signin',false,
 'Internal team messaging and channels.',
 'All internal communication lives here (not WhatsApp).',
 'Use #ops, #sales, #delivery, #alerts channels; DMs only when a channel is not appropriate.',
 'Everyone', 11),
('google-drive','Google Drive','Files','https://drive.google.com/',false,
 'Shared file storage for docs, sheets, contracts and client folders.',
 'Company source of truth for documents and assets.',
 'One folder per client; sub-folders for Contracts, Creative, Reports, Onboarding.',
 'Everyone', 12),
('whatsapp','WhatsApp Business','Client Comms','https://web.whatsapp.com/',false,
 'Primary client-facing chat channel in South Africa.',
 'Clients live on WhatsApp — approvals, quick updates and lead alerts flow here.',
 'Use the company WhatsApp Business number; log important decisions back into GHL notes.',
 'CRM, Ops, Sales', 13),
('canva','Canva','Design','https://www.canva.com/login',false,
 'Design tool for social graphics, decks and quick creative.',
 'Fast, on-brand design for social + ads without a full designer.',
 'Use the Kups brand kit, work inside the client folder, export at platform-recommended sizes.',
 'Social Media, Ops', 14),
('manus','Manus (AI audit & reporting)','AI Reporting','https://manus.im/login',false,
 'AI research and reporting workspace used for audits and client-report drafting.',
 'Speeds up audits, competitor scans and monthly report writing.',
 'Feed brief + client context, generate audit/report draft, sanity-check every figure before sending.',
 'Ops, Delivery, Reporting', 15),
('resend','Resend','Admin/Infra','https://resend.com/login',true,
 'Transactional email delivery service for portal + client-facing emails.',
 'Sends portal invites, notifications and outbound transactional emails.',
 'Manage domains + API keys; do not send marketing emails from here.',
 'Admins only', 16),
('supabase','Portal Backend','Admin/Infra','https://supabase.com/dashboard',true,
 'Database, auth and storage backing this internal portal.',
 'Owns all portal data — users, SOPs, content, audit logs.',
 'Admin-only access. Never share credentials. All schema changes go through code review.',
 'Admins only', 17);

GRANT SELECT ON public.tools TO anon;

-- 2. GLOSSARY: add columns and reseed
ALTER TABLE public.glossary_terms
  ADD COLUMN IF NOT EXISTS full_definition text,
  ADD COLUMN IF NOT EXISTS why_it_matters text,
  ADD COLUMN IF NOT EXISTS how_to_steps text[],
  ADD COLUMN IF NOT EXISTS tool_slug text,
  ADD COLUMN IF NOT EXISTS service_slug text;

DELETE FROM public.glossary_terms;

INSERT INTO public.glossary_terms (term, definition, full_definition, why_it_matters, how_to_steps, tool_slug, service_slug) VALUES
('CRM','Customer Relationship Management system.',
 'A CRM is the central system where every lead, contact and client interaction is stored — pipeline stages, notes, follow-ups, appointments and communication history.',
 'GoHighLevel is our CRM. Every lead a client generates flows into GHL and is worked through their pipeline. If it isn''t in the CRM, it didn''t happen.',
 ARRAY['Open the client sub-account in GHL','Confirm the lead landed in the correct pipeline stage','Log the outreach + response','Set the next follow-up task with a date'],
 'gohighlevel','crm-automation'),
('CPL','Cost Per Lead.',
 'The average ad spend required to generate one qualified lead. Calculated as total spend ÷ number of leads.',
 'Reviewed every 7 days when optimising a paid campaign and reported to the client monthly. If CPL rises, we investigate creative fatigue, audience or landing page.',
 ARRAY['Pull the last 7 days of spend + leads from Ads Manager','Divide spend by leads to get CPL','Compare to the campaign benchmark','Pause the losing ad sets, scale the winners'],
 'meta-ads','paid-advertising'),
('CPA','Cost Per Acquisition.',
 'The cost to acquire one customer (not just a lead). Total ad spend ÷ number of customers/sales.',
 'CPA is the sales-quality version of CPL. We track it once conversions (not just leads) can be tied back to the campaign.',
 ARRAY['Confirm conversion tracking is firing','Pull total spend for the period','Divide by the number of closed customers','Report to the client with CPL vs CPA side by side'],
 'meta-ads','paid-advertising'),
('CTR','Click-Through Rate.',
 'Percentage of people who clicked an ad or link after seeing it. Clicks ÷ Impressions × 100.',
 'Early signal of creative + hook strength. Low CTR usually means the hook, thumbnail or offer needs work — long before you burn budget.',
 ARRAY['Check CTR at Day 2 of any campaign','If below benchmark, swap the hook or thumbnail first','Test a new creative variation','Retest after 48 hours'],
 'meta-ads','paid-advertising'),
('ROAS','Return On Ad Spend.',
 'Revenue generated ÷ ad spend. A ROAS of 4 means R4 in revenue for every R1 in ads.',
 'The most honest ad metric for clients selling online. Reported in every monthly report where revenue can be tracked.',
 ARRAY['Confirm conversion values are firing correctly','Pull revenue attributed to the campaign','Divide by the spend for that campaign','Report ROAS with context (spend + revenue)'],
 'meta-ads','paid-advertising'),
('ROI','Return On Investment.',
 '(Gain − Cost) ÷ Cost. A percentage view of return on any spend, not just ads.',
 'Used in sales conversations to frame the value of a full engagement (retainer + ads + CRM), not only ad performance.',
 ARRAY['Total all client investment (retainer + spend)','Estimate the gain (revenue or booked pipeline)','Calculate (Gain − Cost) ÷ Cost','Use it in the monthly report and QBR'],
 NULL,'paid-advertising'),
('GHL','GoHighLevel — our CRM + automation platform.',
 'GoHighLevel is the all-in-one CRM, automation, booking and reporting platform we use to run client sales and operations.',
 'Every client account, pipeline and automation lives in GHL. If a client is signed, they have a GHL sub-account within 48 hours.',
 ARRAY['Log into GHL','Switch into the client sub-account','Check the pipeline for new leads','Confirm the follow-up automation fired'],
 'gohighlevel','crm-automation'),
('SOP','Standard Operating Procedure.',
 'A written, step-by-step procedure that defines how a task must be done, by whom, when and to what standard.',
 'Every role at Kups has SOPs so quality does not depend on who''s on shift. The SOP Library page has them all.',
 ARRAY['Open the SOP Library','Filter by your department','Read your role''s SOP end to end','Follow it — never freestyle a repeatable process'],
 NULL,NULL),
('GMB','Google Business Profile (formerly Google My Business).',
 'The Google-owned listing that shows a business on Maps and Search — categories, hours, photos, reviews and posts.',
 'Biggest local-SEO lever for SME clients. Optimising GMB regularly moves calls, direction requests and reviews.',
 ARRAY['Log in and verify the profile is claimed','Fill every field (categories, services, photos, hours)','Post weekly updates + offers','Respond to every review within 24 hours'],
 'gmb','seo'),
('KPI','Key Performance Indicator.',
 'A measurable value that shows how effectively a person, team or business is achieving a specific objective.',
 'Every role has KPIs in its SOP. Reviewed weekly by managers and monthly at team level.',
 ARRAY['Open the KPI dashboard','Compare current numbers to target','Note the top 2 gaps','Agree one action per gap for the week'],
 NULL,NULL),
('MVP','Minimum Viable Product.',
 'The smallest version of a product that can be launched to real users to test the idea and gather feedback.',
 'For app + web builds we always ship an MVP first, then iterate — never a 6-month "big bang" launch.',
 ARRAY['List the core problem the product must solve','Cut features to only the ones required to solve it','Build + launch the MVP','Collect feedback and iterate'],
 NULL,'mobile-apps'),
('Pixel','A tracking script installed on a website (Meta Pixel, TikTok Pixel, GA4 tag).',
 'A small piece of JavaScript that records visitor actions on a site so an ad platform can attribute conversions and build audiences.',
 'Non-negotiable before launching paid ads. No pixel = no optimisation = wasted spend.',
 ARRAY['Locate the pixel ID in Meta Events Manager','Install via Google Tag Manager','Test with Meta Pixel Helper','Fire a sample event and confirm it appears in Events Manager'],
 'tag-manager','paid-advertising'),
('UTM','Urchin Tracking Module — URL parameters for tracking sources.',
 'Tags added to a URL (utm_source, utm_medium, utm_campaign) so analytics can see exactly where a visitor came from.',
 'Used on every paid ad link and email link so we can report accurately on which channel drove which lead.',
 ARRAY['Build the destination URL','Add utm_source, utm_medium, utm_campaign','Test the link in a private browser','Confirm the visit shows up correctly in Analytics'],
 'google-analytics','paid-advertising'),
('Lookalike Audience','An audience the ad platform builds that resembles an existing customer or lead list.',
 'A "clone" audience generated by Meta, Google or TikTok based on the traits of a source audience (customers, leads, page followers).',
 'Lookalikes are how paid campaigns scale past cold interest targeting once the pixel has enough conversion data.',
 ARRAY['Confirm the source list has at least 100 quality records','Create a 1–3% Lookalike in Ads Manager','Test it as a separate ad set','Scale budget on the winning percentage'],
 'meta-ads','paid-advertising'),
('Retargeting','Ads shown specifically to people who already interacted with the brand.',
 'Ads served to warm audiences: visited the site, watched a video, engaged with the page, added to cart, etc.',
 'Retargeting closes leads that cold ads created. Every serious paid strategy has a retargeting layer running in parallel.',
 ARRAY['Confirm the pixel has been firing for at least 7 days','Create custom audiences (site visitors, video viewers, engagers)','Build a retargeting ad set with an offer or reminder','Cap frequency so we do not annoy the audience'],
 'meta-ads','paid-advertising'),
('Lead Magnet','A free asset offered in exchange for a lead''s contact details.',
 'A downloadable, quiz, checklist, template or free session that motivates a visitor to hand over their contact info.',
 'Used at the top of every lead-gen funnel to lift form-fill rates and lower CPL.',
 ARRAY['Confirm the target audience and their #1 problem','Design a short, high-value asset','Build the landing page + form','Fulfil the asset automatically via GHL email/WhatsApp'],
 'gohighlevel','paid-advertising'),
('Discovery Call','The first structured sales call with a potential client.',
 'A qualification + fit call where the sales rep understands the prospect''s business, goals, budget and timeline before proposing.',
 'Kups only proposes after a proper discovery. Skipping it is why deals stall or churn.',
 ARRAY['Confirm the call is booked in GHL','Prepare using the discovery script','Ask BANT questions (Budget, Authority, Need, Timeline)','Log outcome + next step in GHL immediately after'],
 'gohighlevel',NULL),
('Pipeline','The staged view of every deal from new lead to won or lost.',
 'A visual, ordered set of stages a lead moves through: New → Contacted → Qualified → Proposal → Won/Lost.',
 'Every client account has at least one pipeline in GHL. It''s how we know exactly where every deal actually is.',
 ARRAY['Open the client sub-account in GHL','Review the pipeline column by column','Move any stale deals or set a follow-up task','Report pipeline value + conversion in the monthly report'],
 'gohighlevel','crm-automation'),
('Onboarding','The structured start of a client engagement.',
 'The first 14 days of a new client, covering contract, welcome, kickoff, strategy, access, and initial build.',
 'A weak onboarding predicts churn. We follow the Client Roadmap page step-by-step for every new client.',
 ARRAY['Open the Client Roadmap page','Complete each step in order','Log the completion timestamp in GHL','Hold the kickoff call within 5 business days of signature'],
 'gohighlevel',NULL),
('Churn','A client cancelling / not renewing.',
 'When a paying client ends the engagement. Measured as a monthly percentage of the active client base.',
 'Churn is a leading indicator of delivery quality. Every churn triggers an internal review.',
 ARRAY['Log the churn in GHL with the reason','Trigger the exit survey / call','Report the reason at the next ops meeting','Adjust the SOP or roadmap step that failed'],
 'gohighlevel',NULL),
('Upsell','Increasing what an existing client buys from us.',
 'Adding services or moving a client to a higher-tier package once trust is established.',
 'The cheapest revenue we can win. Trigger points sit inside every retainer (e.g. capacity hit, results proven, new business unit).',
 ARRAY['Identify the trigger (results achieved, new goal, added service)','Prepare a one-page upsell proposal','Present on the next reporting call','Update the contract and GHL pipeline'],
 'gohighlevel',NULL),
('On-page SEO','Optimising elements on a webpage itself for search.',
 'The SEO work done inside a page: titles, meta descriptions, headers, internal links, image alt text, page speed.',
 'The lowest-friction SEO wins. Always done first before any off-page work like backlinks.',
 ARRAY['Audit the page (title, meta, H1, alt text)','Fix titles and meta descriptions using target keywords','Add internal links and update alt text','Verify with Search Console'],
 'search-console','seo'),
('Local SEO','SEO focused on ranking for location-based searches.',
 'The set of optimisations that get a business found in Maps and "near me" search results — GMB, local citations, NAP consistency, reviews.',
 'Most Kups SME clients live or die by local SEO. Faster to move than national SEO (4–8 weeks).',
 ARRAY['Claim and fully optimise Google Business Profile','Build a local citation list (NAP consistent)','Encourage + respond to reviews','Track local rankings monthly'],
 'gmb','seo'),
('Learning Phase','The initial period when a paid campaign is training the ad algorithm.',
 'The window (usually the first ~50 conversions per ad set) during which Meta / TikTok / Google are still learning who converts. Performance is unstable here.',
 'Do not judge or edit a campaign inside the Learning Phase. Wait for it to exit before optimising.',
 ARRAY['Check ad set status in Ads Manager','Confirm whether it''s still in Learning','Avoid budget or creative edits','Optimise once the ad set exits Learning'],
 'meta-ads','paid-advertising'),
('Conversion','A visitor completing a desired action.',
 'Any tracked action that matters — form submit, purchase, WhatsApp click, booking, call.',
 'Every campaign must have a clear conversion event defined and tracked before launch. No conversion = no measurement.',
 ARRAY['Define the conversion event with the client','Install/verify tracking (GTM + pixel + GA4)','Fire a test conversion','Confirm it lands in the ad platform + GA4'],
 'tag-manager','paid-advertising'),
('Landing Page','A single web page built for a single campaign objective.',
 'A focused page with one goal (usually a form fill) — no navigation distractions, one clear CTA, matched to the ad message.',
 'Sending paid traffic to the homepage is the #1 way we waste spend. Every paid campaign gets a dedicated landing page.',
 ARRAY['Match the landing page headline to the ad hook','Have one CTA above the fold','Add trust proof (reviews, logos, guarantee)','Test on mobile — most traffic will be mobile'],
 NULL,'websites');

GRANT SELECT ON public.glossary_terms TO anon;

-- 3. PRICING ITEMS
CREATE TABLE IF NOT EXISTS public.pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  name text NOT NULL,
  description text,
  price text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_items TO authenticated;
GRANT ALL ON public.pricing_items TO service_role;

ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_items readable by authenticated"
  ON public.pricing_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_items admin write"
  ON public.pricing_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.pricing_items (section, name, description, price, sort_order) VALUES
('Website Development (once-off)','Starter Website','Up to 5 pages, mobile-friendly, contact form.','R4,500',10),
('Website Development (once-off)','Growth Website','Multi-page, blog, booking/quote system.','R8,000–R15,000',20),
('Website Development (once-off)','Custom / E-commerce','Full custom scope or Shopify/Woo store.','Quoted per scope',30),
('Website Development (once-off)','Website Refresh / Redesign Audit','Audit fee, credited to rebuild if client proceeds.','R850',40),
('Website Development (once-off)','Extra Page (beyond package)','Add another page beyond the tier limit.','R450 / page',50),
('Website Development (once-off)','Rush Delivery','Under 7 business days.','+25% of project fee',60),
('CRM & Automation Setup (once-off)','Basic Setup','1 pipeline, 1 follow-up sequence.','R3,000',10),
('CRM & Automation Setup (once-off)','Standard Setup','2–3 pipelines, multi-channel follow-up, booking.','R4,500',20),
('CRM & Automation Setup (once-off)','Advanced Setup','Full automation suite, custom dashboards, integrations.','R6,000',30),
('CRM & Automation Setup (once-off)','Monthly CRM Management','Optimisation if not on Scale Plus / Elite. Free on Scale Plus & Elite Unlimited.','R900 / month',40),
('SEO','SEO Audit (standalone)','Full technical + on-page audit.','R1,200 once-off',10),
('SEO','Local SEO / GMB Optimisation','Setup + monthly maintenance.','R1,800 setup + R650 / month',20),
('SEO','Full SEO Retainer','On-page + local + monthly reporting.','R2,800 / month',30),
('SEO','Bundle Discount','15% off SEO retainer when paired with any marketing retainer.','−15%',40),
('Social Media Add-Ons','Additional Platform','Beyond package allowance.','R750 / month',10),
('Social Media Add-Ons','Extra 5 Posts / Month','On top of the package.','R600',20),
('Social Media Add-Ons','Reel / Video Editing','Client-supplied footage.','R150–R250 per video',30),
('Social Media Add-Ons','AI-Assisted Video Content','Kups-produced short video.','R150–R250 per video',40),
('AI Chatbot & Integrations','Starter Chatbot','Single channel, FAQ + basic lead capture.','R3,500 once-off + R450 / month',10),
('AI Chatbot & Integrations','Advanced Chatbot','Multi-channel, full CRM integration, custom flows.','R6,500 once-off + R750 / month',20),
('Mobile App Development','Starter App','Simple app, limited features.','R15,000–R30,000',10),
('Mobile App Development','Growth App','Multiple features, integrations, admin panel.','R35,000–R80,000',20),
('Mobile App Development','Scale App','Complex, multi-user, advanced integrations.','R90,000–R250,000+',30),
('Mobile App Development','Post-launch Maintenance','Ongoing bug fixes + minor updates.','from R1,500 / month',40),
('Standalone / One-Off Services','Ad Management Only','Client already has creative/tracking.','R2,000 / month + ad spend',10),
('Standalone / One-Off Services','Discovery & Strategy Session','Paid consult for non-clients. Credited if they sign within 14 days.','R650',20),
('Standalone / One-Off Services','Brand Messaging / Positioning Workshop','Positioning + messaging session.','R1,800 once-off',30);

-- 4. SERVICES: expand what_we_do with numbered steps
UPDATE public.services SET what_we_do = $$1. Pull the client''s business info, ideal customer profile and past ad history from the onboarding form.
2. In Meta Ads Manager / Google Ads / TikTok Ads Manager, create a new campaign and choose the objective (Leads, Traffic, or Conversions).
3. Build 2–3 audience sets: interest-based, location-based, and a lookalike from existing customers if pixel data exists.
4. Write ad copy using Hook → Problem → Solution → CTA — draft 3 variations per ad set.
5. Source or request creative (images/video) from the client; use MSP-approved stock only as a temporary placeholder.
6. Install and test the tracking pixel on the client''s site/landing page before spending a single rand.
7. Set the daily/monthly budget per the agreed ad spend (never MSP-managed money — client pays platform directly).
8. Launch the campaign and monitor delivery for the first 48 hours.
9. At Day 7, review CPL / CTR / reach — pause underperforming ad sets, increase budget on winners.
10. Log all figures and compile the monthly report (leads, CPL, reach, clicks, ROAS) by the agreed reporting date.$$
WHERE slug = 'paid-advertising';

UPDATE public.services SET what_we_do = $$1. Send the client the content request form (logo, photos, service descriptions, testimonials, brand colours).
2. Once content is received, choose the page structure (Home, About, Services, Gallery, Contact — or more for Growth tier).
3. Build the site in the agreed platform/builder, starting with the homepage layout and navigation.
4. Write or finalise all page copy — headline, service descriptions, CTAs on every page.
5. Add a contact form, WhatsApp chat button, and clear CTA above the fold on every page.
6. Set up basic on-page SEO — page titles, meta descriptions, header tags, image alt text.
7. Install Google Analytics and Meta Pixel.
8. Test on mobile, tablet, and desktop — fix any layout breaks.
9. Send the client a review link, collect one round of feedback, apply revisions.
10. Publish live, confirm domain/hosting is pointing correctly, and record a short walkthrough video/call for handover.$$
WHERE slug = 'websites';

UPDATE public.services SET what_we_do = $$1. Create the client''s sub-account in GoHighLevel.
2. Build the sales pipeline stages relevant to their business (e.g. New Lead → Contacted → Qualified → Proposal → Won/Lost).
3. Connect their lead sources — website form, Meta lead ads, WhatsApp — so leads flow automatically into the pipeline.
4. Build the instant lead-notification automation (WhatsApp/SMS/email alert the moment a lead arrives).
5. Build the automated follow-up sequence (Day 0 instant reply, Day 1 reminder, Day 3 value message, Day 5 final follow-up).
6. Set up appointment booking if relevant to their business.
7. Build the reporting dashboard view (pipeline value, lead volume, conversion rate).
8. Run a live test lead through the entire pipeline to confirm every automation fires correctly.
9. Record a training walkthrough and grant the client their own login access.
10. Schedule a 30-day check-in to review adoption and refine.$$
WHERE slug = 'crm-automation';

UPDATE public.services SET what_we_do = $$1. Request the month''s content assets from the client by the 25th (photos, videos, promotions, updates).
2. Build the content calendar for the following month, mapping each post to a business goal.
3. Design all static posts and reels in Canva (or approved tool), following the client''s brand guide.
4. Write every caption using a hook → value → CTA structure, plus a relevant hashtag set.
5. Submit the full calendar to the client via WhatsApp for approval by the 28th.
6. Apply one round of revisions maximum per piece based on feedback.
7. Schedule all approved posts on the platform/scheduler.
8. Optimise the Google Business Profile — new posts, respond to reviews, update photos.
9. Monitor comments daily for spam and remove anything inappropriate.
10. Compile the monthly content performance snapshot for the client report.$$
WHERE slug = 'social-media';

UPDATE public.services SET what_we_do = $$1. Run a full technical + on-page audit of the client''s current website (speed, mobile-friendliness, meta tags, existing rankings).
2. Research keywords the client''s ideal customers are actually searching, prioritising by intent and competitiveness.
3. Optimise on-page elements across every page — titles, meta descriptions, header tags, internal linking, image alt text.
4. Claim and fully optimise the Google Business Profile — categories, services, photos, opening hours, posts.
5. Build a local citation list (relevant directories/listings) and ensure NAP (name/address/phone) consistency everywhere.
6. Set a monthly content or blog cadence if agreed in scope.
7. Track keyword rankings and organic traffic monthly using Search Console and Analytics.
8. Compile and send the monthly SEO report with rankings movement, traffic, and next month''s focus.
9. Reassess strategy every quarter based on what''s moving the needle.$$
WHERE slug = 'seo';

UPDATE public.services SET what_we_do = $$1. Map the client''s most common customer questions and lead-qualification questions with them.
2. Choose the deployment channel — WhatsApp, Facebook Messenger, or website widget.
3. Build the conversation flow: greeting → qualifying questions → data capture → handoff or booking.
4. Write the FAQ auto-response library for routine questions.
5. Connect the bot to GoHighLevel so every conversation and captured lead flows straight into the CRM pipeline.
6. Test the full flow end-to-end as a fake customer, checking every branch.
7. Launch live and monitor the first week of real conversations closely.
8. Refine responses based on real questions the bot couldn''t answer well.
9. Share a simple dashboard with the client so they can see conversation volume and bot performance.$$
WHERE slug = 'ai-chatbots';

UPDATE public.services SET what_we_do = $$1. Run a scoping session — what the app must do, who its users are, iOS/Android/both.
2. Define the feature list and confirm it against the appropriate pricing tier (Starter/Growth/Scale).
3. Design the UI/UX — wireframes first, then full visual design, client sign-off before development starts.
4. Build the frontend and backend, including any required integrations (payments, bookings, notifications).
5. Set up an admin dashboard for the client to manage app content where relevant.
6. Test thoroughly — functionality, devices, edge cases — before any store submission.
7. Prepare App Store and/or Google Play developer accounts under the client''s name (client pays store fees directly — $99/year Apple, $25 once-off Google).
8. Submit to the relevant store(s) and handle any review feedback from Apple/Google.
9. Launch, hand over all source code and design files, and confirm the agreed post-launch support period.$$
WHERE slug = 'mobile-apps';
