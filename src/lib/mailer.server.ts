/**
 * Transactional email for the portal (server only).
 *
 * Provider is chosen from environment variables — nothing is hard-coded:
 *   SMTP (preferred):  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
 *                      SMTP_FROM_EMAIL, SMTP_FROM_NAME, optional SMTP_SECURE=true|false
 *   Resend (fallback): RESEND_API_KEY, RESEND_FROM_EMAIL (or SMTP_FROM_EMAIL)
 * If neither is configured, `configured` is false and nothing is sent.
 */
export type MailMessage = { to: string; subject: string; html: string; text: string };

export type Mailer = {
  configured: boolean;
  provider: "smtp" | "resend" | "none";
  send(msg: MailMessage): Promise<void>;
};

function fromAddress() {
  const email = process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "";
  const name = process.env.SMTP_FROM_NAME || "Mavis Strategic Partners";
  return { email, header: email ? `"${name.replace(/"/g, "")}" <${email}>` : "" };
}

export function getMailer(): Mailer {
  const from = fromAddress();

  if (process.env.SMTP_HOST && from.email) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
    return {
      configured: true,
      provider: "smtp",
      async send(msg) {
        const nodemailer = (await import("nodemailer")).default;
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          secure,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || "" }
            : undefined,
          connectionTimeout: 15_000,
          greetingTimeout: 15_000,
        });
        await transport.sendMail({
          from: from.header,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        });
      },
    };
  }

  if (process.env.RESEND_API_KEY && from.email) {
    return {
      configured: true,
      provider: "resend",
      async send(msg) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: from.header,
            to: [msg.to],
            subject: msg.subject,
            html: msg.html,
            text: msg.text,
          }),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
      },
    };
  }

  return {
    configured: false,
    provider: "none",
    async send() {
      throw new Error("No email provider configured (set SMTP_* or RESEND_API_KEY)");
    },
  };
}
