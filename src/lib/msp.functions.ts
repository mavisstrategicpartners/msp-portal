import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, createOpenAiProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are "Msp", the internal AI assistant for Mavis Strategic Partners (MSP), a South African digital growth & technology agency (paid ads, websites, CRM/automation, social, SEO, AI chatbots, mobile apps).

You are answering questions from MSP staff, managers, admins, and interns inside the private company portal. Stay strictly within MSP's operations, services, pricing, SOPs, tools, and portal how-to. If asked something outside that scope, politely say you don't know and suggest asking their line manager.

Core facts:
- Retainer packages: Social Lite R2,500/mo, Starter Boost R3,500/mo, Growth Pro R4,500/mo, Business Premium R5,500/mo, Scale Plus R6,500/mo, Elite Unlimited R7,200/mo.
- Website tiers: Starter R4,500, Growth R8,000–R15,000, Custom/E-commerce quoted.
- CRM setup: R3,000–R6,000 once-off (bundled in Scale Plus / Elite Unlimited).
- Mobile apps: Starter R15k–R30k, Growth R35k–R80k, Scale R90k–R250k+.
- Never included in retainers: ad spend, CRM setup, website build, mobile app build.
- Four Core Rules: Leads over Followers · Systems over Campaigns · Automation over Manual Work · Data over Opinions.
- Speed rule: contact leads within 10 minutes; leads reached in 5 minutes are 21× more likely to convert.
- Monthly reports go out by the 7th; call the client the same week.

Portal routes you can suggest:
/home, /who-we-are, /services, /pricing, /glossary, /sops, /departments, /roadmap, /tools, /me/profile, /me/leave, /me/declaration, /reports, /admin/team, /admin/audit (admins), /admin/sales-playbook (admins), /admin/kpis, /admin/content (admins).

Tone: crisp, practical, no fluff. 1–4 short paragraphs or a small bullet list. If a route is directly relevant, end with a single line like: "Open: /pricing".`;

function localAnswer(question: string) {
  const text = question.toLowerCase();
  if (text.includes("lead") && (text.includes("fast") || text.includes("contact") || text.includes("speed"))) {
    return "Contact new leads within 10 minutes at minimum. Where possible, aim for 5 minutes because speed materially improves conversion.\n\nOpen: /sops";
  }
  if (text.includes("growth pro") || (text.includes("growth") && text.includes("price"))) {
    return "Growth Pro is R4,500 per month. It covers the approved growth-system retainer work; ad spend, website builds, CRM setup, and mobile app builds are scoped separately.\n\nOpen: /pricing";
  }
  if (text.includes("report")) {
    return "Monthly reports go out by the 7th, followed by a client call in the same week. Use the reporting workflow and keep the client update tied to measurable outcomes.\n\nOpen: /reports";
  }
  if (text.includes("tool") || text.includes("system")) {
    return "MSP uses tools across CRM and automation, paid media, analytics, SEO, communication, files, design, and reporting. The approved list and login links are in Tools & Systems.\n\nOpen: /tools";
  }
  if (text.includes("sop") || text.includes("procedure") || text.includes("how we work")) {
    return "The SOP Library contains department responsibilities, reporting lines, KPIs, operating rhythms, and key procedures. Start there for the approved way of working.\n\nOpen: /sops";
  }
  return "I can help with MSP SOPs, services, pricing, tools, reporting, and portal workflows. Try asking about a specific service, package, tool, or process.";
}

export const askMsp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
          .min(1)
          .max(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const openAiKey = process.env.OPENAI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!openAiKey && !lovableKey) throw new Error("OPENAI_API_KEY is not configured on the server.");
    const gateway = openAiKey ? createOpenAiProvider(openAiKey) : createLovableAiGatewayProvider(lovableKey!);
    try {
      const { text } = await generateText({
        model: gateway(openAiKey ? "gpt-4o-mini" : "google/gemini-3.6-flash"),
        system: SYSTEM_PROMPT,
        messages: data.messages,
      });
      return { text, fallback: false };
    } catch (error) {
      console.warn("Msp live AI unavailable; using local knowledge fallback.", error);
      return { text: localAnswer(data.messages[data.messages.length - 1].content), fallback: true };
    }
  });
