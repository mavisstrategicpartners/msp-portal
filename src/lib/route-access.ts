/**
 * Route-level access check used by the signed-in layout's beforeLoad.
 *
 * Every page under /_authenticated runs through `guardRoute` before it loads:
 * no Supabase session → /auth; signed in but the URL belongs to a workspace
 * the user's role may not open → their own dashboard. The rules themselves
 * live in src/lib/navigation.ts (WORKSPACES[*].access).
 *
 * This is a usability and defence-in-depth layer. Data is protected by the
 * server (/api handlers, server functions) and by database row-level security.
 */
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  computeAccess,
  getDefaultDashboardRoute,
  type AccessFlags,
  type Profile,
} from "@/lib/roles";
import { canAccessPath, navContextFromProfile } from "@/lib/navigation";

type Loaded = {
  user: { id: string; email?: string };
  /** Signed in with a temporary password that must be replaced first. */
  mustChangePassword: boolean;
  access: AccessFlags;
  departmentName: string | null;
};

let cache: { userId: string; at: number; value: Loaded } | null = null;
const TTL_MS = 60_000;

export async function loadAccess(): Promise<Loaded | null> {
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;
  if (error || !user) {
    cache = null;
    return null;
  }
  if (cache && cache.userId === user.id && Date.now() - cache.at < TTL_MS) return cache.value;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  const access = computeAccess(profile as Profile | null, user.email, roles ?? []);
  const value: Loaded = {
    user: { id: user.id, email: user.email },
    mustChangePassword: Boolean((user.app_metadata as any)?.must_change_password),
    access,
    departmentName: (profile as Profile | null)?.department ?? null,
  };
  cache = { userId: user.id, at: Date.now(), value };
  return value;
}

export function clearAccessCache() {
  cache = null;
}

export async function guardRoute(pathname: string) {
  let loaded: Loaded | null = null;
  try {
    loaded = await loadAccess();
  } catch (err) {
    console.warn("Access check failed:", err);
  }
  if (!loaded) throw redirect({ to: "/auth", replace: true });
  if (loaded.mustChangePassword) throw redirect({ to: "/set-password" as any, replace: true });

  const ctx = navContextFromProfile({ ...loaded.access, departmentName: loaded.departmentName })!;
  if (!canAccessPath(pathname, ctx)) {
    const home = getDefaultDashboardRoute(loaded.access.systemRole);
    throw redirect({ to: (canAccessPath(home, ctx) ? home : "/home") as any, replace: true });
  }
  return loaded;
}
