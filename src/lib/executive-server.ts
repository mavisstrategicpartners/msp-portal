/**
 * /api/executive — company-wide oversight for the CEO.
 *
 * Read access: the explicitly granted CEO and system administrators
 * (AccessFlags.canViewCompany). Every figure comes from the live records the
 * rest of the portal already uses: the staff task / evidence ledger, attendance
 * clock events, leave requests, clients and onboarding, the sales ledger and
 * the finance tables. Nothing is estimated or invented: when a module has no
 * records yet the response says so.
 *
 * The only writes are executive follow-up requests. Viewing never approves,
 * rejects or edits departmental work.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest, jsonError, type ApiUser } from "@/lib/api-auth.server";
import { computeAccess } from "@/lib/roles";
import type {
  DepartmentKey,
  DepartmentScorecard,
  ExecClient,
  ExecEvidence,
  ExecPerson,
  ExecTask,
  ExecutiveOverview,
  FeedItem,
  FollowUp,
} from "@/lib/executive.types";

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const db = () => supabaseAdmin as any;

// ── Departments ───────────────────────────────────────────────────────────────
// Service departments the CEO tracks. A task belongs to a department by its
// department field; a person by keywords in their job title / department.
export const EXEC_DEPARTMENTS: { key: DepartmentKey; name: string; match: string[] }[] = [
  { key: "sales", name: "Sales", match: ["sales", "business development"] },
  { key: "hr", name: "Human Resources", match: ["human resources", "hr", "people & culture"] },
  { key: "finance", name: "Finance & Administration", match: ["finance", "accounting", "accountant", "billing"] },
  { key: "operations", name: "Operations & Client Relationships", match: ["operations", "relationship"] },
  { key: "media-buying", name: "Media Buying", match: ["media buying", "paid media", "paid ads"] },
  { key: "seo", name: "SEO", match: ["seo"] },
  { key: "creative", name: "Creative", match: ["creative", "graphic", "design", "social media", "content"] },
  { key: "strategy", name: "Strategy", match: ["strategy", "strategist"] },
  { key: "onboarding", name: "Onboarding", match: ["onboarding"] },
  { key: "websites-software", name: "Websites & Software", match: ["websites & software", "website", "web development", "software", "developer"] },
  { key: "crm-ai", name: "CRM & AI Automation", match: ["crm", "automation"] },
  { key: "reporting", name: "Reporting", match: ["reporting"] },
  { key: "client-success", name: "Client Success", match: ["client success", "account manager"] },
  { key: "academy", name: "MSP Academy", match: ["academy"] },
];

const norm = (v?: string | null) => (v || "").trim().toLowerCase();

function keywordHit(text: string, kw: string) {
  if (!text) return false;
  if (kw.length <= 3) return new RegExp(`(^|[^a-z])${kw.replace(/[^a-z]/g, "")}([^a-z]|$)`).test(text);
  return text.includes(kw);
}

export function departmentKeyFor(value?: string | null): DepartmentKey | null {
  const t = norm(value);
  if (!t) return null;
  for (const d of EXEC_DEPARTMENTS) if (d.match.some((kw) => keywordHit(t, kw))) return d.key;
  return null;
}

function slug(v: string) {
  return norm(v).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general";
}

/** Department key for a task: known service department, or its own name. */
function taskDepartmentKey(dept?: string | null): DepartmentKey {
  return departmentKeyFor(dept) ?? slug(dept || "General");
}

function departmentsForPerson(title: string, orgDept: string): DepartmentKey[] {
  const out = new Set<DepartmentKey>();
  const t = norm(title);
  const d = norm(orgDept);
  for (const dep of EXEC_DEPARTMENTS) {
    if (dep.match.some((kw) => keywordHit(t, kw))) out.add(dep.key);
  }
  // Fall back to the profile department only when the title names none
  // (e.g. "Marketing Team" covers several teams, so it is never used).
  if (!out.size) {
    for (const dep of EXEC_DEPARTMENTS) {
      if (dep.match.some((kw) => keywordHit(d, kw))) out.add(dep.key);
    }
  }
  return [...out];
}

const LEAD_WORDS = /\b(manager|lead|head|director|supervisor)\b/;

// ── Time helpers (Africa/Johannesburg) ────────────────────────────────────────
function jhbDate(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
function jhbStartOfDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000+02:00`);
}
function jhbHour(d: Date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Johannesburg", hour: "2-digit", hour12: false }).format(d),
  );
}
function jhbWeekday(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Johannesburg", weekday: "short" }).format(d);
}
function fmtTime(ms?: number | null) {
  if (!ms) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}
const DAY = 86_400_000;

// ── Ledger loading ────────────────────────────────────────────────────────────
async function loadLedger(prefix: string) {
  const out: any[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await db()
      .from("audit_logs")
      .select("action, actor_id, target_id, details, created_at")
      .like("action", `${prefix}%`)
      .order("created_at", { ascending: true })
      .range(from, from + page - 1);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if (!data || data.length < page) break;
  }
  return out;
}

function latestById<T>(rows: any[], action: string, key: string, deleteAction?: string): Map<string, T> {
  const m = new Map<string, T>();
  for (const r of rows) {
    const d = r.details || {};
    if (r.action === action && d[key]?.id) m.set(d[key].id, d[key]);
    else if (deleteAction && r.action === deleteAction) {
      const id = d.taskId || d.leadId || r.target_id || d.target_ref_id;
      if (id) m.delete(id);
    }
  }
  return m;
}

async function loadFollowUps(): Promise<Map<string, FollowUp>> {
  const rows = await loadLedger("executive_followup");
  return latestById<FollowUp>(rows, "executive_followup_upsert", "followUp");
}

async function notifyUser(userId: string, userEmail: string | undefined, title: string, message: string) {
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    userEmail,
    title,
    message,
    type: "executive_follow_up",
    read: false,
    createdAt: new Date().toISOString(),
  };
  await db()
    .from("audit_logs")
    .insert({ action: "staff_notif_upsert", target_id: userId, details: { notification, target_ref_id: notification.id } });
}

// ── Overview ──────────────────────────────────────────────────────────────────
async function buildOverview(): Promise<ExecutiveOverview> {
  const now = new Date();
  const today = jhbDate(now);
  const todayStart = jhbStartOfDay(today);
  const weekAgo = new Date(todayStart.getTime() - 6 * DAY);
  const monthStart = `${today.slice(0, 7)}-01`;
  const weekday = !["Sat", "Sun"].includes(jhbWeekday(now));

  const [
    profilesRes,
    rolesRes,
    staffRows,
    attendanceRes,
    leaveRes,
    clientsRes,
    onboardingRows,
    salesRows,
    teamRes,
    invoicesRes,
    expensesRes,
    budgetsRes,
    approvalsRes,
    followUps,
  ] = await Promise.all([
    db().from("profiles").select("*").order("full_name"),
    db().from("user_roles").select("user_id, role"),
    loadLedger("staff_"),
    db()
      .from("audit_logs")
      .select("actor_id, action, details, created_at")
      .like("action", "attendance_%")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: true })
      .limit(5000),
    db().from("leave_requests").select("*").order("created_at", { ascending: false }),
    db().from("clients").select("*").order("created_at", { ascending: false }),
    loadLedger("client_onboarding_upsert"),
    loadLedger("sales_"),
    db()
      .from("audit_logs")
      .select("action, created_at, details")
      .in("action", ["team_member_created", "team_member_deleted"])
      .gte("created_at", new Date(now.getTime() - 30 * DAY).toISOString()),
    db().from("finance_invoices").select("*"),
    db().from("finance_expenses").select("*"),
    db().from("finance_budgets").select("*"),
    db().from("finance_approvals").select("*"),
    loadFollowUps(),
  ]);

  const profiles: any[] = profilesRes.data || [];
  const rolesByUser = new Map<string, any[]>();
  for (const r of rolesRes.data || []) {
    const list = rolesByUser.get(r.user_id) || [];
    list.push(r);
    rolesByUser.set(r.user_id, list);
  }
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const nameOf = (id?: string | null, fallback = "Unknown") =>
    (id && profileById.get(id)?.full_name) || fallback;

  // Tasks & evidence from the staff ledger
  const tasksMap = latestById<any>(staffRows, "staff_task_upsert", "task", "staff_task_delete");
  const evidenceMap = latestById<any>(staffRows, "staff_evidence_upsert", "evidence");

  const latestEvidenceByTask = new Map<string, any>();
  for (const e of evidenceMap.values()) {
    const prev = latestEvidenceByTask.get(e.taskId);
    if (!prev || String(e.submittedAt) > String(prev.submittedAt)) latestEvidenceByTask.set(e.taskId, e);
  }

  const tasks: ExecTask[] = [...tasksMap.values()].map((t) => {
    const due = t.dueDate ? String(t.dueDate).slice(0, 10) : null;
    const done = t.status === "Completed";
    const ev = latestEvidenceByTask.get(t.id);
    return {
      id: t.id,
      title: t.title || "Untitled task",
      department: t.department || "General",
      departmentKey: taskDepartmentKey(t.department),
      status: t.status || "Not Started",
      priority: t.priority || "Medium",
      dueDate: due,
      overdue: Boolean(due && due < today && !done),
      assignedToId: t.assignedToId || "",
      assignedToName: t.assignedToName || nameOf(t.assignedToId, "Unassigned"),
      assignedByName: t.assignedByName || nameOf(t.assignedById, "—"),
      clientName: t.clientName || null,
      createdAt: t.createdAt || t.assignmentDate || "",
      completionDate: t.completionDate || null,
      latestEvidenceId: ev?.id ?? null,
      latestEvidenceStatus: ev?.status ?? null,
    };
  });
  tasks.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  const evidence: ExecEvidence[] = [...evidenceMap.values()]
    .filter((e) => e.status !== "Draft")
    .map((raw) => {
      const task = taskById.get(raw.taskId);
      const rawTask = tasksMap.get(raw.taskId);
      // Older submissions were approved on the task itself (QA decision) before
      // evidence had its own review step; show those as approved, not waiting.
      const reviewedOnTask =
        raw.status === "Submitted for Review" && rawTask?.status === "Completed" && rawTask?.qaDecisionNotes;
      const e = reviewedOnTask
        ? {
            ...raw,
            status: "Approved",
            reviewedByName: raw.reviewedByName || rawTask.qaReviewer || rawTask.assignedByName,
            reviewerFeedback: raw.reviewerFeedback || rawTask.qaDecisionNotes,
          }
        : raw;
      const waiting =
        e.status === "Submitted for Review" && e.submittedAt
          ? Math.round((now.getTime() - new Date(e.submittedAt).getTime()) / 3_600_000)
          : null;
      return {
        id: e.id,
        taskId: e.taskId,
        taskTitle: e.taskTitle || task?.title || "Task",
        departmentKey: task?.departmentKey ?? "general",
        department: task?.department ?? "General",
        status: e.status,
        submittedAt: e.submittedAt,
        submittedBy: e.submittingStaffName || nameOf(e.submittingStaffId),
        submittedById: e.submittingStaffId,
        reviewedBy: e.reviewedByName || (e.reviewedById ? nameOf(e.reviewedById) : null),
        reviewerFeedback: e.reviewerFeedback || null,
        fileCount: (e.uploadedFiles || []).length,
        linkCount: (e.deliverableLinks || []).length,
        hoursWaiting: waiting,
      };
    })
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));

  // Attendance (latest event of the day per person; days present in last 7)
  const latestToday = new Map<string, any>();
  const daysPresent = new Map<string, Set<string>>();
  const latestEver = new Map<string, any>();
  for (const log of attendanceRes.data || []) {
    if (!log.actor_id) continue;
    const created = new Date(log.created_at);
    const day = jhbDate(created);
    latestEver.set(log.actor_id, { ...log.details, created_at: log.created_at });
    if (log.action === "attendance_clocked_in") {
      const s = daysPresent.get(log.actor_id) || new Set<string>();
      s.add(day);
      daysPresent.set(log.actor_id, s);
    }
    if (created >= todayStart) latestToday.set(log.actor_id, { ...log.details, created_at: log.created_at });
  }

  const activeProfiles = profiles.filter((p) => p.is_active !== false);
  const people: ExecPerson[] = activeProfiles.map((p) => {
    const access = computeAccess(p, p.email, rolesByUser.get(p.id) || []);
    const live = latestToday.get(p.id);
    const state = live?.state as ExecPerson["attendanceToday"] | undefined;
    const mine = tasks.filter((t) => t.assignedToId === p.id);
    return {
      id: p.id,
      name: p.full_name || p.email,
      email: p.email,
      title: p.job_title || "",
      orgDepartment: p.department || "Unassigned",
      departments: departmentsForPerson(p.job_title || "", p.department || ""),
      roleLabel: access.systemRole.replace(/_/g, " "),
      tier: p.role_tier || "staff",
      active: p.is_active !== false,
      lastLoginAt: p.last_login_at || null,
      attendanceToday: state || "No clock-in",
      clockInToday: live?.clock_in_time ? fmtTime(live.clock_in_time) : null,
      clockOutToday: live?.clock_out_time ? fmtTime(live.clock_out_time) : null,
      hoursToday: live?.hours_worked || null,
      daysPresentLast7: daysPresent.get(p.id)?.size || 0,
      openTasks: mine.filter((t) => t.status !== "Completed").length,
      overdueTasks: mine.filter((t) => t.overdue).length,
      completedTasks: mine.filter((t) => t.status === "Completed").length,
    };
  });

  const missingClockOut: ExecutiveOverview["attendance"]["missingClockOut"] = [];
  for (const [uid, ev] of latestEver) {
    if (ev.state !== "Clocked Out" && ev.clock_in_time && jhbDate(new Date(ev.clock_in_time)) < today) {
      if (profileById.get(uid)?.is_active === false) continue;
      missingClockOut.push({ id: uid, name: nameOf(uid), since: jhbDate(new Date(ev.clock_in_time)) });
    }
  }

  const attendance = {
    workday: weekday,
    clockedIn: people.filter((p) => p.attendanceToday === "Clocked In").length,
    onBreak: people.filter((p) => p.attendanceToday === "On Break").length,
    clockedOut: people.filter((p) => p.attendanceToday === "Clocked Out").length,
    noClockIn: people.filter((p) => p.attendanceToday === "No clock-in").length,
    missingClockOut,
  };

  // Leave
  const leaveRows: any[] = leaveRes.data || [];
  const leave = {
    pending: leaveRows
      .filter((l) => String(l.status) === "pending")
      .map((l) => ({
        id: l.id,
        name: nameOf(l.user_id),
        start: l.start_date,
        end: l.end_date,
        reason: l.reason ?? null,
        createdAt: l.created_at,
      })),
    upcomingApproved: leaveRows
      .filter((l) => String(l.status) === "approved" && String(l.end_date) >= today)
      .map((l) => ({ id: l.id, name: nameOf(l.user_id), start: l.start_date, end: l.end_date })),
    total: leaveRows.length,
  };

  // Clients & onboarding
  const onboardingById = latestById<any>(onboardingRows, "client_onboarding_upsert", "onboarding");
  const clientRows: any[] = clientsRes.data || [];
  const clients: ExecClient[] = clientRows.map((c) => {
    const ob = onboardingById.get(c.id) || [...onboardingById.values()].find((o) => norm(o.name) === norm(c.name));
    let onboarding: ExecClient["onboarding"] = null;
    if (ob) {
      const steps: any[] = ob.steps || [];
      const required = steps.filter((s) => s.required !== false);
      const completed = required.filter((s) => s.completed).length;
      const live = completed === required.length && required.length > 0;
      const target = ob.targetCompletionDate ? String(ob.targetCompletionDate).slice(0, 10) : null;
      const delayed = Boolean(target && target < today && !live);
      onboarding = {
        stage: ob.stage || (live ? "Live" : "In Progress"),
        completedSteps: completed,
        totalSteps: required.length,
        progress: required.length ? Math.round((completed / required.length) * 100) : 0,
        startDate: ob.onboardingStartDate || null,
        targetDate: target,
        delayed,
        daysOverdue: delayed && target ? Math.floor((todayStart.getTime() - jhbStartOfDay(target).getTime()) / DAY) : 0,
        blocker: ob.blocker || null,
        escalation: ob.escalationStatus && ob.escalationStatus !== "Normal" ? ob.escalationStatus : null,
        nextStep: required.find((s) => !s.completed)?.title || null,
      };
    }
    const ct = tasks.filter((t) => t.clientName && norm(t.clientName) === norm(c.name));
    const riskReasons: string[] = [];
    if (onboarding?.delayed) riskReasons.push(`Onboarding ${onboarding.daysOverdue} day(s) past target`);
    if (onboarding?.blocker) riskReasons.push(`Blocker: ${onboarding.blocker}`);
    if (onboarding?.escalation) riskReasons.push(`Escalation: ${onboarding.escalation}`);
    const overdue = ct.filter((t) => t.overdue).length;
    if (overdue) riskReasons.push(`${overdue} overdue task(s)`);
    return {
      id: c.id,
      name: c.name,
      industry: c.industry ?? null,
      package: c.active_package ?? null,
      createdAt: c.created_at ?? null,
      accountManager: c.account_manager_id ? nameOf(c.account_manager_id) : ob?.accountManagerName || null,
      onboarding,
      openTasks: ct.filter((t) => t.status !== "Completed").length,
      overdueTasks: overdue,
      atRisk: riskReasons.length > 0,
      riskReasons,
    };
  });

  // Sales (portal sales ledger only — no sample pipeline)
  const leads = [...latestById<any>(salesRows, "sales_lead_upsert", "lead", "sales_lead_delete").values()];
  const stageMap = new Map<string, { count: number; value: number }>();
  for (const l of leads) {
    const s = stageMap.get(l.stage) || { count: 0, value: 0 };
    s.count++;
    s.value += Number(l.estimatedValue) || 0;
    stageMap.set(l.stage, s);
  }
  const wonThisMonth = leads.filter(
    (l) => l.stage === "Won" && String(l.wonAt || l.updatedAt || l.createdAt || "").slice(0, 10) >= monthStart,
  );
  const sales = {
    recorded: leads.length > 0,
    leads: leads.length,
    byStage: [...stageMap.entries()].map(([stage, v]) => ({ stage, ...v })),
    openPipelineValue: leads
      .filter((l) => !["Won", "Lost"].includes(l.stage))
      .reduce((a, l) => a + (Number(l.estimatedValue) || 0), 0),
    wonThisMonth: wonThisMonth.length,
    wonValueThisMonth: wonThisMonth.reduce((a, l) => a + (Number(l.estimatedValue) || 0), 0),
    lost: leads.filter((l) => l.stage === "Lost").length,
  };

  // Finance (agency money only; client ad spend is not MSP money)
  const invoices: any[] = invoicesRes.data || [];
  const expenses: any[] = expensesRes.data || [];
  const budgets: any[] = budgetsRes.data || [];
  const approvals: any[] = approvalsRes.data || [];
  const fee = (i: any) => Number(i.monthlyServiceFeeZar) || 0;
  const isPaid = (i: any) => /paid/i.test(String(i.paymentStatus || ""));
  const isOverdue = (i: any) =>
    /overdue/i.test(String(i.paymentStatus || "")) ||
    (!isPaid(i) && i.dueDate && String(i.dueDate).slice(0, 10) < today);
  const collected = invoices.filter(isPaid).reduce((a, i) => a + fee(i), 0);
  const expensesPaid = expenses.filter((e) => e.status === "Paid").reduce((a, e) => a + (Number(e.amountZar) || 0), 0);
  const finance = {
    recorded: invoices.length + expenses.length + budgets.length + approvals.length > 0,
    invoicedAgencyFees: invoices.reduce((a, i) => a + fee(i), 0),
    collected,
    overdueAmount: invoices.filter(isOverdue).reduce((a, i) => a + fee(i), 0),
    overdueInvoices: invoices.filter(isOverdue).length,
    awaitingPayment: invoices.filter((i) => !isPaid(i)).length,
    expensesPaid,
    expensesPending: expenses
      .filter((e) => e.status !== "Paid")
      .reduce((a, e) => a + (Number(e.amountZar) || 0), 0),
    budgets: budgets.map((b) => ({ dept: b.dept, budget: Number(b.budget) || 0, actual: Number(b.actual) || 0 })),
    pendingApprovals: approvals
      .filter((a) => a.status === "Pending")
      .map((a) => ({
        id: a.id,
        title: a.title,
        department: a.department,
        amount: Number(a.amountZar) || 0,
        requestedBy: a.requestedBy,
        date: a.date,
      })),
    netPosition: invoices.length || expenses.length ? collected - expensesPaid : null,
  };

  // Department scorecards
  const known = new Map(EXEC_DEPARTMENTS.map((d) => [d.key, d.name]));
  for (const t of tasks) if (!known.has(t.departmentKey)) known.set(t.departmentKey, t.department);
  const departments: DepartmentScorecard[] = [...known.entries()].map(([key, name]) => {
    const dt = tasks.filter((t) => t.departmentKey === key);
    const de = evidence.filter((e) => e.departmentKey === key);
    const members = people.filter((p) => p.departments.includes(key) || dt.some((t) => t.assignedToId === p.id));
    const leads = people
      .filter((p) => p.departments.includes(key) && LEAD_WORDS.test(norm(p.title)))
      .map((p) => ({ id: p.id, name: p.name, title: p.title }));
    const completed = dt.filter((t) => t.status === "Completed");
    const withDue = completed.filter((t) => t.dueDate && t.completionDate);
    const onTime = withDue.filter((t) => jhbDate(new Date(t.completionDate!)) <= t.dueDate!).length;
    const reviewed = de.filter((e) => ["Approved", "Changes Requested", "Rejected"].includes(e.status));
    const card: DepartmentScorecard = {
      key,
      name,
      leads,
      members: members.length,
      tasksTotal: dt.length,
      tasksOpen: dt.filter((t) => t.status !== "Completed").length,
      tasksCompleted: completed.length,
      tasksOverdue: dt.filter((t) => t.overdue).length,
      tasksBlocked: dt.filter((t) => t.status === "Blocked").length,
      awaitingReview: de.filter((e) => e.status === "Submitted for Review").length,
      changesRequested: dt.filter((t) => t.status === "Changes Requested").length,
      completionRate: dt.length ? Math.round((completed.length / dt.length) * 100) : null,
      onTimeRate: withDue.length ? Math.round((onTime / withDue.length) * 100) : null,
      evidenceApprovalRate: reviewed.length
        ? Math.round((reviewed.filter((e) => e.status === "Approved").length / reviewed.length) * 100)
        : null,
      presentToday: members.filter((p) => p.attendanceToday === "Clocked In" || p.attendanceToday === "On Break").length,
      status: "no-activity",
      statusReasons: [],
    };
    const reasons: string[] = [];
    if (card.tasksOverdue) reasons.push(`${card.tasksOverdue} overdue task(s)`);
    if (card.tasksBlocked) reasons.push(`${card.tasksBlocked} blocked task(s)`);
    const staleReviews = de.filter((e) => e.status === "Submitted for Review" && (e.hoursWaiting ?? 0) >= 48).length;
    if (staleReviews) reasons.push(`${staleReviews} submission(s) waiting over 48h for review`);
    if (card.awaitingReview && !staleReviews) reasons.push(`${card.awaitingReview} submission(s) awaiting review`);
    if (!leads.length && (dt.length || members.length)) reasons.push("No department lead on record");
    card.statusReasons = reasons;
    card.status = !dt.length && !members.length
      ? "no-activity"
      : card.tasksOverdue || card.tasksBlocked || staleReviews
        ? "attention"
        : card.awaitingReview || (!leads.length && dt.length)
          ? "watch"
          : "on-track";
    return card;
  });
  const statusOrder = { attention: 0, watch: 1, "on-track": 2, "no-activity": 3 };
  departments.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || b.tasksTotal - a.tasksTotal);

  // Feed (events that need executive attention; repetitive items are grouped)
  const feed: FeedItem[] = [];
  const push = (f: FeedItem) => feed.push(f);
  for (const d of departments) {
    if (d.tasksOverdue)
      push({
        id: `overdue-${d.key}`,
        severity: "critical",
        category: "tasks",
        title: `${d.name}: ${d.tasksOverdue} overdue task${d.tasksOverdue > 1 ? "s" : ""}`,
        detail: tasks
          .filter((t) => t.departmentKey === d.key && t.overdue)
          .slice(0, 3)
          .map((t) => `${t.title} (${t.assignedToName}, due ${t.dueDate})`)
          .join(" · "),
        at: null,
        link: `/ceo/departments?dept=${encodeURIComponent(d.key)}`,
        departmentKey: d.key,
      });
  }
  for (const e of evidence.filter((x) => x.status === "Submitted for Review")) {
    push({
      id: `review-${e.id}`,
      severity: (e.hoursWaiting ?? 0) >= 48 ? "warning" : "info",
      category: "deliverables",
      title: `${e.submittedBy} submitted "${e.taskTitle}" for review`,
      detail: `${e.department} · waiting ${e.hoursWaiting ?? 0}h for the department manager`,
      at: e.submittedAt,
      link: `/ceo/delivery?evidence=${encodeURIComponent(e.id)}`,
      departmentKey: e.departmentKey,
    });
  }
  const recentRework = evidence.filter(
    (e) =>
      (e.status === "Changes Requested" || e.status === "Rejected") &&
      now.getTime() - new Date(e.submittedAt).getTime() < 7 * DAY,
  );
  if (recentRework.length)
    push({
      id: "rework-7d",
      severity: "warning",
      category: "deliverables",
      title: `${recentRework.length} deliverable${recentRework.length > 1 ? "s" : ""} sent back for rework this week`,
      detail: recentRework
        .slice(0, 3)
        .map((e) => `${e.taskTitle} (${e.status.toLowerCase()})`)
        .join(" · "),
      at: recentRework[0].submittedAt,
      link: "/ceo/delivery?filter=rework",
    });
  const troubled = clients.filter((x) => x.onboarding?.delayed || x.onboarding?.escalation || x.onboarding?.blocker);
  // Escalations always surface individually; plain delays are grouped when there are many.
  const individually = troubled.length > 3 ? troubled.filter((c) => c.onboarding?.escalation) : troubled;
  if (troubled.length > 3) {
    const delayed = troubled.filter((c) => !c.onboarding?.escalation);
    if (delayed.length)
      push({
        id: "clients-delayed",
        severity: "warning",
        category: "clients",
        title: `${delayed.length} client onboardings are past their target date`,
        detail: delayed
          .sort((a, b) => (b.onboarding?.daysOverdue ?? 0) - (a.onboarding?.daysOverdue ?? 0))
          .slice(0, 4)
          .map((c) => `${c.name} (${c.onboarding?.daysOverdue}d late, ${c.onboarding?.progress}% done)`)
          .join(" · "),
        at: null,
        link: "/ceo/clients?filter=at-risk",
      });
  }
  for (const c of individually) {
    push({
      id: `client-${c.id}`,
      severity: c.onboarding?.escalation ? "critical" : "warning",
      category: "clients",
      title: `${c.name}: onboarding ${c.onboarding?.delayed ? `${c.onboarding.daysOverdue} day(s) past target` : "needs attention"}`,
      detail: [c.onboarding?.escalation && `Escalation: ${c.onboarding.escalation}`, c.onboarding?.blocker && `Blocker: ${c.onboarding.blocker}`, c.onboarding?.nextStep && `Next step: ${c.onboarding.nextStep}`, `${c.onboarding?.progress ?? 0}% complete`]
        .filter(Boolean)
        .join(" · "),
      at: null,
      link: `/ceo/clients?client=${encodeURIComponent(c.id)}`,
    });
  }
  if (attendance.workday && jhbHour(now) >= 10 && attendance.noClockIn)
    push({
      id: "attendance-noclock",
      severity: "info",
      category: "attendance",
      title: `${attendance.noClockIn} active staff member${attendance.noClockIn > 1 ? "s have" : " has"} no clock-in today`,
      detail: "Includes leave and staff who do not use the clock. Check with HR before acting.",
      at: null,
      link: "/ceo/team?filter=no-clock-in",
    });
  if (missingClockOut.length)
    push({
      id: "attendance-open",
      severity: "warning",
      category: "attendance",
      title: `${missingClockOut.length} clock-in session${missingClockOut.length > 1 ? "s" : ""} never clocked out`,
      detail: missingClockOut
        .slice(0, 4)
        .map((m) => `${m.name} (since ${m.since})`)
        .join(" · "),
      at: null,
      link: "/ceo/team?filter=missing-clock-out",
    });
  if (leave.pending.length)
    push({
      id: "leave-pending",
      severity: "info",
      category: "leave",
      title: `${leave.pending.length} leave request${leave.pending.length > 1 ? "s" : ""} awaiting HR`,
      detail: leave.pending.slice(0, 3).map((l) => `${l.name} ${l.start}–${l.end}`).join(" · "),
      at: leave.pending[0].createdAt,
      link: "/ceo/team?tab=leave",
    });
  if (finance.overdueInvoices)
    push({
      id: "finance-overdue",
      severity: "critical",
      category: "finance",
      title: `${finance.overdueInvoices} overdue client invoice${finance.overdueInvoices > 1 ? "s" : ""}`,
      detail: `R${finance.overdueAmount.toLocaleString("en-ZA")} in agency fees outstanding`,
      at: null,
      link: "/ceo/revenue",
    });
  for (const a of finance.pendingApprovals)
    push({
      id: `approval-${a.id}`,
      severity: "warning",
      category: "finance",
      title: `Spend approval pending: ${a.title}`,
      detail: `${a.department} · R${a.amount.toLocaleString("en-ZA")} · requested by ${a.requestedBy}`,
      at: a.date,
      link: "/ceo/revenue",
    });
  for (const f of followUps.values()) {
    if (f.status === "Resolved") continue;
    const ageDays = Math.floor((now.getTime() - new Date(f.createdAt).getTime()) / DAY);
    if (f.status === "Open" && ageDays >= 2)
      push({
        id: `fu-${f.id}`,
        severity: "warning",
        category: "follow-ups",
        title: `Follow-up not yet acknowledged: ${f.subject}`,
        detail: `${f.assigneeName} · requested ${ageDays} day(s) ago`,
        at: f.createdAt,
        link: "/ceo?tab=follow-ups",
      });
  }
  const teamChanges = teamRes.data || [];
  const joined = teamChanges.filter((t: any) => t.action === "team_member_created");
  const left = teamChanges.filter((t: any) => t.action === "team_member_deleted");
  if (joined.length || left.length)
    push({
      id: "people-changes",
      severity: "info",
      category: "people",
      title: `Team changes in the last 30 days: ${joined.length} added, ${left.length} removed`,
      detail: joined
        .slice(-3)
        .map((t: any) => t.details?.email)
        .filter(Boolean)
        .join(" · "),
      at: teamChanges.length ? teamChanges[teamChanges.length - 1].created_at : null,
      link: "/ceo/team",
    });

  const sevOrder = { critical: 0, warning: 1, info: 2 };
  feed.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || String(b.at || "").localeCompare(String(a.at || "")));

  // Decisions / interventions: items someone must act on (not informational)
  const decisions = feed.filter(
    (f) =>
      f.category === "finance" ||
      f.category === "clients" ||
      f.category === "follow-ups" ||
      (f.category === "deliverables" && f.severity !== "info") ||
      f.id.startsWith("overdue-"),
  );

  // Business overview
  const activeClients = clients.length;
  const onboardingInProgress = clients.filter((c) => c.onboarding && c.onboarding.progress < 100).length;
  const onboardingDelayed = clients.filter((c) => c.onboarding?.delayed).length;
  const atRiskClients = clients.filter((c) => c.atRisk).length;
  const openTasks = tasks.filter((t) => t.status !== "Completed").length;
  const overdueTasks = tasks.filter((t) => t.overdue).length;
  const awaitingReview = evidence.filter((e) => e.status === "Submitted for Review").length;
  const statusReasons: string[] = [];
  if (overdueTasks) statusReasons.push(`${overdueTasks} overdue task(s)`);
  if (onboardingDelayed) statusReasons.push(`${onboardingDelayed} client onboarding(s) past target`);
  if (finance.overdueInvoices) statusReasons.push(`${finance.overdueInvoices} overdue invoice(s)`);
  if (awaitingReview) statusReasons.push(`${awaitingReview} deliverable(s) awaiting review`);
  const critical = feed.filter((f) => f.severity === "critical").length;
  const warning = feed.filter((f) => f.severity === "warning").length;

  return {
    generatedAt: now.toISOString(),
    today,
    business: {
      activeClients,
      clientsAddedLast30: clients.filter(
        (c) => c.createdAt && now.getTime() - new Date(c.createdAt).getTime() < 30 * DAY,
      ).length,
      onboardingInProgress,
      onboardingDelayed,
      atRiskClients,
      headcount: activeProfiles.length,
      joinersLast30: joined.length,
      openTasks,
      overdueTasks,
      awaitingReview,
      attentionCount: critical + warning,
      status: critical ? "attention" : warning ? "watch" : "on-track",
      statusReasons,
    },
    departments,
    people,
    attendance,
    leave,
    tasks,
    evidence,
    clients,
    sales,
    finance,
    followUps: [...followUps.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    feed,
    decisions,
  };
}

// ── Request handler ───────────────────────────────────────────────────────────
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

async function saveFollowUp(f: FollowUp, actor: ApiUser) {
  await db().from("audit_logs").insert({
    action: "executive_followup_upsert",
    actor_id: actor.userId,
    target_id: f.assigneeId,
    details: { followUp: f, target_ref_id: f.id },
  });
}

export async function handleExecutiveApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;
  if (method === "OPTIONS") return new Response(null, { status: 204 });

  const auth = await authenticateApiRequest(request);
  if (!auth) return jsonError(401, "Sign in required.", HEADERS);
  const canViewCompany = auth.access.canViewCompany;

  try {
    // GET /api/executive/overview — CEO / administrators only
    if (method === "GET" && pathname === "/api/executive/overview") {
      if (!canViewCompany) return jsonError(403, "Company-wide view is limited to the CEO.", HEADERS);
      return json(await buildOverview());
    }

    // GET /api/executive/followups — CEO/admin: all; anyone else: those assigned to them
    if (method === "GET" && pathname === "/api/executive/followups") {
      const all = [...(await loadFollowUps()).values()];
      const visible = canViewCompany ? all : all.filter((f) => f.assigneeId === auth.userId);
      visible.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json({ followUps: visible });
    }

    // POST /api/executive/followups — the CEO (or an administrator) requests a follow-up
    if (method === "POST" && pathname === "/api/executive/followups") {
      if (!canViewCompany) return jsonError(403, "Only the CEO can request executive follow-ups.", HEADERS);
      const body = await request.json().catch(() => ({}));
      const subject = String(body.subject || "").trim().slice(0, 160);
      const note = String(body.note || "").trim().slice(0, 2000);
      const assigneeId = String(body.assigneeId || "");
      if (!subject || !assigneeId) return json({ error: "A subject and a person to follow up are required." }, 400);
      const { data: assignee } = await db().from("profiles").select("*").eq("id", assigneeId).maybeSingle();
      if (!assignee || assignee.is_active === false) return json({ error: "That person is not an active employee." }, 400);
      const deptKey = body.departmentKey ? String(body.departmentKey) : null;
      const dept = EXEC_DEPARTMENTS.find((d) => d.key === deptKey);
      const priority = ["Normal", "High", "Urgent"].includes(body.priority) ? body.priority : "Normal";
      const nowIso = new Date().toISOString();
      const f: FollowUp = {
        id: `fu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        subject,
        note,
        priority,
        departmentKey: deptKey,
        departmentName: dept?.name ?? (deptKey ? String(body.departmentName || deptKey) : null),
        assigneeId,
        assigneeName: assignee.full_name || assignee.email,
        relatedTaskId: body.relatedTaskId ? String(body.relatedTaskId) : null,
        relatedClientId: body.relatedClientId ? String(body.relatedClientId) : null,
        status: "Open",
        response: null,
        createdById: auth.userId,
        createdByName: auth.fullName,
        createdAt: nowIso,
        updatedAt: nowIso,
        dueDate: body.dueDate ? String(body.dueDate).slice(0, 10) : null,
      };
      await saveFollowUp(f, auth);
      await notifyUser(
        assigneeId,
        assignee.email,
        `CEO follow-up (${priority}): ${subject}`,
        `${auth.fullName} asked you to follow up${f.departmentName ? ` for ${f.departmentName}` : ""}: ${note || subject}${f.dueDate ? ` · by ${f.dueDate}` : ""}`,
      );
      return json({ followUp: f }, 201);
    }

    // PATCH /api/executive/followups/:id — assignee acknowledges/resolves; CEO can resolve or reopen
    if (method === "PATCH" && pathname.startsWith("/api/executive/followups/")) {
      const id = decodeURIComponent(pathname.slice("/api/executive/followups/".length));
      const existing = (await loadFollowUps()).get(id);
      if (!existing) return json({ error: "Follow-up not found." }, 404);
      const isAssignee = existing.assigneeId === auth.userId;
      if (!isAssignee && !canViewCompany) return jsonError(403, "Not your follow-up.", HEADERS);
      const body = await request.json().catch(() => ({}));
      const status = String(body.status || "");
      if (!["Open", "Acknowledged", "Resolved"].includes(status)) return json({ error: "Invalid status." }, 400);
      if (status === "Open" && !canViewCompany) return jsonError(403, "Only the CEO can reopen a follow-up.", HEADERS);
      const updated: FollowUp = {
        ...existing,
        status: status as FollowUp["status"],
        response: body.response !== undefined ? String(body.response).slice(0, 2000) : existing.response,
        updatedAt: new Date().toISOString(),
      };
      await saveFollowUp(updated, auth);
      if (isAssignee && existing.createdById !== auth.userId) {
        const { data: ceo } = await db().from("profiles").select("email").eq("id", existing.createdById).maybeSingle();
        await notifyUser(
          existing.createdById,
          ceo?.email,
          `Follow-up ${status.toLowerCase()}: ${existing.subject}`,
          `${auth.fullName} marked your follow-up as ${status.toLowerCase()}${updated.response ? `: ${updated.response}` : "."}`,
        );
      }
      return json({ followUp: updated });
    }

    return json({ error: "Not found." }, 404);
  } catch (err: any) {
    console.error("[executive] request failed:", err?.message || err);
    return json({ error: "The executive overview could not be loaded. Please try again." }, 500);
  }
}
