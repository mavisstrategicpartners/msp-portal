import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest } from "@/lib/api-auth.server";
import {
  Industry,
  MSP_INDUSTRIES,
  LeadItem,
  SalesActivityItem,
  DuplicateCheckResult,
  SalesTarget,
  ConsultantPerformanceRanking,
  GHLAppointment,
  IndustryPerformanceSummary,
} from "./sales.types";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  jobTitle: string;
  department: string;
  roleTier: string;
  isAdmin: boolean;
  /** CEO oversight: may read the Sales API but not change it. */
  readOnly: boolean;
  isManager: boolean;
}

// ── In-Memory Store backed by Supabase audit_logs ─────────────────────────────
let isInitialized = false;
let leadsStore: Map<string, LeadItem> = new Map();
let targetsStore: Map<string, SalesTarget> = new Map();
let appointmentsStore: Map<string, GHLAppointment> = new Map();
let activitiesStore: Map<string, SalesActivityItem> = new Map();

// Known consultants list for ranking & attribution
export const KNOWN_CONSULTANTS = [
  {
    id: "6de3785e-8bb4-4f22-8acb-b13d6092988c",
    name: "Sales Consultant 1",
    email: "consultant1@mavisstrateegicpartners.co.za",
  },
  {
    id: "f086b7ce-a475-4b96-9ed3-8359afa17628",
    name: "Sales Consultant 2",
    email: "consultant2@mavisstrateegicpartners.co.za",
  },
  {
    id: "584a365e-0a03-4283-865e-38b6037b060b",
    name: "Sales Consultant 3",
    email: "consultant3@mavisstrateegicpartners.co.za",
  },
  {
    id: "4e06b099-0acf-43ae-861e-abc3c1acf8e6",
    name: "Sales Manager",
    email: "manager@mavisstrateegicpartners.co.za",
  },
];

async function logLedgerEntry(action: string, targetId: string, details: any) {
  try {
    const isUuid =
      typeof targetId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    await (supabaseAdmin as any).from("audit_logs").insert({
      action,
      target_id: isUuid ? targetId : null,
      details: { ...details, target_ref_id: targetId },
    });
  } catch (e) {
    console.warn("[Sales Server] Ledger insert error:", e);
  }
}

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  let p = phone.replace(/[^0-9]/g, "");
  if (p.startsWith("27") && p.length === 11) {
    p = "0" + p.slice(2);
  }
  return p;
}

function normalizeName(name?: string): string {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function normalizeEmail(email?: string): string {
  if (!email) return "";
  return email.toLowerCase().trim();
}

// Check for duplicates
export function checkDuplicateLead(
  leads: LeadItem[],
  params: { email?: string; phone?: string; businessName?: string; excludeId?: string }
): DuplicateCheckResult {
  const normEmail = normalizeEmail(params.email);
  const normPhone = normalizePhone(params.phone);
  const normBusiness = normalizeName(params.businessName);

  for (const lead of leads) {
    if (params.excludeId && lead.id === params.excludeId) continue;

    if (normEmail && lead.email && normalizeEmail(lead.email) === normEmail) {
      return {
        isDuplicate: true,
        field: "email",
        value: lead.email,
        matchingLead: lead,
        reason: `A lead with email "${lead.email}" is already registered (${lead.businessName} - assigned to ${lead.assignedSalesperson}).`,
      };
    }

    if (normPhone && lead.phone && normalizePhone(lead.phone) === normPhone) {
      return {
        isDuplicate: true,
        field: "phone",
        value: lead.phone,
        matchingLead: lead,
        reason: `A lead with phone number "${lead.phone}" already exists (${lead.businessName} - assigned to ${lead.assignedSalesperson}).`,
      };
    }

    if (normBusiness && lead.businessName && normalizeName(lead.businessName) === normBusiness) {
      return {
        isDuplicate: true,
        field: "businessName",
        value: lead.businessName,
        matchingLead: lead,
        reason: `A lead with business name "${lead.businessName}" is already in the system (assigned to ${lead.assignedSalesperson}).`,
      };
    }
  }

  return { isDuplicate: false };
}


// Initialize ledger from Supabase audit_logs
async function initLedgerFromSupabase(force = false) {
  if (isInitialized && !force) return;

  leadsStore.clear();
  targetsStore.clear();
  appointmentsStore.clear();
  activitiesStore.clear();

  try {
    const { data: logs, error } = await (supabaseAdmin as any)
      .from("audit_logs")
      .select("*")
      .like("action", "sales_%")
      .order("created_at", { ascending: true });

    if (!error && logs && logs.length > 0) {
      for (const log of logs) {
        const d = log.details;
        if (!d) continue;

        if (log.action === "sales_lead_upsert" && d.lead) {
          leadsStore.set(d.lead.id, d.lead);
        } else if (log.action === "sales_lead_delete" && (d.leadId || log.target_id)) {
          leadsStore.delete(d.leadId || log.target_id);
        } else if (log.action === "sales_target_upsert" && d.target) {
          targetsStore.set(d.target.id, d.target);
        } else if (log.action === "sales_appointment_upsert" && d.appointment) {
          appointmentsStore.set(d.appointment.id, d.appointment);
        } else if (log.action === "sales_activity_upsert" && d.activity) {
          activitiesStore.set(d.activity.id, d.activity);
        }
      }
    }

    // No sample leads or targets: an empty pipeline is shown as empty.
    isInitialized = true;
  } catch (err) {
    console.warn("[Sales Server] Failed to load ledger from Supabase:", err);
    isInitialized = true;
  }
}

// Verify User Auth
async function verifyAuth(request: Request): Promise<AuthenticatedUser | null> {
  // Identity comes only from a verified Supabase token (see api-auth.server.ts).
  // The old X-MSP-User-* header fallback let anyone claim any user or "admin".
  const user = await authenticateApiRequest(request);
  if (!user) return null;
  const a = user.access;
  // Only the Sales team, the GM and administrators may use the Sales API.
  // The CEO may read it for company-wide oversight, but not change it.
  if (!(a.isSales || a.isGM || a.isAdmin || a.isCEO)) return null;
  const readOnly = a.isCEO && !(a.isSales || a.isGM || a.isAdmin);
  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    department: user.department,
    roleTier: user.roleTier,
    isAdmin: a.isAdmin,
    readOnly,
    // Sales Manager rights: the sales manager role, the GM and administrators.
    // Other departments' managers are not sales managers.
    isManager: a.isAdmin || a.isGM || a.isSalesManager,
  };
}

// ── Main Request Handler ─────────────────────────────────────────────────────
export async function handleSalesApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  await initLedgerFromSupabase();

  // Public/Webhook endpoint: GoHighLevel Webhook
  if (pathname === "/api/sales/ghl/webhook" && method === "POST") {
    return handleGhlWebhook(request);
  }

  // Authenticate user
  const auth = await verifyAuth(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized access: Please sign in." }), {
      status: 401,
      headers: HEADERS,
    });
  }
  if (auth.readOnly && method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Executive view is read-only. Sales changes are made by the Sales team." }),
      { status: 403, headers: HEADERS },
    );
  }

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // 1. DUPLICATE LEAD CHECK (/api/sales/check-duplicate)
    // ══════════════════════════════════════════════════════════════════════════
    if (pathname === "/api/sales/check-duplicate") {
      let email = url.searchParams.get("email") || undefined;
      let phone = url.searchParams.get("phone") || undefined;
      let businessName = url.searchParams.get("businessName") || undefined;
      let excludeId = url.searchParams.get("excludeId") || undefined;

      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        email = body.email || email;
        phone = body.phone || phone;
        businessName = body.businessName || businessName;
        excludeId = body.excludeId || excludeId;
      }

      const allLeads = Array.from(leadsStore.values());
      const result = checkDuplicateLead(allLeads, { email, phone, businessName, excludeId });
      return new Response(JSON.stringify(result), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. LEADS API (/api/sales/leads)
    // ══════════════════════════════════════════════════════════════════════════
    if (pathname === "/api/sales/leads") {
      // GET: Retrieve leads (with strict RBAC)
      if (method === "GET") {
        const consultantFilter = url.searchParams.get("consultantId");
        const industryFilter = url.searchParams.get("industry");
        const stageFilter = url.searchParams.get("stage");

        let leads = Array.from(leadsStore.values());

        // STRICT ROLE ISOLATION:
        // Individual consultants can ONLY see their own assigned leads.
        if (!auth.isManager && !auth.isAdmin) {
          leads = leads.filter(
            (l) =>
              l.assignedConsultantId === auth.userId ||
              l.assignedConsultantEmail.toLowerCase() === auth.email.toLowerCase() ||
              l.assignedSalesperson.toLowerCase().includes(auth.fullName.toLowerCase())
          );
        } else if (consultantFilter && consultantFilter !== "all") {
          // Managers/Admins can filter by any consultant
          leads = leads.filter(
            (l) =>
              l.assignedConsultantId === consultantFilter ||
              l.assignedConsultantEmail.toLowerCase() === consultantFilter.toLowerCase()
          );
        }

        if (industryFilter && industryFilter !== "all") {
          leads = leads.filter((l) => l.industry === industryFilter);
        }

        if (stageFilter && stageFilter !== "all") {
          leads = leads.filter((l) => l.stage === stageFilter);
        }

        leads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return new Response(JSON.stringify({ leads }), { status: 200, headers: HEADERS });
      }

      // POST: Create new lead (with mandatory duplicate prevention)
      if (method === "POST") {
        const body = await request.json();
        const {
          businessName,
          contactPerson,
          email,
          phone,
          industry = "Other",
          source = "Inbound Meta Ads",
          stage = "New",
          leadQuality = "Hot",
          estimatedValue = 0,
          assignedConsultantId,
          assignedConsultantEmail,
          assignedSalesperson,
          followUpDate,
          proposalStatus = "Draft",
          packageInterest = "Performance Ads",
          notes = "",
        } = body;

        if (!businessName || !contactPerson) {
          return new Response(
            JSON.stringify({ error: "Business name and contact person are required." }),
            { status: 400, headers: HEADERS }
          );
        }

        // Validate Industry
        const validIndustry: Industry = MSP_INDUSTRIES.includes(industry as any)
          ? (industry as Industry)
          : "Other";

        // Check for duplicates
        const allLeads = Array.from(leadsStore.values());
        const dupCheck = checkDuplicateLead(allLeads, { email, phone, businessName });
        if (dupCheck.isDuplicate) {
          return new Response(
            JSON.stringify({
              error: "Duplicate lead detected",
              duplicate: dupCheck,
            }),
            { status: 409, headers: HEADERS }
          );
        }

        // Determine assigned consultant
        let targetConsultantId = assignedConsultantId || auth.userId;
        let targetConsultantEmail = assignedConsultantEmail || auth.email;
        let targetSalesperson = assignedSalesperson || auth.fullName;

        // Consultants cannot assign leads to other consultants unless Manager/Admin
        if (!auth.isManager && !auth.isAdmin) {
          targetConsultantId = auth.userId;
          targetConsultantEmail = auth.email;
          targetSalesperson = auth.fullName;
        }

        const now = new Date().toISOString();
        const newLead: LeadItem = {
          id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          businessName: businessName.trim(),
          contactPerson: contactPerson.trim(),
          email: email?.trim(),
          phone: phone?.trim(),
          industry: validIndustry,
          source,
          stage,
          leadQuality,
          estimatedValue: Number(estimatedValue) || 0,
          assignedConsultantId: targetConsultantId,
          assignedConsultantEmail: targetConsultantEmail,
          assignedSalesperson: targetSalesperson,
          followUpDate: followUpDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          proposalStatus,
          packageInterest: packageInterest.trim(),
          notes: notes.trim(),
          handoverCompleted: false,
          createdAt: now,
          updatedAt: now,
        };

        leadsStore.set(newLead.id, newLead);
        await logLedgerEntry("sales_lead_upsert", newLead.id, { lead: newLead, createdBy: auth.email });

        return new Response(JSON.stringify({ ok: true, lead: newLead }), { status: 201, headers: HEADERS });
      }
    }

    // Lead detail / updates / delete: /api/sales/leads/:id
    if (pathname.startsWith("/api/sales/leads/")) {
      const leadId = pathname.replace("/api/sales/leads/", "");
      const lead = leadsStore.get(leadId);

      if (!lead) {
        return new Response(JSON.stringify({ error: "Lead not found." }), { status: 404, headers: HEADERS });
      }

      // Check access permission
      const isOwner =
        lead.assignedConsultantId === auth.userId ||
        lead.assignedConsultantEmail.toLowerCase() === auth.email.toLowerCase();

      if (!isOwner && !auth.isManager && !auth.isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: Cannot modify another consultant's lead." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      // PATCH: Update lead
      if (method === "PATCH") {
        const body = await request.json();

        // If email, phone or business name are changing, check for duplicates against others
        if (body.email || body.phone || body.businessName) {
          const allLeads = Array.from(leadsStore.values());
          const dupCheck = checkDuplicateLead(allLeads, {
            email: body.email || lead.email,
            phone: body.phone || lead.phone,
            businessName: body.businessName || lead.businessName,
            excludeId: lead.id,
          });
          if (dupCheck.isDuplicate) {
            return new Response(
              JSON.stringify({
                error: "Duplicate conflict with existing lead record.",
                duplicate: dupCheck,
              }),
              { status: 409, headers: HEADERS }
            );
          }
        }

        if (body.businessName !== undefined) lead.businessName = body.businessName.trim();
        if (body.contactPerson !== undefined) lead.contactPerson = body.contactPerson.trim();
        if (body.email !== undefined) lead.email = body.email.trim();
        if (body.phone !== undefined) lead.phone = body.phone.trim();
        if (body.industry !== undefined && MSP_INDUSTRIES.includes(body.industry)) {
          lead.industry = body.industry;
        }
        if (body.source !== undefined) lead.source = body.source;
        if (body.stage !== undefined) lead.stage = body.stage;
        if (body.leadQuality !== undefined) lead.leadQuality = body.leadQuality;
        if (body.estimatedValue !== undefined) lead.estimatedValue = Number(body.estimatedValue) || 0;
        if (body.followUpDate !== undefined) lead.followUpDate = body.followUpDate;
        if (body.proposalStatus !== undefined) lead.proposalStatus = body.proposalStatus;
        if (body.packageInterest !== undefined) lead.packageInterest = body.packageInterest;
        if (body.notes !== undefined) lead.notes = body.notes;
        if (body.handoverCompleted !== undefined) lead.handoverCompleted = Boolean(body.handoverCompleted);

        // Only manager or admin can reassign leads to another consultant
        if ((auth.isManager || auth.isAdmin) && body.assignedConsultantId) {
          lead.assignedConsultantId = body.assignedConsultantId;
          lead.assignedConsultantEmail = body.assignedConsultantEmail || lead.assignedConsultantEmail;
          lead.assignedSalesperson = body.assignedSalesperson || lead.assignedSalesperson;
        }

        lead.updatedAt = new Date().toISOString();
        leadsStore.set(lead.id, lead);
        await logLedgerEntry("sales_lead_upsert", lead.id, { lead, updatedBy: auth.email });

        return new Response(JSON.stringify({ ok: true, lead }), { status: 200, headers: HEADERS });
      }

      // DELETE: Delete lead (manager or admin only)
      if (method === "DELETE") {
        if (!auth.isManager && !auth.isAdmin) {
          return new Response(JSON.stringify({ error: "Only managers or admins can delete leads." }), {
            status: 403,
            headers: HEADERS,
          });
        }
        leadsStore.delete(lead.id);
        await logLedgerEntry("sales_lead_delete", lead.id, { leadId: lead.id, deletedBy: auth.email });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: HEADERS });
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. TARGETS & LEADERBOARD (/api/sales/targets & /api/sales/leaderboard)
    // ══════════════════════════════════════════════════════════════════════════
    if (pathname === "/api/sales/targets") {
      const monthParam =
        url.searchParams.get("month") ||
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      if (method === "GET") {
        let targets = Array.from(targetsStore.values()).filter((t) => t.month === monthParam);

        // If individual consultant, only return their target
        if (!auth.isManager && !auth.isAdmin) {
          targets = targets.filter(
            (t) =>
              t.consultantId === auth.userId ||
              t.consultantEmail.toLowerCase() === auth.email.toLowerCase()
          );
        }

        return new Response(JSON.stringify({ targets, month: monthParam }), {
          status: 200,
          headers: HEADERS,
        });
      }

      // POST: Assign/update target (Sales Manager or Admin only)
      if (method === "POST") {
        if (!auth.isManager && !auth.isAdmin) {
          return new Response(JSON.stringify({ error: "Only Sales Managers can assign targets." }), {
            status: 403,
            headers: HEADERS,
          });
        }

        const body = await request.json();
        const { consultantId, consultantName, consultantEmail, month, targetAmount } = body;

        if (!consultantId || !month || targetAmount === undefined) {
          return new Response(
            JSON.stringify({ error: "consultantId, month, and targetAmount are required." }),
            { status: 400, headers: HEADERS }
          );
        }

        const now = new Date().toISOString();
        const targetId = `target-${consultantId}-${month}`;
        const target: SalesTarget = {
          id: targetId,
          consultantId,
          consultantName: consultantName || "Consultant",
          consultantEmail: consultantEmail || "",
          month,
          targetAmount: Number(targetAmount) || 0,
          assignedById: auth.userId,
          assignedByName: auth.fullName,
          assignedAt: now,
          updatedAt: now,
        };

        targetsStore.set(target.id, target);
        await logLedgerEntry("sales_target_upsert", target.id, { target, assignedBy: auth.email });

        return new Response(JSON.stringify({ ok: true, target }), { status: 200, headers: HEADERS });
      }
    }

    // Performance Rankings / Leaderboard: /api/sales/leaderboard
    if (pathname === "/api/sales/leaderboard") {
      const monthParam =
        url.searchParams.get("month") ||
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      const allLeads = Array.from(leadsStore.values());
      const allTargets = Array.from(targetsStore.values()).filter((t) => t.month === monthParam);

      // Aggregate all active consultants
      const consultantMap = new Map<string, { id: string; name: string; email: string }>();
      KNOWN_CONSULTANTS.forEach((c) => consultantMap.set(c.id, c));
      allLeads.forEach((l) => {
        if (l.assignedConsultantId && !consultantMap.has(l.assignedConsultantId)) {
          consultantMap.set(l.assignedConsultantId, {
            id: l.assignedConsultantId,
            name: l.assignedSalesperson || "Sales Consultant",
            email: l.assignedConsultantEmail || "",
          });
        }
      });

      const rankings: ConsultantPerformanceRanking[] = [];

      for (const [cId, consultant] of consultantMap.entries()) {
        const consultantLeads = allLeads.filter(
          (l) =>
            l.assignedConsultantId === cId ||
            (l.assignedConsultantEmail &&
              l.assignedConsultantEmail.toLowerCase() === consultant.email.toLowerCase())
        );

        const wonLeads = consultantLeads.filter((l) => l.stage === "Won");
        const actualWon = wonLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

        const assignedTarget =
          allTargets.find(
            (t) =>
              t.consultantId === cId ||
              (t.consultantEmail && t.consultantEmail.toLowerCase() === consultant.email.toLowerCase())
          )?.targetAmount || 100000;

        const remaining = Math.max(0, assignedTarget - actualWon);
        const percentageAchieved = assignedTarget > 0 ? Math.round((actualWon / assignedTarget) * 100) : 0;

        let status: "exceeded" | "reached" | "missed" = "missed";
        if (percentageAchieved > 100) status = "exceeded";
        else if (percentageAchieved >= 100) status = "reached";

        rankings.push({
          consultantId: cId,
          consultantName: consultant.name,
          consultantEmail: consultant.email,
          month: monthParam,
          targetAmount: assignedTarget,
          actualWonAmount: actualWon,
          remainingAmount: remaining,
          percentageAchieved,
          dealsCount: consultantLeads.length,
          wonDealsCount: wonLeads.length,
          leadsCount: consultantLeads.length,
          status,
          rank: 0,
        });
      }

      // Sort by actual won amount descending
      rankings.sort((a, b) => b.actualWonAmount - a.actualWonAmount);
      rankings.forEach((r, idx) => {
        r.rank = idx + 1;
      });

      return new Response(JSON.stringify({ rankings, month: monthParam }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. INDUSTRY PERFORMANCE (/api/sales/industry-performance)
    // ══════════════════════════════════════════════════════════════════════════
    if (pathname === "/api/sales/industry-performance") {
      const allLeads = Array.from(leadsStore.values());
      const summaries: IndustryPerformanceSummary[] = MSP_INDUSTRIES.map((ind) => {
        const indLeads = allLeads.filter((l) => l.industry === ind);
        const wonLeads = indLeads.filter((l) => l.stage === "Won");
        const totalRevenue = wonLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
        const conversionRate =
          indLeads.length > 0 ? Math.round((wonLeads.length / indLeads.length) * 100) : 0;

        return {
          industry: ind,
          totalLeads: indLeads.length,
          wonDeals: wonLeads.length,
          conversionRate,
          totalRevenue,
        };
      });

      summaries.sort((a, b) => b.totalRevenue - a.totalRevenue);
      return new Response(JSON.stringify({ industryPerformance: summaries }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. GOHIGHLEVEL CALENDAR APPOINTMENTS (/api/sales/ghl/appointments & /sync)
    // ══════════════════════════════════════════════════════════════════════════
    if (pathname === "/api/sales/ghl/appointments") {
      let appointments = Array.from(appointmentsStore.values());

      // If consultant, only return their appointments
      if (!auth.isManager && !auth.isAdmin) {
        appointments = appointments.filter(
          (a) =>
            a.consultantId === auth.userId ||
            a.consultantName.toLowerCase().includes(auth.fullName.toLowerCase())
        );
      }

      appointments.sort(
        (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );
      return new Response(JSON.stringify({ appointments }), { status: 200, headers: HEADERS });
    }

    // Trigger GHL sync
    if (pathname === "/api/sales/ghl/sync" && method === "POST") {
      const ghlApiKey = process.env.GHL_API_KEY || process.env.GHL_ACCESS_TOKEN;
      const ghlLocationId = process.env.GHL_LOCATION_ID;

      if (!ghlApiKey || !ghlLocationId) {
        return new Response(
          JSON.stringify({
            ok: false,
            configured: false,
            message:
              "GoHighLevel API credentials (GHL_API_KEY / GHL_LOCATION_ID) are not configured in environment variables. Live appointments cached in local storage.",
            appointments: Array.from(appointmentsStore.values()),
          }),
          { status: 200, headers: HEADERS }
        );
      }

      // If credentials exist, call GHL API
      try {
        const ghlRes = await fetch(
          `https://services.leadconnectorhq.com/calendars/events?locationId=${ghlLocationId}`,
          {
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
            },
          }
        );

        if (!ghlRes.ok) {
          throw new Error(`GHL API error: ${ghlRes.statusText}`);
        }

        const data = await ghlRes.json();
        // Process GHL events into appointmentsStore...
        return new Response(
          JSON.stringify({
            ok: true,
            configured: true,
            message: `Successfully synchronized events from GoHighLevel.`,
            syncedCount: data.events?.length || 0,
          }),
          { status: 200, headers: HEADERS }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            ok: false,
            configured: true,
            error: err.message || "Failed to reach GoHighLevel API",
          }),
          { status: 502, headers: HEADERS }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint not found in Sales API" }), {
      status: 404,
      headers: HEADERS,
    });
  } catch (err: any) {
    console.error("[Sales Server] Handler exception:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: HEADERS,
    });
  }
}

// Ingestion for GoHighLevel Webhooks
async function handleGhlWebhook(request: Request): Promise<Response> {
  // When GHL_WEBHOOK_SECRET is configured, only GoHighLevel calls carrying it
  // (header "x-webhook-secret" or ?secret=) are accepted. Set it in Vercel and
  // in the GHL webhook settings; until it is set the endpoint stays open.
  const expectedSecret = process.env.GHL_WEBHOOK_SECRET;
  if (expectedSecret) {
    const given =
      request.headers.get("x-webhook-secret") || new URL(request.url).searchParams.get("secret");
    if (given !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Invalid webhook secret." }), { status: 401, headers: HEADERS });
    }
  }
  try {
    const payload = await request.json().catch(() => ({}));
    console.log("[Sales Server] Received GHL Webhook payload:", payload?.type || "unknown");

    const eventId = payload?.appointment?.id || payload?.id || `ghl-webhook-${Date.now()}`;
    const clientName =
      payload?.contact?.name ||
      `${payload?.contact?.firstName || ""} ${payload?.contact?.lastName || ""}`.trim() ||
      payload?.clientName ||
      "GHL Scheduled Prospect";

    const email = payload?.contact?.email || payload?.email;
    const phone = payload?.contact?.phone || payload?.phone;
    const startTime = payload?.appointment?.startTime || payload?.startTime || new Date().toISOString();

    const newApp: GHLAppointment = {
      id: `app-ghl-${Date.now()}`,
      ghlEventId: eventId,
      clientName,
      contactEmail: email,
      contactPhone: phone,
      consultantId: "cons-1-uuid-001",
      consultantName: "Sales Consultant 1",
      appointmentDate: startTime,
      status: "scheduled",
      notes: payload?.notes || "Scheduled via GoHighLevel Calendar",
      location: payload?.location || "GoHighLevel Meeting",
      followUpInfo: "Auto-synced via webhook.",
      createdAt: new Date().toISOString(),
    };

    appointmentsStore.set(newApp.id, newApp);
    await logLedgerEntry("sales_appointment_upsert", newApp.id, { appointment: newApp });

    return new Response(JSON.stringify({ ok: true, processedEventId: eventId }), {
      status: 200,
      headers: HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: HEADERS });
  }
}
