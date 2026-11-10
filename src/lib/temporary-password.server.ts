/**
 * One-time temporary passwords for new or reset staff accounts.
 * Generated on the server with a cryptographic RNG, shown once to the
 * administrator, never stored or logged by the portal (Supabase Auth keeps
 * only a bcrypt hash). The account is flagged so the employee must choose
 * their own password at first sign-in.
 */
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGIT = "23456789";
const ALL = LOWER + UPPER + DIGIT;

function pick(set: string, n: number) {
  const bytes = new Uint32Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => set[b % set.length]);
}

export function generateTemporaryPassword(length = 14): string {
  const chars = [...pick(LOWER, 1), ...pick(UPPER, 1), ...pick(DIGIT, 1), ...pick(ALL, length - 3)];
  // Fisher–Yates shuffle with crypto randomness
  const r = new Uint32Array(chars.length);
  crypto.getRandomValues(r);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = r[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Mark (or clear) the "must choose own password" flag, keeping other app_metadata. */
export async function setMustChangePassword(supabaseAdmin: any, userId: string, value: boolean, password?: string) {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const app = { ...(data?.user?.app_metadata || {}), must_change_password: value };
  const update: Record<string, unknown> = { app_metadata: app };
  if (password) update.password = password;
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, update);
  if (error) throw error;
}
