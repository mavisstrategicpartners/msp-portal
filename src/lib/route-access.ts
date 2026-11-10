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
  landingPath,
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
  /** Departments this user is the appointed manager of. */
  leadDepartments: string[];
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

  const [{ data: profile }, { data: roles }, { data: leads }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    (supabase as any).from("department_leads").select("department_key").eq("user_id", user.id),
  ]);
  const leadKeys = ((leads as any[]) ?? []).map((l) => l.department_key);
  const access = computeAccess(profile as Profile | null, user.email, roles ?? [], leadKeys);
  const value: Loaded = {
    user: { id: user.id, email: user.email },
    mustChangePassword: Boolean((user.app_metadata as any)?.must_change_password),
    access,
    departmentName: (profile as Profile | null)?.department ?? null,
    leadDepartments: leadKeys,
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

  const ctx = navContextFromProfile({
    ...loaded.access,
    departmentName: loaded.departmentName,
    isDepartmentLead: loaded.leadDepartments.length > 0,
    leadDepartments: loaded.leadDepartments,
  })!;
  // The CEO has one landing page: the CEO Executive Dashboard. The generic
  // staff home is never shown to her (on login, refresh or a direct link).
  if (loaded.access.isCEO && (pathname === "/home" || pathname === "/")) {
    throw redirect({ to: "/ceo" as any, replace: true });
  }
  if (!canAccessPath(pathname, ctx)) {
    const home = landingPath(loaded.access, loaded.leadDepartments);
    throw redirect({ to: (canAccessPath(home, ctx) ? home : "/home") as any, replace: true });
  }
  return loaded;
}
