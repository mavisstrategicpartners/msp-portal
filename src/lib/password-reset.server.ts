/**
 * Forgot Password — wiring of the core rules to Supabase (server only).
 * Codes live in public.password_reset_requests (service-role access only).
 * The new password is set through Supabase Auth's admin API, which stores it
 * with Supabase's own bcrypt hashing — the same mechanism as normal sign-in.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getMailer } from "@/lib/mailer.server";
import type { ResetDeps, ResetRow, ResetStore } from "@/lib/password-reset.core";

const TABLE = "password_reset_requests";
const db = () => supabaseAdmin as any;

const supabaseStore: ResetStore = {
  async countSince(filter, sinceIso) {
    let q = db()
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso);
    if (filter.email) q = q.eq("email", filter.email);
    if (filter.ip) q = q.eq("request_ip", filter.ip);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  },
  async latestForEmail(email) {
    const { data, error } = await db()
      .from(TABLE)
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as ResetRow) ?? null;
  },
  async insert(row) {
    const { data, error } = await db().from(TABLE).insert(row).select("id").single();
    if (error) throw error;
    return data.id as string;
  },
  async update(id, patch) {
    const { error } = await db().from(TABLE).update(patch).eq("id", id);
    if (error) throw error;
  },
  async invalidateOpen(email, nowIso) {
    const { error } = await db()
      .from(TABLE)
      .update({ invalidated_at: nowIso })
      .eq("email", email)
      .is("completed_at", null)
      .is("invalidated_at", null);
    if (error) throw error;
  },
  async invalidateAllForUser(userId, nowIso) {
    const { error } = await db()
      .from(TABLE)
      .update({ invalidated_at: nowIso })
      .eq("user_id", userId)
      .is("completed_at", null)
      .is("invalidated_at", null);
    if (error) throw error;
  },
  async findByTokenHash(tokenHash) {
    const { data, error } = await db()
      .from(TABLE)
      .select("*")
      .eq("reset_token_hash", tokenHash)
      .maybeSingle();
    if (error) throw error;
    return (data as ResetRow) ?? null;
  },
};

function resetSecret() {
  // A dedicated secret is preferred; the service-role key (also server-only) is the fallback.
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("PASSWORD_RESET_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set");
  return secret;
}

export function getResetDeps(): ResetDeps {
  return {
    store: supabaseStore,
    secret: resetSecret(),
    mailer: getMailer(),
    async findActiveUserId(email) {
      const { data } = await db()
        .from("profiles")
        .select("id, is_active")
        .ilike("email", email.replace(/[%_\\]/g, "\\$&"))
        .limit(1)
        .maybeSingle();
      if (!data || data.is_active === false) return null;
      return data.id as string;
    },
    async setPassword(userId, password) {
      // The user chose this password themselves, so any pending
      // "replace your temporary password" requirement is satisfied.
      const { data: existing } = await supabaseAdmin.auth.admin.getUserById(userId);
      const app_metadata = { ...(existing?.user?.app_metadata || {}), must_change_password: false };
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password, app_metadata });
      if (error) throw new Error(error.message);
    },
    async revokeSessions(userId) {
      const { error } = await db().rpc("revoke_user_sessions", { _user_id: userId });
      if (error) console.warn("[password-reset] could not revoke sessions:", error.message);
    },
    async audit(action, userId, details) {
      await db()
        .from("audit_logs")
        .insert({ actor_id: userId, action, target_id: userId, details });
    },
    pad: () => new Promise((r) => setTimeout(r, 250 + Math.floor(Math.random() * 400))),
  };
}
