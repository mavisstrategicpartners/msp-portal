-- Monthly reports: the existing monthly_reports table (client reports) now also holds each
-- department's monthly report. No new table: a department report has department_key set and no
-- client. Department reports are visible to that department, the CEO, the General Manager and
-- administrators; writes for department reports go through the server API only.
alter type public.report_type add value if not exists 'department_monthly';
alter type public.report_status add value if not exists 'submitted';

alter table public.monthly_reports alter column client_id drop not null;
alter table public.monthly_reports add column if not exists department_key text;
alter table public.monthly_reports add column if not exists submitted_at timestamptz;
alter table public.monthly_reports add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.monthly_reports drop constraint if exists monthly_reports_client_or_department;
alter table public.monthly_reports add constraint monthly_reports_client_or_department
  check (client_id is not null or department_key is not null);
create index if not exists monthly_reports_department_month_idx on public.monthly_reports (department_key, reporting_month desc);

create or replace function public.msp_in_department(_uid uuid, _dept text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.department_leads where user_id = _uid and department_key = _dept)
      or exists (select 1 from public.department_members where user_id = _uid and department_key = _dept);
$$;
revoke all on function public.msp_in_department(uuid, text) from public, anon;
grant execute on function public.msp_in_department(uuid, text) to authenticated;

drop policy if exists reports_read_all_auth on public.monthly_reports;
drop policy if exists reports_read_scoped on public.monthly_reports;
create policy reports_read_scoped on public.monthly_reports for select to authenticated using (
  department_key is null
  or public.msp_is_ceo(auth.uid()) or public.msp_is_gm(auth.uid()) or public.msp_is_admin(auth.uid())
  or public.msp_in_department(auth.uid(), department_key)
);
drop policy if exists reports_write_managers on public.monthly_reports;
create policy reports_write_managers on public.monthly_reports for insert to authenticated
  with check (public.is_manager_or_above(auth.uid()) and department_key is null);
drop policy if exists reports_update_managers on public.monthly_reports;
create policy reports_update_managers on public.monthly_reports for update to authenticated
  using (public.is_manager_or_above(auth.uid()) and department_key is null)
  with check (public.is_manager_or_above(auth.uid()) and department_key is null);
