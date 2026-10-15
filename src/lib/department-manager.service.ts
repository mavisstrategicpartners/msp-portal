import { supabase } from "@/integrations/supabase/client";

export interface DepartmentTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  avatarUrl?: string;
  activeTasksCount: number;
  capacityUtilizationPct: number;
  onTimeDeliveryRate: number;
  status: "Available" | "Optimal" | "Near Capacity" | "Overloaded";
}

export interface DepartmentTask {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  assignedToId?: string;
  assignedToName: string;
  assignedToRole: string;
  department: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "In Progress" | "Submitted for Review" | "Blocked" | "Rework Required" | "Accepted Complete" | "Unassigned";
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies?: string;
  dependencyOwner?: string;
  blocker?: string;
  blockerDate?: string;
  workingHoursLate: number;
  evidenceRequired: string;
  evidenceSubmitted?: string;
  qaReviewer?: string;
  qaDecisionNotes?: string;
  approvedDeadlineChangesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTarget {
  id: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  achievementPct: number;
  status: "On Target" | "At Risk" | "Critical";
  period: string;
  definition: string;
  correctiveAction?: string;
}

export interface DepartmentApprovalItem {
  id: string;
  title: string;
  requestType: "Budget Sign-off" | "QA Deliverable Approval" | "Deadline Extension" | "Task Reassignment" | "Operational Exception";
  requesterName: string;
  requesterRole: string;
  relatedClientName: string;
  relatedTaskId?: string;
  description: string;
  supportingEvidence: string;
  amountZAR?: number;
  requestedDate: string;
  decisionDeadline: string;
  status: "Pending" | "Approved" | "Rejected" | "Changes Requested" | "Escalated";
  decisionBy?: string;
  decisionDate?: string;
  decisionComments?: string;
}

export interface DepartmentClientDetail {
  id: string;
  name: string;
  industry: string;
  accountStatus: "Active Retainer" | "Onboarding" | "Service Delivery";
  package: string;
  accountManager: string;
  scopeSummary: string;
  activeDeliverablesCount: number;
  openIssuesCount: number;
  acceptanceCriteria: string[];
  deadlines: { title: string; due: string; status: string }[];
  communicationNotes: string[];
  requiredEvidenceChecklist: string[];
}

const STORAGE_KEY_PREFIX = "msp.department.media_buying.";
const KEY_TASKS = STORAGE_KEY_PREFIX + "tasks";
const KEY_APPROVALS = STORAGE_KEY_PREFIX + "approvals";
const KEY_TARGETS = STORAGE_KEY_PREFIX + "targets";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn("Storage write error:", err);
  }
}

// ── Initial Authoritative Datasets ──────────────────────────────────────────

const INITIAL_TEAM_MEMBERS: DepartmentTeamMember[] = [
  {
    id: "mb-tm-1",
    name: "Siya Nkosi",
    role: "Media Buying Specialist",
    email: "siya.nkosi@mavisstrategicpartners.co.za",
    department: "Media Buying",
    activeTasksCount: 2,
    capacityUtilizationPct: 92,
    onTimeDeliveryRate: 98,
    status: "Near Capacity",
  },
  {
    id: "mb-tm-2",
    name: "Emma Watson",
    role: "Tracking & CAPI Specialist",
    email: "emma.watson@mavisstrategicpartners.co.za",
    department: "Media Buying",
    activeTasksCount: 1,
    capacityUtilizationPct: 82,
    onTimeDeliveryRate: 100,
    status: "Optimal",
  },
  {
    id: "mb-tm-3",
    name: "Sarah Jenkins",
    role: "Digital Advertising Analyst",
    email: "sarah.jenkins@mavisstrategicpartners.co.za",
    department: "Media Buying",
    activeTasksCount: 1,
    capacityUtilizationPct: 85,
    onTimeDeliveryRate: 99,
    status: "Optimal",
  },
];

const INITIAL_TASKS: DepartmentTask[] = [
  {
    id: "mb-task-1",
    title: "Meta Performance Ads Campaign Launch",
    clientId: "22222222-2222-2222-2222-222222222222",
    clientName: "Makurung Process Solutions (Pty) Ltd",
    assignedToId: "mb-tm-1",
    assignedToName: "Siya Nkosi",
    assignedToRole: "Media Buying Specialist",
    department: "Media Buying",
    priority: "Urgent",
    status: "Blocked",
    dueDate: "2026-10-16",
    estimatedHours: 14,
    dependencies: "Creative asset handover & R12,500 ad spend approval",
    dependencyOwner: "Media Buying Lead (Department Manager)",
    blocker: "Budget sign-off pending with Department Manager for 2 days. Media buyer submitted R12,500 ad spend allocation.",
    blockerDate: "2026-10-12",
    workingHoursLate: 9,
    evidenceRequired: "Account IDs, copy QA checklist & live platform status screenshots",
    evidenceSubmitted: "Ad account ID: act_984128120, Copy approved by client relationship manager, staging creatives uploaded.",
    approvedDeadlineChangesCount: 0,
    createdAt: "2026-10-04T10:00:00Z",
    updatedAt: "2026-10-14T12:00:00Z",
  },
  {
    id: "mb-task-2",
    title: "Google Search Ads CAPI Setup & Event Tracking",
    clientId: "11111111-1111-1111-1111-111111111111",
    clientName: "Imigidi Authentic African Events",
    assignedToId: "mb-tm-2",
    assignedToName: "Emma Watson",
    assignedToRole: "Tracking & CAPI Specialist",
    department: "Media Buying",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-10-18",
    estimatedHours: 8,
    dependencies: "Client DNS verification & Google Tag Manager container access",
    dependencyOwner: "Websites & Software Team",
    workingHoursLate: 0,
    evidenceRequired: "CAPI server events test payload & GA4 tag audit report",
    approvedDeadlineChangesCount: 1,
    createdAt: "2026-10-06T09:30:00Z",
    updatedAt: "2026-10-14T08:15:00Z",
  },
  {
    id: "mb-task-3",
    title: "TikTok Ads Retargeting Campaign Setup",
    clientId: "33333333-3333-3333-3333-333333333333",
    clientName: "Kasi Green Energy",
    assignedToId: "mb-tm-1",
    assignedToName: "Siya Nkosi",
    assignedToRole: "Media Buying Specialist",
    department: "Media Buying",
    priority: "Medium",
    status: "Submitted for Review",
    dueDate: "2026-10-17",
    estimatedHours: 6,
    dependencies: "TikTok pixel active on landing page",
    workingHoursLate: 0,
    evidenceRequired: "TikTok Ads Manager Campaign ID & Pixel check log",
    evidenceSubmitted: "Campaign ID: tt_7718293910. Verified 12 server events in test debugger.",
    qaReviewer: "Department Manager (Media Buying)",
    approvedDeadlineChangesCount: 0,
    createdAt: "2026-10-08T11:00:00Z",
    updatedAt: "2026-10-13T16:20:00Z",
  },
  {
    id: "mb-task-4",
    title: "Monthly Paid Media ROAS & Attribution Audit",
    clientId: "22222222-2222-2222-2222-222222222222",
    clientName: "Makurung Process Solutions (Pty) Ltd",
    assignedToId: "mb-tm-3",
    assignedToName: "Sarah Jenkins",
    assignedToRole: "Digital Advertising Analyst",
    department: "Media Buying",
    priority: "High",
    status: "Accepted Complete",
    dueDate: "2026-10-12",
    estimatedHours: 10,
    workingHoursLate: 0,
    evidenceRequired: "Comprehensive ROAS sheet & client attribution dashboard link",
    evidenceSubmitted: "Report file uploaded: makurung_oct2026_ads_audit.pdf",
    qaReviewer: "Department Manager (Media Buying)",
    qaDecisionNotes: "Approved. Cost per qualified mining inquiry reduced by 22%. Deliverable signed off.",
    approvedDeadlineChangesCount: 0,
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-12T14:40:00Z",
  },
  {
    id: "mb-task-5",
    title: "High-Intent B2B Search Copy & Negative Keyword Expansion",
    clientId: "11111111-1111-1111-1111-111111111111",
    clientName: "Imigidi Authentic African Events",
    assignedToName: "Unassigned",
    assignedToRole: "Unallocated Responsibility",
    department: "Media Buying",
    priority: "High",
    status: "Unassigned",
    dueDate: "2026-10-19",
    estimatedHours: 7,
    dependencies: "Audience intent keyword analysis",
    workingHoursLate: 0,
    evidenceRequired: "Keyword list spreadsheet & approved headline variations",
    approvedDeadlineChangesCount: 0,
    createdAt: "2026-10-10T14:00:00Z",
    updatedAt: "2026-10-10T14:00:00Z",
  },
];

const INITIAL_APPROVALS: DepartmentApprovalItem[] = [
  {
    id: "appr-mb-1",
    title: "R12,500 Ad Spend Budget Sign-off for Client Alpha / Makurung",
    requestType: "Budget Sign-off",
    requesterName: "Siya Nkosi",
    requesterRole: "Media Buying Specialist",
    relatedClientName: "Makurung Process Solutions (Pty) Ltd",
    relatedTaskId: "mb-task-1",
    description: "Requesting department manager sign-off for R12,500 monthly ad spend to activate LinkedIn Sponsored InMail and Meta retargeting campaigns. Account is funded by client.",
    supportingEvidence: "Client deposit proof attached (REF: MPS-2026-092), Campaign structure in Ads Manager ID: act_984128120.",
    amountZAR: 12500,
    requestedDate: "2026-10-12",
    decisionDeadline: "2026-10-14",
    status: "Pending",
  },
  {
    id: "appr-mb-2",
    title: "QA Acceptance for TikTok Ads Retargeting Setup",
    requestType: "QA Deliverable Approval",
    requesterName: "Siya Nkosi",
    requesterRole: "Media Buying Specialist",
    relatedClientName: "Kasi Green Energy",
    relatedTaskId: "mb-task-3",
    description: "Completed full setup of TikTok retargeting ads, custom audience segments, and pixel tracking test. Awaiting manager acceptance.",
    supportingEvidence: "Pixel debug log verified, 3 ad variations attached with CTA routing to solar calculator.",
    requestedDate: "2026-10-13",
    decisionDeadline: "2026-10-15",
    status: "Pending",
  },
  {
    id: "appr-mb-3",
    title: "Deadline Adjustment: Google CAPI Setup (Client DNS Dependency)",
    requestType: "Deadline Extension",
    requesterName: "Emma Watson",
    requesterRole: "Tracking & CAPI Specialist",
    relatedClientName: "Imigidi Authentic African Events",
    relatedTaskId: "mb-task-2",
    description: "Client IT team took 3 days to delegate DNS records for server-side tagging subdomain. Requesting 24h deadline extension to 2026-10-18.",
    supportingEvidence: "Email trail with client IT administrator and DNS propagation screenshot.",
    requestedDate: "2026-10-11",
    decisionDeadline: "2026-10-12",
    status: "Approved",
    decisionBy: "Department Manager (Media Buying)",
    decisionDate: "2026-10-12",
    decisionComments: "Approved. Legitimate external dependency; client IT delay recorded in operational communications log.",
  },
];

const INITIAL_TARGETS: DepartmentTarget[] = [
  {
    id: "tgt-1",
    metricName: "Target Deliverables Completed",
    targetValue: 15,
    currentValue: 14,
    unit: "Deliverables",
    achievementPct: 93.3,
    status: "At Risk",
    period: "October 2026",
    definition: "Total paid ad launches, tracking setups, and performance audits delivered on schedule.",
    correctiveAction: "Approve pending R12,500 ad spend budget to unblock Meta Performance Ads campaign launch.",
  },
  {
    id: "tgt-2",
    metricName: "Department Capacity Utilization",
    targetValue: 85,
    currentValue: 88,
    unit: "%",
    achievementPct: 103.5,
    status: "At Risk",
    period: "October 2026",
    definition: "Average team operational capacity across media buyers and tracking specialists.",
    correctiveAction: "Media Buying is operating at 88% capacity load. Rebalance unassigned search copy task.",
  },
  {
    id: "tgt-3",
    metricName: "On-Time Deadline Compliance (SLA)",
    targetValue: 90,
    currentValue: 85,
    unit: "%",
    achievementPct: 94.4,
    status: "At Risk",
    period: "October 2026",
    definition: "Percentage of client deliverables signed off on or before original SLA date.",
    correctiveAction: "Media Buying SLA lagging (85%) due to managerial approval response latency.",
  },
  {
    id: "tgt-4",
    metricName: "Quality Assurance First-Time Acceptance",
    targetValue: 90,
    currentValue: 93.3,
    unit: "%",
    achievementPct: 103.7,
    status: "On Target",
    period: "October 2026",
    definition: "Percentage of deliverable submissions accepted without requiring rework.",
  },
  {
    id: "tgt-5",
    metricName: "Open Roadblocks / Critical Dependencies",
    targetValue: 0,
    currentValue: 1,
    unit: "Blockers",
    achievementPct: 0,
    status: "At Risk",
    period: "October 2026",
    definition: "Active blockers halting client delivery within the department.",
    correctiveAction: "Resolve budget sign-off blocker for Makurung Process Solutions.",
  },
];

const CLIENT_DELIVERY_DETAILS: DepartmentClientDetail[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Makurung Process Solutions (Pty) Ltd",
    industry: "Mining Engineering / EPC Solutions",
    accountStatus: "Active Retainer",
    package: "SEO + Website Build & Paid Ads",
    accountManager: "Operations & Relationship Manager",
    scopeSummary: "B2B LinkedIn & Meta advertising for mining plant optimisation, tailings retreatment, and industrial EPC contracts across South Africa and SADC.",
    activeDeliverablesCount: 2,
    openIssuesCount: 1,
    acceptanceCriteria: [
      "Target verified mining procurement managers and technical directors in SA",
      "Lead generation forms must route to Operations CRM with WhatsApp notifications",
      "Monthly minimum 15 qualified EPC inquiries",
      "Cost per qualified inquiry under R850",
    ],
    deadlines: [
      { title: "Meta Performance Ads Launch", due: "2026-10-16", status: "Blocked on Budget Sign-off" },
      { title: "Monthly Attribution & ROAS Audit", due: "2026-10-12", status: "Accepted Complete" },
    ],
    communicationNotes: [
      "Client confirmed monthly ad budget deposit of R12,500 on Oct 11.",
      "Relationship Manager noted client is eager to start before industry mining indaba next week.",
    ],
    requiredEvidenceChecklist: [
      "Ad account setup with billing threshold verified",
      "Pixel & CAPI server events firing with 0 dropped events",
      "Negative audience exclusions applied (existing suppliers/competitors)",
    ],
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Imigidi Authentic African Events",
    industry: "Events & Equipment Hire",
    accountStatus: "Active Retainer",
    package: "Social Media + Ads Retainer",
    accountManager: "Operations & Relationship Manager",
    scopeSummary: "Equipment hire B2B Google Search ads & Luxury African experiences social lead generation.",
    activeDeliverablesCount: 2,
    openIssuesCount: 0,
    acceptanceCriteria: [
      "Google Search ads targeting B2B corporate planners & luxury private functions",
      "CAPI setup with Enhanced Conversions enabled",
      "Track call conversions and equipment catalog downloads",
    ],
    deadlines: [
      { title: "Google Search Ads CAPI Setup", due: "2026-10-18", status: "In Progress" },
      { title: "B2B Search Copy Expansion", due: "2026-10-19", status: "Unassigned" },
    ],
    communicationNotes: [
      "Client requested focus on marquee tent and generator hire for corporate year-end functions.",
    ],
    requiredEvidenceChecklist: [
      "Google Ads Conversion Tracking code verified in Tag Assistant",
      "Negative keyword list with consumer search exclusions active",
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Kasi Green Energy",
    industry: "Solar & Clean Energy Solutions",
    accountStatus: "Service Delivery",
    package: "Growth Strategy & Paid Ads",
    accountManager: "Operations & Relationship Manager",
    scopeSummary: "Commercial & residential solar installation inquiries across Gauteng and Mpumalanga.",
    activeDeliverablesCount: 1,
    openIssuesCount: 0,
    acceptanceCriteria: [
      "TikTok ads targeting commercial property owners and residential homeowners",
      "Solar calculator qualification form integration",
    ],
    deadlines: [
      { title: "TikTok Retargeting Campaign Setup", due: "2026-10-17", status: "Awaiting Manager QA" },
    ],
    communicationNotes: [
      "Client requested rapid deployment ahead of summer power tariff updates.",
    ],
    requiredEvidenceChecklist: [
      "TikTok pixel event test logs attached to QA submission",
      "Ad creative video captions match brand guidelines",
    ],
  },
];

// ── Public Service API ───────────────────────────────────────────────────────

export async function fetchDepartmentData(department = "Media Buying") {
  // 1. Fetch live clients from Supabase
  let dbClients: any[] = [];
  try {
    const { data } = await supabase.from("clients").select("id, name, industry, active_package, contact_email, notes");
    if (data && data.length > 0) {
      dbClients = data;
    }
  } catch (err) {
    console.warn("Error fetching Supabase clients:", err);
  }

  // 2. Fetch live profiles from Supabase to reconcile team members
  let dbProfiles: any[] = [];
  try {
    const { data } = await supabase.from("profiles").select("id, full_name, email, department, job_title, role_tier");
    if (data && data.length > 0) {
      dbProfiles = data;
    }
  } catch (err) {
    console.warn("Error fetching Supabase profiles:", err);
  }

  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const approvals = getStored<DepartmentApprovalItem[]>(KEY_APPROVALS, INITIAL_APPROVALS);
  const targets = getStored<DepartmentTarget[]>(KEY_TARGETS, INITIAL_TARGETS);

  // Build unified team members combining ALL system employees from profiles with department specialists
  const unifiedMembers: DepartmentTeamMember[] = [];

  if (dbProfiles && dbProfiles.length > 0) {
    for (const p of dbProfiles) {
      const activeCount = tasks.filter((t) => t.assignedToId === p.id && t.status !== "Accepted Complete").length;
      unifiedMembers.push({
        id: p.id,
        name: p.full_name || p.email || "Employee",
        role: p.job_title || "Specialist",
        email: p.email || "",
        department: p.department || "Operations",
        activeTasksCount: activeCount,
        capacityUtilizationPct: Math.min(100, Math.max(35, activeCount * 20 + 35)),
        onTimeDeliveryRate: 98,
        status: activeCount >= 4 ? "Near Capacity" : "Available",
      });
    }
  }

  // Include department initial specialists if not already listed
  for (const init of INITIAL_TEAM_MEMBERS) {
    if (!unifiedMembers.some((m) => m.id === init.id || (m.email && m.email.toLowerCase() === init.email.toLowerCase()))) {
      unifiedMembers.push(init);
    }
  }

  const teamMembers = unifiedMembers;
  const clients = CLIENT_DELIVERY_DETAILS;

  return {
    department,
    tasks,
    approvals,
    targets,
    teamMembers,
    clients,
    dbClients,
    dbProfiles,
  };
}

// ── Task Management Actions ─────────────────────────────────────────────────

export async function mutateAssignTask(taskId: string, newAssigneeId: string, managerName: string) {
  const { teamMembers } = await fetchDepartmentData();
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const targetMember = teamMembers.find((m) => m.id === newAssigneeId);

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        assignedToId: targetMember?.id,
        assignedToName: targetMember?.name || "Unassigned",
        assignedToRole: targetMember?.role || "Unallocated",
        status: (t.status === "Unassigned" ? "In Progress" : t.status) as any,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  setStored(KEY_TASKS, updatedTasks);

  // Sync assignment to Supabase staff tasks and audit logs
  if (targetMember) {
    try {
      const assignedTask = updatedTasks.find((t) => t.id === taskId);
      if (assignedTask) {
        const staffTaskPayload = {
          id: crypto.randomUUID(),
          title: assignedTask.title,
          description: assignedTask.evidenceRequired ? `Deliverable: ${assignedTask.evidenceRequired}` : `Deliverable for ${assignedTask.clientName}`,
          assignedToId: targetMember.id,
          assignedToName: targetMember.name,
          assignedToEmail: targetMember.email,
          assignedById: "dept-mgr-id",
          assignedByName: managerName || "Department Manager",
          assignedByRole: "Department Manager",
          department: assignedTask.department || "Media Buying",
          clientName: assignedTask.clientName,
          priority: assignedTask.priority || "High",
          status: "In Progress",
          progress: 0,
          dueDate: assignedTask.dueDate,
          evidenceRequired: assignedTask.evidenceRequired,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await supabase.from("audit_logs").insert({
          action: "staff_task_upsert",
          target_id: crypto.randomUUID(),
          details: { task: staffTaskPayload },
        });

        await supabase.from("audit_logs").insert({
          action: "staff_notif_upsert",
          target_id: crypto.randomUUID(),
          details: {
            notification: {
              id: crypto.randomUUID(),
              userId: targetMember.id,
              title: "Task Assigned",
              message: `${managerName} assigned deliverable "${assignedTask.title}" to you for client ${assignedTask.clientName}.`,
              type: "task_assigned",
              relatedTaskId: staffTaskPayload.id,
              read: false,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (err) {
      console.warn("Failed to sync assigned task to staff ledger:", err);
    }
  }

  return updatedTasks;
}

export async function mutateCreateDepartmentTask(taskData: Partial<DepartmentTask>, managerName: string) {
  const { teamMembers } = await fetchDepartmentData();
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const targetMember = teamMembers.find((m) => m.id === taskData.assignedToId);

  const newTask: DepartmentTask = {
    id: `mb-task-${Date.now()}`,
    title: taskData.title || "Untitled Deliverable",
    clientId: taskData.clientId || "11111111-1111-1111-1111-111111111111",
    clientName: taskData.clientName || "General Client",
    assignedToId: targetMember?.id,
    assignedToName: targetMember?.name || "Unassigned",
    assignedToRole: targetMember?.role || "Unallocated",
    department: taskData.department || "Media Buying",
    priority: taskData.priority || "High",
    status: (taskData.assignedToId ? "In Progress" : "Unassigned") as any,
    dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
    estimatedHours: taskData.estimatedHours || 8,
    workingHoursLate: 0,
    evidenceRequired: taskData.evidenceRequired || "Verification report",
    approvedDeadlineChangesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedTasks = [newTask, ...tasks];
  setStored(KEY_TASKS, updatedTasks);

  if (targetMember) {
    try {
      const staffTaskPayload = {
        id: crypto.randomUUID(),
        title: newTask.title,
        description: newTask.evidenceRequired ? `Deliverable: ${newTask.evidenceRequired}` : `Deliverable for ${newTask.clientName}`,
        assignedToId: targetMember.id,
        assignedToName: targetMember.name,
        assignedToEmail: targetMember.email,
        assignedById: "dept-mgr-id",
        assignedByName: managerName || "Department Manager",
        assignedByRole: "Department Manager",
        department: newTask.department,
        clientName: newTask.clientName,
        priority: newTask.priority,
        status: "In Progress",
        progress: 0,
        dueDate: newTask.dueDate,
        evidenceRequired: newTask.evidenceRequired,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await supabase.from("audit_logs").insert({
        action: "staff_task_upsert",
        target_id: crypto.randomUUID(),
        details: { task: staffTaskPayload },
      });

      await supabase.from("audit_logs").insert({
        action: "staff_notif_upsert",
        target_id: crypto.randomUUID(),
        details: {
          notification: {
            id: crypto.randomUUID(),
            userId: targetMember.id,
            title: "New Task Assignment",
            message: `${managerName} assigned deliverable "${newTask.title}" to you for client ${newTask.clientName}.`,
            type: "task_assigned",
            relatedTaskId: staffTaskPayload.id,
            read: false,
            createdAt: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.warn("Failed to sync created task to staff ledger:", err);
    }
  }

  return updatedTasks;
}

export async function mutateTaskPriority(taskId: string, priority: DepartmentTask["priority"], managerName: string) {
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
  setStored(KEY_TASKS, updatedTasks);

  try {
    await supabase.from("audit_logs").insert({
      action: "task_priority_updated",
      target_id: taskId,
      details: { taskId, priority, updatedBy: managerName, timestamp: new Date().toISOString() },
    });
  } catch {}

  return updatedTasks;
}

export async function mutateTaskDeadline(taskId: string, newDueDate: string, reason: string, managerName: string) {
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        dueDate: newDueDate,
        approvedDeadlineChangesCount: t.approvedDeadlineChangesCount + 1,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });
  setStored(KEY_TASKS, updatedTasks);

  try {
    await supabase.from("audit_logs").insert({
      action: "task_deadline_changed",
      target_id: taskId,
      details: { taskId, newDueDate, reason, manager: managerName, timestamp: new Date().toISOString() },
    });
  } catch {}

  return updatedTasks;
}

// ── Quality Assurance Decision ──────────────────────────────────────────────

export async function mutateQADecision(
  taskId: string,
  decision: "Accepted" | "Rework Required",
  notes: string,
  reviewerName: string
) {
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const approvals = getStored<DepartmentApprovalItem[]>(KEY_APPROVALS, INITIAL_APPROVALS);

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: (decision === "Accepted" ? "Accepted Complete" : "Rework Required") as any,
        qaReviewer: reviewerName,
        qaDecisionNotes: notes,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  // Also update corresponding QA approval item if exists
  const updatedApprovals = approvals.map((a) => {
    if (a.relatedTaskId === taskId && a.requestType === "QA Deliverable Approval") {
      return {
        ...a,
        status: (decision === "Accepted" ? "Approved" : "Changes Requested") as any,
        decisionBy: reviewerName,
        decisionDate: new Date().toISOString().split("T")[0],
        decisionComments: notes,
      };
    }
    return a;
  });

  setStored(KEY_TASKS, updatedTasks);
  setStored(KEY_APPROVALS, updatedApprovals);

  try {
    await supabase.from("audit_logs").insert({
      action: decision === "Accepted" ? "qa_deliverable_accepted" : "qa_rework_requested",
      target_id: taskId,
      details: { taskId, decision, notes, reviewer: reviewerName, timestamp: new Date().toISOString() },
    });
  } catch {}

  return { updatedTasks, updatedApprovals };
}

// ── Blocker Resolution & Escalation ─────────────────────────────────────────

export async function mutateResolveBlocker(taskId: string, resolutionNotes: string, managerName: string) {
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const targets = getStored<DepartmentTarget[]>(KEY_TARGETS, INITIAL_TARGETS);

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: "In Progress" as const,
        blocker: undefined,
        blockerDate: undefined,
        workingHoursLate: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  // Recalculate targets (open blockers)
  const updatedTargets = targets.map((tgt) => {
    if (tgt.id === "tgt-5") {
      const remainingBlockers = updatedTasks.filter((t) => !!t.blocker).length;
      return {
        ...tgt,
        currentValue: remainingBlockers,
        achievementPct: remainingBlockers === 0 ? 100 : 0,
        status: (remainingBlockers === 0 ? "On Target" : "At Risk") as any,
      };
    }
    return tgt;
  });

  setStored(KEY_TASKS, updatedTasks);
  setStored(KEY_TARGETS, updatedTargets);

  try {
    await supabase.from("audit_logs").insert({
      action: "blocker_resolved",
      target_id: taskId,
      details: { taskId, resolutionNotes, manager: managerName, timestamp: new Date().toISOString() },
    });
  } catch {}

  return { updatedTasks, updatedTargets };
}

export async function mutateEscalateBlocker(
  taskId: string,
  escalateTo: "Operations Manager" | "General Manager",
  urgency: string,
  reason: string,
  managerName: string
) {
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const task = tasks.find((t) => t.id === taskId);

  try {
    await supabase.from("audit_logs").insert({
      action: "blocker_escalated",
      target_id: taskId,
      details: {
        taskId,
        taskTitle: task?.title,
        client: task?.clientName,
        escalateTo,
        urgency,
        reason,
        escalatedBy: managerName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {}

  return true;
}

// ── Approvals Decision ──────────────────────────────────────────────────────

export async function mutateApprovalDecision(
  approvalId: string,
  decision: "Approved" | "Rejected" | "Changes Requested" | "Escalated",
  comments: string,
  managerName: string
) {
  const approvals = getStored<DepartmentApprovalItem[]>(KEY_APPROVALS, INITIAL_APPROVALS);
  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const targets = getStored<DepartmentTarget[]>(KEY_TARGETS, INITIAL_TARGETS);

  const approvalItem = approvals.find((a) => a.id === approvalId);

  const updatedApprovals = approvals.map((a) => {
    if (a.id === approvalId) {
      return {
        ...a,
        status: decision,
        decisionBy: managerName,
        decisionDate: new Date().toISOString().split("T")[0],
        decisionComments: comments,
      };
    }
    return a;
  });

  let updatedTasks = tasks;

  // If budget sign-off for Makurung Performance ads is approved, automatically unblock the task!
  if (approvalItem?.relatedTaskId && decision === "Approved") {
    updatedTasks = tasks.map((t) => {
      if (t.id === approvalItem.relatedTaskId && t.status === "Blocked") {
        return {
          ...t,
          status: "In Progress" as const,
          blocker: undefined,
          blockerDate: undefined,
          workingHoursLate: 0,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
  }

  // Recalculate targets
  const remainingBlockers = updatedTasks.filter((t) => !!t.blocker).length;
  const updatedTargets = targets.map((tgt) => {
    if (tgt.id === "tgt-5") {
      return {
        ...tgt,
        currentValue: remainingBlockers,
        achievementPct: remainingBlockers === 0 ? 100 : 0,
        status: (remainingBlockers === 0 ? "On Target" : "At Risk") as any,
      };
    }
    return tgt;
  });

  setStored(KEY_APPROVALS, updatedApprovals);
  setStored(KEY_TASKS, updatedTasks);
  setStored(KEY_TARGETS, updatedTargets);

  try {
    await supabase.from("audit_logs").insert({
      action: `approval_${decision.toLowerCase().replace(" ", "_")}`,
      target_id: approvalId,
      details: {
        approvalId,
        title: approvalItem?.title,
        decision,
        comments,
        decidedBy: managerName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {}

  return { updatedApprovals, updatedTasks, updatedTargets };
}
