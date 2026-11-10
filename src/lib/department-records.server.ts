/**
 * Department module records API (server only). Permissions follow the organisation structure:
 *  - the department's manager and administrators: create, edit, assign and delete;
 *  - the department's employees: view the department's records, create, and update records
 *    assigned to them or created by them;
 *  - "open to all" types (IT support requests): any employee may log one and sees their own;
 *  - the CEO and General Manager: view every department's records (oversight, read-only).
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import { RECORD_PRIORITIES, RECORD_TYPES, typeByKey, type DeptRecord, type RecordType } from "@/lib/department-modules";
import { departmentPeople, memberDepartments, type OrgStructure } from "@/lib/org-structure.server";
import type { AccessFlags } from "@/lib/roles";

type Actor = { userId: string; fullName: string; access: AccessFlags; org: OrgStructure; leadDepartments: Set<string> };
type Notify = (userId: string, title: string, message: string) => Promise<void>;
/** Who receives a department's requests: its manager, or the General Manager(s) when it has none. */
type Reviewers = (departmentKey: string) => Promise<string[]>;
const db = () => supabaseAdmin as any;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function rights(actor: Actor, dept: string) {
  const manages = actor.access.isAdmin || actor.leadDepartments.has(dept);
  const member = memberDepartments(actor.org, actor.userId).includes(dept);
  const oversees = actor.access.isCEO || actor.access.isGM;
  return { manages, member, oversees, view: manages || member || oversees };
}

function withNames(org: OrgStructure, r: any): DeptRecord {
  return {
    ...r,
    assigned_to_name: r.assigned_to ? org.people.get(r.assigned_to)?.name ?? null : null,
    created_by_name: r.created_by ? org.people.get(r.created_by)?.name ?? null : null,
  };
}

/** Coerce and validate submitted values against the record type. */
function clean(t: RecordType, body: any, partial: boolean): { ok: true; row: Record<string, any> } | { ok: false; error: string } {
  const row: Record<string, any> = {};
  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? "").trim().slice(0, 200);
    if (!title) return { ok: false, error: `Give the ${t.singular} a title.` };
    row.title = title;
  }
  if (body.status !== undefined) {
    if (!t.statuses.includes(body.status)) return { ok: false, error: "Choose a valid status." };
    row.status = body.status;
  } else if (!partial) row.status = t.statuses[0];
  if (t.priority && body.priority !== undefined) {
    if (body.priority && !RECORD_PRIORITIES.includes(body.priority)) return { ok: false, error: "Choose a valid priority." };
    row.priority = body.priority || null;
  }
  if (t.client && body.clientName !== undefined) row.client_name = String(body.clientName || "").trim().slice(0, 160) || null;
  if (t.due && body.dueDate !== undefined) {
    const d = String(body.dueDate || "");
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return { ok: false, error: "Use a valid date." };
    row.due_date = d || null;
  }
  if (body.data !== undefined || !partial) {
    const data: Record<string, any> = {};
    for (const f of t.fields) {
      const v = body.data?.[f.key];
      if (v === undefined || v === null || v === "") {
        if (f.required && !partial) return { ok: false, error: `${f.label} is required.` };
        continue;
      }
      if (["number", "money", "percent", "rating"].includes(f.type)) {
        const n = Number(v);
        if (!Number.isFinite(n)) return { ok: false, error: `${f.label} must be a number.` };
        if (f.type === "percent" && (n < 0 || n > 100)) return { ok: false, error: `${f.label} must be between 0 and 100.` };
        if (f.type === "rating" && (n < 1 || n > 5)) return { ok: false, error: `${f.label} must be from 1 to 5.` };
        data[f.key] = n;
      } else if (f.type === "select") {
        if (!f.options?.includes(v)) return { ok: false, error: `Choose a valid ${f.label.toLowerCase()}.` };
        data[f.key] = v;
      } else if (f.type === "date") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return { ok: false, error: `${f.label} must be a date.` };
        data[f.key] = String(v);
      } else data[f.key] = String(v).slice(0, f.type === "textarea" ? 4000 : 400);
    }
    row.data = data;
  }
  return { ok: true, row };
}

export async function handleRecordsApi(
  request: Request,
  url: URL,
  actor: Actor,
  notify: Notify,
  reviewers: Reviewers,
): Promise<Response | null> {
  const { pathname } = url;
  const method = request.method;
  if (!pathname.startsWith("/api/staff/records")) return null;

  // GET /api/staff/records/mine -> requests this person raised with any department
  if (method === "GET" && pathname === "/api/staff/records/mine") {
    const { data, error } = await db().from("department_records").select("*").eq("created_by", actor.userId).order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    const openKeys = RECORD_TYPES.filter((t) => t.openToAll).map((t) => t.key);
    return json({ records: (data || []).filter((r: any) => openKeys.includes(r.record_type)).map((r: any) => withNames(actor.org, r)) });
  }

  // GET /api/staff/records?dept=<key>  -> the department's module records the caller may see
  if (method === "GET" && pathname === "/api/staff/records") {
    const dept = String(url.searchParams.get("dept") || "");
    if (!DEPARTMENTS.some((d) => d.key === dept)) return json({ error: "Unknown department." }, 400);
    const r = rights(actor, dept);
    const types = RECORD_TYPES.filter((t) => t.department === dept);
    const openTypes = types.filter((t) => t.openToAll).map((t) => t.key);
    if (!r.view && !openTypes.length) return json({ error: "You do not have access to this department's records." }, 403);
    const { data, error } = await db().from("department_records").select("*").eq("department_key", dept).order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    const rows = (data || []).filter((row: any) => r.view || (openTypes.includes(row.record_type) && row.created_by === actor.userId));
    return json({
      records: rows.map((row: any) => withNames(actor.org, row)),
      canManage: r.manages,
      canView: r.view,
      canCreate: Object.fromEntries(types.map((t) => [t.key, r.manages || r.member || Boolean(t.openToAll)])),
      people: departmentPeople(actor.org, dept).map((id) => ({ id, name: actor.org.people.get(id)?.name ?? id })),
    });
  }

  // POST /api/staff/records  -> create
  if (method === "POST" && pathname === "/api/staff/records") {
    const body = await request.json().catch(() => ({}));
    const t = typeByKey(String(body.type || ""));
    if (!t) return json({ error: "Unknown record type." }, 400);
    const r = rights(actor, t.department);
    const outsider = !r.manages && !r.member;
    if (outsider && !t.openToAll) return json({ error: `Only ${DEPARTMENTS.find((d) => d.key === t.department)?.name} can add ${t.label.toLowerCase()}.` }, 403);
    const c = clean(t, body, false);
    if (!c.ok) return json({ error: c.error }, 400);
    const row: Record<string, any> = { ...c.row };
    if (outsider || (!r.manages && t.openToAll && !r.member)) {
      // An employee logging a request: it starts new and unassigned, and records who asked.
      row.status = t.statuses[0];
      // Someone outside the department may only fill in the request fields.
      const intake = new Set(t.fields.filter((f) => f.intake).map((f) => f.key));
      const data = Object.fromEntries(Object.entries(row.data || {}).filter(([k]) => intake.has(k)));
      row.data = { ...data, requester: actor.fullName };
      delete row.due_date;
    } else if (t.assignee && body.assignedTo) {
      if (!departmentPeople(actor.org, t.department).includes(body.assignedTo))
        return json({ error: "Assign it to someone in this department." }, 400);
      if (!r.manages && body.assignedTo !== actor.userId) return json({ error: "Only the manager can assign it to someone else." }, 403);
      row.assigned_to = body.assignedTo;
    }
    const now = new Date().toISOString();
    const { data, error } = await db()
      .from("department_records")
      .insert({ ...row, department_key: t.department, record_type: t.key, created_by: actor.userId, updated_by: actor.userId, created_at: now, updated_at: now })
      .select()
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (row.assigned_to && row.assigned_to !== actor.userId)
      await notify(row.assigned_to, `New ${t.singular} assigned to you`, `${actor.fullName} assigned "${row.title}" to you.`);
    if (outsider) {
      for (const uid of await reviewers(t.department))
        if (uid !== actor.userId) await notify(uid, `New ${t.singular}`, `${actor.fullName} raised a ${t.singular}: "${row.title}".`);
    }
    return json({ record: withNames(actor.org, data) }, 201);
  }

  const m = pathname.match(/^\/api\/staff\/records\/([^/]+)$/);
  if (m && (method === "PATCH" || method === "DELETE")) {
    const id = decodeURIComponent(m[1]);
    const { data: found } = await db().from("department_records").select("*").eq("id", id).maybeSingle();
    if (!found) return json({ error: "Record not found." }, 404);
    // Snapshot before any change, so notifications compare against the previous values.
    const existing = { ...found, data: { ...(found.data || {}) } };
    const t = typeByKey(existing.record_type);
    if (!t) return json({ error: "Unknown record type." }, 400);
    const r = rights(actor, existing.department_key);
    if (method === "DELETE") {
      if (!r.manages) return json({ error: "Only the department's manager can delete records." }, 403);
      await db().from("department_records").delete().eq("id", id);
      return json({ ok: true });
    }
    const own = existing.assigned_to === actor.userId || existing.created_by === actor.userId;
    if (!r.manages && !(r.member && own)) return json({ error: "You can only update records assigned to you." }, 403);
    const body = await request.json().catch(() => ({}));
    const c = clean(t, body, true);
    if (!c.ok) return json({ error: c.error }, 400);
    const patch: Record<string, any> = { ...c.row };
    if (patch.data) patch.data = { ...existing.data, ...patch.data };
    if (body.assignedTo !== undefined && t.assignee) {
      if (!r.manages) return json({ error: "Only the manager can reassign." }, 403);
      if (body.assignedTo && !departmentPeople(actor.org, existing.department_key).includes(body.assignedTo))
        return json({ error: "Assign it to someone in this department." }, 400);
      patch.assigned_to = body.assignedTo || null;
    }
    if (body.taskId !== undefined && r.manages) patch.task_id = body.taskId ? String(body.taskId) : null;
    const { data, error } = await db()
      .from("department_records")
      .update({ ...patch, updated_by: actor.userId, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    // The person who raised a request hears when its status changes.
    if (t.openToAll && patch.status && patch.status !== existing.status && existing.created_by && existing.created_by !== actor.userId)
      await notify(existing.created_by, `Your ${t.singular} is now "${patch.status}"`, `Your ${t.singular} "${existing.title}" moved to ${patch.status} (updated by ${actor.fullName}).`);
    if (patch.assigned_to && patch.assigned_to !== existing.assigned_to && patch.assigned_to !== actor.userId)
      await notify(patch.assigned_to, `${t.singular[0].toUpperCase()}${t.singular.slice(1)} assigned to you`, `${actor.fullName} assigned "${data?.title ?? existing.title}" to you.`);
    return json({ record: withNames(actor.org, data ?? { ...existing, ...patch }) });
  }

  return json({ error: "Not found." }, 404);
}
