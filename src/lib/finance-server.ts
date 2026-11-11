/**
 * Finance & Administration Command Centre API (server only), mounted under /api/staff/finance.
 *
 * Records: invoices (incl. payment verification), expenses, approval requests and budgets, in the
 * existing finance_* tables. Every change is checked and saved here, then written to the finance
 * audit trail with the real person's name. The audit trail itself cannot be edited or deleted.
 *
 * Who may do what (same rule as the database's row-level security on the finance tables):
 *  - view: the Finance & Administration manager, the General Manager, administrators and the CEO;
 *  - create / edit / delete / verify / decide: the Finance & Administration manager, the General
 *    Manager and administrators. The CEO has read-only oversight.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AccessFlags } from "@/lib/roles";
import { randText as zar } from "@/lib/finance-format";

type Actor = { userId: string; fullName: string; access: AccessFlags };
const db = () => supabaseAdmin as any;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const INVOICE_STATUSES = ["Awaiting Payment", "Paid & Verified", "Overdue"] as const;
export const EXPENSE_CATEGORIES = ["Software & SaaS", "Media & Tools", "Contractor Payouts", "Operations & Office", "Legal & Compliance"] as const;
export const EXPENSE_STATUSES = ["Paid", "Pending Approval", "Scheduled"] as const;
export const APPROVAL_CATEGORIES = ["Software", "Contractor", "Equipment", "Client Refund", "Operational"] as const;
export const APPROVAL_STATUSES = ["Pending", "Approved", "Declined"] as const;

const TABLE: Record<string, string> = { invoices: "finance_invoices", expenses: "finance_expenses", approvals: "finance_approvals", budgets: "finance_budgets" };
const LABEL: Record<string, string> = { invoices: "Invoice", expenses: "Expense", approvals: "Approval request", budgets: "Budget" };

export function financeRights(a: AccessFlags) {
  const edit = a.isFinance || a.isGM || a.isAdmin;
  return { view: edit || a.isCEO, edit };
}

const text = (v: any, max = 200) => String(v ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const money = (v: any): number | null => {
  const n = Number(typeof v === "string" ? v.replace(/[R\s,]/g, "") : v);
  return Number.isFinite(n) && n >= 0 && n < 1e12 ? Math.round(n * 100) / 100 : null;
};
const today = () => new Date().toISOString().slice(0, 10);
const stamp = () => new Date().toLocaleString("sv-SE", { timeZone: "Africa/Johannesburg" }).slice(0, 16);

type Clean = { ok: true; row: Record<string, any> } | { ok: false; error: string };

/** Validate the fields of a record. `partial` = only the fields sent are checked (edits). */
export function cleanFinance(kind: string, b: any, partial: boolean): Clean {
  const row: Record<string, any> = {};
  const has = (k: string) => b?.[k] !== undefined;
  const need = (k: string) => !partial || has(k);
  if (kind === "invoices") {
    if (need("client")) { const v = text(b.client, 160); if (!v) return { ok: false, error: "Enter the client's name." }; row.client = v; }
    if (has("package") || !partial) row.package = text(b.package, 160) || null;
    if (need("monthlyServiceFeeZar")) { const v = money(b.monthlyServiceFeeZar); if (v === null) return { ok: false, error: "Enter the agency fee in rand (0 or more)." }; row.monthlyServiceFeeZar = v; }
    if (need("dueDate")) { const v = text(b.dueDate, 10); if (!isDate(v)) return { ok: false, error: "Choose a valid due date." }; row.dueDate = v; }
    if (has("paymentStatus") || !partial) {
      const v = b.paymentStatus ?? "Awaiting Payment";
      if (!INVOICE_STATUSES.includes(v)) return { ok: false, error: "Choose a valid payment status." };
      row.paymentStatus = v;
    }
    if (has("invoiceNumber")) { const v = text(b.invoiceNumber, 40); if (!v) return { ok: false, error: "The invoice number cannot be empty." }; row.invoiceNumber = v; }
  } else if (kind === "expenses") {
    if (need("vendor")) { const v = text(b.vendor, 160); if (!v) return { ok: false, error: "Enter the vendor or payee." }; row.vendor = v; }
    if (need("category")) { if (!EXPENSE_CATEGORIES.includes(b.category)) return { ok: false, error: "Choose a valid category." }; row.category = b.category; }
    if (need("amountZar")) { const v = money(b.amountZar); if (v === null || v === 0) return { ok: false, error: "Enter the amount in rand." }; row.amountZar = v; }
    if (has("date") || !partial) { const v = text(b.date, 10) || today(); if (!isDate(v)) return { ok: false, error: "Choose a valid date." }; row.date = v; }
    if (has("status") || !partial) { const v = b.status ?? "Paid"; if (!EXPENSE_STATUSES.includes(v)) return { ok: false, error: "Choose a valid status." }; row.status = v; }
  } else if (kind === "approvals") {
    if (need("title")) { const v = text(b.title, 200); if (!v) return { ok: false, error: "Describe what the money is for." }; row.title = v; }
    if (need("department")) { const v = text(b.department, 80); if (!v) return { ok: false, error: "Choose the department." }; row.department = v; }
    if (need("requestedBy")) { const v = text(b.requestedBy, 120); if (!v) return { ok: false, error: "Enter who requested it." }; row.requestedBy = v; }
    if (need("amountZar")) { const v = money(b.amountZar); if (v === null || v === 0) return { ok: false, error: "Enter the amount in rand." }; row.amountZar = v; }
    if (need("category")) { if (!APPROVAL_CATEGORIES.includes(b.category)) return { ok: false, error: "Choose a valid category." }; row.category = b.category; }
    if (has("date") || !partial) { const v = text(b.date, 10) || today(); if (!isDate(v)) return { ok: false, error: "Choose a valid date." }; row.date = v; }
    if (has("notes") || !partial) row.notes = text(b.notes, 2000) || null;
    if (!partial) row.status = "Pending";
  } else if (kind === "budgets") {
    if (need("dept")) { const v = text(b.dept, 80); if (!v) return { ok: false, error: "Choose the department." }; row.dept = v; }
    if (need("budget")) { const v = money(b.budget); if (v === null || v === 0) return { ok: false, error: "Enter the budget in rand." }; row.budget = v; }
    if (has("actual") || !partial) { const v = money(b.actual ?? 0); if (v === null) return { ok: false, error: "Enter actual spend in rand (0 or more)." }; row.actual = v; }
  } else return { ok: false, error: "Unknown record type." };
  return { ok: true, row };
}

function describe(kind: string, r: any) {
  if (kind === "invoices") return `${r.invoiceNumber ?? ""} ${r.client ?? ""} (${zar(r.monthlyServiceFeeZar ?? 0)})`.trim();
  if (kind === "expenses") return `${r.vendor} (${zar(r.amountZar ?? 0)})`;
  if (kind === "approvals") return `${r.title} (${zar(r.amountZar ?? 0)})`;
  return `${r.dept}: budget ${zar(r.budget ?? 0)}, actual ${zar(r.actual ?? 0)}`;
}

/** Which fields changed, in words, for the audit trail. */
function changes(before: any, after: Record<string, any>) {
  return Object.keys(after)
    .filter((k) => String(before?.[k] ?? "") !== String(after[k] ?? ""))
    .map((k) => `${k}: ${before?.[k] ?? "—"} → ${after[k] ?? "—"}`)
    .join("; ");
}

async function audit(actor: Actor, action: string, detail: string) {
  await db().from("finance_audit_trail").insert({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: stamp(),
    actor: actor.fullName,
    action,
    detail: detail.slice(0, 1000),
  });
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const { data } = await db().from("finance_invoices").select("invoiceNumber");
  const nums = (data || [])
    .map((r: any) => String(r.invoiceNumber || "").match(new RegExp(`^INV-${year}-(\\d+)$`)))
    .filter(Boolean)
    .map((m: any) => Number(m[1]));
  return `INV-${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
}

export async function handleFinanceApi(request: Request, url: URL, actor: Actor): Promise<Response | null> {
  const { pathname } = url;
  if (!pathname.startsWith("/api/staff/finance")) return null;
  const method = request.method;
  const r = financeRights(actor.access);
  if (!r.view) return json({ error: "Only Finance & Administration, the General Manager, administrators and the CEO can open finance records." }, 403);

  if (method === "GET" && pathname === "/api/staff/finance") {
    const [inv, exp, app, bud, aud] = await Promise.all(
      ["finance_invoices", "finance_expenses", "finance_approvals", "finance_budgets", "finance_audit_trail"].map((t) => db().from(t).select("*")),
    );
    const err = [inv, exp, app, bud, aud].find((x: any) => x.error);
    if (err) return json({ error: err.error.message }, 500);
    const byDate = (k: string) => (a: any, b: any) => String(b[k] ?? b.created_at ?? "").localeCompare(String(a[k] ?? a.created_at ?? ""));
    return json({
      invoices: (inv.data || []).sort(byDate("created_at")),
      expenses: (exp.data || []).sort(byDate("date")),
      approvals: (app.data || []).sort(byDate("date")),
      budgets: (bud.data || []).sort((a: any, b: any) => String(a.dept).localeCompare(String(b.dept))),
      audit: (aud.data || []).sort(byDate("time")),
      canEdit: r.edit,
      me: actor.fullName,
    });
  }

  if (!r.edit) return json({ error: "You can view finance records but not change them." }, 403);

  // POST /api/staff/finance/invoices/:id/verify -> payment verification gate
  const verify = pathname.match(/^\/api\/staff\/finance\/invoices\/([^/]+)\/verify$/);
  if (method === "POST" && verify) {
    const id = decodeURIComponent(verify[1]);
    const { data: inv } = await db().from("finance_invoices").select("*").eq("id", id).maybeSingle();
    if (!inv) return json({ error: "Invoice not found." }, 404);
    if (inv.paymentStatus === "Paid & Verified") return json({ error: "This payment is already verified." }, 409);
    const patch = { paymentStatus: "Paid & Verified", verifiedAt: stamp(), verifiedBy: actor.fullName, updated_at: new Date().toISOString() };
    const { data, error } = await db().from("finance_invoices").update(patch).eq("id", id).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    await audit(actor, "Payment verified", describe("invoices", { ...inv, ...patch }));
    return json({ record: data ?? { ...inv, ...patch } });
  }

  // POST /api/staff/finance/approvals/:id/decision {status: Approved|Declined}
  const decide = pathname.match(/^\/api\/staff\/finance\/approvals\/([^/]+)\/decision$/);
  if (method === "POST" && decide) {
    const id = decodeURIComponent(decide[1]);
    const body = await request.json().catch(() => ({}));
    if (!["Approved", "Declined"].includes(body.status)) return json({ error: "Choose Approve or Decline." }, 400);
    const { data: app } = await db().from("finance_approvals").select("*").eq("id", id).maybeSingle();
    if (!app) return json({ error: "Approval request not found." }, 404);
    if (app.status !== "Pending") return json({ error: `This request was already ${String(app.status).toLowerCase()}.` }, 409);
    const { data, error } = await db().from("finance_approvals").update({ status: body.status, updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    await audit(actor, `Expenditure ${String(body.status).toLowerCase()}`, describe("approvals", app));
    return json({ record: data ?? { ...app, status: body.status } });
  }

  // POST /api/staff/finance/:kind -> create
  const create = pathname.match(/^\/api\/staff\/finance\/(invoices|expenses|approvals|budgets)$/);
  if (method === "POST" && create) {
    const kind = create[1];
    const body = await request.json().catch(() => ({}));
    const c = cleanFinance(kind, body, false);
    if (!c.ok) return json({ error: c.error }, 400);
    const row: Record<string, any> = { ...c.row, id: `${kind.slice(0, 3)}-${crypto.randomUUID()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (kind === "invoices") {
      row.invoiceNumber = c.row.invoiceNumber || (await nextInvoiceNumber());
      const { data: dup } = await db().from("finance_invoices").select("id").eq("invoiceNumber", row.invoiceNumber).limit(1);
      if (dup?.length) return json({ error: `Invoice number ${row.invoiceNumber} is already used.` }, 409);
    }
    if (kind === "invoices" && row.paymentStatus === "Paid & Verified") Object.assign(row, { verifiedAt: stamp(), verifiedBy: actor.fullName });
    if (kind === "expenses") row.approvedBy = actor.fullName;
    if (kind === "budgets") {
      const { data: dup } = await db().from("finance_budgets").select("id").eq("dept", row.dept).limit(1);
      if (dup?.length) return json({ error: `${row.dept} already has a budget. Edit it instead.` }, 409);
    }
    const { data, error } = await db().from(TABLE[kind]).insert(row).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    await audit(actor, `${LABEL[kind]} created`, describe(kind, row));
    return json({ record: data ?? row }, 201);
  }

  // PATCH / DELETE /api/staff/finance/:kind/:id
  const one = pathname.match(/^\/api\/staff\/finance\/(invoices|expenses|approvals|budgets)\/([^/]+)$/);
  if (one && (method === "PATCH" || method === "DELETE")) {
    const kind = one[1];
    const id = decodeURIComponent(one[2]);
    const { data: found } = await db().from(TABLE[kind]).select("*").eq("id", id).maybeSingle();
    if (!found) return json({ error: `${LABEL[kind]} not found. It may already have been deleted.` }, 404);
    const before = { ...found };
    if (method === "DELETE") {
      const { error } = await db().from(TABLE[kind]).delete().eq("id", id);
      if (error) return json({ error: error.message }, 500);
      await audit(actor, `${LABEL[kind]} deleted`, describe(kind, before));
      return json({ ok: true });
    }
    const body = await request.json().catch(() => ({}));
    const c = cleanFinance(kind, body, true);
    if (!c.ok) return json({ error: c.error }, 400);
    const patch: Record<string, any> = { ...c.row };
    if (kind === "invoices" && patch.invoiceNumber && patch.invoiceNumber !== before.invoiceNumber) {
      const { data: dup } = await db().from("finance_invoices").select("id").eq("invoiceNumber", patch.invoiceNumber).neq("id", id).limit(1);
      if (dup?.length) return json({ error: `Invoice number ${patch.invoiceNumber} is already used.` }, 409);
    }
    if (kind === "invoices" && patch.paymentStatus) {
      if (patch.paymentStatus === "Paid & Verified" && before.paymentStatus !== "Paid & Verified") Object.assign(patch, { verifiedAt: stamp(), verifiedBy: actor.fullName });
      if (patch.paymentStatus !== "Paid & Verified") Object.assign(patch, { verifiedAt: null, verifiedBy: null });
    }
    if (kind === "budgets" && patch.dept && patch.dept !== before.dept) {
      const { data: dup } = await db().from("finance_budgets").select("id").eq("dept", patch.dept).neq("id", id).limit(1);
      if (dup?.length) return json({ error: `${patch.dept} already has a budget.` }, 409);
    }
    const what = changes(before, patch);
    if (!what) return json({ record: before, unchanged: true });
    patch.updated_at = new Date().toISOString();
    const { data, error } = await db().from(TABLE[kind]).update(patch).eq("id", id).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);
    await audit(actor, `${LABEL[kind]} edited`, `${describe(kind, before)} — ${what}`);
    return json({ record: data ?? { ...before, ...patch } });
  }

  if (/^\/api\/staff\/finance\/audit/.test(pathname)) return json({ error: "The audit trail cannot be changed." }, 405);
  return json({ error: "Not found." }, 404);
}
