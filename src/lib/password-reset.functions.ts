/**
 * Forgot Password server functions (public: the user is signed out).
 * All checks happen on the server; responses never contain codes or reveal
 * whether an email belongs to an account.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

function clientIp(): string | null {
  try {
    const h = getRequest()?.headers;
    const fwd = h?.get("x-forwarded-for")?.split(",")[0]?.trim();
    return fwd || h?.get("x-real-ip") || null;
  } catch {
    return null;
  }
}

const emailOnly = z.object({ email: z.string().max(254) });

const UNAVAILABLE = {
  ok: false as const,
  error: "unavailable" as const,
  message:
    "Password reset is temporarily unavailable. Please try again shortly or contact IT support.",
};

/** Configuration or database faults are logged for IT and shown to the user as a clear, generic message. */
async function safely<T>(label: string, fn: () => Promise<T>): Promise<T | typeof UNAVAILABLE> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[password-reset] ${label} failed:`, (err as Error)?.message || err);
    return UNAVAILABLE;
  }
}

/** Step 1 (and Resend): email a new 6-digit code. */
export const requestPasswordResetCode = createServerFn({ method: "POST" })
  .validator((d: unknown) => emailOnly.parse(d))
  .handler(async ({ data }) => {
    const { requestResetCode } = await import("@/lib/password-reset.core");
    const { getResetDeps } = await import("@/lib/password-reset.server");
    return safely("request", async () => requestResetCode(getResetDeps(), data.email, clientIp()));
  });

/** Step 2: check the code; returns a one-time reset token on success. */
export const verifyPasswordResetCode = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: z.string().max(254), code: z.string().max(12) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { verifyResetCode } = await import("@/lib/password-reset.core");
    const { getResetDeps } = await import("@/lib/password-reset.server");
    return safely("verify", async () => verifyResetCode(getResetDeps(), data.email, data.code));
  });

/** Step 3: set the new password with the reset token from step 2. */
export const completePasswordReset = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        email: z.string().max(254),
        resetToken: z.string().max(200),
        password: z.string().max(200),
        confirmPassword: z.string().max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { resetPassword } = await import("@/lib/password-reset.core");
    const { getResetDeps } = await import("@/lib/password-reset.server");
    return safely("reset", async () =>
      resetPassword(
        getResetDeps(),
        data.email,
        data.resetToken,
        data.password,
        data.confirmPassword,
      ),
    );
  });
