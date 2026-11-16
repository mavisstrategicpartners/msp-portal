-- Confidential sales rankings: the raw sales ledger (audit_logs rows whose action starts with
-- "sales_": every lead, its value and assigned consultant, and each consultant's monthly target)
-- may be read directly only by the Root Administrator. Other administrators keep read access to
-- every other audit entry. Sales staff, managers, HR and the General Manager had no direct read
-- access before and still have none. The CEO reads rankings through /api/sales/leaderboard
-- (server-side, CEO-only check); the server uses the service role and is unaffected.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    and (
      coalesce(action, '') not like 'sales\_%'
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role_tier = 'root_admin' and p.is_active is not false
      )
    )
  );
