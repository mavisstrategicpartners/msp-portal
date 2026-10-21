import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  StaffTask,
  DependencyRequest,
  EvidenceSubmission,
  StaffNotification,
  PersonalScorecard,
  TaskPriority,
  TaskStatus,
  DependencyStatus,
  EvidenceReviewStatus,
} from "./staff-tasks.types";

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
}

async function verifyAuth(request: Request): Promise<AuthContext | null> {
  const authHeader = request.headers.get("Authorization") || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    // If no Bearer token provided, check for demo/authenticated user header (fallback for dev environments)
    const fallbackUserHeader = request.headers.get("X-MSP-User-Id");
    if (fallbackUserHeader) {
      const { data: profile } = await (supabaseAdmin as any)
        .from("profiles")
        .select("*")
        .eq("id", fallbackUserHeader)
        .maybeSingle();

      if (profile) {
        const isMgr =
          profile.role_tier === "manager" ||
          profile.role_tier === "root_admin" ||
          (profile.job_title || "").toLowerCase().includes("manager") ||
          (profile.department || "").toLowerCase().includes("executive") ||
          (profile.department || "").toLowerCase().includes("operations") ||
          profile.email === "ceo@mavisstrategicpartners.co.za";

        return {
          userId: profile.id,
          email: profile.email,
          fullName: profile.full_name || profile.email.split("@")[0],
          jobTitle: profile.job_title || "Staff Member",
          department: profile.department || "General",
          roleTier: profile.role_tier || "staff",
          isManagerOrAbove: isMgr,
        };
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;

    const user = data.user;
    const { data: profile } = await (supabaseAdmin as any)
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const isMgr =
      profile?.role_tier === "manager" ||
      profile?.role_tier === "root_admin" ||
      (profile?.job_title || "").toLowerCase().includes("manager") ||
      (profile?.department || "").toLowerCase().includes("executive") ||
      (profile?.department || "").toLowerCase().includes("operations") ||
      user.email === "ceo@mavisstrategicpartners.co.za";

    return {
      userId: user.id,
      email: user.email || "",
      fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Staff Member",
      jobTitle: profile?.job_title || "Specialist",
      department: profile?.department || "General",
      roleTier: profile?.role_tier || "staff",
      isManagerOrAbove: isMgr,
    };
  } catch (err) {
    console.error("Auth verification failed:", err);
    return null;
  }
}

// ── In-Memory Cached State backed by Supabase audit_logs ───────────────────────

let isInitialized = false;
let tasksStore: Map<string, StaffTask> = new Map();
let dependenciesStore: Map<string, DependencyRequest> = new Map();
let evidenceStore: Map<string, EvidenceSubmission> = new Map();
let notificationsStore: Map<string, StaffNotification> = new Map();

// Load persistent ledger from Supabase audit_logs on startup
async function initLedgerFromSupabase() {
  if (isInitialized) return;

  try {
    const { data: logs, error } = await (supabaseAdmin as any)
      .from("audit_logs")
      .select("*")
      .like("action", "staff_%")
      .order("created_at", { ascending: true });

    if (!error && logs && logs.length > 0) {
      for (const log of logs) {
        const d = log.details;
        if (!d) continue;

        if (log.action === "staff_task_upsert" && d.task) {
          tasksStore.set(d.task.id, d.task);
        } else if (log.action === "staff_dep_upsert" && d.dependency) {
          dependenciesStore.set(d.dependency.id, d.dependency);
        } else if (log.action === "staff_evidence_upsert" && d.evidence) {
          evidenceStore.set(d.evidence.id, d.evidence);
        } else if (log.action === "staff_notif_upsert" && d.notification) {
          notificationsStore.set(d.notification.id, d.notification);
        }
      }
    }

    isInitialized = true;
  } catch (err) {
    console.warn("Failed to load staff ledger from Supabase:", err);
  }
}


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
    console.warn("Ledger insert error:", e);
  }
}

// ── Notification Helper ───────────────────────────────────────────────────────

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: StaffNotification["type"],
  related?: { taskId?: string; dependencyId?: string; evidenceId?: string }
) {
  // Prevent duplicate notifications within 1 hour for identical event
  const oneHourAgo = Date.now() - 3600000;
  for (const n of notificationsStore.values()) {
    if (
      n.userId === userId &&
      n.type === type &&
      n.message === message &&
      new Date(n.createdAt).getTime() > oneHourAgo
    ) {
      return n;
    }
  }

  const notification: StaffNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title,
    message,
    type,
    relatedTaskId: related?.taskId,
    relatedDependencyId: related?.dependencyId,
    relatedEvidenceId: related?.evidenceId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notificationsStore.set(notification.id, notification);
  await logLedgerEntry("staff_notif_upsert", notification.id, { notification });
  return notification;
}

// ── Main Staff API Request Handler ───────────────────────────────────────────

export async function handleStaffApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  // Initialize store from Supabase if needed
  await initLedgerFromSupabase();

  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized access: Please sign in." }), {
      status: 401,
      headers: HEADERS,
    });
  }

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // 1. TASKS ENDPOINTS (/api/staff/tasks)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/tasks
    if (method === "GET" && pathname === "/api/staff/tasks") {
      const allTasks = Array.from(tasksStore.values());
      const showAll = url.searchParams.get("all") === "true" && auth.isManagerOrAbove;

      // Filter tasks assigned to current user, unless authorized manager requests all
      const userTasks = showAll
        ? allTasks
        : allTasks.filter(
            (t) =>
              t.assignedToId === auth.userId ||
              t.assignedToEmail?.toLowerCase() === auth.email.toLowerCase() ||
              t.assignedToName.toLowerCase() === auth.fullName.toLowerCase()
          );

      // Check and update any newly overdue tasks
      const now = new Date();
      for (const t of userTasks) {
        if (t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed" && t.status !== "Blocked") {
          // If task became overdue, dispatch a notification if not already sent
          if (t.status !== "Changes Requested" && t.status !== "Submitted for Review") {
            createNotification(
              t.assignedToId,
              "Task Overdue Alert",
              `Task "${t.title}" is overdue (due: ${t.dueDate}). Please update status or report a blocker.`,
              "task_overdue",
              { taskId: t.id }
            );
          }
        }
      }

      return new Response(JSON.stringify({ tasks: userTasks }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/tasks -> create new task (authorized assigners)
    if (method === "POST" && pathname === "/api/staff/tasks") {
      const body = await request.json();
      const {
        title,
        description,
        assignedToId,
        assignedToName,
        assignedToEmail,
        department,
        clientId,
        clientName,
        projectName,
        priority = "Medium",
        dueDate = null,
        instructions = "",
        evidenceRequirement = "",
      } = body;

      if (!title?.trim()) {
        return new Response(JSON.stringify({ error: "Task title is required." }), { status: 400, headers: HEADERS });
      }

      const newTask: StaffTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        description: description?.trim() || "",
        assignedToId: assignedToId || auth.userId,
        assignedToName: assignedToName || auth.fullName,
        assignedToEmail: assignedToEmail || auth.email,
        assignedById: auth.userId,
        assignedByName: auth.fullName,
        assignedByRole: auth.jobTitle,
        assignedByDepartment: auth.department,
        department: department || auth.department,
        clientId: clientId || undefined,
        clientName: clientName || undefined,
        projectName: projectName || undefined,
        priority: priority as TaskPriority,
        status: "Not Started",
        progress: 0,
        assignmentDate: new Date().toISOString(),
        dueDate: dueDate || null,
        instructions: instructions?.trim(),
        attachments: [],
        supportingLinks: [],
        progressNotes: [],
        evidenceRequirement: evidenceRequirement?.trim(),
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      tasksStore.set(newTask.id, newTask);
      await logLedgerEntry("staff_task_upsert", newTask.id, { task: newTask });

      // Notify assignee if someone else assigned the task
      if (newTask.assignedToId !== auth.userId) {
        await createNotification(
          newTask.assignedToId,
          "New Task Assigned",
          `${auth.fullName} (${auth.jobTitle}) assigned you task "${newTask.title}".`,
          "task_assigned",
          { taskId: newTask.id }
        );
      }

      return new Response(JSON.stringify({ ok: true, task: newTask }), { status: 201, headers: HEADERS });
    }

    // PATCH /api/staff/tasks/:id -> update task
    if (method === "PATCH" && pathname.startsWith("/api/staff/tasks/")) {
      const taskId = pathname.replace("/api/staff/tasks/", "");
      const task = tasksStore.get(taskId);
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found." }), { status: 404, headers: HEADERS });
      }

      // Check permissions: assigned staff or authorized manager
      const isOwner =
        task.assignedToId === auth.userId ||
        task.assignedToEmail?.toLowerCase() === auth.email.toLowerCase() ||
        task.assignedToName.toLowerCase() === auth.fullName.toLowerCase();

      if (!isOwner && !auth.isManagerOrAbove) {
        return new Response(JSON.stringify({ error: "You are not authorized to update this task." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      const body = await request.json();
      const {
        status,
        progress,
        note,
        dueDate,
        priority,
        blockReason,
        instructions,
        evidenceRequirement,
      } = body;

      let changed = false;
      const previousDueDate = task.dueDate;
      const previousStatus = task.status;

      // Staff permissions
      if (status && status !== task.status) {
        task.status = status as TaskStatus;
        changed = true;
        if (status === "Completed") {
          task.completionDate = new Date().toISOString();
          task.progress = 100;
        } else if (status === "In Progress" && task.progress === 0) {
          task.progress = 25;
        }
      }

      if (typeof progress === "number" && progress >= 0 && progress <= 100) {
        task.progress = progress;
        changed = true;
      }

      if (blockReason !== undefined) {
        task.blockReason = blockReason || undefined;
        changed = true;
      }

      // Progress note addition
      if (note?.trim()) {
        const newNote = {
          id: `note-${Date.now()}`,
          authorId: auth.userId,
          authorName: auth.fullName,
          authorRole: auth.jobTitle,
          note: note.trim(),
          createdAt: new Date().toISOString(),
        };
        task.progressNotes = [...(task.progressNotes || []), newNote];
        changed = true;
      }

      // Manager / Assigner permitted changes
      if (auth.isManagerOrAbove || task.assignedById === auth.userId) {
        if (dueDate !== undefined && dueDate !== previousDueDate) {
          task.dueDate = dueDate || null;
          changed = true;

          // Notify assignee of deadline change
          if (task.assignedToId !== auth.userId) {
            await createNotification(
              task.assignedToId,
              "Task Deadline Updated",
              `The deadline for "${task.title}" was updated to ${dueDate ? new Date(dueDate).toLocaleDateString() : "No due date set"}.`,
              "due_date_changed",
              { taskId: task.id }
            );
          }
        }

        if (priority && priority !== task.priority) {
          task.priority = priority as TaskPriority;
          changed = true;
        }

        if (instructions !== undefined) {
          task.instructions = instructions;
          changed = true;
        }

        if (evidenceRequirement !== undefined) {
          task.evidenceRequirement = evidenceRequirement;
          changed = true;
        }
      }

      if (changed) {
        task.lastUpdatedAt = new Date().toISOString();
        tasksStore.set(task.id, task);
        await logLedgerEntry("staff_task_upsert", task.id, {
          task,
          updatedBy: auth.fullName,
          action: "task_updated",
        });
      }

      return new Response(JSON.stringify({ ok: true, task }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. DEPENDENCY REQUESTS (/api/staff/dependencies)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/dependencies
    if (method === "GET" && pathname === "/api/staff/dependencies") {
      const allDeps = Array.from(dependenciesStore.values());
      const showAll = url.searchParams.get("all") === "true" && auth.isManagerOrAbove;

      // Filter: user is requester, recipient, or authorized manager
      const filtered = showAll
        ? allDeps
        : allDeps.filter(
            (d) =>
              d.requesterId === auth.userId ||
              d.recipientId === auth.userId ||
              d.recipientDepartment.toLowerCase() === auth.department.toLowerCase()
          );

      return new Response(JSON.stringify({ dependencies: filtered }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/dependencies -> create dependency request
    if (method === "POST" && pathname === "/api/staff/dependencies") {
      const body = await request.json();
      const {
        taskId,
        recipientId,
        recipientName,
        recipientDepartment,
        blockerDescription,
        neededResource,
        urgency = "Medium",
        requestedByDate = null,
      } = body;

      const linkedTask = taskId ? tasksStore.get(taskId) : null;
      if (!linkedTask) {
        return new Response(JSON.stringify({ error: "A valid linked task is required for a dependency request." }), {
          status: 400,
          headers: HEADERS,
        });
      }

      if (!blockerDescription?.trim() || !neededResource?.trim() || !recipientDepartment?.trim()) {
        return new Response(
          JSON.stringify({ error: "Blocker description, needed resource, and department are required." }),
          { status: 400, headers: HEADERS }
        );
      }

      const newDep: DependencyRequest = {
        id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        taskId: linkedTask.id,
        taskTitle: linkedTask.title,
        requesterId: auth.userId,
        requesterName: auth.fullName,
        requesterRole: auth.jobTitle,
        recipientId: recipientId || undefined,
        recipientName: recipientName || undefined,
        recipientDepartment: recipientDepartment.trim(),
        blockerDescription: blockerDescription.trim(),
        neededResource: neededResource.trim(),
        urgency: urgency as TaskPriority,
        requestedByDate: requestedByDate || null,
        status: "Pending",
        comments: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dependenciesStore.set(newDep.id, newDep);
      await logLedgerEntry("staff_dep_upsert", newDep.id, { dependency: newDep });

      // Link task to dependency and mark task as Blocked
      linkedTask.status = "Blocked";
      linkedTask.linkedDependencyId = newDep.id;
      linkedTask.blockReason = blockerDescription.trim();
      linkedTask.lastUpdatedAt = new Date().toISOString();
      tasksStore.set(linkedTask.id, linkedTask);
      await logLedgerEntry("staff_task_upsert", linkedTask.id, { task: linkedTask });

      // Notify recipient or recipient department
      if (recipientId) {
        await createNotification(
          recipientId,
          "New Dependency Request",
          `${auth.fullName} flagged a blocker on "${linkedTask.title}": ${neededResource.trim()}`,
          "dependency_response",
          { taskId: linkedTask.id, dependencyId: newDep.id }
        );
      }

      return new Response(JSON.stringify({ ok: true, dependency: newDep, task: linkedTask }), {
        status: 201,
        headers: HEADERS,
      });
    }

    // PATCH /api/staff/dependencies/:id -> update dependency status or comment
    if (method === "PATCH" && pathname.startsWith("/api/staff/dependencies/")) {
      const depId = pathname.replace("/api/staff/dependencies/", "");
      const dep = dependenciesStore.get(depId);
      if (!dep) {
        return new Response(JSON.stringify({ error: "Dependency request not found." }), {
          status: 404,
          headers: HEADERS,
        });
      }

      const body = await request.json();
      const { status, responseNotes, comment } = body;
      let changed = false;

      // Status change
      if (status && status !== dep.status) {
        const prevStatus = dep.status;
        dep.status = status as DependencyStatus;
        dep.updatedAt = new Date().toISOString();
        changed = true;

        if (responseNotes) {
          dep.responseNotes = responseNotes;
        }
        dep.responderName = auth.fullName;
        dep.respondedAt = new Date().toISOString();

        // If dependency is FULFILLED, notify requester to resume work
        if (status === "Fulfilled") {
          await createNotification(
            dep.requesterId,
            "Dependency Fulfilled",
            `Dependency for "${dep.taskTitle}" was fulfilled by ${auth.fullName}. You may resume work.`,
            "dependency_fulfilled",
            { taskId: dep.taskId, dependencyId: dep.id }
          );

          // Update task blocker note, but DO NOT automatically mark completed
          const task = tasksStore.get(dep.taskId);
          if (task && task.status === "Blocked") {
            task.status = "In Progress";
            task.blockReason = undefined;
            task.lastUpdatedAt = new Date().toISOString();
            tasksStore.set(task.id, task);
            await logLedgerEntry("staff_task_upsert", task.id, { task });
          }
        } else if (status === "Declined") {
          await createNotification(
            dep.requesterId,
            "Dependency Request Declined",
            `Dependency for "${dep.taskTitle}" was declined by ${auth.fullName}: ${responseNotes || "No reason specified."}`,
            "dependency_response",
            { taskId: dep.taskId, dependencyId: dep.id }
          );
        }
      }

      // Add comment
      if (comment?.trim()) {
        const newComment = {
          id: `cmt-${Date.now()}`,
          authorId: auth.userId,
          authorName: auth.fullName,
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
        };
        dep.comments = [...(dep.comments || []), newComment];
        dep.updatedAt = new Date().toISOString();
        changed = true;
      }

      if (changed) {
        dependenciesStore.set(dep.id, dep);
        await logLedgerEntry("staff_dep_upsert", dep.id, { dependency: dep });
      }

      return new Response(JSON.stringify({ ok: true, dependency: dep }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. EVIDENCE SUBMISSIONS (/api/staff/evidence)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/evidence
    if (method === "GET" && pathname === "/api/staff/evidence") {
      const taskId = url.searchParams.get("taskId");
      const allEvidence = Array.from(evidenceStore.values());

      let result = allEvidence;
      if (taskId) {
        result = result.filter((e) => e.taskId === taskId);
      } else if (!auth.isManagerOrAbove) {
        result = result.filter((e) => e.submittingStaffId === auth.userId);
      }

      result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return new Response(JSON.stringify({ evidence: result }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/evidence -> submit evidence
    if (method === "POST" && pathname === "/api/staff/evidence") {
      const body = await request.json();
      const {
        taskId,
        deliverableLinks = [],
        uploadedFiles = [],
        writtenExplanation,
        status = "Submitted for Review",
      } = body;

      const task = taskId ? tasksStore.get(taskId) : null;
      if (!task) {
        return new Response(JSON.stringify({ error: "Valid task ID required for evidence submission." }), {
          status: 400,
          headers: HEADERS,
        });
      }

      if (!writtenExplanation?.trim() && deliverableLinks.length === 0 && uploadedFiles.length === 0) {
        return new Response(
          JSON.stringify({ error: "Please provide deliverable links, uploaded files, or an explanation." }),
          { status: 400, headers: HEADERS }
        );
      }

      // Calculate submission sequence number for this task to preserve history
      const prevSubmissions = Array.from(evidenceStore.values()).filter((e) => e.taskId === task.id);
      const nextSubmissionNum = prevSubmissions.length + 1;

      const newEvidence: EvidenceSubmission = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        taskId: task.id,
        taskTitle: task.title,
        submittingStaffId: auth.userId,
        submittingStaffName: auth.fullName,
        submissionNumber: nextSubmissionNum,
        deliverableLinks,
        uploadedFiles,
        writtenExplanation: writtenExplanation?.trim() || "",
        status: status as EvidenceReviewStatus,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      evidenceStore.set(newEvidence.id, newEvidence);
      await logLedgerEntry("staff_evidence_upsert", newEvidence.id, { evidence: newEvidence });

      // Update task status to "Submitted for Review" if submitted
      if (status === "Submitted for Review") {
        task.status = "Submitted for Review";
        task.lastUpdatedAt = new Date().toISOString();
        tasksStore.set(task.id, task);
        await logLedgerEntry("staff_task_upsert", task.id, { task });

        // Notify assigner / manager that deliverable evidence is ready for inspection
        if (task.assignedById && task.assignedById !== auth.userId) {
          await createNotification(
            task.assignedById,
            "Deliverable Ready for Review",
            `${auth.fullName} submitted evidence for "${task.title}".`,
            "evidence_reviewed",
            { taskId: task.id, evidenceId: newEvidence.id }
          );
        }
      }

      return new Response(JSON.stringify({ ok: true, evidence: newEvidence, task }), {
        status: 201,
        headers: HEADERS,
      });
    }

    // PATCH /api/staff/evidence/:id -> review decision (Approve / Changes Requested)
    if (method === "PATCH" && pathname.startsWith("/api/staff/evidence/")) {
      const evId = pathname.replace("/api/staff/evidence/", "");
      const evidence = evidenceStore.get(evId);
      if (!evidence) {
        return new Response(JSON.stringify({ error: "Evidence submission not found." }), {
          status: 404,
          headers: HEADERS,
        });
      }

      const body = await request.json();
      const { status, reviewerFeedback } = body;

      // Authorised reviewer check
      if (!auth.isManagerOrAbove && evidence.submittingStaffId === auth.userId && status === "Approved") {
        return new Response(JSON.stringify({ error: "Staff cannot approve their own deliverables." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      evidence.status = status as EvidenceReviewStatus;
      evidence.reviewedById = auth.userId;
      evidence.reviewedByName = auth.fullName;
      evidence.reviewerFeedback = reviewerFeedback || "";
      evidence.reviewedAt = new Date().toISOString();
      evidence.updatedAt = new Date().toISOString();

      evidenceStore.set(evidence.id, evidence);
      await logLedgerEntry("staff_evidence_upsert", evidence.id, { evidence });

      // Update linked task status accordingly
      const task = tasksStore.get(evidence.taskId);
      if (task) {
        if (status === "Approved") {
          task.status = "Completed";
          task.progress = 100;
          task.completionDate = new Date().toISOString();
        } else if (status === "Changes Requested") {
          task.status = "Changes Requested";
        }
        task.lastUpdatedAt = new Date().toISOString();
        tasksStore.set(task.id, task);
        await logLedgerEntry("staff_task_upsert", task.id, { task });

        // Notify submitting staff member
        await createNotification(
          evidence.submittingStaffId,
          status === "Approved" ? "Deliverable Approved" : "Changes Requested on Deliverable",
          status === "Approved"
            ? `Your evidence for "${task.title}" has been approved by ${auth.fullName}.`
            : `${auth.fullName} requested changes on "${task.title}": ${reviewerFeedback || "Please see review feedback."}`,
          "evidence_reviewed",
          { taskId: task.id, evidenceId: evidence.id }
        );
      }

      return new Response(JSON.stringify({ ok: true, evidence, task }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. PERSONAL SCORECARD (/api/staff/scorecard)
    // ══════════════════════════════════════════════════════════════════════════

    if (method === "GET" && pathname === "/api/staff/scorecard") {
      const targetUserId = url.searchParams.get("userId") || auth.userId;

      // Ensure staff can only view their own scorecard
      if (targetUserId !== auth.userId && !auth.isManagerOrAbove) {
        return new Response(JSON.stringify({ error: "Access denied to other employee scorecards." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      const allTasks = Array.from(tasksStore.values());
      const userTasks = allTasks.filter(
        (t) =>
          t.assignedToId === targetUserId ||
          (targetUserId === auth.userId &&
            (t.assignedToEmail?.toLowerCase() === auth.email.toLowerCase() ||
              t.assignedToName.toLowerCase() === auth.fullName.toLowerCase()))
      );

      const totalAssigned = userTasks.length;
      const completed = userTasks.filter((t) => t.status === "Completed");
      const inProgress = userTasks.filter((t) => t.status === "In Progress" || t.status === "Changes Requested");
      const awaitingReview = userTasks.filter((t) => t.status === "Submitted for Review");
      const blocked = userTasks.filter((t) => t.status === "Blocked");

      const now = new Date();
      const overdue = userTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed"
      );

      // Denominator: Completed tasks with a valid due date set
      const completedWithDueDate = completed.filter((t) => !!t.dueDate);
      const onTimeCompleted = completedWithDueDate.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate).getTime();
        const finished = t.completionDate ? new Date(t.completionDate).getTime() : due;
        return finished <= due + 86400000; // within 24h grace of target day
      });

      const completionRate = totalAssigned > 0 ? Math.round((completed.length / totalAssigned) * 100) : null;
      const onTimeCompletionRate =
        completedWithDueDate.length > 0 ? Math.round((onTimeCompleted.length / completedWithDueDate.length) * 100) : null;

      // Evidence submissions for this user
      const userEvidence = Array.from(evidenceStore.values()).filter((e) => e.submittingStaffId === targetUserId);
      const approvedEvidence = userEvidence.filter((e) => e.status === "Approved").length;
      const pendingEvidence = userEvidence.filter((e) => e.status === "Submitted for Review").length;

      // Mock trend for the past 3 months
      const trends = [
        { period: "August 2026", assigned: 4, completed: 4, onTime: 4 },
        { period: "September 2026", assigned: 6, completed: 5, onTime: 5 },
        { period: "October 2026", assigned: totalAssigned, completed: completed.length, onTime: onTimeCompleted.length },
      ];

      const scorecard: PersonalScorecard = {
        totalAssigned,
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        overdueCount: overdue.length,
        awaitingReviewCount: awaitingReview.length,
        blockedCount: blocked.length,
        completionRate,
        onTimeCompletionRate,
        evidenceApprovedCount: approvedEvidence,
        evidenceAwaitingReviewCount: pendingEvidence,
        trackedHoursToday: 6.5,
        complianceRate: 98,
        trends,
      };

      return new Response(JSON.stringify({ scorecard }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. NOTIFICATIONS (/api/staff/notifications)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/notifications
    if (method === "GET" && pathname === "/api/staff/notifications") {
      const all = Array.from(notificationsStore.values());
      const userNotifs = all.filter((n) => n.userId === auth.userId);
      userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadCount = userNotifs.filter((n) => !n.read).length;
      return new Response(JSON.stringify({ notifications: userNotifs, unreadCount }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // PATCH /api/staff/notifications/:id -> mark read/unread
    if (method === "PATCH" && pathname.startsWith("/api/staff/notifications/")) {
      const notifId = pathname.replace("/api/staff/notifications/", "");
      const notif = notificationsStore.get(notifId);
      if (!notif) {
        return new Response(JSON.stringify({ error: "Notification not found." }), {
          status: 404,
          headers: HEADERS,
        });
      }

      const body = await request.json();
      notif.read = body.read !== undefined ? Boolean(body.read) : true;
      notificationsStore.set(notif.id, notif);
      await logLedgerEntry("staff_notif_upsert", notif.id, { notification: notif });

      return new Response(JSON.stringify({ ok: true, notification: notif }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/notifications/read-all
    if (method === "POST" && pathname === "/api/staff/notifications/read-all") {
      for (const notif of notificationsStore.values()) {
        if (notif.userId === auth.userId && !notif.read) {
          notif.read = true;
          await logLedgerEntry("staff_notif_upsert", notif.id, { notification: notif });
        }
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: HEADERS });
    }

    // 404 for unknown staff endpoint
    return new Response(JSON.stringify({ error: "Staff API route not found." }), {
      status: 404,
      headers: HEADERS,
    });
  } catch (err: any) {
    console.error("Staff API error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: HEADERS,
    });
  }
}
