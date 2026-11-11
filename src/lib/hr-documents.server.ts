/**
 * HR document requests (server only), under /api/staff/hr-documents.
 *
 * HR asks employees to sign, complete or upload documents. Each request is one row per employee
 * in public.hr_document_requests; files are kept in the private "hr-documents" bucket and only
 * reached through short-lived links issued here.
 *
 *  - Employees: see and act on their own requests only.
 *  - HR (the HR manager) and administrators: create, edit, cancel, review, download.
 *  - The CEO: read-only oversight of requests and statuses.
 *  - Department managers and other staff: their own requests only (HR files stay confidential).
 *
 * "declaration" requests use the existing Internal Confidentiality and Conflict Declaration form
 * (public.employee_declarations); it is shown only to employees HR has asked to complete it.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import { departmentPeople, type OrgStructure } from "@/lib/org-structure.server";
import type { AccessFlags } from "@/lib/roles";

type Actor = { userId: string; fullName: string; access: AccessFlags; org: OrgStructure };
type Notify = (userId: string, title: string, message: string) => Promise<void>;
type HrRecipients = () => Promise<string[]>;

const db = () => supabaseAdmin as any;
const BUCKET = "hr-documents";
const store = () => db().storage.from(BUCKET);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const REQUEST_KINDS = ["sign", "complete", "upload", "declaration"] as const;
export const OPEN_STATUSES = ["Outstanding", "Returned"];
const EXT = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp", "heic", "txt", "csv", "zip"];
const MAX_BYTES = 25 * 1024 * 1024;
const text = (v: any, max = 300) => String(v ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const ext = (n: string) => (n.includes(".") ? n.split(".").pop()!.toLowerCase() : "");

export function hrDocRights(a: AccessFlags) {
  const manage = a.isHR || a.isAdmin;
  return { manage, view: manage || a.isCEO };
}

async function fileExists(path: string) {
  const dir = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  const { data, error } = await store().list(dir, { search: name, limit: 5 });
  return !error && Array.isArray(data) && data.some((o: any) => o.name === name);
}

async function slot(prefix: string, body: any) {
  const fileName = text(body.fileName, 200);
  const size = Number(body.size) || 0;
  if (!fileName) return json({ error: "Missing file name." }, 400);
  if (!EXT.includes(ext(fileName))) return json({ error: `This file type is not allowed. Use ${EXT.join(", ").toUpperCase()}.` }, 400);
  if (size <= 0) return json({ error: "The file is empty." }, 400);
  if (size > MAX_BYTES) return json({ error: "Files can be at most 25 MB." }, 400);
  const path = `${prefix}/${crypto.randomUUID()}-${fileName.replace(/[^\w.\-]+/g, "_").slice(-100)}`;
  const { data, error } = await store().createSignedUploadUrl(path);
  if (error || !data?.token) return json({ error: "Could not prepare the upload." }, 500);
  return json({ path, token: data.token });
}

/** Validate a file uploaded under `prefix` by the caller. */
async function checkFile(f: any, prefix: string) {
  const path = String(f?.path || "");
  if (!path.startsWith(`${prefix}/`) || path.includes("..")) return null;
  if (!(await fileExists(path))) return null;
  return { name: text(f.name, 200) || path.split("/").pop(), path, size: Math.max(0, Number(f.size) || 0), mimeType: text(f.mimeType, 120) || "application/octet-stream" };
}

async function signed(f: any) {
  if (!f?.path) return null;
  const [view, dl] = await Promise.all([store().createSignedUrl(f.path, 60 * 30), store().createSignedUrl(f.path, 60 * 30, { download: f.name })]);
  return view.error || !view.data?.signedUrl ? { ...f, available: false } : { ...f, url: view.data.signedUrl, downloadUrl: dl.data?.signedUrl || view.data.signedUrl, available: true };
}

function withNames(org: OrgStructure, r: any) {
  return { ...r, employee_name: org.people.get(r.employee_id)?.name ?? null };
}

/** Everyone a request is sent to: chosen people, whole departments, or all active staff. */
function resolveAudience(org: OrgStructure, body: any): { ids: string[]; label: string } | { error: string } {
  const active = (id: string) => org.people.get(id)?.active !== false && org.people.has(id);
  if (body.audience === "all") {
    // Everyone placed in a department (the CEO and system accounts are not department staff).
    const ids = [...new Set(DEPARTMENTS.flatMap((d) => departmentPeople(org, d.key)))].filter(active);
    return { ids, label: "All employees" };
  }
  const ids = new Set<string>();
  const labels: string[] = [];
  for (const k of Array.isArray(body.departments) ? body.departments : []) {
    const d = DEPARTMENTS.find((x) => x.key === k);
    if (!d) return { error: "Unknown department." };
    departmentPeople(org, k).filter(active).forEach((id) => ids.add(id));
    labels.push(d.name);
  }
  const people = Array.isArray(body.employees) ? body.employees.map(String) : [];
  for (const id of people) {
    if (!active(id)) return { error: "One of the chosen employees is not an active employee." };
    ids.add(id);
  }
  if (people.length) labels.push(people.length === 1 ? org.people.get(people[0])?.name ?? "1 employee" : `${people.length} employees`);
  return { ids: [...ids], label: labels.join(", ") };
}

export async function handleHrDocumentsApi(request: Request, url: URL, actor: Actor, notify: Notify, hrRecipients: HrRecipients): Promise<Response | null> {
  const { pathname } = url;
  if (!pathname.startsWith("/api/staff/hr-documents")) return null;
  const method = request.method;
  const r = hrDocRights(actor.access);

  // ── Employee: my requests ────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/staff/hr-documents/mine") {
    const [{ data, error }, { data: decl }] = await Promise.all([
      db().from("hr_document_requests").select("*").eq("employee_id", actor.userId).neq("status", "Cancelled").order("created_at", { ascending: false }),
      db().from("employee_declarations").select("id, declaration_date, signature_typed_name, submitted_at").eq("user_id", actor.userId).order("submitted_at", { ascending: false }),
    ]);
    if (error) return json({ error: error.message }, 500);
    // Declarations signed before HR requests existed are shown as completed records.
    const linked = new Set((data || []).map((x: any) => x.declaration_id).filter(Boolean));
    return json({ requests: data || [], declarations: (decl || []).filter((d: any) => !linked.has(d.id)) });
  }

  const mine = pathname.match(/^\/api\/staff\/hr-documents\/mine\/([^/]+)(?:\/(upload-url|submit|files))?$/);
  if (mine) {
    const { data: row } = await db().from("hr_document_requests").select("*").eq("id", decodeURIComponent(mine[1])).maybeSingle();
    if (!row || row.employee_id !== actor.userId || row.status === "Cancelled") return json({ error: "Request not found." }, 404);
    const action = mine[2];
    if (method === "GET" && action === "files")
      return json({ template: await signed(row.template), submission: await Promise.all((row.submission || []).map(signed)) });
    if (!OPEN_STATUSES.includes(row.status)) return json({ error: "This request has already been completed." }, 409);
    const prefix = `submissions/${actor.userId}/${row.id}`;
    if (method === "POST" && action === "upload-url") {
      if (!["complete", "upload"].includes(row.kind)) return json({ error: "This request does not take files." }, 400);
      return slot(prefix, await request.json().catch(() => ({})));
    }
    if (method === "POST" && action === "submit") {
      const body = await request.json().catch(() => ({}));
      const now = new Date().toISOString();
      const patch: Record<string, any> = { submitted_at: now, updated_at: now, response: text(body.response, 2000) || null };
      if (row.kind === "sign") {
        const name = text(body.signature, 120);
        if (!body.acknowledged) return json({ error: "Confirm that you have read the document." }, 400);
        if (name.length < 2) return json({ error: "Type your full name to sign." }, 400);
        Object.assign(patch, { status: "Signed", signature_name: name, acknowledged: true, signed_at: now });
      } else if (row.kind === "declaration") {
        const name = text(body.signature, 120);
        if (!body.acknowledged) return json({ error: "Confirm that you understand the declaration." }, 400);
        if (name.length < 2) return json({ error: "Type your full name to sign." }, 400);
        const { data: prof } = await db().from("profiles").select("full_name, job_title, email").eq("id", actor.userId).maybeSingle();
        const { data: decl, error: dErr } = await db()
          .from("employee_declarations")
          .insert({
            user_id: actor.userId,
            company_name: "Mavis Strategic Partners",
            employee_name: prof?.full_name || actor.fullName,
            position: prof?.job_title || "Team Member",
            id_number: "N/A",
            declaration_date: now.slice(0, 10),
            outside_employment_details: text(body.response, 2000) || null,
            non_solicitation_months: 12,
            confidentiality_acknowledged: true,
            signature_typed_name: name,
          })
          .select()
          .maybeSingle();
        if (dErr) return json({ error: dErr.message }, 500);
        Object.assign(patch, { status: "Signed", signature_name: name, acknowledged: true, signed_at: now, declaration_id: decl?.id ?? null });
      } else {
        const list = Array.isArray(body.files) ? body.files.slice(0, 10) : [];
        const files = [];
        for (const f of list) {
          const ok = await checkFile(f, prefix);
          if (!ok) return json({ error: `"${f?.name || "A file"}" did not finish uploading. Remove it and try again.` }, 400);
          files.push(ok);
        }
        if (!files.length) return json({ error: row.kind === "upload" ? "Attach the requested document." : "Attach the completed document." }, 400);
        Object.assign(patch, { status: "Submitted", submission: files });
      }
      const { data, error } = await db().from("hr_document_requests").update(patch).eq("id", row.id).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      for (const uid of await hrRecipients())
        if (uid !== actor.userId) await notify(uid, `HR document ${patch.status === "Signed" ? "signed" : "submitted"}`, `${actor.fullName} ${patch.status === "Signed" ? "signed" : "submitted"} "${row.title}".`);
      return json({ request: data ?? { ...row, ...patch } });
    }
    return json({ error: "Not found." }, 404);
  }

  // ── HR: manage requests ──────────────────────────────────────────────────
  if (!pathname.startsWith("/api/staff/hr-documents/requests")) return json({ error: "Not found." }, 404);
  if (!r.view) return json({ error: "Only HR can manage document requests." }, 403);

  if (method === "GET" && pathname === "/api/staff/hr-documents/requests") {
    const { data, error } = await db().from("hr_document_requests").select("*").order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    const people = [...actor.org.people.entries()].filter(([, p]) => p.active !== false).map(([id, p]) => ({ id, name: p.name, title: (p as any).title ?? null })).sort((a, b) => a.name.localeCompare(b.name));
    return json({ requests: (data || []).map((x: any) => withNames(actor.org, x)), people, canManage: r.manage });
  }

  const files = pathname.match(/^\/api\/staff\/hr-documents\/requests\/([^/]+)\/files$/);
  if (method === "GET" && files) {
    const { data: row } = await db().from("hr_document_requests").select("*").eq("id", decodeURIComponent(files[1])).maybeSingle();
    if (!row) return json({ error: "Request not found." }, 404);
    return json({ template: await signed(row.template), submission: await Promise.all((row.submission || []).map(signed)) });
  }

  if (!r.manage) return json({ error: "Only HR can change document requests." }, 403);

  if (method === "POST" && pathname === "/api/staff/hr-documents/requests/upload-url")
    return slot(`templates/${actor.userId}`, await request.json().catch(() => ({})));

  if (method === "POST" && pathname === "/api/staff/hr-documents/requests") {
    const body = await request.json().catch(() => ({}));
    const title = text(body.title, 200);
    if (!title) return json({ error: "Give the document a name." }, 400);
    if (!REQUEST_KINDS.includes(body.kind)) return json({ error: "Choose what the employee must do." }, 400);
    const due = text(body.dueDate, 10);
    if (due && !isDate(due)) return json({ error: "Choose a valid deadline." }, 400);
    let template = null;
    if (body.template) {
      template = await checkFile(body.template, `templates/${actor.userId}`);
      if (!template) return json({ error: "The attached document did not finish uploading." }, 400);
    }
    if (body.kind === "sign" && !template) return json({ error: "Attach the document the employee must sign." }, 400);
    const who = resolveAudience(actor.org, body);
    if ("error" in who) return json({ error: who.error }, 400);
    if (!who.ids.length) return json({ error: "Choose at least one employee or department." }, 400);
    const now = new Date().toISOString();
    const batch = crypto.randomUUID();
    const rows = who.ids.map((employee_id) => ({
      batch_id: batch,
      employee_id,
      title,
      kind: body.kind,
      category: text(body.category, 60) || null,
      instructions: text(body.instructions, 4000) || null,
      due_date: due || null,
      audience: who.label,
      template,
      status: "Outstanding",
      requested_by: actor.userId,
      requested_by_name: actor.fullName,
      created_at: now,
      updated_at: now,
    }));
    const { error } = await db().from("hr_document_requests").insert(rows);
    if (error) return json({ error: error.message }, 500);
    const verb = body.kind === "sign" || body.kind === "declaration" ? "sign" : body.kind === "upload" ? "upload" : "complete";
    for (const id of who.ids)
      if (id !== actor.userId) await notify(id, "HR document requested", `HR asked you to ${verb} "${title}"${due ? ` by ${due}` : ""}. Open My HR Documents.`);
    return json({ created: rows.length, batch_id: batch }, 201);
  }

  const one = pathname.match(/^\/api\/staff\/hr-documents\/requests\/([^/]+)$/);
  if (one && method === "PATCH") {
    const { data: row } = await db().from("hr_document_requests").select("*").eq("id", decodeURIComponent(one[1])).maybeSingle();
    if (!row) return json({ error: "Request not found." }, 404);
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const patch: Record<string, any> = { updated_at: now };
    const before = { status: row.status };
    if (body.action === "accept" || body.action === "return") {
      if (!["Submitted", "Signed"].includes(row.status)) return json({ error: "Only submitted or signed documents can be reviewed." }, 409);
      const note = text(body.note, 2000);
      if (body.action === "return" && !note) return json({ error: "Tell the employee what to change." }, 400);
      Object.assign(patch, { status: body.action === "accept" ? "Accepted" : "Returned", review_note: note || null, reviewed_by: actor.userId, reviewed_by_name: actor.fullName, reviewed_at: now });
    } else if (body.action === "cancel") {
      if (row.status === "Cancelled") return json({ error: "Already cancelled." }, 409);
      patch.status = "Cancelled";
    } else {
      if (body.dueDate !== undefined) {
        const due = text(body.dueDate, 10);
        if (due && !isDate(due)) return json({ error: "Choose a valid deadline." }, 400);
        patch.due_date = due || null;
      }
      if (body.instructions !== undefined) patch.instructions = text(body.instructions, 4000) || null;
      if (body.title !== undefined) {
        const t = text(body.title, 200);
        if (!t) return json({ error: "Give the document a name." }, 400);
        patch.title = t;
      }
    }
    const { data, error } = await db().from("hr_document_requests").update(patch).eq("id", row.id).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (patch.status === "Accepted") await notify(row.employee_id, "HR document accepted", `HR accepted "${row.title}".`);
    if (patch.status === "Returned") await notify(row.employee_id, "HR document returned", `HR returned "${row.title}" for changes: ${patch.review_note}`);
    if (patch.status === "Cancelled" && before.status !== "Cancelled") await notify(row.employee_id, "HR document request cancelled", `HR no longer needs "${row.title}".`);
    return json({ request: withNames(actor.org, data ?? { ...row, ...patch }) });
  }

  return json({ error: "Not found." }, 404);
}
