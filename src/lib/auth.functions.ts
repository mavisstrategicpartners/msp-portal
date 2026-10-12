import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passwordNotificationSchema = z.object({
  email: z.string().email(),
});

export const sendPasswordChangeNotification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => passwordNotificationSchema.parse(input))
  .handler(async ({ data }) => {
    const { email } = data;
    let emailSent = false;
    let providerError: string | null = null;

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "info@mavisstrategicpartners.co.za";

    const formattedTime = new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Mavis Strategic Partners <${fromEmail}>`,
            to: [email],
            subject: "Security Alert: Password Changed Successfully — Mavis Strategic Partners",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Changed Successfully</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 24px; color: #1e293b;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                  <tr>
                    <td style="background-color: #3b1d4d; padding: 32px 28px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Mavis Strategic Partners</h1>
                      <p style="color: #e9d5ff; margin: 8px 0 0; font-size: 13px; font-weight: 500;">Internal Corporate Portal Security</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 36px 32px;">
                      <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 14px; margin-bottom: 20px;">
                        <span style="color: #065f46; font-size: 12px; font-weight: 600;">✓ Security Alert</span>
                      </div>
                      <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #0f172a;">Password Changed Successfully</h2>
                      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px; color: #334155;">
                        Hello,
                      </p>
                      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: #334155;">
                        This notification confirms that the password for your corporate account (<strong>${email}</strong>) was successfully changed.
                      </p>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px; margin: 0 0 28px 0;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0 0 6px; font-size: 13px; color: #334155;">
                              <strong>Account:</strong> ${email}
                            </p>
                            <p style="margin: 0 0 6px; font-size: 13px; color: #334155;">
                              <strong>Time of Change:</strong> ${formattedTime} SAST
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #334155;">
                              <strong>Status:</strong> Active &amp; Verified
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
                        If you made this change, you do not need to take any further action. You can now access the portal with your updated password.
                      </p>

                      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;">
                        <p style="font-size: 13px; line-height: 1.5; color: #b91c1c; margin: 0 0 8px; font-weight: 600;">
                          Did not request or authorize this change?
                        </p>
                        <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0;">
                          If you did not perform this action, please notify IT Directory Services immediately at 
                          <a href="mailto:info@mavisstrategicpartners.co.za" style="color: #3b1d4d; font-weight: 600; text-decoration: underline;">info@mavisstrategicpartners.co.za</a> 
                          or contact your administrator to protect your account.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
                        © ${new Date().getFullYear()} Mavis Strategic Partners (Pty) Ltd. All rights reserved.<br>
                        This is an automated system email. Confidential and intended solely for the recipient.
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          }),
        });

        if (response.ok) {
          emailSent = true;
        } else {
          providerError = await response.text();
          console.warn("[Auth Notification] Resend API error:", providerError);
        }
      } catch (err: any) {
        providerError = err?.message || String(err);
        console.warn("[Auth Notification] Error dispatching email:", providerError);
      }
    } else {
      console.info(
        `[Auth Notification] Password changed for ${email}. RESEND_API_KEY not configured in environment; audit record created.`,
      );
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "password_reset_confirmed",
        details: {
          email,
          email_sent: emailSent,
          timestamp: new Date().toISOString(),
          provider_status: emailSent ? "delivered" : resendApiKey ? "resend_error" : "no_resend_key",
          provider_error: providerError,
        },
      });
    } catch (auditErr) {
      console.warn("[Auth Notification] Audit log recording failed:", auditErr);
    }

    return {
      success: true,
      emailSent,
      hasKey: Boolean(resendApiKey),
    };
  });
