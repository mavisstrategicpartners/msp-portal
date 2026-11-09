/**
 * Forgot Password — core rules (no framework or Supabase imports, so it can be
 * tested on its own). Wired to Supabase and the mailer in password-reset.server.ts.
 *
 * Flow: request code → verify code → set new password (with a one-time token).
 *  - 6-digit codes from a CSPRNG, stored only as HMAC-SHA256 hashes
 *  - codes expire after 10 minutes and can be accepted once
 *  - a new code invalidates every earlier unused code for that email
 *  - 5 wrong guesses lock the code; a new code must be requested
 *  - resend cooldown 60 s; max 5 codes per email per hour; 20 per IP per hour
 *  - responses never reveal whether an email has an account
 */
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { normaliseEmail, passwordProblems } from "@/lib/password-rules";

export { normaliseEmail, passwordProblems };

export const CODE_TTL_MS = 10 * 60_000;
export const TOKEN_TTL_MS = 15 * 60_000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60_000;
export const MAX_CODES_PER_EMAIL_PER_HOUR = 5;
export const MAX_CODES_PER_IP_PER_HOUR = 20;

export type ResetRow = {
  id: string;
  email: string;
  user_id: string | null;
  code_hash: string;
  expires_at: string;
  attempts: number;
  verified_at: string | null;
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
  completed_at: string | null;
  invalidated_at: string | null;
  request_ip: string | null;
  created_at: string;
};

export interface ResetStore {
  countSince(filter: { email?: string; ip?: string }, sinceIso: string): Promise<number>;
  latestForEmail(email: string): Promise<ResetRow | null>;
  insert(row: Omit<ResetRow, "id" | "created_at"> & { created_at?: string }): Promise<string>;
  update(id: string, patch: Partial<ResetRow>): Promise<void>;
  invalidateOpen(email: string, nowIso: string): Promise<void>;
  invalidateAllForUser(userId: string, nowIso: string): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<ResetRow | null>;
}

export interface ResetDeps {
  store: ResetStore;
  findActiveUserId(email: string): Promise<string | null>;
  setPassword(userId: string, password: string): Promise<void>;
  revokeSessions(userId: string): Promise<void>;
  mailer: {
    configured: boolean;
    send(msg: { to: string; subject: string; html: string; text: string }): Promise<void>;
  };
  audit?(action: string, userId: string | null, details: Record<string, unknown>): Promise<void>;
  secret: string;
  now?: () => number;
  /** Small random delay for unknown emails so response time does not reveal them. */
  pad?: () => Promise<void>;
}

export type RequestResult =
  | { ok: true; expiresInMinutes: number; resendAfterSeconds: number }
  | {
      ok: false;
      error: "invalid_email" | "rate_limited" | "email_unavailable";
      message: string;
      retryAfterSeconds?: number;
    };

export type VerifyResult =
  | { ok: true; resetToken: string; tokenExpiresInMinutes: number }
  | {
      ok: false;
      error: "invalid_code" | "expired" | "too_many_attempts" | "no_active_code";
      message: string;
      attemptsRemaining?: number;
    };

export type ResetResult =
  | { ok: true }
  | { ok: false; error: "weak_password" | "mismatch" | "invalid_token"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hmac(secret: string, purpose: string, email: string, value: string) {
  return createHmac("sha256", secret).update(`${purpose}:${email}:${value}`).digest("hex");
}

function sameHash(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}

export function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function requestResetCode(
  deps: ResetDeps,
  rawEmail: string,
  ip: string | null,
): Promise<RequestResult> {
  const now = (deps.now ?? Date.now)();
  const email = normaliseEmail(rawEmail);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "invalid_email", message: "Enter a valid email address." };
  }
  if (!deps.mailer.configured) {
    return {
      ok: false,
      error: "email_unavailable",
      message: "Password reset email is not set up yet. Please contact IT support.",
    };
  }

  // Rate limits apply to every address (registered or not) so they reveal nothing.
  const latest = await deps.store.latestForEmail(email);
  if (latest) {
    const since = now - new Date(latest.created_at).getTime();
    if (since < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - since) / 1000);
      return {
        ok: false,
        error: "rate_limited",
        retryAfterSeconds: wait,
        message: `Please wait ${wait} seconds before requesting another code.`,
      };
    }
  }
  const hourAgo = new Date(now - 3_600_000).toISOString();
  if ((await deps.store.countSince({ email }, hourAgo)) >= MAX_CODES_PER_EMAIL_PER_HOUR) {
    return {
      ok: false,
      error: "rate_limited",
      retryAfterSeconds: 3600,
      message: "Too many codes requested for this email. Please try again in an hour.",
    };
  }
  if (ip && (await deps.store.countSince({ ip }, hourAgo)) >= MAX_CODES_PER_IP_PER_HOUR) {
    return {
      ok: false,
      error: "rate_limited",
      retryAfterSeconds: 3600,
      message: "Too many reset requests. Please try again later.",
    };
  }

  const userId = await deps.findActiveUserId(email);
  const code = generateCode();
  const nowIso = new Date(now).toISOString();

  await deps.store.invalidateOpen(email, nowIso); // a new code replaces all earlier ones
  await deps.store.insert({
    email,
    user_id: userId,
    code_hash: hmac(deps.secret, "code", email, code),
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
    attempts: 0,
    verified_at: null,
    reset_token_hash: null,
    reset_token_expires_at: null,
    completed_at: null,
    invalidated_at: null,
    request_ip: ip,
    created_at: nowIso,
  });

  if (userId) {
    try {
      await deps.mailer.send(resetEmail(email, code));
      await deps.audit?.("password_reset_code_sent", userId, { email });
    } catch (err) {
      // Logged for IT; the response stays generic so it cannot reveal the account.
      console.error("[password-reset] email delivery failed:", (err as Error)?.message || err);
      await deps.audit?.("password_reset_email_failed", userId, {
        email,
        error: String((err as Error)?.message || err),
      });
    }
  } else {
    await deps.pad?.();
  }

  return {
    ok: true,
    expiresInMinutes: CODE_TTL_MS / 60_000,
    resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
  };
}

export async function verifyResetCode(
  deps: ResetDeps,
  rawEmail: string,
  rawCode: string,
): Promise<VerifyResult> {
  const now = (deps.now ?? Date.now)();
  const email = normaliseEmail(rawEmail);
  const code = (rawCode || "").replace(/\D/g, "");
  const row = await deps.store.latestForEmail(email);

  if (!row || row.invalidated_at || row.verified_at || row.completed_at) {
    return {
      ok: false,
      error: "no_active_code",
      message: "This code is no longer valid. Request a new code.",
    };
  }
  if (new Date(row.expires_at).getTime() <= now) {
    return { ok: false, error: "expired", message: "This code has expired. Request a new code." };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      error: "too_many_attempts",
      message: "Too many incorrect attempts. Request a new code.",
    };
  }

  const matches =
    code.length === 6 && sameHash(hmac(deps.secret, "code", email, code), row.code_hash);
  if (!matches || !row.user_id) {
    const attempts = row.attempts + 1;
    const patch: Partial<ResetRow> = { attempts };
    if (attempts >= MAX_ATTEMPTS) patch.invalidated_at = new Date(now).toISOString();
    await deps.store.update(row.id, patch);
    const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
    return remaining > 0
      ? {
          ok: false,
          error: "invalid_code",
          attemptsRemaining: remaining,
          message: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        }
      : {
          ok: false,
          error: "too_many_attempts",
          attemptsRemaining: 0,
          message: "Too many incorrect attempts. Request a new code.",
        };
  }

  const token = randomBytes(32).toString("base64url");
  await deps.store.update(row.id, {
    verified_at: new Date(now).toISOString(), // the code is now spent
    reset_token_hash: hmac(deps.secret, "token", email, token),
    reset_token_expires_at: new Date(now + TOKEN_TTL_MS).toISOString(),
  });
  return { ok: true, resetToken: token, tokenExpiresInMinutes: TOKEN_TTL_MS / 60_000 };
}

export async function resetPassword(
  deps: ResetDeps,
  rawEmail: string,
  resetToken: string,
  password: string,
  confirmPassword: string,
): Promise<ResetResult> {
  const now = (deps.now ?? Date.now)();
  const email = normaliseEmail(rawEmail);
  if (password !== confirmPassword) {
    return { ok: false, error: "mismatch", message: "The passwords do not match." };
  }
  const problems = passwordProblems(password, email);
  if (problems.length) {
    return {
      ok: false,
      error: "weak_password",
      message: `Your password needs ${problems.join(", ")}.`,
    };
  }

  const row = resetToken
    ? await deps.store.findByTokenHash(hmac(deps.secret, "token", email, resetToken))
    : null;
  const valid =
    row &&
    row.email === email &&
    row.user_id &&
    row.verified_at &&
    !row.completed_at &&
    !row.invalidated_at &&
    row.reset_token_expires_at &&
    new Date(row.reset_token_expires_at).getTime() > now;
  if (!valid) {
    return {
      ok: false,
      error: "invalid_token",
      message: "Your reset session has expired. Please start again.",
    };
  }

  await deps.setPassword(row.user_id!, password); // Supabase Auth hashes the password (bcrypt)
  const nowIso = new Date(now).toISOString();
  await deps.store.update(row.id, { completed_at: nowIso });
  await deps.store.invalidateAllForUser(row.user_id!, nowIso);
  await deps.revokeSessions(row.user_id!); // sign out every existing session
  await deps.audit?.("password_reset_completed", row.user_id!, { email });
  try {
    await deps.mailer.send(passwordChangedEmail(email));
  } catch (err) {
    console.warn("[password-reset] confirmation email failed:", (err as Error)?.message || err);
  }
  return { ok: true };
}

// ── Emails ──────────────────────────────────────────────────────────────────

function shell(title: string, inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="background:#3b1d4d;padding:28px 24px;text-align:center;">
<div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.3px;">Mavis Strategic Partners</div>
<div style="color:#e9d5ff;font-size:12px;margin-top:6px;">Company Operations &amp; Performance Portal</div></td></tr>
<tr><td style="padding:28px 24px;font-size:15px;line-height:1.6;">${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#faf7fc;border-top:1px solid #eee;font-size:12px;color:#64748b;text-align:center;">
This is an automated security message from Mavis Strategic Partners. Need help? Email info@mavisstrategicpartners.co.za</td></tr>
</table></td></tr></table></body></html>`;
}

export function resetEmail(to: string, code: string) {
  const subject = "MSP Account Password Reset Verification Code";
  const html = shell(
    subject,
    `<p style="margin:0 0 14px;">Hello,</p>
<p style="margin:0 0 18px;">We received a request to reset the password for your MSP portal account. Enter this verification code on the password reset page:</p>
<div style="text-align:center;margin:0 0 18px;"><span style="display:inline-block;padding:14px 22px;border-radius:10px;background:#f5f0fa;border:1px solid #e3d5f0;font-size:32px;font-weight:800;letter-spacing:8px;color:#3b1d4d;font-family:'SFMono-Regular',Consolas,monospace;">${code}</span></div>
<p style="margin:0 0 10px;"><strong>This code expires in 10 minutes</strong> and can only be used once.</p>
<p style="margin:0 0 10px;">Do not share this code with anyone. MSP staff will never ask you for it.</p>
<p style="margin:0;color:#64748b;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>`,
  );
  const text = `MSP Account Password Reset Verification Code

We received a request to reset the password for your MSP portal account.

Your verification code: ${code}

This code expires in 10 minutes and can only be used once.
Do not share this code with anyone.
If you did not request a password reset, ignore this email. Your password will not change.

Mavis Strategic Partners`;
  return { to, subject, html, text };
}

export function passwordChangedEmail(to: string) {
  const subject = "Your MSP portal password was changed";
  const html = shell(
    subject,
    `<p style="margin:0 0 14px;">Hello,</p>
<p style="margin:0 0 14px;">The password for your MSP portal account was just changed using a verification code, and you were signed out on all devices.</p>
<p style="margin:0;color:#64748b;">If this wasn't you, contact IT support immediately at info@mavisstrategicpartners.co.za.</p>`,
  );
  const text = `The password for your MSP portal account was just changed and you were signed out on all devices.
If this wasn't you, contact IT support immediately at info@mavisstrategicpartners.co.za.`;
  return { to, subject, html, text };
}
