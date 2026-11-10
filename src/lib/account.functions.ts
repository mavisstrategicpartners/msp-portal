import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseSession } from "@/integrations/supabase/auth-middleware";
import { passwordProblems } from "@/lib/password-rules";

const KNOWN_PUBLIC_PASSWORDS = ["staff2026"];

/**
 * First sign-in with a temporary password: the employee sets their own
 * password. Only accounts carrying the must_change_password flag may use this;
 * everyone else changes their password from their profile as before.
 */
export const completePasswordChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .validator((data) => z.object({ newPassword: z.string().min(1).max(72) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { setMustChangePassword } = await import("@/lib/temporary-password.server");
    const { data: found, error } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = found?.user;
    if (error || !user) throw new Error("Your account could not be found. Please sign in again.");
    if (!(user.app_metadata as any)?.must_change_password) {
      throw new Error("Your account does not need a password change.");
    }
    const problems = passwordProblems(data.newPassword, user.email || "");
    if (KNOWN_PUBLIC_PASSWORDS.includes(data.newPassword.toLowerCase())) problems.push("must not be a shared default password");
    if (problems.length) throw new Error(`Your new password needs ${problems.join(", ")}.`);

    await setMustChangePassword(supabaseAdmin, user.id, false, data.newPassword);
    await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: user.id,
      action: "password_set_after_temporary",
      target_id: user.id,
      details: { email: user.email },
    });
    return { ok: true };
  });
