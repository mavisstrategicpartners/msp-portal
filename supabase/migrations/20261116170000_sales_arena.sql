-- Sales Arena (from "MSP Sales Arena.xlsx"): salespeople, cash targets, lead pipeline, lead-setter
-- activity, lead magnets (competitor analyses / growth audits), payments received, audit trail.
--
-- Security model: every table has row-level security ON and NO policies for the browser roles,
-- except that a signed-in person may read their OWN salesperson link (sales_people.profile_id).
-- All reads and writes go through the server API (/api/sales-arena), which decides per role:
--   CEO: company-wide data, leaderboard and rankings, target management, exports.
--   Salespeople: only their own targets, pipeline, activity, lead magnets and receipts.
--   Everyone else (HR, Finance, Operations, department managers, administrators, Root Admin):
--   no Sales Arena data unless they are themselves a linked salesperson (then: own data only).
-- Report files live in the private "sales-reports" bucket; links are issued by the server.
-- New tables only: no existing table, row or policy is dropped or rewritten (except the
-- audit_logs read policy at the end, which is narrowed, not widened).

create table if not exists public.sales_people (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(btrim(display_name)) between 2 and 120),
  profile_id uuid unique references public.profiles(id) on delete set null,
  is_closer boolean not null default true,
  is_setter boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists sales_people_name_uniq on public.sales_people (lower(btrim(display_name)));

create table if not exists public.sales_targets (
  id uuid primary key default gen_random_uuid(),
  month date not null check (extract(day from month) = 1),
  -- null salesperson = the company target for the month
  salesperson_id uuid references public.sales_people(id) on delete cascade,
  kind text not null default 'cash' check (kind in ('cash', 'daily_calls', 'daily_bookings')),
  amount numeric(14, 2) not null check (amount >= 0),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'cash' or salesperson_id is not null)
);
create unique index if not exists sales_targets_uniq
  on public.sales_targets (month, kind, coalesce(salesperson_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table if not exists public.sales_opportunities (
  id uuid primary key default gen_random_uuid(),
  deal_ref text not null check (length(btrim(deal_ref)) between 2 and 80),
  received_date date,
  salesperson_id uuid references public.sales_people(id) on delete set null,
  company text not null check (length(btrim(company)) between 1 and 200),
  contact_name text,
  phone text,
  email text,
  industry text,
  service text,
  lead_source text,
  stage text not null default 'New' check (stage in ('New', 'Contacted', 'Qualified', 'Meeting booked', 'Proposal sent', 'Negotiation', 'Won', 'Lost')),
  quoted_fee numeric(14, 2) check (quoted_fee is null or quoted_fee >= 0),
  signed_value numeric(14, 2) check (signed_value is null or signed_value >= 0),
  expected_close date,
  next_follow_up date,
  next_action text,
  lost_reason text,
  ghl_url text check (ghl_url is null or ghl_url ~* '^https?://'),
  setter_id uuid references public.sales_people(id) on delete set null,
  contacted_by text,
  contact_date date,
  website text,
  location text,
  notes text,
  source text not null default 'portal' check (source in ('portal', 'workbook')),
  source_ref text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stage <> 'Lost' or lost_reason is not null)
);
create unique index if not exists sales_opportunities_ref_uniq on public.sales_opportunities (upper(btrim(deal_ref)));
create index if not exists sales_opportunities_owner_idx on public.sales_opportunities (salesperson_id, stage);
create index if not exists sales_opportunities_followup_idx on public.sales_opportunities (next_follow_up);

create table if not exists public.sales_setter_activities (
  id uuid primary key default gen_random_uuid(),
  deal_ref text,
  opportunity_id uuid references public.sales_opportunities(id) on delete set null,
  activity_at timestamptz,
  -- Reporting month; when the exact date is known it must be that date's month (SA time).
  activity_month date not null check (extract(day from activity_month) = 1),
  setter_id uuid not null references public.sales_people(id) on delete restrict,
  company text,
  activity_type text not null check (activity_type in ('Call', 'WhatsApp', 'Email')),
  result text not null check (result in ('Connected', 'No answer', 'Voicemail', 'Wrong number', 'Replied', 'Sent')),
  qualified boolean not null default false,
  meeting_booked boolean not null default false,
  appointment_at timestamptz,
  closer_id uuid references public.sales_people(id) on delete set null,
  next_follow_up date,
  follow_up_done_at timestamptz,
  notes text,
  call_minutes numeric(6, 1) check (call_minutes is null or call_minutes >= 0),
  source text not null default 'portal' check (source in ('portal', 'workbook')),
  source_ref text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (activity_at is null or activity_month = date_trunc('month', activity_at at time zone 'Africa/Johannesburg')::date),
  check (appointment_at is null or meeting_booked)
);
create index if not exists sales_setter_activities_month_idx on public.sales_setter_activities (activity_month, setter_id);
create index if not exists sales_setter_activities_ref_idx on public.sales_setter_activities (upper(deal_ref));

create table if not exists public.sales_lead_magnets (
  id uuid primary key default gen_random_uuid(),
  deal_ref text,
  opportunity_id uuid references public.sales_opportunities(id) on delete set null,
  company text not null check (length(btrim(company)) between 1 and 200),
  report_type text not null check (report_type in ('Competitor analysis', 'Growth audit', 'Combined analysis + audit')),
  requested_date date,
  sales_owner_id uuid references public.sales_people(id) on delete set null,
  prepared_by_name text,
  prepared_by_profile uuid references public.profiles(id) on delete set null,
  due_date date,
  -- Work status. Delivery (completed / sent / discussed) is evidenced by the dates below.
  workflow_status text not null default 'Requested' check (workflow_status in ('Requested', 'In preparation', 'Ready for review', 'Approved', 'Completed - details pending', 'Declined')),
  completed_date date,
  completed_by uuid references public.profiles(id) on delete set null,
  report_link text check (report_link is null or report_link ~* '^https?://'),
  report_file jsonb,
  sent_date date,
  sent_by uuid references public.profiles(id) on delete set null,
  discussed_date date,
  discussed_by uuid references public.profiles(id) on delete set null,
  next_follow_up date,
  follow_up_done_at timestamptz,
  next_action text,
  source text not null default 'portal' check (source in ('portal', 'workbook')),
  source_ref text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A report is "sent" only after it is completed with evidence; "discussed" only after it is sent.
  check (sent_date is null or (completed_date is not null and (report_link is not null or report_file is not null))),
  check (discussed_date is null or sent_date is not null),
  check (completed_date is null or requested_date is null or completed_date >= requested_date),
  check (sent_date is null or completed_date is null or sent_date >= completed_date)
);
create index if not exists sales_lead_magnets_ref_idx on public.sales_lead_magnets (upper(deal_ref));

create table if not exists public.sales_payments (
  id uuid primary key default gen_random_uuid(),
  -- Actual receipt date. Null = month confirmed but exact date not yet known ("dates pending").
  receipt_date date,
  revenue_month date not null check (extract(day from revenue_month) = 1),
  salesperson_id uuid not null references public.sales_people(id) on delete restrict,
  client text not null check (length(btrim(client)) between 1 and 200),
  service text,
  deal_ref text,
  opportunity_id uuid references public.sales_opportunities(id) on delete set null,
  invoice_ref text,
  -- MSP fee received in Rand, excluding VAT and client ad spend. Refunds are negative.
  amount numeric(14, 2) not null check (amount <> 0),
  receipt_type text check (receipt_type in ('New client', 'Renewal', 'Project payment', 'Refund')),
  payment_ref text,
  notes text,
  source text not null default 'portal' check (source in ('portal', 'workbook')),
  source_ref text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (receipt_date is null or revenue_month = date_trunc('month', receipt_date)::date),
  check ((receipt_type = 'Refund') = (amount < 0))
);
create unique index if not exists sales_payments_ref_uniq on public.sales_payments (upper(btrim(payment_ref))) where payment_ref is not null and btrim(payment_ref) <> '';
create index if not exists sales_payments_month_idx on public.sales_payments (revenue_month, salesperson_id);
create index if not exists sales_payments_date_idx on public.sales_payments (receipt_date);

create table if not exists public.sales_arena_audit (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id uuid,
  action text not null,
  before jsonb,
  after jsonb,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  at timestamptz not null default now()
);
create index if not exists sales_arena_audit_entity_idx on public.sales_arena_audit (entity, entity_id, at desc);

-- Row-level security: on everywhere; the browser roles get nothing except their own link row.
do $$
declare t text;
begin
  foreach t in array array['sales_people', 'sales_targets', 'sales_opportunities', 'sales_setter_activities', 'sales_lead_magnets', 'sales_payments', 'sales_arena_audit'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke insert, update, delete, truncate on public.%I from authenticated', t);
  end loop;
end $$;
revoke select on public.sales_targets, public.sales_opportunities, public.sales_setter_activities, public.sales_lead_magnets, public.sales_payments, public.sales_arena_audit from authenticated;

drop policy if exists sales_people_select_own on public.sales_people;
create policy sales_people_select_own on public.sales_people
  for select to authenticated using (profile_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit)
values ('sales-reports', 'sales-reports', false, 26214400)
on conflict (id) do nothing;

-- The older Sales module kept its leads and targets inside audit_logs ("sales_*" rows). Those rows
-- are confidential sales data too: no browser role reads them directly (the CEO sees sales data
-- through the server). Other audit entries stay readable by administrators as before.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role) and coalesce(action, '') not like 'sales\_%');
