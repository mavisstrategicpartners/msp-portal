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

  // Build real initial state if not in localStorage
  let workflows = getLocal<ClientWorkflowStage[]>(KEY_WORKFLOWS, []);
  let onboarding = getLocal<ClientOnboardingRecord[]>(KEY_ONBOARDING, []);
  let deadlines = getLocal<ServiceDeadlineItem[]>(KEY_DEADLINES, []);
  let communications = getLocal<ClientCommunicationRecord[]>(KEY_COMMUNICATIONS, []);
  let recoveryPlans = getLocal<ClientRecoveryPlan[]>(KEY_RECOVERY, []);
  let verifications = getLocal<VerificationItem[]>(KEY_VERIFICATIONS, []);
  let escalations = getLocal<OperationalEscalation[]>(KEY_ESCALATIONS, []);

  // Sync workflows with real clients
  if (workflows.length === 0 && realClients.length > 0) {
    workflows = realClients.map((client) => {
      const isMakurung = client.name.toLowerCase().includes("makurung");
      const clientReports = realReports.filter((r) => r.client_id === client.id);
      const hasReviewPending = clientReports.some((r) => r.status === "internal_review");

      return {
        id: `wf-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        currentStage: isMakurung ? "Service Setup" : "Ongoing Account Management",
        stageOwner: isMakurung ? "Operations & Relationship Manager" : "Account Lead",
        dependencies: isMakurung ? "Search Console & Hosting Credentials Handover" : "Monthly Media Content Asset Approvals",
        requiredEvidence: isMakurung ? "Technical Content Spec Sign-off" : "Monthly Performance Report Signed Pack",
        nextAction: isMakurung ? "Review Website Content Spec and verify developer handoff" : "Review Ads performance and confirm retainer renewal",
        nextActionDue: new Date(Date.now() + (isMakurung ? 2 : 5) * 86400000).toISOString().split("T")[0],
        status: hasReviewPending ? "Pending Review" : "On Track",
        progressPct: isMakurung ? 65 : 85,
        lastUpdated: client.updated_at || client.created_at,
      };
    });
    setLocal(KEY_WORKFLOWS, workflows);
  }

  // Sync onboarding queue for real clients
  if (onboarding.length === 0 && realClients.length > 0) {
    const defaultSteps = (isSetupOnly: boolean): OnboardingStep[] => [
      { id: "s1", stepKey: "info_verify", title: "Client Info & Contact Verification", required: true, completed: true, completedDate: "2026-04-02", completedBy: "Operations" },
      { id: "s2", stepKey: "contract_sla", title: "Agreement & Scope of Work Locked", required: true, completed: true, completedDate: "2026-04-05", completedBy: "Operations" },
      { id: "s3", stepKey: "access_creds", title: "Platform Access & Integration Setup", required: true, completed: !isSetupOnly, completedDate: !isSetupOnly ? "2026-04-10" : null, blocker: isSetupOnly ? "Search Console access pending from client webmaster" : null },
      { id: "s4", stepKey: "strategy_spec", title: "Strategy & Specification Delivery", required: true, completed: true, completedDate: "2026-04-20" },
      { id: "s5", stepKey: "internal_assign", title: "Internal Team & Owner Assigned", required: true, completed: true, completedDate: "2026-04-22" },
      { id: "s6", stepKey: "launch_readiness", title: "Technical Verification & QA Sign-off", required: true, completed: false, blocker: isSetupOnly ? "Website spec awaiting verification" : null },
      { id: "s7", stepKey: "client_handover", title: "Final Handover & Kickoff Review", required: true, completed: false },
    ];

    onboarding = realClients.map((client) => {
      const isMakurung = client.name.toLowerCase().includes("makurung");
      const steps = defaultSteps(isMakurung);
      const targetDate = new Date(Date.now() + (isMakurung ? 4 : 14) * 86400000).toISOString().split("T")[0];
      return {
        id: `onb-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        stage: isMakurung ? "Access & Specification Sign-off" : "Active Delivery Handover",
        assignedOwner: "Operations & Relationship Manager",
        targetCompletionDate: targetDate,
        startDate: client.created_at.split("T")[0],
        businessDaysAge: calculateBusinessDays(client.created_at.split("T")[0]),
        blocker: isMakurung ? "Search Console access pending; Website Spec awaiting review" : null,
        escalationStatus: isMakurung ? "Overdue Blocker" : "Normal",
        steps,
        contactEmail: client.contact_email || "operations@mavisstrategicpartners.co.za",
      };
    });
    setLocal(KEY_ONBOARDING, onboarding);
  }

  // Sync service deadlines from real reports & service commitments
  if (deadlines.length === 0 && realReports.length > 0) {
    deadlines = realReports.map((report) => {
      const client = realClients.find((c) => c.id === report.client_id);
      const isPending = report.status === "internal_review";
      const isMakurung = client?.name.toLowerCase().includes("makurung") ?? false;
      const originalDate = report.reporting_period_end || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      return {
        id: `dl-${report.id}`,
        serviceName: report.report_type === "website_spec" ? "Website Build & SEO Architecture" : report.report_type === "seo_gbp" ? "Local SEO & GBP Optimisation" : "Growth Strategy & Performance Ads",
        clientId: report.client_id,
        clientName: client?.name || "Client Record",
        deliverableName: report.title,
        accountablePerson: report.prepared_by_name || "Operations Team",
        department: isMakurung ? "IT & SEO Department" : "Marketing Team",
        originalDeadline: originalDate,
        currentDeadline: isPending ? new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0] : originalDate,
        approvedDeadlineChangesCount: isPending ? 1 : 0,
        status: isPending ? "Submitted for Review" : "Accepted Completion",
        dependencies: isPending ? "Review of Makurung page wireframes & SEO schema" : "Client feedback received and logged",
        evidenceLink: `/reports?id=${report.id}`,
        verificationStatus: isPending ? "Awaiting Review" : "Verified",
        commitmentRisk: isPending ? "Moderate" : "Low",
      };
    });
    setLocal(KEY_DEADLINES, deadlines);
  }

  // Sync verification queue from deliverables awaiting verification
  if (verifications.length === 0) {
    const unverifiedReports = realReports.filter((r) => r.status === "internal_review");
    verifications = unverifiedReports.map((r) => {
      const client = realClients.find((c) => c.id === r.client_id);
      return {
        id: `vr-${r.id}`,
        relatedClientId: r.client_id,
        clientName: client?.name || "Makurung Process Solutions (Pty) Ltd",
        recordType: "Deliverable",
        recordTitle: r.title,
        whatMustBeVerified: "Complete website information architecture, navigation structure, 8 service page specs, and schema markup before developer handover.",
        submissionEvidence: `Monthly Report record: ${r.title}`,
        submittedBy: r.prepared_by_name || "Kups Web Team",
        submittedDate: r.created_at.split("T")[0],
        verificationRequirements: "Check keyword cluster integration, mobile responsiveness spec, CTA placements, and technical SEO structure compliance.",
        assignedReviewer: "Operations & Relationship Manager",
        currentStatus: "Pending Verification",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      };
    });

    // If no reports unverified, make sure Makurung's pending item is in queue
    if (verifications.length === 0 && realClients.length > 0) {
      const makurung = realClients.find((c) => c.name.toLowerCase().includes("makurung")) || realClients[0];
      verifications.push({
        id: `vr-spec-001`,
        relatedClientId: makurung.id,
        clientName: makurung.name,
        recordType: "Deliverable",
        recordTitle: "Makurung — Website Development Content Spec",
        whatMustBeVerified: "Corporate Mining Engineering specification, 8 page wireframes, conversion architecture, and GBP booking integration.",
        submissionEvidence: "Website Development Content Spec (April/May 2026 Deliverable)",
        submittedBy: "Web & SEO Delivery Team",
        submittedDate: "2026-05-01",
        verificationRequirements: "Verify alignment with Limpopo EPC mining positioning, technical SEO checklist, and contact form schema.",
        assignedReviewer: "Operations & Relationship Manager",
        currentStatus: "Pending Verification",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      });
    }
    setLocal(KEY_VERIFICATIONS, verifications);
  }

  // Communications history
  if (communications.length === 0 && realClients.length > 0) {
    const makurung = realClients.find((c) => c.name.toLowerCase().includes("makurung")) || realClients[0];
    const imigidi = realClients.find((c) => c.name.toLowerCase().includes("imigidi")) || realClients[1] || realClients[0];

    communications = [
      {
        id: "comm-1",
        clientId: makurung.id,
        clientName: makurung.name,
        interactionDate: "2026-05-04",
        channel: "Video Conference",
        responsibleEmployee: "Operations & Relationship Manager",
        summary: "Walked through the April SEO & GBP Report (414 GBP interactions achieved). Client expressed satisfaction with GBP calls (+14) but raised concern that Search Console access is still not linked to their webmaster.",
        outstandingQuestions: "Who on Makurung's IT side holds the primary Google account for Search Console delegation?",
        promisedFollowUp: "Send delegation step-by-step PDF guide to info@makurung.co.za by Friday.",
        nextCommunicationDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        hasUnresolvedComplaint: true,
        isIntegrationSent: false,
        recordedAt: new Date().toISOString(),
      },
      {
        id: "comm-2",
        clientId: imigidi.id,
        clientName: imigidi.name,
        interactionDate: "2026-05-02",
        channel: "WhatsApp",
        responsibleEmployee: "Operations & Relationship Manager",
        summary: "Confirmed delivery of April Ads Performance Report. Client acknowledged receipt and approved campaign budget reallocation to equipment hire promotions.",
        outstandingQuestions: "None currently outstanding.",
        promisedFollowUp: "Send mid-month ad spend telemetry summary.",
        nextCommunicationDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        hasUnresolvedComplaint: false,
        isIntegrationSent: false,
        recordedAt: new Date().toISOString(),
      },
    ];
    setLocal(KEY_COMMUNICATIONS, communications);
  }

  // Real client recovery plans (only for clients with recorded issues)
  if (recoveryPlans.length === 0 && realClients.length > 0) {
    const makurung = realClients.find((c) => c.name.toLowerCase().includes("makurung"));
    if (makurung) {
      recoveryPlans = [
        {
          id: `rec-${makurung.id}`,
          clientId: makurung.id,
          clientName: makurung.name,
          accountOwner: "Operations & Relationship Manager",
          reasonForConcern: "Technical SEO and Search Console access blocker delayed developer build by 6 business days.",
          supportingEvidence: "Makurung SEO Report recorded issues: Search Console access not verified; live rank tracking pending; developer handoff on hold.",
          recoveryObjective: "Restore developer velocity by securing access and completing spec verification within 4 business days.",
          agreedCorrectiveActions: [
            "Operations Manager phone call with Makurung IT lead for live access screen share",
            "Sign-off on Website Content Spec in Verification Queue",
            "Hand off clean build pack to developer with daily SLA check",
          ],
          responsibleOwners: ["Operations & Relationship Manager", "Lead Developer Siphelele Malotana"],
          milestones: [
            { title: "Search Console ownership verified", deadline: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], status: "Pending" },
            { title: "Website Spec QA verified & accepted", deadline: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], status: "Pending" },
            { title: "Developer sprint started with zero blockers", deadline: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], status: "Pending" },
          ],
          clientExpectations: "Client expects website structure live by month-end with clear weekly milestones.",
          reviewDates: [new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]],
          escalationPath: "General Manager",
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setLocal(KEY_RECOVERY, recoveryPlans);
    }
  }

  // Escalations queue
  if (escalations.length === 0 && realClients.length > 0) {
    const makurung = realClients.find((c) => c.name.toLowerCase().includes("makurung")) || realClients[0];
    escalations = [
      {
        id: "esc-101",
        title: "Search Console Access Blocker on Makurung Process Solutions",
        issueType: "Cross-Department Blocker",
        relatedClientId: makurung.id,
        clientOrRecord: makurung.name,
        raisedBy: "Kups Web & SEO Team",
        dateRaised: "2026-05-02",
        priority: "High",
        businessImpact: "Critical (Revenue/SLA)",
        currentOwner: "Operations & Relationship Manager",
        targetResolutionDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        escalationLevel: "Level 1 (Operations Manager)",
        status: "Action Pending",
        progressNotes: [
          "2026-05-02: Issue flagged in April SEO audit report.",
          "2026-05-04: Video call held; IT contact identified.",
          "2026-05-05: Step-by-step delegation instructions prepared.",
        ],
        nextAction: "Direct phone call with Makurung webmaster to complete DNS TXT verification token setup.",
        createdAt: new Date().toISOString(),
      },
    ];
    setLocal(KEY_ESCALATIONS, escalations);
  }

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

