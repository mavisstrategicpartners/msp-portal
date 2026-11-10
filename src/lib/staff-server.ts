import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest } from "@/lib/api-auth.server";
import { computeAccess, type AccessFlags } from "@/lib/roles";
import {
  assignPolicy,
  assignableDepartments,
  canConfigureStructure,
  departmentPeople,
  invalidateOrgStructure,
  ledDepartments,
  loadOrgStructure,
  managerOf,
  managesDepartment,
  memberDepartments,
  primaryDepartment,
  type OrgStructure,
} from "@/lib/org-structure.server";
import { handleRecordsApi } from "@/lib/department-records.server";
import {
  cancelAppointment,
  createAppointment,
  managerReport,
  runProvisioning,
  validateAppointment,
} from "@/lib/manager-provisioning.server";
import {
  DEPARTMENTS,
  UNASSIGNED_DEPARTMENT,
  departmentExact,
  departmentFromText,
  isUnassignedDepartment,
} from "@/lib/departments";
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
  access: AccessFlags;
  /** Department keys this user is the confirmed manager of (department_leads). */
  leadDepartments: Set<string>;
  /** Organisation structure (departments, managers, employees) from the database. */
  org: OrgStructure;
}

/** Department key of a task's department field (exact name/key first). */
function taskDeptKey(dept?: string | null): string | null {
  if (isUnassignedDepartment(dept)) return null;
  return (departmentExact(dept) ?? departmentFromText(dept))?.key ?? null;
}

async function verifyAuth(request: Request): Promise<AuthContext | null> {
  // Identity comes only from a verified Supabase token (see api-auth.server.ts).
  const user = await authenticateApiRequest(request);
  if (!user) return null;
  const org = await loadOrgStructure();
  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    department: user.department,
    roleTier: user.roleTier,
    isManagerOrAbove: user.access.isManagerOrAbove,
    access: user.access,
    leadDepartments: new Set(ledDepartments(org, user.userId)),
    org,
  };
}

const norm = (v?: string | null) => (v || "").trim().toLowerCase();

// ── Who manages what ─────────────────────────────────────────────────────────
// Authority comes from the organisation structure only (department_leads /
// department_members), never from job titles:
//   administrators and the General Manager oversee every department;
//   a department manager oversees the department(s) they lead.

/** Company-wide oversight of work: administrators and the General Manager. */
function overseesAllDepartments(auth: AuthContext) {
  return auth.access.isAdmin || auth.access.isGM;
}

function isTaskAssignee(auth: AuthContext, task: StaffTask) {
  return Boolean(
    (task.assignedToId && auth.userId && task.assignedToId.toLowerCase() === auth.userId.toLowerCase()) ||
      (task.assignedToEmail && auth.email && task.assignedToEmail.toLowerCase() === auth.email.toLowerCase()) ||
      (task.assignedToName &&
        auth.fullName &&
        task.assignedToName.toLowerCase() === auth.fullName.toLowerCase() &&
        auth.fullName.toLowerCase() !== "staff member"),
  );
}

/** Departments this user may create tasks in / move tasks into (keys). */
function assignableDepartmentKeys(auth: AuthContext): string[] {
  return assignableDepartments(auth.org, auth);
}

/** May this user see this task and its evidence? Reviewers, plus the CEO
 *  (company-wide, read-only: viewing never grants approval rights). */
function canViewTask(auth: AuthContext, task: StaffTask, _submitterDepartment?: string | null) {
  return auth.access.isCEO || canReviewTask(auth, task);
}

/** May this user oversee / review work on this task? Only the manager of the task's department
 *  (or the General Manager / an administrator). Assigning a task never grants oversight of another
 *  department's work. */
function canReviewTask(auth: AuthContext, task: StaffTask, _submitterDepartment?: string | null) {
  return managesDepartment(auth.org, auth, taskDeptKey(task.department));
}

/** May this user view an employee's records (scorecard)? */
function canViewEmployee(auth: AuthContext, employeeId: string) {
  if (employeeId === auth.userId) return true;
  if (auth.access.isCEO || overseesAllDepartments(auth)) return true;
  const depts = memberDepartments(auth.org, employeeId);
  return depts.some((k) => auth.leadDepartments.has(k));
}

const profileDeptCache = new Map<string, { dept: string | null; at: number }>();
async function profileDepartment(userId?: string | null): Promise<string | null> {
  if (!userId) return null;
  const hit = profileDeptCache.get(userId);
  if (hit && Date.now() - hit.at < 60_000) return hit.dept;
  const { data } = await (supabaseAdmin as any).from("profiles").select("department").eq("id", userId).maybeSingle();
  const dept = (data?.department as string) ?? null;
  profileDeptCache.set(userId, { dept, at: Date.now() });
  return dept;
}

// ── Evidence file storage (private "evidence" bucket) ─────────────────────────
const EVIDENCE_BUCKET = "evidence";
const MAX_EVIDENCE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EVIDENCE_TYPES = new Set([
  "application/pdf",
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv", "text/plain",
  "application/zip", "application/x-zip-compressed",
  "video/mp4",
]);

async function evidenceFileExists(path: string) {
  const dir = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  const { data, error } = await (supabaseAdmin as any).storage.from(EVIDENCE_BUCKET).list(dir, { search: name, limit: 5 });
  return !error && Array.isArray(data) && data.some((o: any) => o.name === name);
}

/** Fresh, short-lived links for an authorised viewer. Old submissions saved a
 *  browser-only "blob:" link (the file never reached the server) — flag those. */
async function signEvidenceFiles(files: EvidenceSubmission["uploadedFiles"]) {
  const out = [];
  for (const f of files || []) {
    if (f.path) {
      const store = (supabaseAdmin as any).storage.from(EVIDENCE_BUCKET);
      const [view, dl] = await Promise.all([
        store.createSignedUrl(f.path, 60 * 30),
        store.createSignedUrl(f.path, 60 * 30, { download: f.name }),
      ]);
      if (!view.error && view.data?.signedUrl) {
        out.push({ ...f, url: view.data.signedUrl, downloadUrl: dl.data?.signedUrl || view.data.signedUrl, available: true });
        continue;
      }
      out.push({ ...f, url: "", available: false, unavailableReason: "The file could not be found in storage." });
    } else if (f.url && /^https?:\/\//.test(f.url) && !f.url.startsWith("blob:")) {
      out.push({ ...f, downloadUrl: f.url, available: true });
    } else {
      out.push({
        ...f,
        url: "",
        available: false,
        unavailableReason:
          "This file was never uploaded: it was attached before the evidence upload fix and only existed on the staff member's device. Request corrections so they can upload it again.",
      });
    }
  }
  return out;
}

/** Who reviews a task's submissions: its department's manager, or — when the department has no
 *  manager (or the task has no department) — the General Manager. */
async function departmentManagersFor(dept?: string | null): Promise<string[]> {
  const key = DEPARTMENTS.some((d) => d.key === dept) ? (dept as string) : taskDeptKey(dept);
  const org = await loadOrgStructure();
  const lead = key ? org.leads.get(key) : undefined;
  if (lead && org.people.get(lead)?.active) return [lead];
  const db = supabaseAdmin as any;
  const [{ data: profs }, { data: roleRows }] = await Promise.all([
    db.from("profiles").select("*").eq("is_active", true),
    db.from("user_roles").select("user_id, role"),
  ]);
  return (profs || [])
    .filter((p: any) => computeAccess(p, p.email, (roleRows || []).filter((r: any) => r.user_id === p.id)).isGM)
    .map((p: any) => p.id);
}

// ── In-Memory Cached State backed by Supabase audit_logs ───────────────────────

let isInitialized = false;
let tasksStore: Map<string, StaffTask> = new Map();
let dependenciesStore: Map<string, DependencyRequest> = new Map();
let evidenceStore: Map<string, EvidenceSubmission> = new Map();
let notificationsStore: Map<string, StaffNotification> = new Map();

// Load persistent ledger from Supabase audit_logs
async function initLedgerFromSupabase(force = false) {
  if (isInitialized && !force) return;

  tasksStore.clear();
  dependenciesStore.clear();
  evidenceStore.clear();
  notificationsStore.clear();

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
        } else if (log.action === "staff_task_delete") {
          const targetId = d.taskId || log.target_id || d.target_ref_id;
          if (targetId) tasksStore.delete(targetId);
        } else if (log.action === "staff_dep_upsert" && d.dependency) {
          dependenciesStore.set(d.dependency.id, d.dependency);
        } else if (log.action === "staff_evidence_upsert" && d.evidence) {
          evidenceStore.set(d.evidence.id, d.evidence);
        } else if (log.action === "staff_notif_upsert" && d.notification) {
          // A creation entry never overwrites a notification that already exists (and may have
          // been read since); only status updates do. This keeps one record per event.
          if (d.op === "create" && notificationsStore.has(d.notification.id)) continue;
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

function ledgerRow(action: string, targetId: string, details: any) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
  return { action, target_id: isUuid ? targetId : null, details: { ...details, target_ref_id: targetId } };
}

/** A notification belongs to the signed-in user by account id (or, for older records, by email). */
function ownsNotification(n: StaffNotification, auth: { userId: string; email?: string | null }) {
  if (n.userId && auth.userId && n.userId.toLowerCase() === auth.userId.toLowerCase()) return true;
  return Boolean(n.userEmail && auth.email && n.userEmail.toLowerCase() === auth.email.toLowerCase());
}

// ── Notification Helper ───────────────────────────────────────────────────────

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: StaffNotification["type"],
  related?: { taskId?: string; dependencyId?: string; evidenceId?: string },
  userEmail?: string
) {
  // Prevent duplicate notifications within 1 hour for identical event
  const oneHourAgo = Date.now() - 3600000;
  for (const n of notificationsStore.values()) {
    if (
      (n.userId === userId || (userEmail && n.userEmail && n.userEmail.toLowerCase() === userEmail.toLowerCase())) &&
      n.type === type &&
      n.message === message &&
      // Different submissions/tasks are different events, even with the same wording.
      (n.relatedEvidenceId || null) === (related?.evidenceId || null) &&
      (n.relatedTaskId || null) === (related?.taskId || null) &&
      new Date(n.createdAt).getTime() > oneHourAgo
    ) {
      return n;
    }
  }

  const notification: StaffNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userEmail,
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
  await logLedgerEntry("staff_notif_upsert", notification.id, { notification, op: "create" });
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
    // Department module records (support requests, campaigns, briefs, …)
    if (pathname.startsWith("/api/staff/records")) {
      await initLedgerFromSupabase();
      const res = await handleRecordsApi(
        request,
        url,
        auth,
        async (uid, title, message) => {
          await createNotification(uid, title, message, "task_assigned");
        },
        async (key) => departmentManagersFor(key),
      );
      if (res) return res;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. TASKS ENDPOINTS (/api/staff/tasks)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/departments -> departments with their managers and employees, what the
    // caller may assign (department -> eligible employees), and the caller's own place in the structure.
    if (method === "GET" && pathname === "/api/staff/departments") {
      const org = await loadOrgStructure(true);
      const person = (id: string | undefined | null) => {
        const p = id ? org.people.get(id) : undefined;
        return p ? { id: p.id, name: p.name, title: p.title, active: p.active } : null;
      };
      const assign: Record<string, { reason: string; via: string; assignees: any[] }> = {};
      for (const d of DEPARTMENTS) {
        const pol = assignPolicy(org, auth, d.key);
        if (pol.allowed) assign[d.key] = { reason: pol.reason, via: pol.via, assignees: pol.assignees.map(person).filter(Boolean) };
      }
      const myDept = primaryDepartment(org, auth.userId);
      return new Response(
        JSON.stringify({
          departments: DEPARTMENTS.map((d) => {
            const lead = person(org.leads.get(d.key));
            const members = org.memberships
              .filter((m) => m.departmentKey === d.key && org.people.get(m.userId)?.active)
              .map((m) => ({ ...person(m.userId), primary: m.isPrimary, source: m.source }));
            return { key: d.key, name: d.name, lead: lead && lead.active ? lead : null, members };
          }),
          assignable: Object.keys(assign),
          assign,
          me: {
            departmentKey: myDept,
            departments: memberDepartments(org, auth.userId),
            manager: person(managerOf(org, auth.userId)),
            leads: [...auth.leadDepartments],
          },
          canManageLeads: canConfigureStructure(auth.access),
          canConfigure: canConfigureStructure(auth.access),
          canCorrectAny: overseesAllDepartments(auth),
        }),
        { status: 200, headers: HEADERS },
      );
    }

    // GET /api/staff/org/people -> every active person and their departments (CEO / administrators)
    if (method === "GET" && pathname === "/api/staff/org/people") {
      if (!canConfigureStructure(auth.access) && !auth.access.isGM) {
        return new Response(JSON.stringify({ error: "Only the CEO, the General Manager or an administrator can view the structure." }), { status: 403, headers: HEADERS });
      }
      const org = await loadOrgStructure(true);
      const db = supabaseAdmin as any;
      const [{ data: profs }, { data: roleRows }] = await Promise.all([
        db.from("profiles").select("*"),
        db.from("user_roles").select("user_id, role"),
      ]);
      // Positions above or outside the departments (not department employees).
      const position = new Map<string, string>();
      for (const pr of profs || []) {
        const a = computeAccess(pr, pr.email, (roleRows || []).filter((r: any) => r.user_id === pr.id));
        if (a.isCEO) position.set(pr.id, "CEO");
        else if (a.isGM) position.set(pr.id, "General Manager");
        else if (a.isAdmin) position.set(pr.id, "Administrator");
      }
      const people = [...org.people.values()]
        .filter((p) => p.active)
        .map((p) => ({
          position: position.get(p.id) ?? null,
          id: p.id,
          name: p.name,
          email: p.email,
          title: p.title,
          recordedDepartment: p.recordedDepartment,
          primary: primaryDepartment(org, p.id),
          additional: org.memberships.filter((m) => m.userId === p.id && !m.isPrimary).map((m) => m.departmentKey),
          leads: ledDepartments(org, p.id),
          source: org.memberships.find((m) => m.userId === p.id && m.isPrimary)?.source ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return new Response(JSON.stringify({ people }), { status: 200, headers: HEADERS });
    }

    // PUT /api/staff/org/members/:userId -> set an employee's department (+ other departments they work in)
    if (method === "PUT" && /^\/api\/staff\/org\/members\/[^/]+$/.test(pathname)) {
      if (!canConfigureStructure(auth.access)) {
        return new Response(JSON.stringify({ error: "Only the CEO or an administrator can change departments." }), { status: 403, headers: HEADERS });
      }
      const userId = decodeURIComponent(pathname.split("/").pop()!);
      const body = await request.json().catch(() => ({}));
      const primary: string | null = body.primary ? String(body.primary) : null;
      const additional: string[] = Array.isArray(body.additional) ? body.additional.map(String) : [];
      const valid = (k: string) => DEPARTMENTS.some((d) => d.key === k);
      if ((primary && !valid(primary)) || additional.some((k) => !valid(k))) {
        return new Response(JSON.stringify({ error: "Unknown department." }), { status: 400, headers: HEADERS });
      }
      if (!primary && additional.length) {
        return new Response(JSON.stringify({ error: "Choose the main department first." }), { status: 400, headers: HEADERS });
      }
      const db = supabaseAdmin as any;
      const { data: person } = await db.from("profiles").select("id, full_name, is_active").eq("id", userId).maybeSingle();
      if (!person || person.is_active === false) {
        return new Response(JSON.stringify({ error: "Choose an active employee." }), { status: 400, headers: HEADERS });
      }
      const { data: roleRows } = await db.from("user_roles").select("role").eq("user_id", userId);
      if ((roleRows || []).some((r: any) => r.role === "ceo") && primary) {
        return new Response(JSON.stringify({ error: "The CEO is not a member of a department." }), { status: 400, headers: HEADERS });
      }
      const nowIso = new Date().toISOString();
      const rows = [
        ...(primary ? [{ user_id: userId, department_key: primary, is_primary: true }] : []),
        ...[...new Set(additional)].filter((k) => k !== primary).map((k) => ({ user_id: userId, department_key: k, is_primary: false })),
      ].map((r) => ({ ...r, source: "manual", assigned_by: auth.userId, assigned_at: nowIso }));
      const { error: delErr } = await db.from("department_members").delete().eq("user_id", userId);
      if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: HEADERS });
      if (rows.length) {
        const { error } = await db.from("department_members").insert(rows);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: HEADERS });
      }
      invalidateOrgStructure();
      await logLedgerEntry("department_member_set", userId, { userId, primary, additional, by: auth.fullName });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: HEADERS });
    }

    // PUT /api/staff/departments/:key/lead -> the CEO or an administrator appoints a department manager
    if (method === "PUT" && /^\/api\/staff\/departments\/[^/]+\/lead$/.test(pathname)) {
      if (!canConfigureStructure(auth.access)) {
        return new Response(JSON.stringify({ error: "Only the CEO or an administrator can set department managers." }), { status: 403, headers: HEADERS });
      }
      const key = decodeURIComponent(pathname.split("/")[4]);
      const dept = DEPARTMENTS.find((d) => d.key === key);
      if (!dept) return new Response(JSON.stringify({ error: "Unknown department." }), { status: 400, headers: HEADERS });
      const { userId } = await request.json().catch(() => ({}));
      const db = supabaseAdmin as any;
      if (!userId) {
        await db.from("department_leads").delete().eq("department_key", key);
      } else {
        const { data: person } = await db.from("profiles").select("id, email, is_active").eq("id", userId).maybeSingle();
        if (!person || person.is_active === false) {
          return new Response(JSON.stringify({ error: "Choose an active employee." }), { status: 400, headers: HEADERS });
        }
        const { data: roleRows } = await db.from("user_roles").select("role").eq("user_id", userId);
        if ((roleRows || []).some((r: any) => r.role === "ceo")) {
          return new Response(JSON.stringify({ error: "The CEO is not appointed as a department manager." }), { status: 400, headers: HEADERS });
        }
        const { error } = await db
          .from("department_leads")
          .upsert({ department_key: key, user_id: userId, assigned_by: auth.userId, assigned_at: new Date().toISOString(), note: null });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: HEADERS });
      }
      invalidateOrgStructure();
      await logLedgerEntry("department_lead_set", key, { department: dept.name, userId: userId || null, by: auth.fullName });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: HEADERS });
    }

    // ── Department manager appointments and one-time account provisioning ───────
    // GET /api/staff/org/managers -> every department's manager, pending appointment or vacancy
    if (method === "GET" && pathname === "/api/staff/org/managers") {
      if (!canConfigureStructure(auth.access) && !auth.access.isGM) {
        return new Response(JSON.stringify({ error: "Only the CEO, the General Manager or an administrator can view manager accounts." }), { status: 403, headers: HEADERS });
      }
      const report = await managerReport();
      return new Response(
        JSON.stringify({ ...report, canAppoint: canConfigureStructure(auth.access), canProvision: auth.access.isAdmin }),
        { status: 200, headers: HEADERS },
      );
    }
    // POST /api/staff/org/appointments -> CEO / administrator records the verified person appointed
    if (method === "POST" && pathname === "/api/staff/org/appointments") {
      if (!canConfigureStructure(auth.access)) {
        return new Response(JSON.stringify({ error: "Only the CEO or an administrator can appoint managers." }), { status: 403, headers: HEADERS });
      }
      const v = validateAppointment(await request.json().catch(() => ({})));
      if (!v.ok) return new Response(JSON.stringify({ error: v.error }), { status: 400, headers: HEADERS });
      const r = await createAppointment(v.value, auth.userId);
      return new Response(JSON.stringify(r.status === 201 ? { appointment: r.appointment } : { error: r.error }), { status: r.status, headers: HEADERS });
    }
    // DELETE /api/staff/org/appointments/:id -> cancel a pending appointment
    if (method === "DELETE" && pathname.startsWith("/api/staff/org/appointments/")) {
      if (!canConfigureStructure(auth.access)) {
        return new Response(JSON.stringify({ error: "Only the CEO or an administrator can change appointments." }), { status: 403, headers: HEADERS });
      }
      const r = await cancelAppointment(decodeURIComponent(pathname.split("/").pop()!), auth.userId);
      return new Response(JSON.stringify(r.status === 200 ? { ok: true } : { error: r.error }), { status: r.status, headers: HEADERS });
    }
    // POST /api/staff/org/provision -> administrators: create/link accounts for all pending appointments.
    // Temporary passwords appear only in this response (never stored or logged).
    if (method === "POST" && pathname === "/api/staff/org/provision") {
      if (!auth.access.isAdmin) {
        return new Response(JSON.stringify({ error: "Only an administrator can provision manager accounts." }), { status: 403, headers: HEADERS });
      }
      const result = await runProvisioning({ userId: auth.userId, fullName: auth.fullName });
      return new Response(JSON.stringify(result), { status: 200, headers: { ...HEADERS, "Cache-Control": "no-store" } });
    }

    // GET /api/staff/tasks
    if (method === "GET" && pathname === "/api/staff/tasks") {
      await initLedgerFromSupabase(true);
      const allTasks = Array.from(tasksStore.values());
      const showAll = url.searchParams.get("all") === "true" && (auth.isManagerOrAbove || auth.leadDepartments.size > 0 || auth.access.isCEO);

      // Managers see their own department's work (company-wide for CEO/admin, GM, Operations);
      // everyone else sees the tasks assigned to them.
      const userTasks = showAll
        ? allTasks.filter((t) => canViewTask(auth, t) || isTaskAssignee(auth, t))
        : allTasks.filter((t) => {
            const matchesId = Boolean(
              t.assignedToId &&
              auth.userId &&
              (t.assignedToId === auth.userId || t.assignedToId.toLowerCase() === auth.userId.toLowerCase())
            );
            const matchesEmail = Boolean(
              t.assignedToEmail &&
              auth.email &&
              t.assignedToEmail.toLowerCase() === auth.email.toLowerCase()
            );
            const matchesName = Boolean(
              t.assignedToName &&
              auth.fullName &&
              t.assignedToName.toLowerCase() === auth.fullName.toLowerCase() &&
              auth.fullName.toLowerCase() !== "staff member"
            );
            return matchesId || matchesEmail || matchesName;
          });

      userTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Check and update any newly overdue tasks
      const now = new Date();
      for (const t of userTasks) {
        if (t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed" && t.status !== "Blocked") {
          if (t.status !== "Changes Requested" && t.status !== "Submitted for Review") {
            createNotification(
              t.assignedToId,
              "Task Overdue Alert",
              `Task "${t.title}" is overdue (due: ${t.dueDate}). Please update status or report a blocker.`,
              "task_overdue",
              { taskId: t.id },
              t.assignedToEmail
            );
          }
        }
      }

      return new Response(JSON.stringify({ tasks: userTasks }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/tasks -> create new task (authorized assigners)
    if (method === "POST" && pathname === "/api/staff/tasks") {
      if (!assignableDepartmentKeys(auth).length) {
        return new Response(
          JSON.stringify({
            error: auth.access.isCEO
              ? "The CEO view is read-only; work is assigned by department managers."
              : "Only department managers, the General Manager and administrators can assign work.",
          }),
          { status: 403, headers: HEADERS },
        );
      }

      const body = await request.json();
      const {
        title,
        description,
        assignedToId,
        assignedToName,
        assignedToEmail,
        assignedToRole,
        department,
        clientId,
        clientName,
        projectName,
        priority = "High",
        dueDate = null,
        instructions = "",
        evidenceRequirement = "",
        evidenceRequired = "",
        taskType = "Client Work",
        attachments = [],
        status,
      } = body;

      if (!title?.trim()) {
        return new Response(JSON.stringify({ error: "Task title is required." }), { status: 400, headers: HEADERS });
      }
      // Every task belongs to the department doing the work, chosen explicitly
      // (never inferred from who assigned it).
      const dept = departmentExact(department);
      if (!dept) {
        return new Response(JSON.stringify({ error: "Choose the department responsible for this work." }), {
          status: 400,
          headers: HEADERS,
        });
      }
      const policy = assignPolicy(auth.org, auth, dept.key);
      if (!policy.allowed) {
        return new Response(JSON.stringify({ error: policy.reason }), { status: 403, headers: HEADERS });
      }
      // Every task has a responsible employee from the department doing the work.
      if (!assignedToId) {
        return new Response(JSON.stringify({ error: "Choose the employee responsible for this work." }), { status: 400, headers: HEADERS });
      }
      if (!policy.assignees.includes(assignedToId)) {
        return new Response(
          JSON.stringify({
            error:
              policy.via === "general-manager" && auth.org.leads.has(dept.key)
                ? policy.reason
                : `That person is not an employee of ${dept.name}. Assign it to someone in ${dept.name}, or ask the CEO or an administrator to add them to the department.`,
          }),
          { status: 403, headers: HEADERS },
        );
      }

      // If assignedToId is provided, look up employee in profiles to ensure exact ID, name, email & role
      let finalAssigneeId = assignedToId;
      let finalAssigneeName = assignedToName || "Unassigned";
      let finalAssigneeEmail = assignedToEmail || "";
      let finalAssigneeRole = assignedToRole || "Specialist";

      if (assignedToId) {
        const { data: assigneeProfile } = await (supabaseAdmin as any)
          .from("profiles")
          .select("id, full_name, email, job_title, department")
          .eq("id", assignedToId)
          .maybeSingle();

        if (assigneeProfile) {
          finalAssigneeId = assigneeProfile.id;
          finalAssigneeName = assigneeProfile.full_name || finalAssigneeName || assigneeProfile.email;
          finalAssigneeEmail = assigneeProfile.email || finalAssigneeEmail;
          finalAssigneeRole = assigneeProfile.job_title || finalAssigneeRole;
        }
      }

      const taskId = crypto.randomUUID();
      const resolvedStatus = status || (finalAssigneeId ? "In Progress" : "Not Started");
      const resolvedDesc = description?.trim() || evidenceRequired || instructions || `Deliverable: ${title.trim()}`;

      const newTask: StaffTask = {
        id: taskId,
        title: title.trim(),
        description: resolvedDesc,
        assignedToId: finalAssigneeId || "",
        assignedToName: finalAssigneeName,
        assignedToEmail: finalAssigneeEmail,
        assignedById: auth.userId,
        assignedByName: auth.fullName,
        assignedByRole: auth.jobTitle || "Department Manager",
        assignedByDepartment: auth.department || "Operations",
        department: dept.name,
        clientId: clientId || undefined,
        clientName: clientName || undefined,
        projectName: projectName || undefined,
        priority: priority as TaskPriority,
        status: resolvedStatus as TaskStatus,
        progress: resolvedStatus === "In Progress" ? 10 : 0,
        assignmentDate: new Date().toISOString(),
        dueDate: dueDate || null,
        instructions:
          typeof instructions === "string"
            ? instructions.trim()
            : typeof evidenceRequired === "string"
            ? evidenceRequired.trim()
            : undefined,
        attachments: (attachments || []).map((a: any) => ({
          name: a.name,
          url: a.url,
          size: a.size || 0,
          type: a.type || a.mimeType || "application/octet-stream",
        })),
        supportingLinks: [],
        progressNotes: [],
        evidenceRequirement:
          typeof evidenceRequirement === "string"
            ? evidenceRequirement.trim()
            : typeof evidenceRequired === "string"
            ? evidenceRequired.trim()
            : "Verification report",
        taskType: taskType,
        evidenceRequired:
          typeof evidenceRequired === "string"
            ? evidenceRequired.trim()
            : typeof evidenceRequirement === "string"
            ? evidenceRequirement.trim()
            : "Verification report",
        approvedDeadlineChangesCount: 0,
        estimatedHours: body.estimatedHours || 8,
        workingHoursLate: 0,
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      tasksStore.set(newTask.id, newTask);
      await logLedgerEntry("staff_task_upsert", newTask.id, { task: newTask });

      // Notify assignee if assigned to someone
      if (finalAssigneeId && finalAssigneeId !== auth.userId) {
        await createNotification(
          finalAssigneeId,
          "New Task Assigned",
          `${auth.fullName} (${auth.jobTitle || "Department Manager"}) assigned deliverable "${newTask.title}" to you${newTask.clientName && newTask.clientName !== "Internal Task" ? ` for client ${newTask.clientName}` : ""}.`,
          "task_assigned",
          { taskId: newTask.id },
          finalAssigneeEmail
        );
      }

      return new Response(JSON.stringify({ ok: true, task: newTask }), { status: 201, headers: HEADERS });
    }

    // PATCH /api/staff/tasks/:id -> update task
    if (method === "PATCH" && pathname.startsWith("/api/staff/tasks/")) {
      const taskId = pathname.replace("/api/staff/tasks/", "");
      let task = tasksStore.get(taskId);
      if (!task) {
        await initLedgerFromSupabase(true);
        task = tasksStore.get(taskId);
      }
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found." }), { status: 404, headers: HEADERS });
      }

      // Check permissions: assigned staff or authorized manager
      const isOwner =
        (task.assignedToId && auth.userId && (task.assignedToId === auth.userId || task.assignedToId.toLowerCase() === auth.userId.toLowerCase())) ||
        (task.assignedToEmail && auth.email && task.assignedToEmail.toLowerCase() === auth.email.toLowerCase()) ||
        (task.assignedToName && auth.fullName && task.assignedToName.toLowerCase() === auth.fullName.toLowerCase() && auth.fullName.toLowerCase() !== "staff member");

      const isReviewer = canReviewTask(auth, task, await profileDepartment(task.assignedToId));
      if (!isOwner && !isReviewer) {
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
        evidenceRequired,
        assignedToId,
        assignedToName,
        assignedToEmail,
        assignedToRole,
        taskType,
        clientId,
        clientName,
        attachments,
        qaReviewer,
        qaDecisionNotes,
        department: newDepartment,
      } = body;

      let changed = false;
      const previousDueDate = task.dueDate;

      // Department correction / reassignment
      if (newDepartment !== undefined && newDepartment !== task.department) {
        const target = departmentExact(newDepartment);
        if (!target) {
          return new Response(JSON.stringify({ error: "Choose a valid department." }), { status: 400, headers: HEADERS });
        }
        const fromKey = taskDeptKey(task.department);
        const targetPolicy = assignPolicy(auth.org, auth, target.key);
        const mayMove =
          targetPolicy.allowed &&
          (overseesAllDepartments(auth) || managesDepartment(auth.org, auth, fromKey));
        if (!mayMove) {
          return new Response(
            JSON.stringify({
              error: targetPolicy.allowed
                ? "Only the manager of this task's department, the General Manager or an administrator can move it."
                : targetPolicy.reason,
            }),
            { status: 403, headers: HEADERS },
          );
        }
        const responsible = assignedToId || task.assignedToId;
        if (!responsible || !targetPolicy.assignees.includes(responsible)) {
          return new Response(
            JSON.stringify({ error: `Also choose a responsible employee from ${target.name} when moving this task.` }),
            { status: 400, headers: HEADERS },
          );
        }
        const from = task.department || UNASSIGNED_DEPARTMENT;
        task.department = target.name;
        task.progressNotes = [
          ...(task.progressNotes || []),
          {
            id: `note-${Date.now()}`,
            authorId: auth.userId,
            authorName: auth.fullName,
            authorRole: auth.jobTitle,
            note: `Department changed from "${from}" to "${target.name}".`,
            createdAt: new Date().toISOString(),
          } as any,
        ];
        changed = true;
      }

      // Staff and Manager permissions: status
      if (status && status !== task.status) {
        let normalizedStatus: TaskStatus = status as TaskStatus;
        if (status === "Accepted Complete") normalizedStatus = "Completed";
        else if (status === "Rework Required") normalizedStatus = "Changes Requested";

        // Sign-off (Completed / Changes Requested) is a review decision: only an
        // authorised reviewer may make it, and never on their own work.
        if (normalizedStatus === "Completed" || normalizedStatus === "Changes Requested") {
          if (!isReviewer || (isOwner && !overseesAllDepartments(auth))) {
            return new Response(
              JSON.stringify({ error: "Only the reviewing manager can sign off or return this deliverable." }),
              { status: 403, headers: HEADERS },
            );
          }
          // Keep the latest pending evidence submission in step with the decision.
          const pending = Array.from(evidenceStore.values())
            .filter((e) => e.taskId === task.id && e.status === "Submitted for Review")
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
          if (pending) {
            pending.status = normalizedStatus === "Completed" ? "Approved" : "Changes Requested";
            pending.reviewedById = auth.userId;
            pending.reviewedByName = auth.fullName;
            pending.reviewerFeedback = qaDecisionNotes || note || pending.reviewerFeedback || "";
            pending.reviewedAt = new Date().toISOString();
            pending.updatedAt = pending.reviewedAt;
            evidenceStore.set(pending.id, pending);
            await logLedgerEntry("staff_evidence_upsert", pending.id, { evidence: pending });
          }
        }

        task.status = normalizedStatus;
        changed = true;
        if (normalizedStatus === "Completed") {
          task.completionDate = new Date().toISOString();
          task.progress = 100;
        } else if (normalizedStatus === "In Progress" && task.progress === 0) {
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

      // Manager-permitted changes: Reassignment, Deadline, Priority, QA
      if (isReviewer) {
        // Reassignment: only to an employee of the task's department whom this caller may assign.
        if (assignedToId && assignedToId !== task.assignedToId) {
          const key = taskDeptKey(task.department);
          const pol = key ? assignPolicy(auth.org, auth, key) : null;
          if (!pol || !pol.allowed || !pol.assignees.includes(assignedToId)) {
            return new Response(
              JSON.stringify({
                error: !key
                  ? "Set this task's department before reassigning it."
                  : pol && !pol.allowed
                    ? pol.reason
                    : `That person is not an employee of ${task.department} whom you can assign.`,
              }),
              { status: 403, headers: HEADERS },
            );
          }
          let newName = assignedToName || task.assignedToName;
          let newEmail = assignedToEmail || task.assignedToEmail || "";
          let newRole = assignedToRole || task.assignedToRole || "Specialist";

          const { data: assigneeProfile } = await (supabaseAdmin as any)
            .from("profiles")
            .select("id, full_name, email, job_title")
            .eq("id", assignedToId)
            .maybeSingle();

          if (assigneeProfile) {
            newName = assigneeProfile.full_name || newName;
            newEmail = assigneeProfile.email || newEmail;
            newRole = assigneeProfile.job_title || newRole;
          }

          task.assignedToId = assignedToId;
          task.assignedToName = newName;
          task.assignedToEmail = newEmail;
          task.assignedToRole = newRole;
          if (task.status === "Not Started") {
            task.status = "In Progress";
          }
          changed = true;

          // Notify the new assignee
          if (assignedToId !== auth.userId) {
            await createNotification(
              assignedToId,
              "Deliverable Assigned to You",
              `${auth.fullName} (${auth.jobTitle || "Department Manager"}) reassigned deliverable "${task.title}" to you${task.clientName && task.clientName !== "Internal Task" ? ` for client ${task.clientName}` : ""}.`,
              "task_assigned",
              { taskId: task.id },
              newEmail
            );
          }
        }

        if (dueDate !== undefined && dueDate !== previousDueDate) {
          task.dueDate = dueDate || null;
          task.approvedDeadlineChangesCount = (task.approvedDeadlineChangesCount || 0) + 1;
          changed = true;

          // Notify assignee of deadline change
          if (task.assignedToId && task.assignedToId !== auth.userId) {
            await createNotification(
              task.assignedToId,
              "Task Deadline Updated",
              `The deadline for "${task.title}" was updated to ${dueDate ? new Date(dueDate).toLocaleDateString() : "No due date set"}.`,
              "due_date_changed",
              { taskId: task.id },
              task.assignedToEmail
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

        if (evidenceRequirement !== undefined || evidenceRequired !== undefined) {
          task.evidenceRequirement = evidenceRequirement || evidenceRequired;
          task.evidenceRequired = evidenceRequired || evidenceRequirement;
          changed = true;
        }

        if (taskType !== undefined) {
          task.taskType = taskType;
          changed = true;
        }

        if (clientId !== undefined) {
          task.clientId = clientId || undefined;
          changed = true;
        }

        if (clientName !== undefined) {
          task.clientName = clientName || undefined;
          changed = true;
        }

        if (attachments !== undefined) {
          task.attachments = attachments;
          changed = true;
        }

        if (qaReviewer !== undefined) {
          task.qaReviewer = qaReviewer;
          changed = true;
        }

        if (qaDecisionNotes !== undefined) {
          task.qaDecisionNotes = qaDecisionNotes;
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

    // DELETE /api/staff/tasks/:id -> remove task (authorized managers or assigner)
    if (method === "DELETE" && pathname.startsWith("/api/staff/tasks/")) {
      const taskId = pathname.replace("/api/staff/tasks/", "").trim();
      const task = tasksStore.get(taskId);
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found." }), { status: 404, headers: HEADERS });
      }

      if (!managesDepartment(auth.org, auth, taskDeptKey(task.department))) {
        return new Response(JSON.stringify({ error: "Only the department's manager, the General Manager or an administrator can remove this task." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      tasksStore.delete(taskId);
      await logLedgerEntry("staff_task_delete", taskId, {
        taskId,
        deletedBy: auth.fullName,
        deletedById: auth.userId,
        deletedAt: new Date().toISOString(),
        taskTitle: task.title,
        assigneeId: task.assignedToId,
      });

      // Clean up linked notifications for this task
      for (const [notifId, notif] of notificationsStore.entries()) {
        if (notif.relatedTaskId === taskId) {
          notificationsStore.delete(notifId);
        }
      }

      return new Response(JSON.stringify({ ok: true, message: "Deliverable removed successfully." }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. DEPENDENCY REQUESTS (/api/staff/dependencies)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/dependencies
    if (method === "GET" && pathname === "/api/staff/dependencies") {
      const allDeps = Array.from(dependenciesStore.values());
      const showAll = url.searchParams.get("all") === "true" && (auth.isManagerOrAbove || auth.leadDepartments.size > 0 || auth.access.isCEO);

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
    // GET /api/staff/evidence[?taskId=] -> submissions the caller may see
    if (method === "GET" && pathname === "/api/staff/evidence") {
      const taskId = url.searchParams.get("taskId");
      let result = Array.from(evidenceStore.values());
      if (taskId) result = result.filter((e) => e.taskId === taskId);

      const visible: EvidenceSubmission[] = [];
      for (const e of result) {
        if (e.submittingStaffId === auth.userId) {
          visible.push(e);
          continue;
        }
        const task = tasksStore.get(e.taskId);
        if (task && canViewTask(auth, task, await profileDepartment(e.submittingStaffId))) visible.push(e);
      }
      visible.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return new Response(JSON.stringify({ evidence: visible }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/evidence/upload-url -> one-time upload slot in the private bucket
    if (method === "POST" && pathname === "/api/staff/evidence/upload-url") {
      const { taskId, fileName, mimeType, size } = await request.json();
      const task = taskId ? tasksStore.get(taskId) : null;
      if (!task) {
        return new Response(JSON.stringify({ error: "Valid task ID required." }), { status: 400, headers: HEADERS });
      }
      if (!isTaskAssignee(auth, task) && !canReviewTask(auth, task)) {
        return new Response(JSON.stringify({ error: "You can only upload evidence for your own tasks." }), {
          status: 403,
          headers: HEADERS,
        });
      }
      if (!ALLOWED_EVIDENCE_TYPES.has(String(mimeType || "").toLowerCase())) {
        return new Response(
          JSON.stringify({ error: `File type not allowed (${mimeType || "unknown"}). Use PDF, images, Word, Excel, PowerPoint, CSV, TXT, ZIP or MP4.` }),
          { status: 400, headers: HEADERS },
        );
      }
      if (!(Number(size) > 0) || Number(size) > MAX_EVIDENCE_BYTES) {
        return new Response(JSON.stringify({ error: "Files must be between 1 byte and 25 MB." }), { status: 400, headers: HEADERS });
      }
      const clean = String(fileName || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
      const path = `tasks/${task.id}/${auth.userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${clean}`;
      const { data, error } = await (supabaseAdmin as any).storage.from(EVIDENCE_BUCKET).createSignedUploadUrl(path);
      if (error || !data?.token) {
        console.error("[evidence] could not create upload slot:", error?.message);
        return new Response(JSON.stringify({ error: "File storage is unavailable. Please try again." }), {
          status: 502,
          headers: HEADERS,
        });
      }
      return new Response(JSON.stringify({ path, token: data.token, signedUrl: data.signedUrl }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // POST /api/staff/evidence -> submit evidence
    if (method === "POST" && pathname === "/api/staff/evidence") {
      const body = await request.json();
      const { taskId, deliverableLinks = [], uploadedFiles = [], writtenExplanation } = body;
      const status: EvidenceReviewStatus = body.status === "Draft" ? "Draft" : "Submitted for Review";

      const task = taskId ? tasksStore.get(taskId) : null;
      if (!task) {
        return new Response(JSON.stringify({ error: "Valid task ID required for evidence submission." }), {
          status: 400,
          headers: HEADERS,
        });
      }
      if (!isTaskAssignee(auth, task) && !canReviewTask(auth, task)) {
        return new Response(JSON.stringify({ error: "You can only submit evidence for tasks assigned to you." }), {
          status: 403,
          headers: HEADERS,
        });
      }

      // Every file must be a real upload in this task's storage folder.
      const files: EvidenceSubmission["uploadedFiles"] = [];
      for (const f of uploadedFiles as any[]) {
        const path = typeof f?.path === "string" ? f.path : "";
        if (!path.startsWith(`tasks/${task.id}/`) || path.includes("..")) {
          return new Response(
            JSON.stringify({ error: `"${f?.name || "A file"}" was not uploaded. Please attach it again.` }),
            { status: 400, headers: HEADERS },
          );
        }
        if (!(await evidenceFileExists(path))) {
          return new Response(
            JSON.stringify({ error: `"${f?.name || "A file"}" did not finish uploading. Please attach it again.` }),
            { status: 400, headers: HEADERS },
          );
        }
        files.push({ name: String(f.name || "file"), path, url: "", size: Number(f.size) || 0, mimeType: String(f.mimeType || "") });
      }

      if (!writtenExplanation?.trim() && deliverableLinks.length === 0 && files.length === 0) {
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
        uploadedFiles: files,
        writtenExplanation: writtenExplanation?.trim() || "",
        status,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      evidenceStore.set(newEvidence.id, newEvidence);
      await logLedgerEntry("staff_evidence_upsert", newEvidence.id, { evidence: newEvidence });

      if (status === "Submitted for Review") {
        task.status = "Submitted for Review";
        task.lastUpdatedAt = new Date().toISOString();
        tasksStore.set(task.id, task);
        await logLedgerEntry("staff_task_upsert", task.id, { task });

        // Notify whoever reviews this department's work (its manager, else the General Manager).
        const recipients = new Set<string>();
        for (const id of await departmentManagersFor(task.department)) recipients.add(id);
        recipients.delete(auth.userId);
        const fileNote = files.length ? ` (${files.length} file${files.length === 1 ? "" : "s"} attached)` : "";
        for (const managerId of recipients) {
          await createNotification(
            managerId,
            "Deliverable Ready for Review",
            `${auth.fullName} submitted evidence for "${task.title}"${fileNote}.`,
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

    // GET /api/staff/evidence/:id -> full submission with viewable files
    if (method === "GET" && /^\/api\/staff\/evidence\/[^/]+$/.test(pathname)) {
      const evId = decodeURIComponent(pathname.replace("/api/staff/evidence/", ""));
      let evidence = evidenceStore.get(evId);
      if (!evidence) {
        await initLedgerFromSupabase(true);
        evidence = evidenceStore.get(evId);
      }
      if (!evidence) {
        return new Response(JSON.stringify({ error: "Evidence submission not found." }), { status: 404, headers: HEADERS });
      }
      const task = tasksStore.get(evidence.taskId);
      const staffDept = await profileDepartment(evidence.submittingStaffId);
      const isSubmitter = evidence.submittingStaffId === auth.userId;
      const canReview = Boolean(task && canReviewTask(auth, task, staffDept)) && !isSubmitter;
      const canView = Boolean(task && canViewTask(auth, task, staffDept));
      if (!isSubmitter && !canReview && !canView && !(task && isTaskAssignee(auth, task))) {
        return new Response(JSON.stringify({ error: "You are not authorised to view this submission." }), {
          status: 403,
          headers: HEADERS,
        });
      }
      const history = Array.from(evidenceStore.values())
        .filter((e) => e.taskId === evidence!.taskId && e.id !== evidence!.id)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .map((e) => ({ ...e, uploadedFiles: e.uploadedFiles.map((f) => ({ ...f, url: "" })) }));
      // Older submissions were approved on the task (QA decision) before evidence
      // had its own review step: report them as approved, not still waiting.
      const reviewedOnTask =
        evidence.status === "Submitted for Review" && task?.status === "Completed" && (task as any)?.qaDecisionNotes;
      const shown = reviewedOnTask
        ? {
            ...evidence,
            status: "Approved" as EvidenceReviewStatus,
            reviewedByName: evidence.reviewedByName || (task as any).qaReviewer || task!.assignedByName,
            reviewerFeedback: evidence.reviewerFeedback || (task as any).qaDecisionNotes,
          }
        : evidence;
      const detail = {
        ...shown,
        uploadedFiles: await signEvidenceFiles(evidence.uploadedFiles),
        submittingStaffDepartment: staffDept,
        taskDepartment: task?.department ?? null,
        taskStatus: task?.status ?? null,
        canReview: canReview && shown.status === "Submitted for Review",
        history,
      };
      return new Response(JSON.stringify({ evidence: detail }), { status: 200, headers: HEADERS });
    }

    // PATCH /api/staff/evidence/:id -> review decision
    if (method === "PATCH" && pathname.startsWith("/api/staff/evidence/")) {
      const evId = decodeURIComponent(pathname.replace("/api/staff/evidence/", ""));
      const evidence = evidenceStore.get(evId);
      if (!evidence) {
        return new Response(JSON.stringify({ error: "Evidence submission not found." }), {
          status: 404,
          headers: HEADERS,
        });
      }

      const body = await request.json();
      const status = String(body.status || "") as EvidenceReviewStatus;
      const reviewerFeedback = String(body.reviewerFeedback || "").trim();
      const task = tasksStore.get(evidence.taskId);

      if (!["Approved", "Changes Requested", "Rejected"].includes(status)) {
        return new Response(JSON.stringify({ error: "Decision must be Approved, Changes Requested or Rejected." }), {
          status: 400,
          headers: HEADERS,
        });
      }
      if (evidence.submittingStaffId === auth.userId) {
        return new Response(JSON.stringify({ error: "You cannot review your own submission." }), { status: 403, headers: HEADERS });
      }
      if (!task || !canReviewTask(auth, task, await profileDepartment(evidence.submittingStaffId))) {
        return new Response(JSON.stringify({ error: "You are not authorised to review this submission." }), {
          status: 403,
          headers: HEADERS,
        });
      }
      if (evidence.status !== "Submitted for Review") {
        return new Response(JSON.stringify({ error: `This submission was already reviewed (${evidence.status}).` }), {
          status: 409,
          headers: HEADERS,
        });
      }
      if (status !== "Approved" && !reviewerFeedback) {
        return new Response(JSON.stringify({ error: "Please explain what needs to change." }), { status: 400, headers: HEADERS });
      }

      evidence.status = status;
      evidence.reviewedById = auth.userId;
      evidence.reviewedByName = auth.fullName;
      evidence.reviewerFeedback = reviewerFeedback;
      evidence.reviewedAt = new Date().toISOString();
      evidence.updatedAt = evidence.reviewedAt;
      evidenceStore.set(evidence.id, evidence);
      await logLedgerEntry("staff_evidence_upsert", evidence.id, { evidence });

      if (status === "Approved") {
        task.status = "Completed";
        task.progress = 100;
        task.completionDate = new Date().toISOString();
      } else {
        task.status = "Changes Requested";
      }
      task.qaReviewer = auth.fullName;
      task.qaDecisionNotes = reviewerFeedback;
      task.lastUpdatedAt = new Date().toISOString();
      tasksStore.set(task.id, task);
      await logLedgerEntry("staff_task_upsert", task.id, { task });

      const titles: Record<string, string> = {
        Approved: "Deliverable Approved",
        "Changes Requested": "Corrections Requested on Deliverable",
        Rejected: "Deliverable Rejected",
      };
      const messages: Record<string, string> = {
        Approved: `${auth.fullName} approved your evidence for "${task.title}".${reviewerFeedback ? ` Comment: ${reviewerFeedback}` : ""}`,
        "Changes Requested": `${auth.fullName} requested corrections on "${task.title}": ${reviewerFeedback}`,
        Rejected: `${auth.fullName} rejected your submission for "${task.title}": ${reviewerFeedback}`,
      };
      await createNotification(
        evidence.submittingStaffId,
        titles[status],
        messages[status],
        "evidence_reviewed",
        { taskId: task.id, evidenceId: evidence.id }
      );

      return new Response(JSON.stringify({ ok: true, evidence, task }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. PERSONAL SCORECARD (/api/staff/scorecard)
    // ══════════════════════════════════════════════════════════════════════════

    if (method === "GET" && pathname === "/api/staff/scorecard") {
      const targetUserId = url.searchParams.get("userId") || auth.userId;

      // Ensure staff can only view their own scorecard
      if (!canViewEmployee(auth, targetUserId)) {
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

      // Group authentic user tasks by month for performance evaluation trends
      const trendsMap = new Map<string, { period: string; assigned: number; completed: number; onTime: number }>();
      for (const t of userTasks) {
        const dateVal = t.assignmentDate || t.createdAt;
        if (!dateVal) continue;
        const d = new Date(dateVal);
        const period = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        const entry = trendsMap.get(period) || { period, assigned: 0, completed: 0, onTime: 0 };
        entry.assigned += 1;
        if (t.status === "Completed") {
          entry.completed += 1;
          if (t.dueDate) {
            const due = new Date(t.dueDate).getTime();
            const finished = t.completionDate ? new Date(t.completionDate).getTime() : due;
            if (finished <= due + 86400000) {
              entry.onTime += 1;
            }
          }
        }
        trendsMap.set(period, entry);
      }
      const trends = Array.from(trendsMap.values());

      // Tracked hours from real attendance today
      let trackedHoursToday = 0;
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const { data: attLog } = await (supabaseAdmin as any)
          .from("audit_logs")
          .select("details")
          .eq("action", "attendance_record")
          .gte("created_at", `${todayStr}T00:00:00.000Z`)
          .order("created_at", { ascending: false });

        if (attLog && attLog.length > 0) {
          const userAtt = attLog.find((l: any) => l.details?.userId === targetUserId);
          if (userAtt?.details?.hoursWorked) {
            const match = userAtt.details.hoursWorked.match(/(\d+)h\s*(\d+)m/);
            if (match) {
              trackedHoursToday = Math.round((parseInt(match[1], 10) + parseInt(match[2], 10) / 60) * 10) / 10;
            }
          }
        }
      } catch {}

      const complianceRate = totalAssigned > 0
        ? Math.max(0, Math.round(100 - (overdue.length / totalAssigned) * 100))
        : null;

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
        trackedHoursToday,
        complianceRate,
        trends,
      };

      return new Response(JSON.stringify({ scorecard }), { status: 200, headers: HEADERS });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. NOTIFICATIONS (/api/staff/notifications)
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/staff/notifications
    if (method === "GET" && pathname === "/api/staff/notifications") {
      await initLedgerFromSupabase(true);
      const all = Array.from(notificationsStore.values());
      const userNotifs = all.filter((n) => ownsNotification(n, auth));
      userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadCount = userNotifs.filter((n) => !n.read).length;
      return new Response(JSON.stringify({ notifications: userNotifs, unreadCount }), {
        status: 200,
        headers: HEADERS,
      });
    }

    // PATCH /api/staff/notifications/:id -> mark read/unread (own notifications only)
    if (method === "PATCH" && pathname.startsWith("/api/staff/notifications/")) {
      const notifId = decodeURIComponent(pathname.replace("/api/staff/notifications/", ""));
      // Always read the persisted state: a fresh server instance starts with an empty cache.
      await initLedgerFromSupabase(true);
      const notif = notificationsStore.get(notifId);
      if (!notif || !ownsNotification(notif, auth)) {
        return new Response(JSON.stringify({ error: "Notification not found." }), {
          status: 404,
          headers: HEADERS,
        });
      }

      const body = await request.json().catch(() => ({}));
      const read = body.read !== undefined ? Boolean(body.read) : true;
      if (notif.read !== read) {
        const updated: StaffNotification = { ...notif, read, readAt: read ? new Date().toISOString() : null };
        notificationsStore.set(updated.id, updated);
        await logLedgerEntry("staff_notif_upsert", updated.id, { notification: updated, op: read ? "read" : "unread", actorId: auth.userId });
        return new Response(JSON.stringify({ ok: true, notification: updated }), { status: 200, headers: HEADERS });
      }
      return new Response(JSON.stringify({ ok: true, notification: notif }), { status: 200, headers: HEADERS });
    }

    // POST /api/staff/notifications/read-all -> mark every unread notification of the caller as read
    if (method === "POST" && pathname === "/api/staff/notifications/read-all") {
      await initLedgerFromSupabase(true);
      const readAt = new Date().toISOString();
      const rows: any[] = [];
      for (const notif of notificationsStore.values()) {
        if (!notif.read && ownsNotification(notif, auth)) {
          const updated: StaffNotification = { ...notif, read: true, readAt };
          notificationsStore.set(updated.id, updated);
          rows.push(ledgerRow("staff_notif_upsert", updated.id, { notification: updated, op: "read", actorId: auth.userId }));
        }
      }
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await (supabaseAdmin as any).from("audit_logs").insert(rows.slice(i, i + 200));
        if (error) {
          console.error("[staff] mark-all-read failed:", error.message);
          return new Response(JSON.stringify({ error: "Could not save. Please try again." }), { status: 500, headers: HEADERS });
        }
      }
      return new Response(JSON.stringify({ ok: true, updated: rows.length }), { status: 200, headers: HEADERS });
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
