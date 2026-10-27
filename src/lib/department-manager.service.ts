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

export type TaskType =
  | "Client Work"
  | "Internal Operations"
  | "Administration"
  | "Technical / IT"
  | "Meetings & Planning"
  | "Research & Development"
  | "Training & Professional Development"
  | "Other";

export interface DepartmentTask {
  id: string;
  title: string;
  clientId?: string | null;
  clientName: string;
  taskType?: TaskType;
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
  attachments?: { name: string; url: string; size: number; mimeType: string }[];
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

// ── File Attachment Upload ───────────────────────────────────────────────────

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/zip",
];

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25 MB

export async function uploadTaskAttachment(
  file: File,
  taskId: string
): Promise<{ name: string; url: string; size: number; mimeType: string }> {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    throw new Error(
      `File format not permitted (${file.type || "unknown"}). Allowed: PDF, Word, Excel, PNG, JPG, WEBP, CSV, ZIP.`
    );
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error("File exceeds 25 MB maximum upload limit.");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `task-attachments/${taskId}/${Date.now()}_${cleanName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      // Fall back to a local object URL (works for images in-session)
      return { name: file.name, url: URL.createObjectURL(file), size: file.size, mimeType: file.type };
    }

    const { data: signedData, error: signErr } = await supabase.storage
      .from("evidence")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30-day link

    if (!signErr && signedData?.signedUrl) {
      return { name: file.name, url: signedData.signedUrl, size: file.size, mimeType: file.type };
    }

    const { data: publicData } = supabase.storage.from("evidence").getPublicUrl(path);
    return { name: file.name, url: publicData.publicUrl, size: file.size, mimeType: file.type };
  } catch {
    return { name: file.name, url: URL.createObjectURL(file), size: file.size, mimeType: file.type };
  }
}

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

const CLIENT_DELIVERY_DETAILS: DepartmentClientDetail[] = [];

// ── Public Service API & Auth Helpers ───────────────────────────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  } catch {}

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("msp.authenticatedUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) {
          headers["X-MSP-User-Id"] = parsed.id;
        }
      }
    } catch {}
  }

  return headers;
}

export function staffTaskToDeptTask(st: any): DepartmentTask {
  let deptStatus: DepartmentTask["status"] = "In Progress";
  if (st.status === "Completed") deptStatus = "Accepted Complete";
  else if (st.status === "Changes Requested") deptStatus = "Rework Required";
  else if (st.status === "Blocked") deptStatus = "Blocked";
  else if (st.status === "Submitted for Review") deptStatus = "Submitted for Review";
  else if (st.status === "Not Started" && (!st.assignedToId || st.assignedToName === "Unassigned")) deptStatus = "Unassigned";
  else deptStatus = "In Progress";

  return {
    id: st.id,
    title: st.title,
    clientId: st.clientId || null,
    clientName: st.clientName || (st.clientId ? "Client" : "Internal Task"),
    taskType: (st.taskType as any) || (st.clientId ? "Client Work" : "Internal Operations"),
    assignedToId: st.assignedToId || undefined,
    assignedToName: st.assignedToName || "Unassigned",
    assignedToRole: st.assignedToRole || "Specialist",
    department: st.department || "Media Buying",
    priority: (st.priority as any) || "High",
    status: deptStatus,
    dueDate: st.dueDate ? st.dueDate.split("T")[0] : new Date().toISOString().split("T")[0],
    estimatedHours: st.estimatedHours || 8,
    dependencies: st.dependenciesSummary,
    blocker: st.blockReason,
    workingHoursLate: st.workingHoursLate || 0,
    evidenceRequired: st.evidenceRequired || st.evidenceRequirement || "Verified deliverables & completion report",
    evidenceSubmitted: st.evidenceSubmitted,
    attachments: (st.attachments || []).map((a: any) => ({
      name: a.name,
      url: a.url,
      size: a.size || 0,
      mimeType: a.type || a.mimeType || "application/octet-stream",
    })),
    qaReviewer: st.qaReviewer,
    qaDecisionNotes: st.qaDecisionNotes,
    approvedDeadlineChangesCount: st.approvedDeadlineChangesCount || 0,
    createdAt: st.createdAt || new Date().toISOString(),
    updatedAt: st.lastUpdatedAt || st.updatedAt || new Date().toISOString(),
  };
}

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

  // 3. Fetch authoritative tasks from server API
  let tasks: DepartmentTask[] = [];
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/staff/tasks?all=true", { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tasks)) {
        tasks = data.tasks.map(staffTaskToDeptTask);
        setStored(KEY_TASKS, tasks);
      }
    }
  } catch (err) {
    console.warn("Failed to load department tasks from server, checking local store:", err);
  }

  if (tasks.length === 0) {
    tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  }

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
  const targetMember = teamMembers.find((m) => m.id === newAssigneeId);

  const headers = await getAuthHeaders();
  const res = await fetch(`/api/staff/tasks/${taskId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      assignedToId: targetMember?.id || "",
      assignedToName: targetMember?.name || "Unassigned",
      assignedToEmail: targetMember?.email || "",
      assignedToRole: targetMember?.role || "Specialist",
      status: "In Progress",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save task assignment to database.");
  }

  const { task: updatedStaffTask } = await res.json();
  const updatedDeptTask = staffTaskToDeptTask(updatedStaffTask);

  const existingTasks = getStored<DepartmentTask[]>(KEY_TASKS, []);
  const updatedTasks = existingTasks.map((t) => (t.id === taskId ? updatedDeptTask : t));
  setStored(KEY_TASKS, updatedTasks);

  return updatedTasks;
}

export async function mutateCreateDepartmentTask(taskData: Partial<DepartmentTask>, managerName: string) {
  const { teamMembers } = await fetchDepartmentData();
  const targetMember = teamMembers.find((m) => m.id === taskData.assignedToId);

  // Determine whether this is a client-linked or internal task
  const isInternalTask = !taskData.clientId || taskData.clientId === "none";
  const resolvedClientId = isInternalTask ? null : taskData.clientId;
  const resolvedClientName = isInternalTask ? "Internal Task" : (taskData.clientName || "Internal Task");

  const headers = await getAuthHeaders();
  const res = await fetch("/api/staff/tasks", {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: taskData.title?.trim() || "Untitled Deliverable",
      description:
        taskData.evidenceRequired ||
        (isInternalTask
          ? `Internal task — ${taskData.taskType || "General"}`
          : `Deliverable for ${resolvedClientName}`),
      assignedToId: targetMember?.id || "",
      assignedToName: targetMember?.name || "Unassigned",
      assignedToEmail: targetMember?.email || "",
      assignedToRole: targetMember?.role || "Specialist",
      department: taskData.department || "Media Buying",
      clientId: resolvedClientId || undefined,
      clientName: resolvedClientName,
      priority: taskData.priority || "High",
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
      instructions: taskData.evidenceRequired || "Verification report",
      evidenceRequirement: taskData.evidenceRequired || "Verification report",
      evidenceRequired: taskData.evidenceRequired || "Verification report",
      taskType: taskData.taskType || (isInternalTask ? "Internal Operations" : "Client Work"),
      attachments: taskData.attachments || [],
      status: targetMember ? "In Progress" : "Not Started",
      estimatedHours: taskData.estimatedHours || 8,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create and assign deliverable on server.");
  }

  const { task: createdStaffTask } = await res.json();
  const newDeptTask = staffTaskToDeptTask(createdStaffTask);

  const existingTasks = getStored<DepartmentTask[]>(KEY_TASKS, []);
  const updatedTasks = [newDeptTask, ...existingTasks.filter((t) => t.id !== newDeptTask.id)];
  setStored(KEY_TASKS, updatedTasks);

  return updatedTasks;
}

export async function mutateTaskPriority(taskId: string, priority: DepartmentTask["priority"], managerName: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/staff/tasks/${taskId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      priority,
      note: `Priority changed to ${priority} by ${managerName}`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update priority on server.");
  }

  const { task: updatedStaffTask } = await res.json();
  const updatedDeptTask = staffTaskToDeptTask(updatedStaffTask);

  const existingTasks = getStored<DepartmentTask[]>(KEY_TASKS, []);
  const updatedTasks = existingTasks.map((t) => (t.id === taskId ? updatedDeptTask : t));
  setStored(KEY_TASKS, updatedTasks);

  return updatedTasks;
}

export async function mutateTaskDeadline(taskId: string, newDueDate: string, reason: string, managerName: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/staff/tasks/${taskId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      dueDate: newDueDate,
      note: `Deadline adjusted to ${newDueDate}. Reason: ${reason} (Approved by ${managerName})`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update deadline on server.");
  }

  const { task: updatedStaffTask } = await res.json();
  const updatedDeptTask = staffTaskToDeptTask(updatedStaffTask);

  const existingTasks = getStored<DepartmentTask[]>(KEY_TASKS, []);
  const updatedTasks = existingTasks.map((t) => (t.id === taskId ? updatedDeptTask : t));
  setStored(KEY_TASKS, updatedTasks);

  return updatedTasks;
}

// ── Quality Assurance Decision ──────────────────────────────────────────────

export async function mutateQADecision(
  taskId: string,
  decision: "Accepted" | "Rework Required",
  notes: string,
  reviewerName: string
) {
  const headers = await getAuthHeaders();
  const mappedStatus = decision === "Accepted" ? "Completed" : "Changes Requested";
  const res = await fetch(`/api/staff/tasks/${taskId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      status: mappedStatus,
      qaReviewer: reviewerName,
      qaDecisionNotes: notes,
      note: `QA Review by ${reviewerName}: ${decision}. ${notes}`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to record QA decision on server.");
  }

  const { task: updatedStaffTask } = await res.json();
  const updatedDeptTask = staffTaskToDeptTask(updatedStaffTask);

  const tasks = getStored<DepartmentTask[]>(KEY_TASKS, INITIAL_TASKS);
  const approvals = getStored<DepartmentApprovalItem[]>(KEY_APPROVALS, INITIAL_APPROVALS);

  const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedDeptTask : t));

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
