/**
 * Server-side identity for the portal's custom /api handlers.
 *
 * The caller is identified ONLY by a valid Supabase access token
 * (Authorization: Bearer <token>). Headers such as X-MSP-User-Id,
 * X-MSP-User-Email or X-MSP-User-Role are ignored: anyone can set them.
 * Permissions come from the shared role model in src/lib/roles.ts, so the
 * server and the browser always agree on what a role may do.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computeAccess, type AccessFlags, type Profile } from "@/lib/roles";

export type ApiUser = {
  userId: string;
  email: string;
  fullName: string;
  jobTitle: string;
  department: string;
  roleTier: string;
  access: AccessFlags;
};

export async function authenticateApiRequest(request: Request): Promise<ApiUser | null> {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    const user = data?.user;
    if (error || !user) return null;

    const db = supabaseAdmin as any;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      db.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    if (profile && profile.is_active === false) return null; // deactivated accounts lose API access

    const access = computeAccess(profile as Profile | null, user.email, roles ?? []);
    return {
      userId: user.id,
      email: user.email || "",
      fullName:
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Staff Member",
      jobTitle: profile?.job_title || "Staff Member",
      department: profile?.department || "General",
      roleTier: access.roleTier,
      access,
    };
  } catch (err) {
    console.warn("[api-auth] token verification failed:", err);
    return null;
  }
}

export function jsonError(status: 401 | 403, message: string, headers: HeadersInit = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
