-- Applied to production 2026-11-09 after the RBAC hardening (Supabase security advisor).
-- Trigger functions are never called directly: nobody needs EXECUTE via the API.
REVOKE EXECUTE ON FUNCTION public.protect_profile_permissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_admin_role() FROM PUBLIC, anon, authenticated;
-- Role-check helpers are used by RLS for signed-in users only; signed-out visitors don't need them.
REVOKE EXECUTE ON FUNCTION public.get_role_tier(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_manager_or_above(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_root_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_role_tier(uuid), public.is_manager_or_above(uuid), public.is_root_admin(uuid) TO authenticated, service_role;
