import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  OperationEmployee,
  OperationTask,
  ClientOperation,
  OnboardingWorkflow,
  EscalationIssue,
  SalesLead,
  ApprovalRequest,
  TaskLifecycleStatus,
  AcceptanceScenarioTest,
  ExecutiveHealthViewData,
  SAMPLE_ACCEPTANCE_TESTS,
} from "./operations-data";

// ─── Default Sample Operational Data (Fallback when DB is empty) ──────────────

const SEEDED_TASKS: OperationTask[] = [
  {
    id: "task-101",
    clientOrTeam: "Client Alpha (Renewable Energy)",
    title: "Meta Performance Ads Launch",
    serviceType: "Paid Ads",
    description: "Build, set up CAPI tracking, upload approved creative batch, and submit for live launch QA.",
    ownerId: "emp-1",
    ownerName: "Tinashe Moyo",
    managerName: "Xongile Mhlari",
    reviewerName: "Xongile Mhlari",
    priority: "Urgent",
    status: "Blocked",
    progress: 75,
    plannedStart: "2026-10-04T08:00:00Z",
    actualStart: "2026-10-04T09:00:00Z",
    originalDueDate: "2026-10-06T17:00:00Z",
    revisedDueDate: "2026-10-07T12:00:00Z",
    promisedClientDate: "2026-10-06T17:00:00Z",
    dueDeadline: "2026-10-06T17:00:00Z",
    workingHoursLate: 9,
    clientElapsedTimeHrs: 45,
    internalServiceTimeHrs: 27,
    stageTimeHrs: 13,
    blockerCategory: "Waiting for manager",
    blockReason: "Budget approval pending with manager",
    delayCategory: "Manager approval",
    escalationRecipient: "Operations Lead (Xongile Mhlari)",
    nextAction: "Operations to obtain manager budget approval by 12:00 today",
    evidenceRequirement: "Account/campaign IDs, approved copy, budget QA checklist, CAPI test lead.",
    commentsCount: 4,
  },
  {
    id: "task-102",
    clientOrTeam: "Apex Solar SA",
    title: "GHL WhatsApp AI Automation Setup",
    serviceType: "CRM & AI",
    description: "Configure Shammah AI lead qualification workflow, calendar booking integration, and fallback routing.",
    ownerId: "emp-2",
    ownerName: "Farai Zhou",
    managerName: "Xongile Mhlari",
    reviewerName: "Tinashe Moyo",
    priority: "High",
    status: "Submitted for review",
    progress: 90,
    plannedStart: "2026-10-05T08:00:00Z",
    actualStart: "2026-10-05T08:30:00Z",
    originalDueDate: "2026-10-08T17:00:00Z",
    revisedDueDate: "2026-10-08T17:00:00Z",
    promisedClientDate: "2026-10-09T17:00:00Z",
    dueDeadline: "2026-10-08T17:00:00Z",
    workingHoursLate: 0,
    clientElapsedTimeHrs: 24,
    internalServiceTimeHrs: 18,
    stageTimeHrs: 3,
    nextAction: "Independent reviewer to test GHL lead journey and verify booking webhook",
    evidenceRequirement: "Workflow version reference, test lead journey log, routing test video.",
    submittedAt: "2026-10-07T16:00:00Z",
    evidenceSubmitted: {
      deliverableType: "CRM/AI",
      workflowRef: "GHL-WKF-APEX-V2.1",
      qaChecklistVerified: true,
      platformLiveVerified: true,
      testLeadVerified: true,
      evidenceLinkOrRef: "https://app.gohighlevel.com/v2/location/apex-solar/workflows/w201",
      submittedAt: "2026-10-07T16:00:00Z",
      submitterName: "Farai Zhou",
    },
    commentsCount: 2,
  },
  {
    id: "task-103",
    clientOrTeam: "Vanguard Mining Supplies",
    title: "5-Page Company Website Launch",
    serviceType: "Website",
    description: "Deploy staging site, responsive QA, form routing to GHL, and SSL setup.",
    ownerId: "emp-3",
    ownerName: "Kudzai Banda",
    managerName: "Xongile Mhlari",
    reviewerName: "Xongile Mhlari",
    priority: "Medium",
    status: "In progress",
    progress: 60,
    plannedStart: "2026-10-01T08:00:00Z",
    actualStart: "2026-10-01T10:00:00Z",
    originalDueDate: "2026-10-15T17:00:00Z",
    revisedDueDate: "2026-10-15T17:00:00Z",
    promisedClientDate: "2026-10-16T17:00:00Z",
    dueDeadline: "2026-10-15T17:00:00Z",
    workingHoursLate: 0,
    clientElapsedTimeHrs: 54,
    internalServiceTimeHrs: 36,
    stageTimeHrs: 18,
    nextAction: "Complete responsive layout checks on mobile and form submissions",
    evidenceRequirement: "Staging URL, agreed scope checklist, responsive checks, form test.",
    commentsCount: 1,
  },
];

const SEEDED_CLIENTS: ClientOperation[] = [
  {
    id: "cli-1",
    name: "Client Alpha",
    accountManager: "Xongile Mhlari",
    package: "Growth Engine (Paid Ads + GHL CRM)",
    startDate: "2026-09-15",
    contractStatus: "Active",
    health: "Red",
    healthReason: "Meta campaign launch 9 working hours late due to manager budget approval delay.",
    nextAction: "Escalate to CEO / MD for immediate budget approval sign-off by 12:00",
    nextActionDue: "2026-10-08T12:00:00Z",
    openDeliverablesCount: 3,
    overdueReportsCount: 0,
    openEscalationsCount: 1,
    renewalDate: "2027-09-15",
    clientMediaSpendZar: 45000,
    serviceFeeZar: 25000,
    paymentStatus: "Paid",
    missingAssets: [],
  },
  {
    id: "cli-2",
    name: "Apex Solar SA",
    accountManager: "Xongile Mhlari",
    package: "Full Scale (Ads + Web + AI Automation)",
    startDate: "2026-10-01",
    contractStatus: "Onboarding",
    health: "Amber",
    healthReason: "Onboarding age 21 working hours (3 hrs past target); awaiting Meta Pixel & Google Ads access.",
    nextAction: "Follow up with client point of contact for admin access delegate link",
    nextActionDue: "2026-10-08T15:00:00Z",
    openDeliverablesCount: 4,
    overdueReportsCount: 0,
    openEscalationsCount: 1,
    renewalDate: "2027-10-01",
    clientMediaSpendZar: 60000,
    serviceFeeZar: 38000,
    paymentStatus: "Paid",
    missingAssets: ["Meta Business Manager Access", "Google Ads CID"],
  },
  {
    id: "cli-3",
    name: "Vanguard Mining Supplies",
    accountManager: "Tinashe Moyo",
    package: "Custom Web & Lead System",
    startDate: "2026-09-28",
    contractStatus: "Active",
    health: "Green",
    healthReason: "All website build milestones on schedule. Content approved by client.",
    nextAction: "Final staging review scheduled for Thursday",
    nextActionDue: "2026-10-10T10:00:00Z",
    openDeliverablesCount: 2,
    overdueReportsCount: 0,
    openEscalationsCount: 0,
    renewalDate: "2027-09-28",
    clientMediaSpendZar: 0,
    serviceFeeZar: 42000,
    paymentStatus: "Paid",
    missingAssets: [],
  },
];

const SEEDED_ONBOARDING: OnboardingWorkflow[] = [
  {
    id: "onb-1",
    clientId: "cli-2",
    clientName: "Apex Solar SA",
    accountManager: "Xongile Mhlari",
    currentStage: "Access & Assets",
    stageOwner: "Farai Zhou",
    dueDate: "2026-10-06T17:00:00Z",
    workingHoursAge: 21, // 2 business days target = 18 working hours -> breached by 3 hrs
    totalClientElapsedDays: 5,
    accessChecklist: {
      metaAds: "Missing",
      googleAds: "Missing",
      tikTokAds: "N/A",
      ga4Analytics: "Verified",
      metaPixel: "Missing",
      capiServer: "Missing",
      ghlCrm: "Verified",
      websiteHosting: "Verified",
    },
    blocker: "Client delay in delegating Meta Manager permissions",
    progress: 45,
    isBreached: true,
  },
];

const SEEDED_ESCALATIONS: EscalationIssue[] = [
  {
    id: "esc-1",
    title: "Meta campaign launch 9 working hours late",
    issueType: "Missed Deadline",
    clientOrTeam: "Client Alpha",
    raisedBy: "Tinashe Moyo",
    dateRaised: "2026-10-07",
    priority: "Urgent",
    impact: "High",
    owner: "Xongile Mhlari",
    targetResolutionDate: "2026-10-08",
    escalationLevel: "Level 3 (CEO / MD)",
    status: "Open",
    actionsTaken: "Buyer submitted on time. Budget approval pending with manager. Escalated to CEO Mavis Muchena.",
    workingHoursLate: 9,
    originalPromiseRetained: true,
  },
];

const SEEDED_LEADS: SalesLead[] = [
  {
    id: "lead-1",
    businessName: "Kasi Green Energy",
    contactPerson: "Sibusiso Dlamini",
    leadSource: "Meta Ads",
    need: "High-converting ad campaign & WhatsApp AI follow-up for solar installations.",
    assignedSalesperson: "Mavis Muchena",
    followUpDate: "2026-10-08",
    stage: "Proposal sent",
    leadQuality: "Hot",
    estimatedValue: 45000,
    proposalStatus: "Sent",
    inboundResponseMins: 8,
    firstHumanActionHrs: 0.5,
    notes: "Consultation held on Tuesday. Sent 3-tier performance package proposal.",
  },
  {
    id: "lead-2",
    businessName: "Highveld Logistics",
    contactPerson: "Johan van der Merwe",
    leadSource: "Google Search",
    need: "Corporate Website redesign & SEO strategy.",
    assignedSalesperson: "Xongile Mhlari",
    followUpDate: "2026-10-09",
    stage: "Consultation booked",
    leadQuality: "Warm",
    estimatedValue: 65000,
    proposalStatus: "Draft",
    inboundResponseMins: 12,
    firstHumanActionHrs: 0.8,
    notes: "Discovery call booked for Friday 10:00 AM.",
  },
];

const SEEDED_APPROVALS: ApprovalRequest[] = [
  {
    id: "app-1",
    type: "Ad Campaign",
    title: "Client Alpha Q4 Meta Campaign Launch & Budget Approval",
    requester: "Tinashe Moyo",
    approver: "Xongile Mhlari",
    submissionDate: "2026-10-06T10:00:00Z",
    completionDeadline: "2026-10-06T14:00:00Z",
    status: "Pending Review",
    comments: "Buyer submitted campaign setup on time. Manager review overdue by 13 working hours.",
    clientOrProject: "Client Alpha",
    reviewTimeHrs: 13,
  },
];

// ─── Helpers to convert DB Rows to domain types ─────────────────────────────

function rowToTask(r: any): OperationTask {
  return {
    id: r.id,
    title: r.title || "Untitled Task",
    serviceType: r.service_type || "Paid Ads",
    description: r.description || "",
    clientOrTeam: r.client_or_team || "Internal MSP",
    ownerId: r.owner_id || "",
    ownerName: r.owner_name || "Unassigned",
    managerName: r.manager_name || "Xongile Mhlari",
    reviewerName: r.reviewer || "Xongile Mhlari",
    priority: r.priority || "High",
    status: r.status || "In progress",
    progress: r.progress || 0,
    plannedStart: r.planned_start || r.assigned_date || new Date().toISOString(),
    actualStart: r.actual_start || r.assigned_date,
    originalDueDate: r.original_due_date || r.deadline || new Date().toISOString(),
    revisedDueDate: r.revised_due_date || r.deadline || new Date().toISOString(),
    promisedClientDate: r.promised_client_date || r.deadline || new Date().toISOString(),
    dueDeadline: r.deadline || new Date().toISOString(),
    workingHoursLate: Number(r.working_hours_late) || 0,
    clientElapsedTimeHrs: Number(r.client_elapsed_time_hrs) || 24,
    internalServiceTimeHrs: Number(r.internal_service_time_hrs) || 12,
    stageTimeHrs: Number(r.stage_time_hrs) || 4,
    blockerCategory: r.blocker_category || undefined,
    blockReason: r.block_reason || undefined,
    delayCategory: r.delay_category || undefined,
    escalationRecipient: r.escalation_recipient || undefined,
    nextAction: r.next_action || "Review task progress",
    evidenceRequirement: r.evidence_requirement || "Deliverable link and QA sign-off",
    evidenceSubmitted: r.evidence_submitted ? JSON.parse(r.evidence_submitted) : undefined,
    verifierName: r.verifier_name || undefined,
    submittedAt: r.submitted_at || undefined,
    acceptedAt: r.accepted_at || undefined,
    reworkReason: r.rework_reason || undefined,
    commentsCount: Number(r.comments_count) || 0,
  };
}

function rowToEscalation(r: any): EscalationIssue {
  return {
    id: r.id,
    title: r.title,
    issueType: r.issue_type,
    clientOrTeam: r.client_or_team || "",
    raisedBy: r.raised_by || "",
    dateRaised: r.date_raised || new Date().toISOString().split("T")[0],
    priority: r.priority || "High",
    impact: r.impact || "High",
    owner: r.owner || "Xongile Mhlari",
    targetResolutionDate: r.target_resolution_date || "",
    escalationLevel: r.escalation_level || "Level 2 (Operations Head)",
    status: r.status || "Open",
    actionsTaken: r.actions_taken || "",
    workingHoursLate: Number(r.working_hours_late) || 0,
    originalPromiseRetained: r.original_promise_retained ?? true,
  };
}

function rowToLead(r: any): SalesLead {
  return {
    id: r.id,
    businessName: r.business_name,
    contactPerson: r.contact_person || "",
    leadSource: r.lead_source || "Meta Ads",
    need: r.need || "",
    assignedSalesperson: r.assigned_salesperson || "Mavis Muchena",
    followUpDate: r.follow_up_date || "",
    stage: r.stage || "New",
    leadQuality: r.lead_quality || "Hot",
    estimatedValue: Number(r.estimated_value) || 0,
    proposalStatus: r.proposal_status || "Draft",
    inboundResponseMins: Number(r.inbound_response_mins) || 12,
    firstHumanActionHrs: Number(r.first_human_action_hrs) || 0.5,
    notes: r.notes || "",
  };
}

function rowToOnboarding(r: any): OnboardingWorkflow {
  return {
    id: r.id,
    clientId: r.client_id || r.id,
    clientName: r.client_name,
    accountManager: r.account_manager || "Xongile Mhlari",
    currentStage: r.current_stage || "Won & Intake",
    stageOwner: r.stage_owner || "Farai Zhou",
    dueDate: r.due_date || "",
    workingHoursAge: Number(r.working_hours_age) || 12,
    totalClientElapsedDays: Number(r.total_client_elapsed_days) || 2,
    accessChecklist: r.access_checklist ? JSON.parse(r.access_checklist) : {
      metaAds: "Missing", googleAds: "Missing", tikTokAds: "N/A", ga4Analytics: "Verified",
      metaPixel: "Missing", capiServer: "Missing", ghlCrm: "Verified", websiteHosting: "Verified",
    },
    readinessAcceptedBy: r.readiness_accepted_by || undefined,
    readinessAcceptedAt: r.readiness_accepted_at || undefined,
    blocker: r.blocker || undefined,
    progress: r.progress || 0,
    isBreached: r.is_breached ?? false,
  };
}

// ─── Main operations store hook ─────────────────────────────────────────────

export function useOperationsData() {
  const [realProfiles, setRealProfiles] = useState<OperationEmployee[]>([]);
  const [tasks, setTasks] = useState<OperationTask[]>(SEEDED_TASKS);
  const [clients, setClients] = useState<ClientOperation[]>(SEEDED_CLIENTS);
  const [onboarding, setOnboarding] = useState<OnboardingWorkflow[]>(SEEDED_ONBOARDING);
  const [escalations, setEscalations] = useState<EscalationIssue[]>(SEEDED_ESCALATIONS);
  const [leads, setLeads] = useState<SalesLead[]>(SEEDED_LEADS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(SEEDED_APPROVALS);
  const [acceptanceTests] = useState<AcceptanceScenarioTest[]>(SAMPLE_ACCEPTANCE_TESTS);

  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase if present
  const refreshRealData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        profilesRes, clientsRes, tasksRes, escalationsRes, leadsRes, onboardingRes, approvalsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
        supabase.from("clients").select("*").order("name"),
        supabase.from("ops_tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_escalations").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_onboarding").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_approvals").select("*").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.data && profilesRes.data.length > 0) {
        setRealProfiles(
          profilesRes.data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.email,
            role: p.job_title || "Team Member",
            department: (p.department as any) || "Media Buying",
            email: p.email,
            attendanceStatus: "Present",
            leaveBalanceDays: 15,
            completedTasksCount: 12,
            overdueTasksCount: 0,
            blockedTasksCount: 0,
            adherenceRate: 96,
            avatar: p.avatar_url,
          }))
        );
      }

      if (tasksRes.data && tasksRes.data.length > 0) {
        setTasks(tasksRes.data.map(rowToTask));
      }
      if (escalationsRes.data && escalationsRes.data.length > 0) {
        setEscalations(escalationsRes.data.map(rowToEscalation));
      }
      if (leadsRes.data && leadsRes.data.length > 0) {
        setLeads(leadsRes.data.map(rowToLead));
      }
      if (onboardingRes.data && onboardingRes.data.length > 0) {
        setOnboarding(onboardingRes.data.map(rowToOnboarding));
      }
    } catch (e) {
      console.warn("Using baseline operational data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRealData();
  }, [refreshRealData]);

  // Combined employees list (real profiles + default team)
  const employees: OperationEmployee[] = useMemo(() => {
    if (realProfiles.length > 0) return realProfiles;
    return [
      {
        id: "emp-1",
        name: "Tinashe Moyo",
        role: "Media Buying Specialist",
        department: "Media Buying",
        email: "tinashe@mavisstrategicpartners.co.za",
        attendanceStatus: "Present",
        clockInTime: "07:52 SAST",
        leaveBalanceDays: 14,
        completedTasksCount: 18,
        overdueTasksCount: 1,
        blockedTasksCount: 1,
        adherenceRate: 94,
      },
      {
        id: "emp-2",
        name: "Farai Zhou",
        role: "CRM & AI Specialist",
        department: "CRM & AI Automation",
        email: "farai@mavisstrategicpartners.co.za",
        attendanceStatus: "Present",
        clockInTime: "08:01 SAST",
        leaveBalanceDays: 16,
        completedTasksCount: 22,
        overdueTasksCount: 0,
        blockedTasksCount: 0,
        adherenceRate: 98,
      },
      {
        id: "emp-3",
        name: "Kudzai Banda",
        role: "Full-Stack Web Developer",
        department: "Websites & Software",
        email: "kudzai@mavisstrategicpartners.co.za",
        attendanceStatus: "Present",
        clockInTime: "07:45 SAST",
        leaveBalanceDays: 12,
        completedTasksCount: 15,
        overdueTasksCount: 0,
        blockedTasksCount: 0,
        adherenceRate: 95,
      },
      {
        id: "emp-4",
        name: "Xongile Mhlari",
        role: "Operations & Relationship Manager",
        department: "Client Success",
        email: "xongile@mavisstrategicpartners.co.za",
        attendanceStatus: "Present",
        clockInTime: "07:30 SAST",
        leaveBalanceDays: 18,
        completedTasksCount: 35,
        overdueTasksCount: 0,
        blockedTasksCount: 1,
        adherenceRate: 99,
      },
      {
        id: "emp-5",
        name: "Mavis Muchena",
        role: "Chief Executive Officer",
        department: "Strategy",
        email: "mavis@mavisstrategicpartners.co.za",
        attendanceStatus: "Present",
        clockInTime: "07:15 SAST",
        leaveBalanceDays: 20,
        completedTasksCount: 40,
        overdueTasksCount: 0,
        blockedTasksCount: 0,
        adherenceRate: 100,
      },
    ];
  }, [realProfiles]);

  // CEO Command Centre Five Health Views calculation
  const executiveHealth: ExecutiveHealthViewData = useMemo(() => {
    return {
      sales: {
        newLeads: leads.filter((l) => l.stage === "New").length || 14,
        unansweredLeads: 1,
        overdueFollowUps: leads.filter((l) => new Date(l.followUpDate) < new Date()).length || 2,
        consultationsHeld: 8,
        proposalsSent: leads.filter((l) => l.stage === "Proposal sent").length || 5,
        closedDeals: 3,
        verifiedNewRevenueZar: 185000,
      },
      revenue: {
        bookedZar: 650000,
        invoicedZar: 580000,
        cashCollectedZar: 520000,
        overdueDebtZar: 60000,
        recurringZar: 420000,
        costMarginPct: 68,
      },
      client: {
        onboardingLate: onboarding.filter((o) => o.isBreached).length || 1,
        awaitingLaunch: onboarding.filter((o) => o.currentStage === "Publish & Verify").length || 2,
        unresolvedComplaints: 0,
        missedCheckIns: 1,
        renewalRisks: 1,
        greenCount: clients.filter((c) => c.health === "Green").length,
        amberCount: clients.filter((c) => c.health === "Amber").length,
        redCount: clients.filter((c) => c.health === "Red").length,
      },
      delivery: {
        dueToday: 8,
        overdueMilestones: tasks.filter((t) => t.status === "Blocked" || t.workingHoursLate > 0).length || 2,
        blockedWork: tasks.filter((t) => t.status === "Blocked").length,
        approvalBacklog: approvals.filter((a) => a.status === "Pending Review").length,
        campaignsAwaitingLaunch: 2,
        overdueWebsites: 0,
      },
      team: {
        assignedWorkload: tasks.length,
        acceptedDeliveryRatePct: 94,
        staleUpdates: 1,
        pendingVerification: tasks.filter((t) => t.status === "Submitted for review").length,
        managerOverdueApprovals: approvals.filter((a) => a.reviewTimeHrs > 4).length,
        unresolvedBlockers: tasks.filter((t) => Boolean(t.blockReason)).length,
      },
    };
  }, [leads, onboarding, clients, tasks, approvals]);

  // Overall metrics summary
  const metrics = useMemo(() => {
    const totalPeople = employees.length;
    const presentCount = employees.filter((e) => e.attendanceStatus === "Present").length;
    const lateCount = employees.filter((e) => e.attendanceStatus === "Late").length;
    const leaveCount = employees.filter((e) => e.attendanceStatus === "Approved Leave").length;

    const overdueCount = tasks.filter((t) => t.workingHoursLate > 0 || t.status === "Blocked").length;
    const blockedCount = tasks.filter((t) => t.status === "Blocked").length;
    const completedCount = tasks.filter((t) => t.status === "Accepted complete").length;

    const openEscalations = escalations.filter((e) => e.status !== "Resolved" && e.status !== "Closed").length;

    return {
      people: { total: totalPeople, present: presentCount, late: lateCount, onLeave: leaveCount },
      work: { overdue: overdueCount, blocked: blockedCount, completed: completedCount },
      clients: { openEscalations },
    };
  }, [employees, tasks, escalations]);

  // Action methods
  const addTask = useCallback((newTask: Omit<OperationTask, "id">) => {
    const created: OperationTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [created, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskLifecycleStatus, reworkReason?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              reworkReason: status === "Rework" ? reworkReason : t.reworkReason,
              acceptedAt: status === "Accepted complete" ? new Date().toISOString() : t.acceptedAt,
            }
          : t
      )
    );
  }, []);

  const submitTaskEvidence = useCallback((taskId: string, submission: OperationTask["evidenceSubmitted"]) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "Submitted for review",
              submittedAt: new Date().toISOString(),
              evidenceSubmitted: submission,
            }
          : t
      )
    );
  }, []);

  const verifyTaskCompletion = useCallback((taskId: string, verifierName: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "Accepted complete",
              verifierName,
              acceptedAt: new Date().toISOString(),
              progress: 100,
            }
          : t
      )
    );
  }, []);

  const addEscalation = useCallback((newEsc: Omit<EscalationIssue, "id">) => {
    const created: EscalationIssue = {
      ...newEsc,
      id: `esc-${Date.now()}`,
    };
    setEscalations((prev) => [created, ...prev]);
  }, []);

  const resolveEscalation = useCallback((escId: string, actionsTaken: string) => {
    setEscalations((prev) =>
      prev.map((e) => (e.id === escId ? { ...e, status: "Resolved", actionsTaken } : e))
    );
  }, []);

  const addLead = useCallback((newLead: Omit<SalesLead, "id">) => {
    const created: SalesLead = {
      ...newLead,
      id: `lead-${Date.now()}`,
    };
    setLeads((prev) => [created, ...prev]);
  }, []);

  const updateClientHealth = useCallback((clientId: string, health: "Green" | "Amber" | "Red", reason: string, nextAction: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, health, healthReason: reason, nextAction } : c))
    );
  }, []);

  return {
    tasks,
    clients,
    onboarding,
    escalations,
    leads,
    approvals,
    employees,
    acceptanceTests,
    executiveHealth,
    metrics,
    loading,
    refreshRealData,
    addTask,
    updateTaskStatus,
    submitTaskEvidence,
    verifyTaskCompletion,
    addEscalation,
    resolveEscalation,
    addLead,
    updateClientHealth,
  };
}
