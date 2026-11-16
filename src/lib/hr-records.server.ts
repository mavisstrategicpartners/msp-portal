/**
 * HR administration API (server only), under /api/staff/hr and /api/staff/leave.
 *
 * The HR Manager is the central administrator of employee records:
 *  - Employees: list, add (staff or intern only), update personal and employment details.
 *    The employee record is public.profiles; employment details live in public.hr_employees
 *    (one row per profile).
 *  - Employee folders: every employee has an HR folder. Documents are rows in
 *    public.hr_documents (category, date, uploader, notes) with the file in the private
 *    "hr-documents" bucket (folders/<employee id>/...).
 *  - Leave: public.leave_requests is the single leave record. Employees apply and follow
 *    status; HR approves, declines or asks for more information.
 *  - Audit: every HR action is written to public.hr_audit, linked to the employee.
 *
 * Access: the HR Manager and administrators manage; the CEO has read-only oversight; every
 * employee reaches only their own leave (and their own document requests elsewhere).
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import type { OrgStructure } from "@/lib/org-structure.server";
import type { AccessFlags } from "@/lib/roles";
import { EMPLOYMENT_TYPES, FOLDER_CATEGORIES, LEAVE_TYPES, workingDays } from "@/lib/hr-shared";

type Actor = { userId: string; fullName: string; access: AccessFlags; org: OrgStructure };
type Notify = (userId: string, title: string, message: string) => Promise<void>;
type HrRecipients = () => Promise<string[]>;

const db = () => supabaseAdmin as any;
const store = () => db().storage.from("hr-documents");
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const text = (v: any, max = 300) => String(v ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const today = () => new Date().toISOString().slice(0, 10);

export { FOLDER_CATEGORIES, LEAVE_TYPES, workingDays };
const EXT = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp", "heic", "txt", "csv", "zip"];

export function hrRights(a: AccessFlags) {
  const manage = a.isHR || a.isAdmin;
  return { manage, view: manage || a.isCEO };
}

/** Write one HR audit entry (who, what, which employee, when). */
export async function hrAudit(actor: { userId: string; fullName: string }, action: string, employee: { id?: string | null; name?: string | null } | null, details?: string) {
  await db()
    .from("hr_audit")
    .insert({
      id: `hra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toLocaleString("sv-SE", { timeZone: "Africa/Johannesburg" }).slice(0, 16),
      actor: actor.fullName,
      action,
      target: employee?.name ?? null,
      employee_id: employee?.id ?? null,
      details: details ? details.slice(0, 2000) : null,
    });
}

async function signed(path?: string | null, name?: string) {
  if (!path) return null;
  const [v, d] = await Promise.all([store().createSignedUrl(path, 60 * 30), store().createSignedUrl(path, 60 * 30, { download: name || true })]);
  return v.error ? null : { url: v.data?.signedUrl, downloadUrl: d.data?.signedUrl || v.data?.signedUrl };
}

async function fileExists(path: string) {
  const dir = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  const { data, error } = await store().list(dir, { search: name, limit: 5 });
  return !error && Array.isArray(data) && data.some((o: any) => o.name === name);
}

const personName = (org: OrgStructure, id: string) => org.people.get(id)?.name ?? null;
const deptOf = (org: OrgStructure, id: string) => {
  const m = org.memberships.find((x) => x.userId === id && x.isPrimary) ?? org.memberships.find((x) => x.userId === id);
  const key = m?.departmentKey ?? [...org.leads.entries()].find(([, uid]) => uid === id)?.[0] ?? null;
  return key ? { key, name: DEPARTMENTS.find((d) => d.key === key)?.name ?? key } : null;
};

function cleanDetails(b: any): { ok: true; row: Record<string, any> } | { ok: false; error: string } {
  const row: Record<string, any> = {};
  const str = (k: string, max = 200) => { if (b[k] !== undefined) row[k] = text(b[k], max) || null; };
  const date = (k: string) => {
    if (b[k] === undefined) return null;
    const v = text(b[k], 10);
    if (v && !isDate(v)) return `Enter a valid ${k.replace(/_/g, " ")}.`;
    row[k] = v || null;
    return null;
  };
  str("employee_number", 40);
  str("id_number", 40);
  str("address", 500);
  str("emergency_contact_name", 120);
  str("emergency_contact_phone", 40);
  str("manager", 120);
  str("gender", 40);
  str("notes", 4000);
  if (b.employment_type !== undefined) {
    const v = text(b.employment_type, 40);
    if (v && !(EMPLOYMENT_TYPES as readonly string[]).includes(v)) return { ok: false, error: "Choose a valid employment type." };
    row.employment_type = v || null;
  }
  for (const k of ["join_date", "end_date", "date_of_birth"]) {
    const e = date(k);
    if (e) return { ok: false, error: e };
  }
  return { ok: true, row };
}

export async function handleHrRecordsApi(request: Request, url: URL, actor: Actor, notify: Notify, hrRecipients: HrRecipients): Promise<Response | null> {
  const { pathname } = url;
  const method = request.method;

  // ── Employees: my leave ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/staff/leave")) {
    if (method === "GET" && pathname === "/api/staff/leave/mine") {
      const { data, error } = await db().from("leave_requests").select("*").eq("user_id", actor.userId).order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json({ requests: data || [], types: LEAVE_TYPES });
    }
    if (method === "POST" && pathname === "/api/staff/leave") {
      const b = await request.json().catch(() => ({}));
      const type = text(b.leaveType, 60);
      const start = text(b.startDate, 10);
      const end = text(b.endDate, 10);
      if (!LEAVE_TYPES.includes(type as any)) return json({ error: "Choose the type of leave." }, 400);
      if (!isDate(start) || !isDate(end)) return json({ error: "Choose the first and last day of leave." }, 400);
      if (end < start) return json({ error: "The last day cannot be before the first day." }, 400);
      const days = workingDays(start, end);
      if (!days) return json({ error: "The dates you chose are all weekend days." }, 400);
      const reason = text(b.reason, 2000);
      if (!reason) return json({ error: "Add a short reason." }, 400);
      const { data: clash } = await db().from("leave_requests").select("id, start_date, end_date, status").eq("user_id", actor.userId);
      if ((clash || []).some((r: any) => ["pending", "approved", "info_requested"].includes(r.status) && r.start_date <= end && r.end_date >= start))
        return json({ error: "You already have leave requested or approved for some of these days." }, 409);
      const now = new Date().toISOString();
      const { data, error } = await db().from("leave_requests").insert({ user_id: actor.userId, leave_type: type, start_date: start, end_date: end, days, reason, status: "pending", created_at: now, updated_at: now }).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      await hrAudit(actor, "Leave application submitted", { id: actor.userId, name: actor.fullName }, `${type}, ${start} to ${end} (${days} working day${days === 1 ? "" : "s"})`);
      for (const uid of await hrRecipients()) if (uid !== actor.userId) await notify(uid, "New leave application", `${actor.fullName} applied for ${type.toLowerCase()}: ${start} to ${end} (${days} day${days === 1 ? "" : "s"}).`);
      return json({ request: data }, 201);
    }
    const m = pathname.match(/^\/api\/staff\/leave\/mine\/([^/]+)$/);
    if (m && (method === "PATCH" || method === "DELETE")) {
      const { data: row } = await db().from("leave_requests").select("*").eq("id", decodeURIComponent(m[1])).maybeSingle();
      if (!row || row.user_id !== actor.userId) return json({ error: "Leave application not found." }, 404);
      if (method === "DELETE") {
        if (row.status !== "pending" && row.status !== "info_requested") return json({ error: "Only applications HR has not decided yet can be withdrawn." }, 409);
        await db().from("leave_requests").delete().eq("id", row.id);
        await hrAudit(actor, "Leave application withdrawn", { id: actor.userId, name: actor.fullName }, `${row.leave_type ?? "Leave"}, ${row.start_date} to ${row.end_date}`);
        return json({ ok: true });
      }
      if (row.status !== "info_requested") return json({ error: "HR has not asked for more information on this application." }, 409);
      const b = await request.json().catch(() => ({}));
      const response = text(b.response, 2000);
      if (!response) return json({ error: "Add the information HR asked for." }, 400);
      const patch: Record<string, any> = { employee_response: response, status: "pending", updated_at: new Date().toISOString() };
      if (b.startDate !== undefined || b.endDate !== undefined) {
        const start = text(b.startDate ?? row.start_date, 10);
        const end = text(b.endDate ?? row.end_date, 10);
        if (!isDate(start) || !isDate(end) || end < start) return json({ error: "Choose valid dates." }, 400);
        Object.assign(patch, { start_date: start, end_date: end, days: workingDays(start, end) });
      }
      const { data, error } = await db().from("leave_requests").update(patch).eq("id", row.id).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      await hrAudit(actor, "Leave information provided", { id: actor.userId, name: actor.fullName }, response);
      for (const uid of await hrRecipients()) if (uid !== actor.userId) await notify(uid, "Leave application updated", `${actor.fullName} answered your question about their leave application.`);
      return json({ request: data });
    }
    return json({ error: "Not found." }, 404);
  }

  if (!pathname.startsWith("/api/staff/hr/")) return null;
  const r = hrRights(actor.access);
  if (!r.view) return json({ error: "Only HR can open employee records." }, 403);
  const body = method === "GET" ? {} : await request.json().catch(() => ({}));
  const mustManage = () => (r.manage ? null : json({ error: "You can view HR records but not change them." }, 403));

  // ── HR: leave administration ─────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/staff/hr/leave") {
    const { data, error } = await db().from("leave_requests").select("*").order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({
      requests: (data || []).map((x: any) => ({ ...x, employee_name: personName(actor.org, x.user_id), department: deptOf(actor.org, x.user_id)?.name ?? null })),
      canManage: r.manage,
    });
  }
  const lv = pathname.match(/^\/api\/staff\/hr\/leave\/([^/]+)$/);
  if (lv && method === "PATCH") {
    const denied = mustManage();
    if (denied) return denied;
    const { data: row } = await db().from("leave_requests").select("*").eq("id", decodeURIComponent(lv[1])).maybeSingle();
    if (!row) return json({ error: "Leave application not found." }, 404);
    const note = text(body.note, 2000);
    const action = body.action;
    const status = action === "approve" ? "approved" : action === "decline" ? "declined" : action === "request_info" ? "info_requested" : null;
    if (!status) return json({ error: "Choose approve, decline or request information." }, 400);
    if (row.status === "approved" || row.status === "declined") {
      if (!body.reopen) return json({ error: `This application was already ${row.status}.` }, 409);
    }
    if ((action === "decline" || action === "request_info") && !note) return json({ error: action === "decline" ? "Give the reason for declining." : "Say what information you need." }, 400);
    if (row.user_id === actor.userId && !actor.access.isAdmin) return json({ error: "You cannot decide your own leave application." }, 403);
    const now = new Date().toISOString();
    const { data, error } = await db()
      .from("leave_requests")
      .update({ status, hr_note: note || null, reviewed_by: actor.userId, reviewed_by_name: actor.fullName, reviewed_at: now, updated_at: now })
      .eq("id", row.id)
      .select()
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    const emp = { id: row.user_id, name: personName(actor.org, row.user_id) };
    const label = status === "approved" ? "approved" : status === "declined" ? "declined" : "information requested";
    await hrAudit(actor, `Leave ${label}`, emp, `${row.leave_type ?? "Leave"}, ${row.start_date} to ${row.end_date}${note ? ` — ${note}` : ""}`);
    await notify(
      row.user_id,
      status === "info_requested" ? "HR needs more information about your leave" : `Leave ${status}`,
      status === "info_requested" ? `HR asked: ${note}` : `Your ${(row.leave_type ?? "leave").toLowerCase()} (${row.start_date} to ${row.end_date}) was ${status}${note ? `: ${note}` : "."}`,
    );
    return json({ request: { ...data, employee_name: emp.name } });
  }

  // ── HR: employees ────────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/staff/hr/employees") {
    const [{ data: profiles }, { data: details }, { data: docs }, { data: reqs }, { data: leave }] = await Promise.all([
      db().from("profiles").select("id, full_name, email, phone, job_title, role_tier, is_active, created_at, avatar_url"),
      db().from("hr_employees").select("profile_id, employee_number, employment_type, join_date, end_date"),
      db().from("hr_documents").select("employee_id"),
      db().from("hr_document_requests").select("employee_id, status, due_date"),
      db().from("leave_requests").select("user_id, status"),
    ]);
    const count = (rows: any[] | null, key: string, id: string, pred: (x: any) => boolean = () => true) => (rows || []).filter((x) => x[key] === id && pred(x)).length;
    const t = today();
    const employees = (profiles || [])
      .map((p: any) => {
        const d = (details || []).find((x: any) => x.profile_id === p.id) || {};
        return {
          ...p,
          department: deptOf(actor.org, p.id),
          employee_number: d.employee_number ?? null,
          employment_type: d.employment_type ?? null,
          join_date: d.join_date ?? null,
          end_date: d.end_date ?? null,
          documents: count(docs, "employee_id", p.id),
          open_requests: count(reqs, "employee_id", p.id, (x) => ["Outstanding", "Returned"].includes(x.status)),
          overdue_requests: count(reqs, "employee_id", p.id, (x) => ["Outstanding", "Returned"].includes(x.status) && x.due_date && x.due_date < t),
          pending_leave: count(leave, "user_id", p.id, (x) => x.status === "pending" || x.status === "info_requested"),
        };
      })
      .sort((a: any, b: any) => String(a.full_name ?? "").localeCompare(String(b.full_name ?? "")));
    return json({ employees, canManage: r.manage, categories: FOLDER_CATEGORIES, employmentTypes: EMPLOYMENT_TYPES, departments: DEPARTMENTS.map((d) => ({ key: d.key, name: d.name })) });
  }

  if (method === "POST" && pathname === "/api/staff/hr/employees") {
    const denied = mustManage();
    if (denied) return denied;
    const fullName = text(body.fullName, 120);
    const email = text(body.email, 200).toLowerCase();
    if (fullName.length < 2) return json({ error: "Enter the employee's full name." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid work email address." }, 400);
    const dept = DEPARTMENTS.find((d) => d.key === body.departmentKey);
    if (!dept) return json({ error: "Choose the department." }, 400);
    const tier = body.roleTier === "intern" ? "intern" : "staff"; // HR adds staff and interns; never managers or administrators
    const c = cleanDetails(body.details || {});
    if (!c.ok) return json({ error: c.error }, 400);
    const { data: existing } = await db().from("profiles").select("id").ilike("email", email).limit(1);
    if (existing?.length) return json({ error: "Someone with this email already has an account." }, 409);
    const { generateTemporaryPassword } = await import("@/lib/temporary-password.server");
    const temporaryPassword = generateTemporaryPassword();
    const { data: created, error: cErr } = await db().auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { must_change_password: true },
    });
    if (cErr || !created?.user) return json({ error: cErr?.message || "The account could not be created." }, 500);
    const id = created.user.id;
    const { PROFILE_LABEL_FOR } = await import("@/lib/staff-department.server");
    const { error: pErr } = await db().from("profiles").upsert({
      id,
      email,
      full_name: fullName,
      phone: text(body.phone, 40) || null,
      job_title: text(body.jobTitle, 120) || null,
      department: PROFILE_LABEL_FOR[dept.key] ?? null,
      role_tier: tier,
      is_active: true,
      onboarding_completed: false,
    });
    if (pErr) return json({ error: pErr.message }, 500);
    await db().from("user_roles").upsert({ user_id: id, role: "user" }, { onConflict: "user_id,role" });
    await db().from("department_members").insert({ user_id: id, department_key: dept.key, is_primary: true, source: "manual", assigned_by: actor.userId, assigned_at: new Date().toISOString() });
    await db().from("hr_employees").upsert({ id, profile_id: id, full_name: fullName, email, department: dept.name, role: text(body.jobTitle, 120) || null, phone: text(body.phone, 40) || null, ...c.row, updated_at: new Date().toISOString() });
    try {
      const { invalidateOrgStructure } = await import("@/lib/org-structure.server");
      invalidateOrgStructure();
    } catch {
      /* cache refreshes on its own */
    }
    await hrAudit(actor, "Employee added", { id, name: fullName }, `${email}, ${dept.name}, ${tier}`);
    // The temporary password is returned once, to the HR user who created the account, and never stored or logged.
    return json({ employee: { id, full_name: fullName, email }, temporaryPassword }, 201);
  }

  const emp = pathname.match(/^\/api\/staff\/hr\/employees\/([^/]+)(?:\/(documents)(?:\/([^/]+))?(?:\/(link))?)?$/);
  if (!emp) return json({ error: "Not found." }, 404);
  const empId = emp[1];
  const { data: profile } = await db().from("profiles").select("*").eq("id", empId).maybeSingle();
  if (!profile) return json({ error: "Employee not found." }, 404);
  const empRef = { id: empId, name: profile.full_name };
  const section = emp[2];

  // GET folder
  if (method === "GET" && !section) {
    const [{ data: details }, { data: docs }, { data: reqs }, { data: leave }, { data: audit }, { data: decl }] = await Promise.all([
      db().from("hr_employees").select("*").eq("profile_id", empId).maybeSingle(),
      db().from("hr_documents").select("*").eq("employee_id", empId).order("created_at", { ascending: false }),
      db().from("hr_document_requests").select("*").eq("employee_id", empId).order("created_at", { ascending: false }),
      db().from("leave_requests").select("*").eq("user_id", empId).order("start_date", { ascending: false }),
      db().from("hr_audit").select("*").eq("employee_id", empId).order("created_at", { ascending: false }).limit(200),
      db().from("employee_declarations").select("id, declaration_date, signature_typed_name, submitted_at").eq("user_id", empId),
    ]);
    await hrAudit(actor, "Employee folder viewed", empRef);
    return json({
      profile: { ...profile, department: deptOf(actor.org, empId) },
      details: details || null,
      documents: docs || [],
      requests: reqs || [],
      leave: leave || [],
      declarations: decl || [],
      audit: audit || [],
      canManage: r.manage,
    });
  }

  // PATCH employee details
  if (method === "PATCH" && !section) {
    const denied = mustManage();
    if (denied) return denied;
    const c = cleanDetails(body.details || {});
    if (!c.ok) return json({ error: c.error }, 400);
    const changes: string[] = [];
    const prof: Record<string, any> = {};
    if (body.fullName !== undefined) {
      const v = text(body.fullName, 120);
      if (v.length < 2) return json({ error: "Enter the full name." }, 400);
      if (v !== profile.full_name) prof.full_name = v;
    }
    if (body.phone !== undefined && (text(body.phone, 40) || null) !== profile.phone) prof.phone = text(body.phone, 40) || null;
    if (body.jobTitle !== undefined && (text(body.jobTitle, 120) || null) !== profile.job_title) prof.job_title = text(body.jobTitle, 120) || null;
    if (Object.keys(prof).length) {
      const { error } = await db().from("profiles").update(prof).eq("id", empId);
      if (error) return json({ error: error.message }, 500);
      changes.push(...Object.keys(prof).map((k) => k.replace(/_/g, " ")));
    }
    if (body.departmentKey && body.departmentKey !== deptOf(actor.org, empId)?.key) {
      // Managers and administrators are placed through Department Structure, not by HR.
      if (!actor.access.isAdmin && ["manager", "root_admin"].includes(profile.role_tier)) return json({ error: "Managers and administrators change department on Department Structure (Root Admin)." }, 403);
      const { setMainDepartment } = await import("@/lib/staff-department.server");
      const move = await setMainDepartment(db(), empId, body.departmentKey, actor.userId).catch((e: Error) => ({ error: e.message }) as any);
      if ((move as any).error) return json({ error: (move as any).error }, 400);
      await db().from("profiles").update({ department: (move as any).profileLabel }).eq("id", empId);
      try {
        const { invalidateOrgStructure } = await import("@/lib/org-structure.server");
        invalidateOrgStructure();
      } catch {
        /* refreshes on its own */
      }
      changes.push("department");
    }
    if (Object.keys(c.row).length) {
      const { data: cur } = await db().from("hr_employees").select("*").eq("profile_id", empId).maybeSingle();
      const diff = Object.keys(c.row).filter((k) => String(cur?.[k] ?? "") !== String(c.row[k] ?? ""));
      if (diff.length) {
        const row = { ...(cur || { id: empId, profile_id: empId, full_name: profile.full_name, email: profile.email }), ...c.row, full_name: prof.full_name ?? profile.full_name, updated_at: new Date().toISOString() };
        const { error } = await db().from("hr_employees").upsert(row);
        if (error) return json({ error: error.message }, 500);
        changes.push(...diff.map((k) => k.replace(/_/g, " ")));
      }
    }
    if (changes.length) await hrAudit(actor, "Employee details updated", { id: empId, name: prof.full_name ?? profile.full_name }, `Changed: ${changes.join(", ")}`);
    return json({ ok: true, changed: changes });
  }

  // Folder documents
  if (section === "documents") {
    const docId = emp[3] ? decodeURIComponent(emp[3]) : null;
    if (method === "POST" && docId === "upload-url") {
      const denied = mustManage();
      if (denied) return denied;
      const fileName = text(body.fileName, 200);
      const size = Number(body.size) || 0;
      const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";
      if (!fileName || !EXT.includes(ext)) return json({ error: `This file type is not allowed. Use ${EXT.join(", ").toUpperCase()}.` }, 400);
      if (size <= 0 || size > 25 * 1024 * 1024) return json({ error: "Files must be between 1 byte and 25 MB." }, 400);
      const path = `folders/${empId}/${crypto.randomUUID()}-${fileName.replace(/[^\w.\-]+/g, "_").slice(-100)}`;
      const { data, error } = await store().createSignedUploadUrl(path);
      if (error || !data?.token) return json({ error: "Could not prepare the upload." }, 500);
      return json({ path, token: data.token });
    }
    if (method === "POST" && !docId) {
      const denied = mustManage();
      if (denied) return denied;
      const path = text(body.path, 500);
      if (!path.startsWith(`folders/${empId}/`) || path.includes("..") || !(await fileExists(path))) return json({ error: "The file did not finish uploading." }, 400);
      const category = (FOLDER_CATEGORIES as readonly string[]).includes(body.category) ? body.category : "Other";
      const docDate = text(body.documentDate, 10);
      if (docDate && !isDate(docDate)) return json({ error: "Enter a valid document date." }, 400);
      const now = new Date().toISOString();
      const row = {
        id: `hrd-${crypto.randomUUID()}`,
        employee_id: empId,
        employee_name: profile.full_name,
        name: text(body.name, 200) || path.split("/").pop(),
        type: category,
        category,
        size: Math.max(0, Number(body.size) || 0),
        mime_type: text(body.mimeType, 120) || null,
        access: "HR Only",
        uploaded: now.slice(0, 10),
        document_date: docDate || null,
        storage_path: path,
        uploaded_by: actor.userId,
        uploaded_by_name: actor.fullName,
        notes: text(body.notes, 2000) || null,
        source: "upload",
        created_at: now,
        updated_at: now,
      };
      const { data, error } = await db().from("hr_documents").insert(row).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      await hrAudit(actor, "Document added to folder", empRef, `${row.name} (${category})`);
      return json({ document: data ?? row }, 201);
    }
    if (!docId) return json({ error: "Not found." }, 404);
    const { data: doc } = await db().from("hr_documents").select("*").eq("id", docId).maybeSingle();
    if (!doc || doc.employee_id !== empId) return json({ error: "Document not found in this folder." }, 404);
    if (method === "GET" && emp[4] === "link") {
      const l = await signed(doc.storage_path, doc.name);
      if (!l) return json({ error: doc.data_url ? "This older document is stored inside the record; open it from the legacy view." : "The file is missing." }, 404);
      await hrAudit(actor, "Document opened", empRef, doc.name);
      return json(l);
    }
    if (method === "PATCH") {
      const denied = mustManage();
      if (denied) return denied;
      const patch: Record<string, any> = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) { const v = text(body.name, 200); if (!v) return json({ error: "Give the document a name." }, 400); patch.name = v; }
      if (body.category !== undefined) { if (!(FOLDER_CATEGORIES as readonly string[]).includes(body.category)) return json({ error: "Choose a valid category." }, 400); patch.category = body.category; patch.type = body.category; }
      if (body.documentDate !== undefined) { const v = text(body.documentDate, 10); if (v && !isDate(v)) return json({ error: "Enter a valid document date." }, 400); patch.document_date = v || null; }
      if (body.notes !== undefined) patch.notes = text(body.notes, 2000) || null;
      const { data, error } = await db().from("hr_documents").update(patch).eq("id", docId).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      await hrAudit(actor, "Document details updated", empRef, `${doc.name}${patch.name && patch.name !== doc.name ? ` → ${patch.name}` : ""}${patch.category && patch.category !== doc.category ? `, category ${patch.category}` : ""}`);
      return json({ document: data });
    }
    if (method === "DELETE") {
      const denied = mustManage();
      if (denied) return denied;
      const { error } = await db().from("hr_documents").delete().eq("id", docId);
      if (error) return json({ error: error.message }, 500);
      // Files filed from a document request stay with that request; only folder uploads are removed.
      if (doc.storage_path && doc.source === "upload") await store().remove([doc.storage_path]);
      await hrAudit(actor, "Document removed from folder", empRef, `${doc.name} (${doc.category ?? doc.type ?? "Other"})`);
      return json({ ok: true });
    }
  }
  return json({ error: "Not found." }, 404);
}
