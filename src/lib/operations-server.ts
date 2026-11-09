import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest } from "@/lib/api-auth.server";
import {
  ClientRecord,
  ClientType,
  OnboardingStage,
  OnboardingStep,
  ClientCommunicationLog,
  CreateClientInput,
  UpdateClientInput,
} from "./operations.types";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ── Authentication & Permission Verification ─────────────────────────────────

interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  jobTitle: string;
  department: string;
  roleTier: string;
  isManagerOrAbove: boolean;
  canManageClients: boolean;
}

async function verifyAuth(request: Request): Promise<AuthContext | null> {
  // Identity comes only from a verified Supabase token (see api-auth.server.ts).
  const user = await authenticateApiRequest(request);
  if (!user) return null;
  const a = user.access;
  // Client records are managed by Operations, the GM and administrators only.
  const canManageClients = a.isAdmin || a.isOperations || a.isGM;
  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    department: user.department,
    roleTier: user.roleTier,
    isManagerOrAbove: a.isManagerOrAbove,
    canManageClients,
  };
}

function calculateBusinessDays(startDateStr: string, endDateStr?: string): number {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(0, count - 1);
}

function createDefaultSteps(isQuickSetup = false): OnboardingStep[] {
  return [
    {
      id: crypto.randomUUID(),
      stepKey: "kyc_verification",
      title: "Client Entity & Contact Verification (KYC)",
      required: true,
      completed: isQuickSetup,
      completedDate: isQuickSetup ? new Date().toISOString().split("T")[0] : null,
      completedBy: isQuickSetup ? "Operations" : null,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "contract_scope",
      title: "Engagement Contract & Scope of Work Locked",
      required: true,
      completed: isQuickSetup,
      completedDate: isQuickSetup ? new Date().toISOString().split("T")[0] : null,
      completedBy: isQuickSetup ? "Operations" : null,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "platform_access",
      title: "Platform Credentials & Integration Setup",
      required: true,
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "strategy_roadmap",
      title: "Strategic Roadmap & Kickoff Specification",
      required: true,
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "team_assignment",
      title: "Internal Operations Team & Account Lead Assigned",
      required: true,
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "qa_verification",
      title: "Technical Verification & QA Readiness Sign-off",
      required: true,
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      stepKey: "live_activation",
      title: "Final Client Handover & Live Service Activation",
      required: true,
      completed: false,
    },
  ];
}

// ── Main API Handler ─────────────────────────────────────────────────────────

export async function handleOperationsApi(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  try {
    const auth = await verifyAuth(request);

    // ── 1. GET /api/operations/clients ───────────────────────────────────────
    if (method === "GET" && pathname === "/api/operations/clients") {
      if (!auth) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access. Authentication required." }),
          { status: 401, headers: HEADERS }
        );
      }

      // Fetch all real clients from database
      const { data: dbClients, error: cErr } = await (supabaseAdmin as any)
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (cErr) {
        return new Response(
          JSON.stringify({ error: "Failed to retrieve clients: " + cErr.message }),
          { status: 500, headers: HEADERS }
        );
      }

      // Fetch all active profiles to map relationship manager names
      const { data: profiles } = await (supabaseAdmin as any)
        .from("profiles")
        .select("id, full_name, email, job_title, department");

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

      // Fetch persistent onboarding audit records
      const { data: onbLogs } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("target_id, details, created_at")
        .eq("action", "client_onboarding_upsert");

      const onbMap = new Map<string, any>();
      (onbLogs || []).forEach((l: any) => {
        if (l.target_id && l.details?.onboarding) {
          onbMap.set(l.target_id, l.details.onboarding);
        }
      });

      // Construct verified ClientRecord items
      const clientsList: ClientRecord[] = (dbClients || []).map((client: any) => {
        const savedOnb = onbMap.get(client.id);
        const mgr = client.account_manager_id ? profileMap.get(client.account_manager_id) : null;
        const mgrName = mgr?.full_name || mgr?.email || savedOnb?.accountManagerName || "Operations & Relationship Manager";

        const startDate = savedOnb?.onboardingStartDate || client.created_at.split("T")[0];
        const businessDays = calculateBusinessDays(startDate);
        const targetDate = savedOnb?.targetCompletionDate || new Date(new Date(startDate).getTime() + 14 * 86400000).toISOString().split("T")[0];

        const steps = savedOnb?.steps && savedOnb.steps.length > 0
          ? savedOnb.steps
          : createDefaultSteps(client.name.toLowerCase().includes("makurung") || client.name.toLowerCase().includes("imigidi"));

        const blocker = savedOnb?.blocker ?? null;
        const isOverdue = new Date(targetDate) < new Date() && savedOnb?.stage !== "Onboarding Completed";
        const escalationStatus = blocker && isOverdue ? "Overdue Blocker" : blocker ? "Escalated" : "Normal";

        return {
          id: client.id,
          name: client.name,
          clientType: savedOnb?.clientType || (client.name.toLowerCase().includes("solutions") || client.name.toLowerCase().includes("(pty)") ? "Business" : "Business"),
          primaryContact: client.contact_name || savedOnb?.primaryContact || "Primary Contact",
          contactEmail: client.contact_email || savedOnb?.contactEmail || "",
          contactPhone: client.contact_phone || savedOnb?.contactPhone || "",
          businessRegistrationNumber: savedOnb?.businessRegistrationNumber || null,
          address: savedOnb?.address || "Gauteng, South Africa",
          servicesRequired: client.active_package || savedOnb?.servicesRequired || "Standard Package",
          accountManagerId: client.account_manager_id || savedOnb?.accountManagerId || null,
          accountManagerName: mgrName,
          onboardingStartDate: startDate,
          targetCompletionDate: targetDate,
          stage: (savedOnb?.stage || "New Client") as OnboardingStage,
          blocker,
          escalationStatus,
          steps,
          notes: client.notes || savedOnb?.notes || "",
          specialRequirements: savedOnb?.specialRequirements || "",
          communications: savedOnb?.communications || [],
          businessDaysAge: businessDays,
          createdAt: client.created_at,
          updatedAt: client.updated_at || client.created_at,
          createdById: savedOnb?.createdById,
          createdByName: savedOnb?.createdByName,
        };
      });

      return new Response(JSON.stringify({ clients: clientsList }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // ── 2. POST /api/operations/clients ──────────────────────────────────────
    if (method === "POST" && pathname === "/api/operations/clients") {
      if (!auth) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access. Authentication required." }),
          { status: 401, headers: HEADERS }
        );
      }

      if (!auth.canManageClients) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You do not have permission to register new clients." }),
          { status: 403, headers: HEADERS }
        );
      }

      const body: CreateClientInput = await request.json().catch(() => null);
      if (!body) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON request payload." }),
          { status: 400, headers: HEADERS }
        );
      }

      // Mandatory validation
      const name = (body.name || "").trim();
      const primaryContact = (body.primaryContact || "").trim();
      const contactEmail = (body.contactEmail || "").trim().toLowerCase();
      const contactPhone = (body.contactPhone || "").trim();
      const clientType = body.clientType || "Business";
      const address = (body.address || "").trim();
      const servicesRequired = (body.servicesRequired || "").trim();

      if (!name || name.length < 2) {
        return new Response(
          JSON.stringify({ error: "Client / Company name is required (minimum 2 characters)." }),
          { status: 400, headers: HEADERS }
        );
      }

      if (!primaryContact) {
        return new Response(
          JSON.stringify({ error: "Primary contact person is required." }),
          { status: 400, headers: HEADERS }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!contactEmail || !emailRegex.test(contactEmail)) {
        return new Response(
          JSON.stringify({ error: "A valid contact email address is required." }),
          { status: 400, headers: HEADERS }
        );
      }

      if (!contactPhone) {
        return new Response(
          JSON.stringify({ error: "Contact phone number is required." }),
          { status: 400, headers: HEADERS }
        );
      }

      if (!address) {
        return new Response(
          JSON.stringify({ error: "Client physical or business address is required." }),
          { status: 400, headers: HEADERS }
        );
      }

      if (!servicesRequired) {
        return new Response(
          JSON.stringify({ error: "Services or products required must be specified." }),
          { status: 400, headers: HEADERS }
        );
      }

      // Check for duplicates in Supabase database
      const { data: existingClients } = await (supabaseAdmin as any)
        .from("clients")
        .select("id, name, contact_email");

      const nameLower = name.toLowerCase();
      const duplicate = (existingClients || []).find(
        (c: any) =>
          c.name.toLowerCase() === nameLower ||
          (c.contact_email && c.contact_email.toLowerCase() === contactEmail)
      );

      if (duplicate) {
        return new Response(
          JSON.stringify({
            error: `A client with company name "${name}" or email "${contactEmail}" already exists in the system (Client ID: ${duplicate.id}).`,
          }),
          { status: 409, headers: HEADERS }
        );
      }

      // Resolve relationship manager
      let accountManagerId = body.accountManagerId || null;
      let accountManagerName = "Operations & Relationship Manager";
      if (accountManagerId) {
        const { data: mgrProfile } = await (supabaseAdmin as any)
          .from("profiles")
          .select("id, full_name, email, job_title")
          .eq("id", accountManagerId)
          .maybeSingle();

        if (mgrProfile) {
          accountManagerName = mgrProfile.full_name || mgrProfile.email || "Account Manager";
        }
      }

      const clientId = crypto.randomUUID();
      const now = new Date().toISOString();
      const startDate = body.onboardingStartDate || now.split("T")[0];
      const targetDate =
        body.targetCompletionDate ||
        new Date(new Date(startDate).getTime() + 14 * 86400000).toISOString().split("T")[0];

      const initialStage: OnboardingStage = body.isDraft ? "Draft" : "New Client";
      const steps = createDefaultSteps(false);

      const notesFormatted = `[Type: ${clientType}]${body.businessRegistrationNumber ? ` Reg: ${body.businessRegistrationNumber}` : ""} | Address: ${address} | ${body.notes || ""}`;

      // 1. Insert persistent record into Supabase `clients` table
      const { data: insertedClient, error: insertErr } = await (supabaseAdmin as any)
        .from("clients")
        .insert({
          id: clientId,
          name,
          industry: clientType === "Business" ? "Corporate Business" : "Individual Client",
          account_manager_id: accountManagerId,
          active_package: servicesRequired,
          contact_name: primaryContact,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          notes: notesFormatted,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (insertErr) {
        return new Response(
          JSON.stringify({ error: "Failed to persist client in database: " + insertErr.message }),
          { status: 500, headers: HEADERS }
        );
      }

      // 2. Build complete ClientRecord
      const newClientRecord: ClientRecord = {
        id: clientId,
        name,
        clientType,
        primaryContact,
        contactEmail,
        contactPhone,
        businessRegistrationNumber: body.businessRegistrationNumber || null,
        address,
        servicesRequired,
        accountManagerId,
        accountManagerName,
        onboardingStartDate: startDate,
        targetCompletionDate: targetDate,
        stage: initialStage,
        blocker: null,
        escalationStatus: "Normal",
        steps,
        notes: body.notes || "",
        specialRequirements: body.specialRequirements || "",
        communications: [],
        businessDaysAge: 0,
        createdAt: now,
        updatedAt: now,
        createdById: auth.userId,
        createdByName: auth.fullName,
      };

      // 3. Persist onboarding metadata into Supabase audit ledger
      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "client_onboarding_upsert",
        target_id: clientId,
        details: { onboarding: newClientRecord },
      });

      // 4. Record audit trail event
      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "client_created",
        target_id: clientId,
        details: {
          clientId,
          clientName: name,
          contactEmail,
          clientType,
          createdById: auth.userId,
          createdByName: auth.fullName,
          timestamp: now,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Client "${name}" created successfully and added to Onboarding Pipeline.`,
          client: newClientRecord,
        }),
        { status: 201, headers: HEADERS }
      );
    }

    // ── 3. PATCH /api/operations/clients/:id ─────────────────────────────────
    if (method === "PATCH" && pathname.startsWith("/api/operations/clients/")) {
      if (!auth) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access." }),
          { status: 401, headers: HEADERS }
        );
      }

      if (!auth.canManageClients) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You do not have permission to update clients." }),
          { status: 403, headers: HEADERS }
        );
      }

      const clientId = pathname.replace("/api/operations/clients/", "").split("/")[0];
      const updates: UpdateClientInput = await request.json().catch(() => ({}));

      // Fetch existing client
      const { data: existing, error: getErr } = await (supabaseAdmin as any)
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (getErr || !existing) {
        return new Response(
          JSON.stringify({ error: "Client not found." }),
          { status: 404, headers: HEADERS }
        );
      }

      // Fetch existing onboarding log
      const { data: onbLog } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("details")
        .eq("action", "client_onboarding_upsert")
        .eq("target_id", clientId)
        .maybeSingle();

      const existingRecord: ClientRecord = onbLog?.details?.onboarding || {
        id: existing.id,
        name: existing.name,
        clientType: "Business",
        primaryContact: existing.contact_name || "Contact",
        contactEmail: existing.contact_email || "",
        contactPhone: existing.contact_phone || "",
        address: "South Africa",
        servicesRequired: existing.active_package || "",
        accountManagerId: existing.account_manager_id,
        accountManagerName: "Operations Manager",
        onboardingStartDate: existing.created_at.split("T")[0],
        targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        stage: "New Client",
        blocker: null,
        escalationStatus: "Normal",
        steps: createDefaultSteps(),
        notes: existing.notes || "",
        communications: [],
        businessDaysAge: 0,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      };

      const now = new Date().toISOString();

      // Update core client table
      const dbUpdates: any = { updated_at: now };
      if (updates.name) dbUpdates.name = updates.name.trim();
      if (updates.primaryContact) dbUpdates.contact_name = updates.primaryContact.trim();
      if (updates.contactEmail) dbUpdates.contact_email = updates.contactEmail.trim().toLowerCase();
      if (updates.contactPhone) dbUpdates.contact_phone = updates.contactPhone.trim();
      if (updates.servicesRequired) dbUpdates.active_package = updates.servicesRequired;
      if (updates.accountManagerId !== undefined) dbUpdates.account_manager_id = updates.accountManagerId;

      await (supabaseAdmin as any)
        .from("clients")
        .update(dbUpdates)
        .eq("id", clientId);

      // Merge updated fields into ClientRecord
      const mergedRecord: ClientRecord = {
        ...existingRecord,
        name: updates.name ?? existingRecord.name,
        clientType: updates.clientType ?? existingRecord.clientType,
        primaryContact: updates.primaryContact ?? existingRecord.primaryContact,
        contactEmail: updates.contactEmail ?? existingRecord.contactEmail,
        contactPhone: updates.contactPhone ?? existingRecord.contactPhone,
        businessRegistrationNumber: updates.businessRegistrationNumber ?? existingRecord.businessRegistrationNumber,
        address: updates.address ?? existingRecord.address,
        servicesRequired: updates.servicesRequired ?? existingRecord.servicesRequired,
        accountManagerId: updates.accountManagerId !== undefined ? updates.accountManagerId : existingRecord.accountManagerId,
        stage: updates.stage ?? existingRecord.stage,
        blocker: updates.blocker !== undefined ? updates.blocker : existingRecord.blocker,
        targetCompletionDate: updates.targetCompletionDate ?? existingRecord.targetCompletionDate,
        notes: updates.notes ?? existingRecord.notes,
        specialRequirements: updates.specialRequirements ?? existingRecord.specialRequirements,
        updatedAt: now,
      };

      // Re-calculate escalation status
      const isOverdue = new Date(mergedRecord.targetCompletionDate) < new Date() && mergedRecord.stage !== "Onboarding Completed";
      mergedRecord.escalationStatus = mergedRecord.blocker && isOverdue ? "Overdue Blocker" : mergedRecord.blocker ? "Escalated" : "Normal";

      // Persist onboarding update
      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "client_onboarding_upsert",
        target_id: clientId,
        details: { onboarding: mergedRecord },
      });

      return new Response(
        JSON.stringify({ success: true, client: mergedRecord }),
        { status: 200, headers: HEADERS }
      );
    }

    // ── 4. POST /api/operations/clients/:id/steps ─────────────────────────────
    if (method === "POST" && pathname.includes("/steps")) {
      if (!auth) {
        return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401, headers: HEADERS });
      }
      if (!auth.canManageClients) {
        return new Response(JSON.stringify({ error: "Forbidden: client records are managed by Operations." }), { status: 403, headers: HEADERS });
      }

      const parts = pathname.split("/");
      const clientId = parts[4];
      const payload: { stepKey: string; completed: boolean; blocker?: string | null } = await request.json();

      const { data: onbLog } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("details")
        .eq("action", "client_onboarding_upsert")
        .eq("target_id", clientId)
        .maybeSingle();

      if (!onbLog?.details?.onboarding) {
        return new Response(JSON.stringify({ error: "Onboarding record not found." }), { status: 404, headers: HEADERS });
      }

      const record: ClientRecord = onbLog.details.onboarding;
      const updatedSteps = record.steps.map((s) => {
        if (s.stepKey === payload.stepKey) {
          return {
            ...s,
            completed: payload.completed,
            completedDate: payload.completed ? new Date().toISOString().split("T")[0] : null,
            completedBy: payload.completed ? auth.fullName : null,
            blocker: payload.blocker !== undefined ? payload.blocker : s.blocker,
          };
        }
        return s;
      });

      // Check if any step has blocker
      const activeBlocker = updatedSteps.find((s) => s.blocker)?.blocker || null;
      const allCompleted = updatedSteps.every((s) => s.completed);

      record.steps = updatedSteps;
      record.blocker = activeBlocker;
      if (allCompleted) {
        record.stage = "Onboarding Completed";
      }
      record.updatedAt = new Date().toISOString();

      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "client_onboarding_upsert",
        target_id: clientId,
        details: { onboarding: record },
      });

      return new Response(JSON.stringify({ success: true, client: record }), { status: 200, headers: HEADERS });
    }

    // ── 5. POST /api/operations/clients/:id/communications ───────────────────
    if (method === "POST" && pathname.includes("/communications")) {
      if (!auth) {
        return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401, headers: HEADERS });
      }
      if (!auth.canManageClients) {
        return new Response(JSON.stringify({ error: "Forbidden: client records are managed by Operations." }), { status: 403, headers: HEADERS });
      }

      const parts = pathname.split("/");
      const clientId = parts[4];
      const commBody: Partial<ClientCommunicationLog> = await request.json();

      const { data: onbLog } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("details")
        .eq("action", "client_onboarding_upsert")
        .eq("target_id", clientId)
        .maybeSingle();

      if (!onbLog?.details?.onboarding) {
        return new Response(JSON.stringify({ error: "Client onboarding record not found." }), { status: 404, headers: HEADERS });
      }

      const record: ClientRecord = onbLog.details.onboarding;
      const newComm: ClientCommunicationLog = {
        id: crypto.randomUUID(),
        clientId,
        interactionDate: commBody.interactionDate || new Date().toISOString().split("T")[0],
        channel: commBody.channel || "Email",
        responsibleEmployee: auth.fullName,
        summary: (commBody.summary || "").trim(),
        outstandingQuestions: commBody.outstandingQuestions,
        promisedFollowUp: commBody.promisedFollowUp,
        nextCommunicationDate: commBody.nextCommunicationDate,
        recordedAt: new Date().toISOString(),
      };

      record.communications = [newComm, ...(record.communications || [])];
      record.updatedAt = new Date().toISOString();

      await (supabaseAdmin as any).from("audit_logs").insert({
        action: "client_onboarding_upsert",
        target_id: clientId,
        details: { onboarding: record },
      });

      return new Response(JSON.stringify({ success: true, client: record }), { status: 200, headers: HEADERS });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: HEADERS });
  } catch (err: any) {
    console.error("Operations API Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error: " + (err.message || String(err)) }),
      { status: 500, headers: HEADERS }
    );
  }
}
