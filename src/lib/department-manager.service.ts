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
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any legacy synthetic demo IDs
      const cleaned = parsed.filter((item: any) => {
        if (!item || !item.id) return false;
        const idStr = String(item.id);
        return !idStr.startsWith("mb-task-") && !idStr.startsWith("appr-mb-") && !idStr.startsWith("tgt-");
      });
      return cleaned as unknown as T;
    }
    return parsed;
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

const INITIAL_TEAM_MEMBERS: DepartmentTeamMember[] = [];

const INITIAL_TASKS: DepartmentTask[] = [];

const INITIAL_APPROVALS: DepartmentApprovalItem[] = [];

const INITIAL_TARGETS: DepartmentTarget[] = [];

const CLIENT_DELIVERY_DETAILS: DepartmentClientDetail[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Makurung Process Solutions (Pty) Ltd",
    industry: "Mining Engineering / EPC Solutions",
    accountStatus: "Active Retainer",
    package: "SEO + Website Build & Paid Ads",
    accountManager: "Operations & Relationship Manager",
    scopeSummary: "B2B LinkedIn & Meta advertising for mining plant optimisation, tailings retreatment, and industrial EPC contracts across South Africa and SADC.",
    activeDeliverablesCount: 0,
    openIssuesCount: 0,
    acceptanceCriteria: [
      "Target verified mining procurement managers and technical directors in SA",
      "Lead generation forms must route to Operations CRM with WhatsApp notifications",
    ],
    deadlines: [],
    communicationNotes: [],
    requiredEvidenceChecklist: [
      "Ad account setup with billing threshold verified",
      "Pixel & CAPI server events firing with 0 dropped events",
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
    activeDeliverablesCount: 0,
    openIssuesCount: 0,
    acceptanceCriteria: [
      "Google Search ads targeting B2B corporate planners & luxury private functions",
      "CAPI setup with Enhanced Conversions enabled",
    ],
    deadlines: [],
    communicationNotes: [],
    requiredEvidenceChecklist: [
      "Google Ads Conversion Tracking code verified in Tag Assistant",
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
        capacityUtilizationPct: activeCount === 0 ? 0 : Math.min(100, activeCount * 25),
        onTimeDeliveryRate: 100,
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
