import { supabase } from "@/integrations/supabase/client";

export interface RealClient {
  id: string;
  name: string;
  industry: string | null;
  account_manager_id: string | null;
  active_package: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RealDeliverable {
  id: string;
  client_id: string;
  client_name?: string;
  report_type: string;
  title: string;
  reporting_month: string;
  reporting_period_start?: string | null;
  reporting_period_end?: string | null;
  prepared_by_name?: string | null;
  status: "draft" | "internal_review" | "sent_to_client";
  data: any;
  status_history: any[];
  created_at: string;
  updated_at: string;
}

export interface ClientWorkflowStage {
  id: string;
  clientId: string;
  clientName: string;
  currentStage:
    | "Intake & Qualification"
    | "Agreement & Contract"
    | "Active Onboarding"
    | "Service Setup"
    | "Ongoing Account Management"
    | "Renewal Preparation"
    | "Retention & Recovery"
    | "Offboarding & Closure";
  stageOwner: string;
  dependencies: string;
  requiredEvidence: string;
  nextAction: string;
  nextActionDue: string;
  status: "On Track" | "At Risk" | "Blocked" | "Pending Review" | "Completed";
  progressPct: number;
  lastUpdated: string;
}

export interface OnboardingStep {
  id: string;
  stepKey: string;
  title: string;
  required: boolean;
  completed: boolean;
  completedDate?: string | null;
  completedBy?: string | null;
  evidenceRef?: string | null;
  blocker?: string | null;
}

export interface ClientOnboardingRecord {
  id: string;
  clientId: string;
  clientName: string;
  stage: string;
  assignedOwner: string;
  targetCompletionDate: string;
  startDate: string;
  businessDaysAge: number;
  blocker: string | null;
  escalationStatus: "Normal" | "Escalated" | "Overdue Blocker";
  steps: OnboardingStep[];
  contactEmail: string;
}

export interface ServiceDeadlineItem {
  id: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  deliverableName: string;
  accountablePerson: string;
  department: string;
  originalDeadline: string;
  currentDeadline: string;
  approvedDeadlineChangesCount: number;
  status: "Work in Progress" | "Blocked" | "Submitted for Review" | "Rework Required" | "Accepted Completion";
  dependencies: string;
  evidenceLink: string | null;
  verificationStatus: "Unsubmitted" | "Awaiting Review" | "Changes Requested" | "Verified";
  commitmentRisk: "Low" | "Moderate" | "High";
}

export interface ClientCommunicationRecord {
  id: string;
  clientId: string;
  clientName: string;
  interactionDate: string;
  channel: "Email" | "Phone" | "WhatsApp" | "Meeting" | "Video Conference" | "Written Correspondence";
  responsibleEmployee: string;
  summary: string;
  outstandingQuestions: string;
  promisedFollowUp: string;
  nextCommunicationDate: string;
  hasUnresolvedComplaint: boolean;
  isIntegrationSent: boolean; // clearly distinguished from manual record
  recordedAt: string;
}

export interface ClientRecoveryPlan {
  id: string;
  clientId: string;
  clientName: string;
  accountOwner: string;
  reasonForConcern: string;
  supportingEvidence: string;
  recoveryObjective: string;
  agreedCorrectiveActions: string[];
  responsibleOwners: string[];
  milestones: { title: string; deadline: string; status: "Pending" | "Done" }[];
  clientExpectations: string;
  reviewDates: string[];
  escalationPath: "Operations Manager" | "General Manager" | "Executive / CEO";
  status: "Draft" | "Active" | "At Risk" | "Awaiting Client" | "Escalated" | "Successful" | "Unsuccessful";
  outcomeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationItem {
  id: string;
  relatedClientId: string;
  clientName: string;
  recordType: "Deliverable" | "Onboarding Step" | "Contract / Document" | "Operational Task";
  recordTitle: string;
  whatMustBeVerified: string;
  submissionEvidence: string;
  submittedBy: string;
  submittedDate: string;
  verificationRequirements: string;
  assignedReviewer: string;
  currentStatus: "Pending Verification" | "Verified and Accepted" | "Rejected - Rework Required" | "Additional Evidence Requested" | "Escalated";
  dueDate: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OperationalEscalation {
  id: string;
  title: string;
  issueType: "Overdue Onboarding" | "Client Commitment Risk" | "Delivery Delay" | "Cross-Department Blocker" | "Missing Client Info" | "Unresolved Complaint" | "Failed Verification" | "Stalled Recovery Plan";
  relatedClientId?: string;
  clientOrRecord: string;
  raisedBy: string;
  dateRaised: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  businessImpact: "Critical (Revenue/SLA)" | "High (Client Sentiment)" | "Moderate" | "Low";
  currentOwner: string;
  targetResolutionDate: string;
  escalationLevel: "Level 1 (Operations Manager)" | "Level 2 (General Manager)" | "Level 3 (CEO Mavis Muchena)";
  status: "Open" | "Acknowledged" | "Investigating" | "Action Pending" | "Resolved";
  progressNotes: string[];
  nextAction: string;
  createdAt: string;
}

// ── Storage Keys for persistent state ─────────────────────────────────────────
const STORAGE_PREFIX = "msp.operations.";
const KEY_WORKFLOWS = STORAGE_PREFIX + "workflows";
const KEY_ONBOARDING = STORAGE_PREFIX + "onboarding";
const KEY_DEADLINES = STORAGE_PREFIX + "deadlines";
const KEY_COMMUNICATIONS = STORAGE_PREFIX + "communications";
const KEY_RECOVERY = STORAGE_PREFIX + "recovery";
const KEY_VERIFICATIONS = STORAGE_PREFIX + "verifications";
const KEY_ESCALATIONS = STORAGE_PREFIX + "escalations";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to cache ${key}:`, err);
  }
}

// Calculate business days between two dates
export function calculateBusinessDays(startDateStr: string, endDateStr?: string): number {
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

// Format ZAR currency
export function formatZar(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "R 0.00";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Authoritative Data Fetching & State Derivation ────────────────────────────

export async function fetchAuthoritativeOperationsData() {
  const [clientsRes, reportsRes, profilesRes] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("monthly_reports").select("*").order("reporting_month", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email, department, job_title").eq("is_active", true),
  ]);

  const realClients: RealClient[] = clientsRes.data || [];
  const realReports: RealDeliverable[] = reportsRes.data || [];
  const realProfiles = profilesRes.data || [];

  // Only genuine records are shown. Earlier versions generated sample workflows,
  // onboarding progress, deadlines, verifications, client communications, a
  // recovery plan and an escalation for real clients and saved them in this
  // browser; those generated records are filtered out below and no longer made.
  const GENERATED_IDS = new Set(["comm-1", "comm-2", "esc-101", "vr-spec-001"]);
  const isGenerated = (r: any) =>
    GENERATED_IDS.has(r?.id) ||
    (typeof r?.id === "string" &&
      r.id.startsWith("rec-") &&
      String(r.reasonForConcern || "").startsWith("Technical SEO and Search Console access blocker"));

  // Workflow stages, deadlines and verification decisions were only ever the
  // generated records, so nothing is read back for them from this browser.
  const workflows: ClientWorkflowStage[] = [];

  // Onboarding: the real records kept by the Operations API.
  let onboarding: ClientOnboardingRecord[] = [];
  try {
    const { fetchOperationsClients } = await import("@/lib/operations-client");
    const clients = await fetchOperationsClients();
    onboarding = clients
      .filter((c: any) => Array.isArray(c.steps))
      .map((c: any) => ({
        id: c.id,
        clientId: c.id,
        clientName: c.name,
        stage: c.stage,
        assignedOwner: c.accountManagerName || "Not assigned",
        targetCompletionDate: c.targetCompletionDate,
        startDate: c.onboardingStartDate,
        businessDaysAge: c.onboardingStartDate ? calculateBusinessDays(c.onboardingStartDate) : 0,
        blocker: c.blocker ?? null,
        escalationStatus: c.escalationStatus || "Normal",
        steps: c.steps,
        contactEmail: c.contactEmail || "",
      }));
  } catch (err) {
    console.warn("Could not load onboarding records:", err);
  }

  // Deadlines and verifications: derived only from recorded monthly reports.
  const deadlines: ServiceDeadlineItem[] = realReports.map((report) => {
    const client = realClients.find((c) => c.id === report.client_id);
    const isPending = report.status === "internal_review";
    const due = report.reporting_period_end || "";
    return {
      id: `dl-${report.id}`,
      serviceName: report.report_type === "website_spec" ? "Website Build & SEO Architecture" : report.report_type === "seo_gbp" ? "Local SEO & GBP Optimisation" : "Growth Strategy & Performance Ads",
      clientId: report.client_id,
      clientName: client?.name || "Unknown client",
      deliverableName: report.title,
      accountablePerson: report.prepared_by_name || "Not recorded",
      department: "Not recorded",
      originalDeadline: due,
      currentDeadline: due,
      approvedDeadlineChangesCount: 0,
      status: isPending ? "Submitted for Review" : "Accepted Completion",
      dependencies: "",
      evidenceLink: `/reports?id=${report.id}`,
      verificationStatus: isPending ? "Awaiting Review" : "Verified",
      commitmentRisk: "Low",
    } as ServiceDeadlineItem;
  });
  const verifications: VerificationItem[] = realReports
    .filter((r) => r.status === "internal_review")
    .map((r) => {
      const client = realClients.find((c) => c.id === r.client_id);
      return {
        id: `vr-${r.id}`,
        relatedClientId: r.client_id,
        clientName: client?.name || "Unknown client",
        recordType: "Deliverable",
        recordTitle: r.title,
        whatMustBeVerified: "Review the submitted report before it is sent to the client.",
        submissionEvidence: `Monthly report: ${r.title}`,
        submittedBy: r.prepared_by_name || "Not recorded",
        submittedDate: (r.created_at || "").split("T")[0],
        verificationRequirements: "",
        assignedReviewer: "Operations",
        currentStatus: "Pending Verification",
        dueDate: r.reporting_period_end || "",
      } as VerificationItem;
    });

  // Entries Operations staff recorded themselves (kept in this browser only).
  const communications = getLocal<ClientCommunicationRecord[]>(KEY_COMMUNICATIONS, []).filter((r) => !isGenerated(r));
  const recoveryPlans = getLocal<ClientRecoveryPlan[]>(KEY_RECOVERY, []).filter((r) => !isGenerated(r));
  const escalations = getLocal<OperationalEscalation[]>(KEY_ESCALATIONS, []).filter((r) => !isGenerated(r));
  setLocal(KEY_COMMUNICATIONS, communications);
  setLocal(KEY_RECOVERY, recoveryPlans);
  setLocal(KEY_ESCALATIONS, escalations);

  return {
    realClients,
    realReports,
    realProfiles,
    workflows,
    onboarding,
    deadlines,
    communications,
    recoveryPlans,
    verifications,
    escalations,
  };
}

// ── State Mutators with Persistence ──────────────────────────────────────────

export async function mutateWorkflowStage(workflowId: string, stage: ClientWorkflowStage["currentStage"], nextAction: string, nextActionDue: string) {
  const current = getLocal<ClientWorkflowStage[]>(KEY_WORKFLOWS, []);
  const updated = current.map((w) => {
    if (w.id === workflowId) {
      return { ...w, currentStage: stage, nextAction, nextActionDue, lastUpdated: new Date().toISOString() };
    }
    return w;
  });
  setLocal(KEY_WORKFLOWS, updated);

  // Record audit trail in Supabase
  try {
    const item = current.find((w) => w.id === workflowId);
    if (item?.clientId) {
      await supabase.from("clients").update({ updated_at: new Date().toISOString() }).eq("id", item.clientId);
    }
  } catch (err) {
    console.warn("Audit update error:", err);
  }

  return updated;
}

export async function mutateOnboardingStep(onboardingId: string, stepKey: string, completed: boolean, blocker?: string | null) {
  const current = getLocal<ClientOnboardingRecord[]>(KEY_ONBOARDING, []);
  const updated = current.map((onb) => {
    if (onb.id === onboardingId) {
      const newSteps = onb.steps.map((st) => {
        if (st.stepKey === stepKey) {
          return {
            ...st,
            completed,
            completedDate: completed ? new Date().toISOString().split("T")[0] : null,
            completedBy: completed ? "Operations Manager" : null,
            blocker: completed ? null : blocker || st.blocker,
          };
        }
        return st;
      });
      const allDone = newSteps.every((s) => s.completed);
      return {
        ...onb,
        steps: newSteps,
        stage: allDone ? "Completed Onboarding" : onb.stage,
        escalationStatus: (newSteps.some((s) => !!s.blocker) ? "Overdue Blocker" : "Normal") as ClientOnboardingRecord["escalationStatus"],
      };
    }
    return onb;
  });
  setLocal(KEY_ONBOARDING, updated);
  return updated;
}

export async function mutateServiceDeadline(deadlineId: string, newDeadline: string, reason: string, status?: ServiceDeadlineItem["status"]) {
  const current = getLocal<ServiceDeadlineItem[]>(KEY_DEADLINES, []);
  const updated = current.map((dl) => {
    if (dl.id === deadlineId) {
      return {
        ...dl,
        currentDeadline: newDeadline,
        approvedDeadlineChangesCount: dl.approvedDeadlineChangesCount + 1,
        status: status || dl.status,
        dependencies: reason ? `Deadline adjusted: ${reason}` : dl.dependencies,
      };
    }
    return dl;
  });
  setLocal(KEY_DEADLINES, updated);
  return updated;
}

export async function mutateVerificationDecision(
  verificationId: string,
  decision: "Verified and Accepted" | "Rejected - Rework Required" | "Additional Evidence Requested" | "Escalated",
  reviewerName: string,
  rejectionReason?: string
) {
  const current = getLocal<VerificationItem[]>(KEY_VERIFICATIONS, []);
  const updated = current.map((vr) => {
    if (vr.id === verificationId) {
      return {
        ...vr,
        currentStatus: decision,
        verifiedAt: new Date().toISOString(),
        verifiedBy: reviewerName,
        rejectionReason: rejectionReason || vr.rejectionReason,
      };
    }
    return vr;
  });
  setLocal(KEY_VERIFICATIONS, updated);

  // If deliverable verified, update Supabase monthly_reports if applicable
  const target = current.find((v) => v.id === verificationId);
  if (target && target.recordType === "Deliverable") {
    try {
      const reportId = verificationId.replace("vr-", "");
      if (decision === "Verified and Accepted") {
        await supabase.from("monthly_reports").update({ status: "sent_to_client", updated_at: new Date().toISOString() }).eq("id", reportId);
      } else if (decision === "Rejected - Rework Required") {
        await supabase.from("monthly_reports").update({ status: "draft", updated_at: new Date().toISOString() }).eq("id", reportId);
      }
    } catch (e) {
      console.warn("Could not sync verification to monthly_reports:", e);
    }
  }

  return updated;
}

export async function mutateAddCommunication(comm: Omit<ClientCommunicationRecord, "id" | "recordedAt">) {
  const current = getLocal<ClientCommunicationRecord[]>(KEY_COMMUNICATIONS, []);
  const newComm: ClientCommunicationRecord = {
    ...comm,
    id: `comm-${Date.now()}`,
    recordedAt: new Date().toISOString(),
  };
  const updated = [newComm, ...current];
  setLocal(KEY_COMMUNICATIONS, updated);

  // Touch client updated_at in Supabase
  try {
    if (comm.clientId) {
      await supabase.from("clients").update({ updated_at: new Date().toISOString() }).eq("id", comm.clientId);
    }
  } catch (e) {
    console.warn("Client touch failed:", e);
  }

  return updated;
}

export async function mutateRecoveryPlan(plan: ClientRecoveryPlan) {
  const current = getLocal<ClientRecoveryPlan[]>(KEY_RECOVERY, []);
  const exists = current.some((p) => p.id === plan.id);
  const updated = exists ? current.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...current];
  setLocal(KEY_RECOVERY, updated);
  return updated;
}

export async function mutateEscalation(esc: OperationalEscalation) {
  const current = getLocal<OperationalEscalation[]>(KEY_ESCALATIONS, []);
  const exists = current.some((e) => e.id === esc.id);
  const updated = exists ? current.map((e) => (e.id === esc.id ? esc : e)) : [esc, ...current];
  setLocal(KEY_ESCALATIONS, updated);
  return updated;
}

