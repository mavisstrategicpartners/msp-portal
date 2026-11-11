/**
 * Signed-in user changes their own password (used by the Root Administrator and every other
 * account from My Profile → Change password).
 *
 *  - Only ever changes the caller's own account: the user id comes from the verified session,
 *    never from the request.
 *  - The current password is checked with Supabase Auth before anything changes.
 *  - The new password must meet the portal's rules, match its confirmation and differ from the
 *    current one.
 *  - Supabase Auth stores only a bcrypt hash; the portal never stores, logs or returns passwords.
 *  - The check signs in a throw-away session which is then revoked on its own ("local" scope),
 *    so the user's existing sessions are not signed out.
 */
import { passwordProblems } from "@/lib/password-rules";

const KNOWN_PUBLIC_PASSWORDS = ["staff2026", "password1", "password123"];

export type PasswordChangeInput = { currentPassword: string; newPassword: string; confirmPassword: string };

type Deps = {
  admin: any; // supabaseAdmin
  /** true when (email, password) signs in successfully. */
  verify: (email: string, password: string) => Promise<boolean>;
  audit: (row: Record<string, unknown>) => Promise<void>;
};

export class PasswordChangeError extends Error {}

export async function changeOwnPassword(deps: Deps, userId: string, input: PasswordChangeInput) {
  const { currentPassword = "", newPassword = "", confirmPassword = "" } = input || ({} as PasswordChangeInput);
  if (!currentPassword) throw new PasswordChangeError("Enter your current password.");
  if (!newPassword) throw new PasswordChangeError("Enter a new password.");
  if (newPassword !== confirmPassword) throw new PasswordChangeError("The new password and its confirmation do not match.");

  const { data, error } = await deps.admin.auth.admin.getUserById(userId);
  const user = data?.user;
  if (error || !user?.email) throw new PasswordChangeError("Your account could not be found. Please sign in again.");

  const problems = passwordProblems(newPassword, user.email);
  if (KNOWN_PUBLIC_PASSWORDS.includes(newPassword.toLowerCase())) problems.push("must not be a common or shared password");
  if (newPassword === currentPassword) problems.push("must be different from your current password");
  if (problems.length) throw new PasswordChangeError(`Your new password needs: ${problems.join(", ")}.`);

  if (!(await deps.verify(user.email, currentPassword))) {
    await deps.audit({ actor_id: userId, action: "password_change_failed", target_id: userId, details: { reason: "wrong current password" } });
    throw new PasswordChangeError("Your current password is incorrect.");
  }

  // Supabase Auth hashes the password; clear any "must change" flag at the same time.
  const app = { ...(user.app_metadata || {}) };
  if (app.must_change_password) app.must_change_password = false;
  const { error: upErr } = await deps.admin.auth.admin.updateUserById(userId, { password: newPassword, app_metadata: app });
  if (upErr) throw new PasswordChangeError(`The password could not be changed: ${upErr.message}`);

  await deps.audit({ actor_id: userId, action: "password_changed", target_id: userId, details: { email: user.email, at: new Date().toISOString() } });
  return { ok: true as const };
}

/** Check a password with Supabase Auth without touching the caller's existing sessions. */
export async function verifyPasswordWithSupabase(email: string, password: string): Promise<boolean> {
  const url = (process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co").trim().replace(/\/$/, "");
  // The sign-in (publishable) key is the one meant for password sign-in; the server key works too.
  const key = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) throw new PasswordChangeError("Password service is not configured.");
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 429) throw new PasswordChangeError("Too many attempts. Wait a few minutes and try again.");
  if (!res.ok) return false;
  const session = await res.json().catch(() => null);
  // Revoke only the throw-away session created by this check.
  if (session?.access_token)
    await fetch(`${url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  return Boolean(session?.access_token);
}
