/**
 * Monthly reports API (server only).
 *
 * The existing monthly_reports table holds two kinds of report:
 *  - client reports (client_id set, department_key empty): readable by all staff, as before;
 *  - department monthly reports (department_key set): written by a department for a month.
 *
 * Department reports:
 *  - created by the department's manager or its employees (one report per department per month);
 *  - the person who prepares it is the responsible person; it stays editable while a draft;
 *  - the department's manager (and administrators) can edit, submit, return to draft or delete drafts;
 *  - visible to that department, the CEO, the General Manager and administrators only;
 *  - on submission the department's manager, the CEO and the General Manager are notified.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import { ledDepartments, memberDepartments, type OrgStructure } from "@/lib/org-structure.server";
import type { AccessFlags } from "@/lib/roles";
import { cleanAttachments, createUploadSlot, discardUpload, json, removeFiles, signFiles } from "@/lib/department-records.server";
import { REPORT_SECTIONS } from "@/lib/monthly-reports";

type Actor = { userId: string; fullName: string; access: AccessFlags; org: OrgStructure; leadDepartments: Set<string> };
type Notify = (userId: string, title: string, message: string) => Promise<void>;
type Recipients = (departmentKey: string) => Promise<{ managers: string[]; executives: string[] }>;

const db = () => supabaseAdmin as any;
const ROOT = "reports";
const deptName = (k: string) => DEPARTMENTS.find((d) => d.key === k)?.name ?? k;
const isDept = (k: string) => DEPARTMENTS.some((d) => d.key === k);

function rights(actor: Actor, dept: string) {
  const manages = actor.access.isAdmin || actor.leadDepartments.has(dept);
  const member = memberDepartments(actor.org, actor.userId).includes(dept);
  const oversees = actor.access.isCEO || actor.access.isGM || actor.access.isAdmin;
  return { manages, member, oversees, view: manages || member || oversees, write: manages || member };
}

/** Departments this person may write a monthly report for. */
function writableDepartments(actor: Actor): string[] {
  if (actor.access.isAdmin) return DEPARTMENTS.map((d) => d.key);
  return Array.from(new Set([...ledDepartments(actor.org, actor.userId), ...memberDepartments(actor.org, actor.userId)])).filter(isDept);
}

function view(actor: Actor, row: any) {
  const r = row.department_key ? rights(actor, row.department_key) : null;
  const own = row.prepared_by_id === actor.userId || row.created_by === actor.userId;
  return {
    ...row,
    department_name: row.department_key ? deptName(row.department_key) : null,
    prepared_by_name: row.prepared_by_id ? actor.org.people.get(row.prepared_by_id)?.name ?? row.prepared_by_name : row.prepared_by_name,
    can_edit: Boolean(r && (r.manages || (own && row.status === "draft"))),
    can_manage: Boolean(r?.manages),
  };
}

/** "2026-10" or "2026-10-01" -> "2026-10-01"; null when invalid or in the future. */
function monthStart(v: any): string | null {
  const m = String(v || "").match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12 || y < 2020) return null;
  const now = new Date();
  if (y > now.getFullYear() || (y === now.getFullYear() && mo > now.getMonth() + 1)) return null;
  return `${m[1]}-${m[2]}-01`;
}

function cleanData(body: any, requireSummary: boolean): { ok: true; data: Record<string, string> } | { ok: false; error: string } {
  const data: Record<string, string> = {};
  for (const s of REPORT_SECTIONS) {
    const v = String(body?.[s.key] ?? "").trim().slice(0, 8000);
    if (v) data[s.key] = v;
  }
  if (requireSummary && !data.summary) return { ok: false, error: "Write the summary before submitting." };
  return { ok: true, data };
}

export async function handleReportsApi(
  request: Request,
  url: URL,
  actor: Actor,
  notify: Notify,
  recipients: Recipients,
): Promise<Response | null> {
  const { pathname } = url;
  const method = request.method;
  if (!pathname.startsWith("/api/staff/reports")) return null;

  // GET /api/staff/reports -> reports the caller may see, and what they may create
  if (method === "GET" && pathname === "/api/staff/reports") {
    const { data, error } = await db().from("monthly_reports").select("*").order("reporting_month", { ascending: false }).order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    const visible = (data || []).filter((row: any) => !row.department_key || rights(actor, row.department_key).view);
    const oversees = actor.access.isCEO || actor.access.isGM || actor.access.isAdmin;
    return json({
      reports: visible.map((row: any) => view(actor, row)),
      writable: writableDepartments(actor).map((key) => ({ key, name: deptName(key), manages: rights(actor, key).manages })),
      oversees,
      departments: oversees ? DEPARTMENTS.map((d) => ({ key: d.key, name: d.name })) : null,
    });
  }

  // POST /api/staff/reports/upload-url -> one-time upload slot for a report attachment
  if (method === "POST" && pathname === "/api/staff/reports/upload-url") {
    const body = await request.json().catch(() => ({}));
    const dept = String(body.departmentKey || "");
    if (!isDept(dept) || !rights(actor, dept).write) return json({ error: "You cannot add files to this department's reports." }, 403);
    return createUploadSlot(ROOT, dept, actor.userId, body);
  }
  if (method === "POST" && pathname === "/api/staff/reports/discard-upload") {
    const body = await request.json().catch(() => ({}));
    return discardUpload(ROOT, "monthly_reports", actor.userId, body);
  }

  // POST /api/staff/reports -> create a department report (draft, or submitted straight away)
  if (method === "POST" && pathname === "/api/staff/reports") {
    const body = await request.json().catch(() => ({}));
    const dept = String(body.departmentKey || "");
    if (!isDept(dept)) return json({ error: "Choose the department." }, 400);
    if (!rights(actor, dept).write) return json({ error: `Only ${deptName(dept)} can write its monthly report.` }, 403);
    const month = monthStart(body.reportingMonth);
    if (!month) return json({ error: "Choose a valid reporting month (not in the future)." }, 400);
    const submit = Boolean(body.submit);
    const c = cleanData(body.data, submit);
    if (!c.ok) return json({ error: c.error }, 400);
    const { data: dup } = await db()
      .from("monthly_reports")
      .select("id, status, prepared_by_name")
      .eq("department_key", dept)
      .eq("report_type", "department_monthly")
      .eq("reporting_month", month)
      .limit(1);
    if (dup?.length)
      return json({ error: `${deptName(dept)} already has a report for this month (prepared by ${dup[0].prepared_by_name || "a colleague"}). Open it instead.`, existingId: dup[0].id }, 409);
    let attachments: any[] = [];
    if (Array.isArray(body.attachments) && body.attachments.length) {
      const a = await cleanAttachments(body.attachments, dept, actor, [], ROOT);
      if (!a.ok) return json({ error: a.error }, 400);
      attachments = a.files;
    }
    const now = new Date().toISOString();
    const label = new Date(`${month}T00:00:00Z`).toLocaleDateString("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" });
    const title = String(body.title || "").trim().slice(0, 200) || `${deptName(dept)} — Monthly Report (${label})`;
    const status = submit ? "submitted" : "draft";
    const { data, error } = await db()
      .from("monthly_reports")
      .insert({
        client_id: null,
        department_key: dept,
        report_type: "department_monthly",
        title,
        reporting_month: month,
        prepared_by_id: actor.userId,
        prepared_by_name: actor.fullName,
        status,
        submitted_at: submit ? now : null,
        data: c.data,
        attachments,
        status_history: [{ status, at: now, by: actor.fullName }],
        created_by: actor.userId,
        created_at: now,
        updated_at: now,
      })
      .select()
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (submit) await announce(data, actor, notify, recipients);
    return json({ report: view(actor, data) }, 201);
  }

  const fm = pathname.match(/^\/api\/staff\/reports\/([^/]+)\/files$/);
  if (method === "GET" && fm) {
    const { data: row } = await db().from("monthly_reports").select("*").eq("id", decodeURIComponent(fm[1])).maybeSingle();
    if (!row) return json({ error: "Report not found." }, 404);
    if (row.department_key && !rights(actor, row.department_key).view) return json({ error: "You do not have access to this report." }, 403);
    return json({ files: await signFiles(row.attachments || []) });
  }

  const m = pathname.match(/^\/api\/staff\/reports\/([^/]+)$/);
  if (m && (method === "PATCH" || method === "DELETE")) {
    const { data: row } = await db().from("monthly_reports").select("*").eq("id", decodeURIComponent(m[1])).maybeSingle();
    if (!row) return json({ error: "Report not found." }, 404);
    if (!row.department_key) return json({ error: "Client reports cannot be changed here." }, 403);
    const r = rights(actor, row.department_key);
    const own = row.prepared_by_id === actor.userId || row.created_by === actor.userId;
    if (method === "DELETE") {
      if (row.status !== "draft" && !actor.access.isAdmin) return json({ error: "Submitted reports are kept. Return it to draft first." }, 409);
      if (!r.manages && !own) return json({ error: "Only the department's manager or the person preparing it can delete a draft." }, 403);
      await db().from("monthly_reports").delete().eq("id", row.id);
      await removeFiles((row.attachments || []).map((f: any) => f.path));
      return json({ ok: true });
    }
    const body = await request.json().catch(() => ({}));
    const before = { status: row.status, prepared_by_id: row.prepared_by_id, title: row.title };
    const reopen = body.action === "reopen";
    const submit = body.action === "submit";
    if (reopen) {
      if (!r.manages) return json({ error: "Only the department's manager can return a report to draft." }, 403);
    } else if (!r.manages && !(own && row.status === "draft")) {
      return json({ error: row.status === "draft" ? "Only the person preparing it or the department's manager can edit this report." : "This report has been submitted. Ask the department's manager to return it to draft." }, 403);
    }
    const patch: Record<string, any> = {};
    if (body.data !== undefined) {
      const c = cleanData(body.data, false);
      if (!c.ok) return json({ error: c.error }, 400);
      patch.data = c.data;
    }
    if (body.title !== undefined) {
      const t = String(body.title || "").trim().slice(0, 200);
      if (!t) return json({ error: "Give the report a title." }, 400);
      patch.title = t;
    }
    if (body.reportingMonth !== undefined) {
      const month = monthStart(body.reportingMonth);
      if (!month) return json({ error: "Choose a valid reporting month (not in the future)." }, 400);
      if (month !== row.reporting_month) {
        const { data: dup } = await db().from("monthly_reports").select("id").eq("department_key", row.department_key).eq("report_type", "department_monthly").eq("reporting_month", month).neq("id", row.id).limit(1);
        if (dup?.length) return json({ error: `${deptName(row.department_key)} already has a report for that month.` }, 409);
      }
      patch.reporting_month = month;
    }
    let removed: string[] = [];
    if (body.attachments !== undefined) {
      const a = await cleanAttachments(body.attachments, row.department_key, actor, row.attachments || [], ROOT);
      if (!a.ok) return json({ error: a.error }, 400);
      const keep = new Set(a.files.map((f: any) => f.path));
      removed = (row.attachments || []).map((f: any) => f.path).filter((p: string) => !keep.has(p));
      patch.attachments = a.files;
    }
    const now = new Date().toISOString();
    if (submit) {
      const summary = (patch.data ?? row.data ?? {}).summary;
      if (!summary) return json({ error: "Write the summary before submitting." }, 400);
      patch.status = "submitted";
      patch.submitted_at = now;
    } else if (reopen) {
      patch.status = "draft";
      patch.submitted_at = null;
    }
    if (patch.status) patch.status_history = [...(row.status_history || []), { status: patch.status, at: now, by: actor.fullName }];
    const { data, error } = await db().from("monthly_reports").update({ ...patch, updated_at: now }).eq("id", row.id).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    await removeFiles(removed);
    if (submit && before.status !== "submitted") await announce(data, actor, notify, recipients);
    if (reopen && before.status !== "draft" && before.prepared_by_id && before.prepared_by_id !== actor.userId)
      await notify(before.prepared_by_id, "Monthly report returned to draft", `${actor.fullName} returned "${before.title}" to draft for changes.`);
    return json({ report: view(actor, data) });
  }

  return json({ error: "Not found." }, 404);
}

async function announce(row: any, actor: Actor, notify: Notify, recipients: Recipients) {
  const { managers, executives } = await recipients(row.department_key);
  const to = new Set([...managers, ...executives]);
  to.delete(actor.userId);
  const month = new Date(`${row.reporting_month}T00:00:00Z`).toLocaleDateString("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" });
  for (const uid of to)
    await notify(uid, `${deptName(row.department_key)} monthly report submitted`, `${actor.fullName} submitted the ${deptName(row.department_key)} report for ${month}: "${row.title}".`);
}
