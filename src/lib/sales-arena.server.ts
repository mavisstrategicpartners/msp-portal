/**
 * /api/sales-arena — the Sales Arena module (from "MSP Sales Arena.xlsx").
 *
 * Every permission decision is made here, on the server, from the verified Supabase token.
 * The tables have row-level security with no browser policies, so this API (service role) is the
 * only way in. Who may do what:
 *
 *  CEO (explicit "ceo" role grant): company dashboard, monthly leaderboard and rankings, every
 *    salesperson's targets and figures, all pipeline/activity/lead-magnet/payment records, target
 *    and salesperson management, exports.
 *  Linked salesperson (an active sales_people row whose profile_id is the caller): their own
 *    targets and performance, pipeline deals where they are the salesperson or the lead setter,
 *    their own setter activity (or activity where they are the assigned closer), lead magnets
 *    they own, and receipts credited to them. Never another person's figures or any ranking.
 *  Report preparer (lead magnet prepared_by_profile = caller): that lead magnet only.
 *  Everyone else — HR, Finance, Operations, department managers, the General Manager, ordinary
 *    administrators and the Root Administrator — no Sales Arena data. No existing permission
 *    grants it, and administrator rights deliberately do not.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest, type ApiUser } from "@/lib/api-auth.server";
import { canViewSalesLeaderboard } from "@/lib/roles";
import * as L from "@/lib/sales-arena-shared";

const db = () => supabaseAdmin as any;
const BUCKET = "sales-reports";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const deny = (msg = "You do not have access to this Sales Arena information.") => json({ error: msg }, 403);
const bad = (msg: string) => json({ error: msg }, 400);

type Person = { id: string; display_name: string; profile_id: string | null; is_closer: boolean; is_setter: boolean; is_active: boolean; sort_order: number };
type Ctx = { user: ApiUser; isCEO: boolean; me: Person | null; people: Person[] };

// ── helpers ──────────────────────────────────────────────────────────────────
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;
const money = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[R\s,]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
};
const dateOrNull = (v: unknown) => (v === null || v === undefined || v === "" ? null : L.isIsoDate(v) ? v : undefined);
const oneOf = <T extends readonly string[]>(list: T, v: unknown) => (v === null || v === undefined || v === "" ? null : (list as readonly string[]).includes(String(v)) ? String(v) : undefined);
const upper = (s: string | null | undefined) => (s ? s.trim().toUpperCase() : "");
const url = (v: unknown) => {
  const s = str(v, 1000);
  if (!s) return null;
  return /^https?:\/\/\S+$/i.test(s) ? s : undefined;
};

async function audit(ctx: Ctx, entity: string, entityId: string | null, action: string, before: any, after: any) {
  try {
    await db().from("sales_arena_audit").insert({ entity, entity_id: entityId, action, before, after, actor_id: ctx.user.userId, actor_name: ctx.user.fullName || ctx.user.email });
  } catch (e) {
    console.warn("[sales-arena] audit insert failed", e);
  }
}
function changed(before: any, after: any) {
  const b: any = {}, a: any = {};
  for (const k of Object.keys(after)) if (k !== "updated_at" && JSON.stringify(before?.[k] ?? null) !== JSON.stringify(after[k] ?? null)) { b[k] = before?.[k] ?? null; a[k] = after[k]; }
  return { b, a, any: Object.keys(a).length > 0 };
}
async function rows(table: string, build?: (q: any) => any): Promise<any[]> {
  let q = db().from(table).select("*");
  if (build) q = build(q);
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}
async function one(table: string, id: string) {
  const { data } = await db().from(table).select("*").eq("id", id).maybeSingle();
  return data || null;
}
const nameOf = (ctx: Ctx, id: string | null | undefined) => (id ? ctx.people.find((p) => p.id === id)?.display_name ?? "Unknown" : null);
async function opportunityByRef(ref: string | null) {
  if (!ref) return null;
  const all = await rows("sales_opportunities");
  return all.find((o) => upper(o.deal_ref) === upper(ref)) || null;
}
const isoMonth = (m: unknown) => (L.isMonth(m) ? (m as string) : null);
/** "YYYY-MM-DDTHH:mm" in South African time → ISO timestamp. */
function saTimestamp(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
  if (!m) return undefined;
  if (!L.isIsoDate(m[1])) return undefined;
  return new Date(`${m[1]}T${m[2] ?? "00"}:${m[3] ?? "00"}:00+02:00`).toISOString();
}

// ── scope ────────────────────────────────────────────────────────────────────
const ownsDeal = (ctx: Ctx, o: any) => ctx.isCEO || (!!ctx.me && (o.salesperson_id === ctx.me.id || o.setter_id === ctx.me.id));
const ownsActivity = (ctx: Ctx, a: any) => ctx.isCEO || (!!ctx.me && (a.setter_id === ctx.me.id || a.closer_id === ctx.me.id));
const ownsPayment = (ctx: Ctx, p: any) => ctx.isCEO || (!!ctx.me && p.salesperson_id === ctx.me.id);
const ownsMagnet = (ctx: Ctx, m: any) => ctx.isCEO || (!!ctx.me && m.sales_owner_id === ctx.me.id) || m.prepared_by_profile === ctx.user.userId;

// ── serialisers (names resolved server-side; no colleague figures leak through) ──
function dealOut(ctx: Ctx, o: any, today: string) {
  return {
    ...o,
    salesperson_name: nameOf(ctx, o.salesperson_id),
    setter_name: nameOf(ctx, o.setter_id),
    follow_up_status: L.followUpStatus(o.next_follow_up, today, o.stage === "Won" || o.stage === "Lost"),
  };
}
function activityOut(ctx: Ctx, a: any, today: string) {
  return {
    ...a,
    setter_name: nameOf(ctx, a.setter_id),
    closer_name: nameOf(ctx, a.closer_id),
    date_pending: !a.activity_at,
    follow_up_status: L.followUpStatus(a.next_follow_up, today, false, Boolean(a.follow_up_done_at)),
  };
}
function magnetOut(ctx: Ctx, m: any, today: string) {
  const { report_file, ...rest } = m;
  return {
    ...rest,
    has_file: Boolean(report_file),
    file_name: report_file?.name ?? null,
    sales_owner_name: nameOf(ctx, m.sales_owner_id),
    delivery_status: L.magnetDelivery(m, today),
    follow_up_status: L.followUpStatus(m.next_follow_up, today, m.workflow_status === "Declined" || Boolean(m.discussed_date), Boolean(m.follow_up_done_at)),
    can_edit: ownsMagnet(ctx, m),
  };
}
function paymentOut(ctx: Ctx, p: any) {
  return { ...p, salesperson_name: nameOf(ctx, p.salesperson_id), date_pending: !p.receipt_date };
}

// ── dashboard (CEO) ─────────────────────────────────────────────────────────
async function monthTargets(month: string) {
  const all = await rows("sales_targets", (q) => q.eq("month", `${month}-01`));
  const cash = all.filter((t) => t.kind === "cash");
  return {
    company: cash.find((t) => !t.salesperson_id) ?? null,
    byPerson: new Map<string, number>(cash.filter((t) => t.salesperson_id).map((t) => [t.salesperson_id, Number(t.amount)])),
    setter: all.filter((t) => t.kind !== "cash"),
  };
}

async function ceoDashboard(ctx: Ctx, month: string, reportingDate: string) {
  const p = L.period(reportingDate);
  const today = L.todayZA();
  const [payments, deals, acts, magnets, t] = await Promise.all([
    rows("sales_payments"),
    rows("sales_opportunities"),
    rows("sales_setter_activities"),
    rows("sales_lead_magnets"),
    monthTargets(month),
  ]);
  const monthPays = payments.map((x) => ({ ...x, amount: Number(x.amount), revenue_month: String(x.revenue_month).slice(0, 10) }));
  // Leaderboard: active people, plus anyone credited with cash or a target this month.
  const ids = new Set(ctx.people.filter((x) => x.is_active).map((x) => x.id));
  for (const x of monthPays) if (x.revenue_month === p.monthStart) ids.add(x.salesperson_id);
  for (const id of t.byPerson.keys()) ids.add(id);
  const people = ctx.people.filter((x) => ids.has(x.id));
  const ct = L.companyTarget(t.company ? Number(t.company.amount) : null, people.map((x) => t.byPerson.get(x.id) ?? 0));
  const company = L.performanceRow(null, "MSP company", ct.total, monthPays, p);
  const leaderboard = L.applyRanks(people.map((x) => L.performanceRow(x.id, x.display_name, t.byPerson.get(x.id) ?? 0, monthPays, p)))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999) || b.target.month - a.target.month || a.name.localeCompare(b.name));

  // Monthly trend: last 12 months, cash by revenue month vs that month's company target.
  const allTargets = await rows("sales_targets");
  const trend = [];
  for (let i = 11; i >= 0; i--) {
    const m = L.shiftMonth(month, -i);
    const mt = allTargets.filter((x) => x.kind === "cash" && String(x.month).slice(0, 7) === m);
    const ctm = L.companyTarget(Number(mt.find((x) => !x.salesperson_id)?.amount ?? 0) || null, mt.filter((x) => x.salesperson_id).map((x) => Number(x.amount)));
    trend.push({ month: m, target: ctm.total, actual: Math.round(monthPays.filter((x) => x.revenue_month.slice(0, 7) === m).reduce((s, x) => s + x.amount, 0) * 100) / 100 });
  }

  const stages = L.STAGES.map((s) => ({ stage: s, count: deals.filter((d) => d.stage === s).length }));
  const setter = L.setterSummary(acts, month);
  const bySetter = ctx.people
    .map((x) => ({ id: x.id, name: x.display_name, ...L.setterSummary(acts, month, x.id) }))
    .filter((x) => x.attempts > 0 || ctx.people.find((y) => y.id === x.id)?.is_setter);
  const delivery = magnets.map((m) => ({ m, s: L.magnetDelivery(m, today) }));
  const inMonth = (d: string | null) => !!d && d >= p.monthStart && d <= p.reportingDate;
  return {
    period: p,
    company: { ...company, targetBreakdown: ct },
    leaderboard,
    weeklyPlan: L.weeklyPlan(month, ct.total, people.map((x) => ({ id: x.id, name: x.display_name, monthly: t.byPerson.get(x.id) ?? 0 }))),
    dailyPace: L.dailyPace(month, ct.total, monthPays, reportingDate),
    trend,
    pipeline: {
      stages,
      open: deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length,
      quotedOpen: deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").reduce((s, d) => s + (Number(d.quoted_fee) || 0), 0),
      signedWonThisMonth: deals.filter((d) => d.stage === "Won").reduce((s, d) => s + (Number(d.signed_value) || 0), 0),
      overdueFollowUps: deals.filter((d) => L.followUpStatus(d.next_follow_up, today, d.stage === "Won" || d.stage === "Lost") === "Overdue").length,
    },
    setter: { ...setter, bySetter, dailyCalls: L.dailyCalls(acts, month, reportingDate) },
    leadMagnets: {
      completedThisMonth: magnets.filter((m) => inMonth(m.completed_date) && (m.report_link || m.report_file)).length,
      sentThisMonth: magnets.filter((m) => inMonth(m.sent_date) && m.completed_date && (m.report_link || m.report_file)).length,
      completedNotSent: delivery.filter((x) => x.s === "Completed - not sent").length,
      overduePreparation: delivery.filter((x) => x.s === "Overdue preparation").length,
      detailsPending: delivery.filter((x) => x.s === "Completed - details pending").length,
    },
  };
}

async function myDashboard(ctx: Ctx, month: string, reportingDate: string) {
  const me = ctx.me!;
  const p = L.period(reportingDate);
  const today = L.todayZA();
  const [payments, deals, acts, t] = await Promise.all([
    rows("sales_payments", (q) => q.eq("salesperson_id", me.id)),
    rows("sales_opportunities"),
    rows("sales_setter_activities", (q) => q.eq("setter_id", me.id)),
    monthTargets(month),
  ]);
  const mine = payments.map((x) => ({ ...x, amount: Number(x.amount), revenue_month: String(x.revenue_month).slice(0, 10) }));
  const myDeals = deals.filter((d) => d.salesperson_id === me.id || d.setter_id === me.id);
  const row = L.performanceRow(me.id, me.display_name, t.byPerson.get(me.id) ?? 0, mine, p);
  row.rank = null; // never a ranking for staff
  return {
    period: p,
    me: { id: me.id, name: me.display_name, is_setter: me.is_setter, is_closer: me.is_closer },
    performance: row,
    weeklyPlan: L.weeklyPlan(month, t.byPerson.get(me.id) ?? 0, []).map(({ people: _omit, ...w }) => w),
    trend: Array.from({ length: 6 }, (_, i) => {
      const m = L.shiftMonth(month, i - 5);
      return { month: m, actual: Math.round(mine.filter((x) => x.revenue_month.slice(0, 7) === m).reduce((s, x) => s + x.amount, 0) * 100) / 100 };
    }),
    pipeline: L.STAGES.map((s) => ({ stage: s, count: myDeals.filter((d) => d.stage === s).length })),
    followUps: myDeals
      .map((d) => dealOut(ctx, d, today))
      .filter((d) => ["Overdue", "Due today", "Set follow-up"].includes(d.follow_up_status))
      .slice(0, 20),
    setter: me.is_setter || acts.length ? L.setterSummary(acts, month, me.id) : null,
    setterTargets: t.setter.filter((x) => x.salesperson_id === me.id).map((x) => ({ kind: x.kind, amount: Number(x.amount) })),
  };
}

// ── CSV export (CEO only) ───────────────────────────────────────────────────
function csv(header: string[], data: any[][]) {
  const cell = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // no spreadsheet formula injection
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [header, ...data].map((r) => r.map(cell).join(",")).join("\n");
}

// ── handler ─────────────────────────────────────────────────────────────────
export async function handleSalesArenaApi(request: Request): Promise<Response> {
  const u = new URL(request.url);
  const path = u.pathname.replace(/\/+$/, "");
  const method = request.method;
  const user = await authenticateApiRequest(request);
  if (!user) return json({ error: "Please sign in." }, 401);

  const people: Person[] = (await rows("sales_people")).sort((a, b) => a.sort_order - b.sort_order || a.display_name.localeCompare(b.display_name));
  const isCEO = canViewSalesLeaderboard(user.access);
  const me = people.find((x) => x.profile_id === user.userId && x.is_active) ?? null;
  const ctx: Ctx = { user, isCEO, me, people };
  const body = method === "GET" ? {} : await request.json().catch(() => ({}));
  const today = L.todayZA();

  try {
    // Who am I in the Sales Arena (used by the menu and the pages).
    if (path === "/api/sales-arena/me" && method === "GET") {
      const preparer = !isCEO && !me ? (await rows("sales_lead_magnets")).some((m) => m.prepared_by_profile === user.userId) : false;
      return json({
        isCEO,
        salesperson: me ? { id: me.id, name: me.display_name, is_setter: me.is_setter, is_closer: me.is_closer } : null,
        isPreparer: preparer,
        // Names only, for pickers (assigned closer, lead setter). No figures.
        people: isCEO || me ? people.filter((x) => x.is_active).map((x) => ({ id: x.id, name: x.display_name, is_setter: x.is_setter, is_closer: x.is_closer })) : [],
      });
    }

    const month = isoMonth(u.searchParams.get("month")) ?? today.slice(0, 7);
    const dateParam = u.searchParams.get("date");
    const reportingDate = L.isIsoDate(dateParam) && dateParam.slice(0, 7) === month ? dateParam : L.defaultReportingDate(month, today);

    // ── CEO-only: dashboard, leaderboard, rankings, people, target management, exports ──
    if (path === "/api/sales-arena/dashboard" && method === "GET") {
      if (!isCEO) return deny("The company sales dashboard and leaderboard are restricted to the CEO.");
      return json(await ceoDashboard(ctx, month, reportingDate));
    }
    if (path.startsWith("/api/sales-arena/export/") && method === "GET") {
      if (!isCEO) return deny("Sales Arena exports are restricted to the CEO.");
      const kind = path.split("/").pop();
      let out = "";
      if (kind === "leaderboard") {
        const d = await ceoDashboard(ctx, month, reportingDate);
        out = csv(["Rank", "Salesperson", "Month target", "Month actual", "Month %", "Week target", "Week actual", "Day target", "Day actual", "Remaining", "Dates pending"],
          [d.company, ...d.leaderboard].map((r: any) => [r.rank ?? "", r.name, r.target.month, r.actual.month, r.pct.month.value ?? r.pct.month.label, r.target.week, r.actual.week, r.target.day, r.actual.day, r.remaining, r.datesPending ? "Yes" : "No"]));
      } else if (kind === "payments") {
        const all = (await rows("sales_payments")).filter((x) => !u.searchParams.get("month") || String(x.revenue_month).startsWith(month));
        out = csv(["Receipt date", "Revenue month", "Salesperson", "Client", "Service", "Deal ID", "Invoice ref", "MSP fee (R)", "Receipt type", "Payment ref", "Notes"],
          all.map((x) => [x.receipt_date ?? "Date pending", String(x.revenue_month).slice(0, 7), nameOf(ctx, x.salesperson_id), x.client, x.service, x.deal_ref, x.invoice_ref, x.amount, x.receipt_type, x.payment_ref, x.notes]));
      } else if (kind === "pipeline") {
        const all = await rows("sales_opportunities");
        out = csv(["Deal ID", "Received", "Salesperson", "Company", "Contact", "Phone", "Email", "Industry", "Service", "Source", "Stage", "Quoted fee", "Signed value", "Expected close", "Next follow-up", "Next action", "Lost reason", "Lead setter"],
          all.map((o) => [o.deal_ref, o.received_date, nameOf(ctx, o.salesperson_id), o.company, o.contact_name, o.phone, o.email, o.industry, o.service, o.lead_source, o.stage, o.quoted_fee, o.signed_value, o.expected_close, o.next_follow_up, o.next_action, o.lost_reason, nameOf(ctx, o.setter_id)]));
      } else if (kind === "activity") {
        const all = (await rows("sales_setter_activities")).filter((a) => String(a.activity_month).startsWith(month));
        out = csv(["Date/time", "Month", "Lead setter", "Lead ID", "Company", "Activity", "Result", "Qualified", "Meeting booked", "Appointment", "Closer", "Next follow-up", "Minutes", "Notes"],
          all.map((a) => [a.activity_at ?? "Date pending", String(a.activity_month).slice(0, 7), nameOf(ctx, a.setter_id), a.deal_ref, a.company, a.activity_type, a.result, a.qualified ? "Yes" : "No", a.meeting_booked ? "Yes" : "No", a.appointment_at, nameOf(ctx, a.closer_id), a.next_follow_up, a.call_minutes, a.notes]));
      } else return bad("Unknown export.");
      return new Response(out, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sales-arena-${kind}-${month}.csv"`, "Cache-Control": "no-store" } });
    }

    if (path === "/api/sales-arena/people") {
      if (!isCEO) return deny();
      if (method === "GET") {
        const { data: profiles } = await db().from("profiles").select("id, full_name, email, is_active");
        return json({ people, profiles: (profiles || []).filter((x: any) => x.is_active !== false).map((x: any) => ({ id: x.id, name: x.full_name || x.email, email: x.email })) });
      }
      if (method === "POST") {
        const name = str(body.display_name, 120);
        if (!name || name.length < 2) return bad("Enter the salesperson's name.");
        if (people.some((x) => x.display_name.trim().toLowerCase() === name.toLowerCase())) return json({ error: "A salesperson with this name already exists." }, 409);
        const profileId = str(body.profile_id, 64);
        if (profileId && people.some((x) => x.profile_id === profileId)) return json({ error: "That portal account is already linked to a salesperson." }, 409);
        const row = { display_name: name, profile_id: profileId, is_closer: body.is_closer !== false, is_setter: Boolean(body.is_setter), is_active: true, sort_order: people.length + 1, created_by: user.userId };
        const { data, error } = await db().from("sales_people").insert(row).select();
        if (error) return bad(error.message);
        const created = Array.isArray(data) ? data[0] : data;
        await audit(ctx, "salesperson", created?.id ?? null, "created", null, row);
        return json({ person: created }, 201);
      }
    }
    const pm = path.match(/^\/api\/sales-arena\/people\/([0-9a-f-]{36})$/);
    if (pm && method === "PATCH") {
      if (!isCEO) return deny();
      const before = people.find((x) => x.id === pm[1]);
      if (!before) return json({ error: "Not found." }, 404);
      const patch: any = {};
      if (body.display_name !== undefined) {
        const n = str(body.display_name, 120);
        if (!n || n.length < 2) return bad("Enter the salesperson's name.");
        if (people.some((x) => x.id !== before.id && x.display_name.trim().toLowerCase() === n.toLowerCase())) return json({ error: "A salesperson with this name already exists." }, 409);
        patch.display_name = n;
      }
      if (body.profile_id !== undefined) {
        const pid = str(body.profile_id, 64);
        if (pid && people.some((x) => x.id !== before.id && x.profile_id === pid)) return json({ error: "That portal account is already linked to a salesperson." }, 409);
        patch.profile_id = pid;
      }
      for (const k of ["is_closer", "is_setter", "is_active"]) if (body[k] !== undefined) patch[k] = Boolean(body[k]);
      patch.updated_at = new Date().toISOString();
      await db().from("sales_people").update(patch).eq("id", before.id);
      const c = changed(before, patch);
      if (c.any) await audit(ctx, "salesperson", before.id, "updated", c.b, c.a);
      return json({ ok: true });
    }

    // ── Targets: CEO manages; a salesperson sees only their own ──
    if (path === "/api/sales-arena/targets" && method === "GET") {
      const t = await monthTargets(month);
      const p = L.period(reportingDate);
      if (isCEO) {
        const individual = people.map((x) => ({ id: x.id, name: x.display_name, is_active: x.is_active, is_setter: x.is_setter, monthly: t.byPerson.get(x.id) ?? 0 }));
        const ct = L.companyTarget(t.company ? Number(t.company.amount) : null, individual.map((x) => x.monthly));
        return json({
          month, period: p, company: { ...ct, explicitAmount: t.company ? Number(t.company.amount) : null, ...L.targetsFor(ct.total, p) },
          people: individual.map((x) => ({ ...x, ...L.targetsFor(x.monthly, p) })),
          setterTargets: t.setter.map((x) => ({ salesperson_id: x.salesperson_id, kind: x.kind, amount: Number(x.amount) })),
          weeklyPlan: L.weeklyPlan(month, ct.total, individual),
        });
      }
      if (!me) return deny();
      const mine = t.byPerson.get(me.id) ?? 0;
      return json({
        month, period: p, people: [{ id: me.id, name: me.display_name, monthly: mine, ...L.targetsFor(mine, p) }],
        setterTargets: t.setter.filter((x) => x.salesperson_id === me.id).map((x) => ({ salesperson_id: x.salesperson_id, kind: x.kind, amount: Number(x.amount) })),
        weeklyPlan: L.weeklyPlan(month, mine, []).map(({ people: _omit, ...w }) => w),
      });
    }
    if (path === "/api/sales-arena/targets" && method === "PUT") {
      if (!isCEO) return deny("Only the CEO can set or change sales targets.");
      const m = isoMonth(body.month);
      if (!m) return bad("Choose the reporting month.");
      const existing = await rows("sales_targets", (q) => q.eq("month", `${m}-01`));
      const changes: { salesperson_id: string | null; kind: string; amount: number }[] = [];
      if (body.company !== undefined) {
        const v = body.company === null || body.company === "" ? 0 : money(body.company);
        if (v === null || !Number.isFinite(v) || v < 0) return bad("The company target must be a positive amount (or 0 to use the sum of individual targets).");
        changes.push({ salesperson_id: null, kind: "cash", amount: v });
      }
      for (const x of Array.isArray(body.people) ? body.people : []) {
        if (!people.some((p) => p.id === x.id)) return bad("Unknown salesperson.");
        const v = money(x.amount);
        if (v === null || !Number.isFinite(v) || v < 0) return bad("Targets must be amounts of R0 or more.");
        changes.push({ salesperson_id: x.id, kind: "cash", amount: v });
      }
      for (const x of Array.isArray(body.setterTargets) ? body.setterTargets : []) {
        if (!people.some((p) => p.id === x.salesperson_id) || !["daily_calls", "daily_bookings"].includes(x.kind)) return bad("Invalid setter target.");
        const v = Number(x.amount);
        if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) return bad("Setter targets are whole numbers of 0 or more.");
        changes.push({ salesperson_id: x.salesperson_id, kind: x.kind, amount: v });
      }
      let n = 0;
      for (const c of changes) {
        const cur = existing.find((e) => e.kind === c.kind && (e.salesperson_id ?? null) === c.salesperson_id);
        if (cur && Number(cur.amount) === c.amount) continue;
        if (!cur && c.amount === 0) continue; // blank stays unset
        const beforeAmount = cur ? Number(cur.amount) : null;
        if (cur) await db().from("sales_targets").update({ amount: c.amount, updated_by: user.userId, updated_at: new Date().toISOString() }).eq("id", cur.id);
        else await db().from("sales_targets").insert({ month: `${m}-01`, ...c, updated_by: user.userId });
        await audit(ctx, "target", cur?.id ?? null, cur ? "updated" : "set", cur ? { month: m, kind: c.kind, salesperson: nameOf(ctx, c.salesperson_id) ?? "Company", amount: beforeAmount } : null, { month: m, kind: c.kind, salesperson: nameOf(ctx, c.salesperson_id) ?? "Company", amount: c.amount });
        n++;
      }
      return json({ ok: true, changed: n });
    }
    if (path === "/api/sales-arena/targets/history" && method === "GET") {
      if (!isCEO) return deny();
      const h = (await rows("sales_arena_audit", (q) => q.eq("entity", "target"))).filter((x) => !u.searchParams.get("month") || x.after?.month === month);
      return json({ history: h.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 200) });
    }

    // ── My dashboard (a linked salesperson) ──
    if (path === "/api/sales-arena/my" && method === "GET") {
      if (!me) return deny("You are not set up as a salesperson in the Sales Arena.");
      return json(await myDashboard(ctx, month, reportingDate));
    }

    // Everything below needs: CEO, a linked salesperson, or (lead magnets) the report preparer.
    const isMagnetPath = path.startsWith("/api/sales-arena/lead-magnets");
    if (!isCEO && !me && !isMagnetPath) return deny("You are not set up as a salesperson in the Sales Arena.");

    // ── Pipeline ──
    if (path === "/api/sales-arena/opportunities" && method === "GET") {
      let list = await rows("sales_opportunities");
      list = list.filter((o) => ownsDeal(ctx, o));
      const sp = u.searchParams.get("salesperson");
      if (sp && isCEO) list = list.filter((o) => o.salesperson_id === sp || o.setter_id === sp);
      const stage = u.searchParams.get("stage");
      if (stage) list = list.filter((o) => o.stage === stage);
      const q = (u.searchParams.get("q") || "").toLowerCase();
      if (q) list = list.filter((o) => [o.deal_ref, o.company, o.contact_name, o.email, o.phone, o.location].some((v) => String(v ?? "").toLowerCase().includes(q)));
      let out = list.map((o) => dealOut(ctx, o, today));
      const fu = u.searchParams.get("followUp");
      if (fu === "overdue") out = out.filter((o) => o.follow_up_status === "Overdue");
      else if (fu === "today") out = out.filter((o) => o.follow_up_status === "Due today");
      else if (fu === "week") out = out.filter((o) => o.next_follow_up && o.next_follow_up >= today && o.next_follow_up <= L.addDays(today, 7));
      else if (fu === "none") out = out.filter((o) => o.follow_up_status === "Set follow-up");
      out.sort((a, b) => String(a.next_follow_up ?? "9999").localeCompare(String(b.next_follow_up ?? "9999")) || String(b.created_at).localeCompare(String(a.created_at)));
      return json({ opportunities: out });
    }
    if (path === "/api/sales-arena/opportunities" && method === "POST") {
      const v = await validateDeal(ctx, body, null);
      if ("error" in v) return bad(v.error);
      const all = await rows("sales_opportunities");
      let ref = str(body.deal_ref, 80);
      if (ref && all.some((o) => upper(o.deal_ref) === upper(ref))) return json({ error: `Deal ID ${ref} is already in use.` }, 409);
      if (!ref) {
        const nums = all.map((o) => Number(String(o.deal_ref).match(/^MSP-LOCAL-(\d+)$/i)?.[1] ?? 0));
        ref = `MSP-LOCAL-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
      }
      const row = { ...v.row, deal_ref: ref, created_by: user.userId, updated_by: user.userId };
      const { data, error } = await db().from("sales_opportunities").insert(row).select();
      if (error) return bad(error.message);
      const created = Array.isArray(data) ? data[0] : data;
      await audit(ctx, "opportunity", created.id, "created", null, row);
      return json({ opportunity: dealOut(ctx, created, today) }, 201);
    }
    const om = path.match(/^\/api\/sales-arena\/opportunities\/([0-9a-f-]{36})$/);
    if (om) {
      const o = await one("sales_opportunities", om[1]);
      if (!o || !ownsDeal(ctx, o)) return json({ error: "Not found." }, 404);
      if (method === "GET") {
        const ref = upper(o.deal_ref);
        const [acts, mags, pays, hist] = await Promise.all([
          rows("sales_setter_activities"), rows("sales_lead_magnets"), rows("sales_payments"),
          rows("sales_arena_audit", (q) => q.eq("entity_id", o.id)),
        ]);
        const linked = (x: any) => x.opportunity_id === o.id || (ref && upper(x.deal_ref) === ref);
        return json({
          opportunity: dealOut(ctx, o, today),
          activities: acts.filter(linked).filter((a) => isCEO || ownsActivity(ctx, a) || o.salesperson_id === me?.id).map((a) => activityOut(ctx, a, today)).sort((a, b) => String(b.activity_at ?? b.created_at).localeCompare(String(a.activity_at ?? a.created_at))),
          leadMagnets: mags.filter(linked).map((m) => magnetOut(ctx, m, today)),
          // Receipts: the CEO sees all; a salesperson only receipts credited to them.
          payments: pays.filter(linked).filter((x) => ownsPayment(ctx, x)).map((x) => paymentOut(ctx, x)),
          history: hist.sort((a, b) => String(b.at).localeCompare(String(a.at))),
        });
      }
      if (method === "PATCH") {
        if (body.completeFollowUp) {
          const next = dateOrNull(body.next_follow_up);
          if (next === undefined) return bad("Invalid next follow-up date.");
          const patch = { next_follow_up: next, next_action: str(body.next_action, 500) ?? o.next_action, updated_by: user.userId, updated_at: new Date().toISOString() };
          await db().from("sales_opportunities").update(patch).eq("id", o.id);
          await audit(ctx, "opportunity", o.id, "follow_up_completed", { next_follow_up: o.next_follow_up, next_action: o.next_action }, { done_on: today, outcome: str(body.outcome, 500), next_follow_up: next, next_action: patch.next_action });
          return json({ ok: true });
        }
        const v = await validateDeal(ctx, { ...o, ...body }, o);
        if ("error" in v) return bad(v.error);
        const patch: any = { ...v.row, updated_by: user.userId, updated_at: new Date().toISOString() };
        // Deal ID: only the CEO may change it (e.g. to the real GoHighLevel ID); linked records follow.
        const newRef = str(body.deal_ref, 80);
        if (newRef && upper(newRef) !== upper(o.deal_ref)) {
          if (!isCEO) return deny("Only the CEO can change a deal ID.");
          const all = await rows("sales_opportunities");
          if (all.some((x) => x.id !== o.id && upper(x.deal_ref) === upper(newRef))) return json({ error: `Deal ID ${newRef} is already in use.` }, 409);
          patch.deal_ref = newRef;
          for (const t of ["sales_setter_activities", "sales_lead_magnets", "sales_payments"]) {
            const linked = (await rows(t)).filter((x) => upper(x.deal_ref) === upper(o.deal_ref));
            for (const x of linked) await db().from(t).update({ deal_ref: newRef, opportunity_id: o.id }).eq("id", x.id);
          }
        }
        const c = changed(o, patch);
        if (!c.any) return json({ ok: true, unchanged: true });
        const label = c.a.stage ? `stage: ${c.b.stage} → ${c.a.stage}` : "updated";
        await db().from("sales_opportunities").update(patch).eq("id", o.id);
        await audit(ctx, "opportunity", o.id, label, c.b, c.a);
        return json({ ok: true });
      }
    }

    // ── Setter activity ──
    if (path === "/api/sales-arena/activities" && method === "GET") {
      let list = (await rows("sales_setter_activities")).filter((a) => ownsActivity(ctx, a));
      if (u.searchParams.get("month")) list = list.filter((a) => String(a.activity_month).startsWith(month));
      const setter = u.searchParams.get("setter");
      if (setter && isCEO) list = list.filter((a) => a.setter_id === setter);
      const ref = u.searchParams.get("ref");
      if (ref) list = list.filter((a) => upper(a.deal_ref) === upper(ref));
      list.sort((a, b) => String(b.activity_at ?? b.activity_month).localeCompare(String(a.activity_at ?? a.activity_month)) || String(b.created_at).localeCompare(String(a.created_at)));
      const summary = isCEO && !setter ? L.setterSummary(list, month) : L.setterSummary(list, month, isCEO ? setter ?? undefined : me!.id);
      return json({ activities: list.map((a) => activityOut(ctx, a, today)), summary });
    }
    if (path === "/api/sales-arena/activities" && method === "POST") {
      const v = await validateActivity(ctx, body, null);
      if ("error" in v) return bad(v.error);
      const row = { ...v.row, created_by: user.userId };
      const { data, error } = await db().from("sales_setter_activities").insert(row).select();
      if (error) return bad(error.message);
      const created = Array.isArray(data) ? data[0] : data;
      await audit(ctx, "activity", created.id, "created", null, row);
      return json({ activity: activityOut(ctx, created, today) }, 201);
    }
    const am = path.match(/^\/api\/sales-arena\/activities\/([0-9a-f-]{36})$/);
    if (am && method === "PATCH") {
      const a = await one("sales_setter_activities", am[1]);
      if (!a || !ownsActivity(ctx, a)) return json({ error: "Not found." }, 404);
      if (!isCEO && a.setter_id !== me!.id) return deny("Only the lead setter who logged this attempt (or the CEO) can change it.");
      if (body.completeFollowUp) {
        await db().from("sales_setter_activities").update({ follow_up_done_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", a.id);
        await audit(ctx, "activity", a.id, "follow_up_completed", { next_follow_up: a.next_follow_up }, { done_on: today });
        return json({ ok: true });
      }
      const v = await validateActivity(ctx, { ...a, activity_at: a.activity_at ? undefined : null, ...body }, a);
      if ("error" in v) return bad(v.error);
      const patch = { ...v.row, updated_at: new Date().toISOString() };
      const c = changed(a, patch);
      if (!c.any) return json({ ok: true, unchanged: true });
      await db().from("sales_setter_activities").update(patch).eq("id", a.id);
      await audit(ctx, "activity", a.id, "updated", c.b, c.a);
      return json({ ok: true });
    }

    // ── Lead magnets ──
    if (isMagnetPath) {
      const all = await rows("sales_lead_magnets");
      const isPreparer = all.some((m) => m.prepared_by_profile === user.userId);
      if (!isCEO && !me && !isPreparer) return deny("You are not set up in the Sales Arena.");
      if (path === "/api/sales-arena/lead-magnets" && method === "GET") {
        const list = all.filter((m) => ownsMagnet(ctx, m)).map((m) => magnetOut(ctx, m, today));
        const st = u.searchParams.get("status");
        return json({ leadMagnets: (st ? list.filter((m) => m.delivery_status === st) : list).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))) });
      }
      if (path === "/api/sales-arena/lead-magnets" && method === "POST") {
        if (!isCEO && !me) return deny();
        const v = await validateMagnet(ctx, body, null);
        if ("error" in v) return bad(v.error);
        const row = { ...v.row, created_by: user.userId };
        const { data, error } = await db().from("sales_lead_magnets").insert(row).select();
        if (error) return bad(error.message);
        const created = Array.isArray(data) ? data[0] : data;
        await audit(ctx, "lead_magnet", created.id, "created", null, row);
        return json({ leadMagnet: magnetOut(ctx, created, today) }, 201);
      }
      const mm = path.match(/^\/api\/sales-arena\/lead-magnets\/([0-9a-f-]{36})(?:\/(upload-url|file))?$/);
      if (mm) {
        const m = all.find((x) => x.id === mm[1]);
        if (!m || !ownsMagnet(ctx, m)) return json({ error: "Not found." }, 404);
        if (mm[2] === "upload-url" && method === "POST") {
          const fileName = str(body.fileName, 200);
          const size = Number(body.size) || 0;
          const ext = (fileName || "").split(".").pop()?.toLowerCase() || "";
          if (!fileName) return bad("Missing file name.");
          if (!["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg"].includes(ext)) return bad("Upload a PDF, Word, PowerPoint, Excel or image file.");
          if (size <= 0 || size > 25 * 1024 * 1024) return bad("Files must be between 1 byte and 25 MB.");
          const p = `magnets/${m.id}/${crypto.randomUUID()}-${fileName.replace(/[^\w.\-]+/g, "_").slice(-100)}`;
          const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(p);
          if (error || !data?.token) return json({ error: "Could not prepare the upload." }, 500);
          return json({ path: p, token: data.token, bucket: BUCKET });
        }
        if (mm[2] === "file" && method === "GET") {
          if (!m.report_file?.path) return json({ error: "No file uploaded." }, 404);
          const { data, error } = await db().storage.from(BUCKET).createSignedUrl(m.report_file.path, 60 * 10, { download: m.report_file.name });
          if (error || !data?.signedUrl) return json({ error: "The file is not available." }, 404);
          return json({ url: data.signedUrl });
        }
        if (!mm[2] && method === "PATCH") {
          if (body.completeFollowUp) {
            await db().from("sales_lead_magnets").update({ follow_up_done_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", m.id);
            await audit(ctx, "lead_magnet", m.id, "follow_up_completed", { next_follow_up: m.next_follow_up }, { done_on: today });
            return json({ ok: true });
          }
          const v = await validateMagnet(ctx, { ...m, ...body }, m);
          if ("error" in v) return bad(v.error);
          const patch: any = { ...v.row, updated_at: new Date().toISOString() };
          if (body.report_file !== undefined) {
            const f = body.report_file;
            if (f) {
              const p = String(f.path || "");
              if (!p.startsWith(`magnets/${m.id}/`) || p.includes("..")) return bad("Invalid file.");
              const dir = p.slice(0, p.lastIndexOf("/")), nm = p.slice(p.lastIndexOf("/") + 1);
              const { data } = await db().storage.from(BUCKET).list(dir, { search: nm, limit: 5 });
              if (!Array.isArray(data) || !data.some((o: any) => o.name === nm)) return bad("The upload did not finish. Try again.");
              patch.report_file = { path: p, name: str(f.name, 200) || nm, size: Number(f.size) || 0, mimeType: str(f.mimeType, 120) };
            } else patch.report_file = null;
          }
          // Re-check evidence rules with the file included.
          const merged = { ...m, ...patch };
          if (merged.sent_date && !(merged.completed_date && (merged.report_link || merged.report_file))) return bad("A report can only be marked as sent after its completion date and report link or file are recorded.");
          // Who completed / sent / discussed it.
          if (patch.completed_date && !m.completed_date) patch.completed_by = user.userId;
          if (patch.sent_date && !m.sent_date) patch.sent_by = user.userId;
          if (patch.discussed_date && !m.discussed_date) patch.discussed_by = user.userId;
          const c = changed(m, patch);
          if (!c.any) return json({ ok: true, unchanged: true });
          await db().from("sales_lead_magnets").update(patch).eq("id", m.id);
          const action = c.a.discussed_date ? "discussed" : c.a.sent_date ? "sent" : c.a.completed_date ? "completed" : "updated";
          await audit(ctx, "lead_magnet", m.id, action, c.b, { ...c.a, report_file: c.a.report_file ? { name: c.a.report_file.name } : c.a.report_file });
          return json({ ok: true });
        }
      }
      return json({ error: "Not found." }, 404);
    }

    // ── Payments received ──
    if (path === "/api/sales-arena/payments" && method === "GET") {
      let list = (await rows("sales_payments")).filter((x) => ownsPayment(ctx, x));
      if (u.searchParams.get("month")) list = list.filter((x) => String(x.revenue_month).startsWith(month));
      const sp = u.searchParams.get("salesperson");
      if (sp && isCEO) list = list.filter((x) => x.salesperson_id === sp);
      const ref = u.searchParams.get("ref");
      if (ref) list = list.filter((x) => upper(x.deal_ref) === upper(ref));
      const q = (u.searchParams.get("q") || "").toLowerCase();
      if (q) list = list.filter((x) => [x.client, x.deal_ref, x.invoice_ref, x.payment_ref, x.notes].some((v) => String(v ?? "").toLowerCase().includes(q)));
      list.sort((a, b) => String(b.receipt_date ?? b.revenue_month).localeCompare(String(a.receipt_date ?? a.revenue_month)));
      const total = list.reduce((s, x) => s + Number(x.amount), 0);
      return json({ payments: list.map((x) => paymentOut(ctx, x)), total: Math.round(total * 100) / 100, undated: list.filter((x) => !x.receipt_date).length });
    }
    if (path === "/api/sales-arena/payments" && method === "POST") {
      const v = await validatePayment(ctx, body, null);
      if ("error" in v) return json({ error: v.error }, v.status ?? 400);
      const row = { ...v.row, created_by: user.userId, updated_by: user.userId };
      const { data, error } = await db().from("sales_payments").insert(row).select();
      if (error) return /duplicate|unique/i.test(error.message) ? json({ error: "This payment reference has already been recorded." }, 409) : bad(error.message);
      const created = Array.isArray(data) ? data[0] : data;
      await audit(ctx, "payment", created.id, "recorded", null, row);
      return json({ payment: paymentOut(ctx, created) }, 201);
    }
    const paym = path.match(/^\/api\/sales-arena\/payments\/([0-9a-f-]{36})$/);
    if (paym && method === "PATCH") {
      const p0 = await one("sales_payments", paym[1]);
      if (!p0 || !ownsPayment(ctx, p0)) return json({ error: "Not found." }, 404);
      let merged: any;
      if (!isCEO) {
        // A salesperson may only add the actual receipt date to their own month-only receipt.
        const keys = Object.keys(body).filter((k) => body[k] !== undefined);
        if (p0.receipt_date || keys.some((k) => k !== "receipt_date")) return deny("Only the CEO can change a recorded payment. You can add the receipt date once it is known.");
        merged = { ...p0, receipt_date: body.receipt_date, revenue_month: String(p0.revenue_month).slice(0, 7) };
      } else merged = { ...p0, revenue_month: String(p0.revenue_month).slice(0, 7), ...body };
      const v = await validatePayment(ctx, merged, p0);
      if ("error" in v) return json({ error: v.error }, v.status ?? 400);
      const patch = { ...v.row, updated_by: user.userId, updated_at: new Date().toISOString() };
      const c = changed(p0, patch);
      if (!c.any) return json({ ok: true, unchanged: true });
      await db().from("sales_payments").update(patch).eq("id", p0.id);
      await audit(ctx, "payment", p0.id, c.a.receipt_date && !p0.receipt_date ? "receipt_date_added" : "updated", c.b, c.a);
      return json({ ok: true });
    }

    // ── Change history (CEO) ──
    if (path === "/api/sales-arena/audit" && method === "GET") {
      if (!isCEO) return deny();
      const ent = u.searchParams.get("entity");
      const list = await rows("sales_arena_audit", (q) => (ent ? q.eq("entity", ent) : q));
      return json({ history: list.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 300) });
    }

    return json({ error: "Not found." }, 404);
  } catch (e: any) {
    console.error("[sales-arena]", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

// ── validation ──────────────────────────────────────────────────────────────
async function validateDeal(ctx: Ctx, b: any, before: any): Promise<{ row: any } | { error: string }> {
  const company = str(b.company, 200);
  if (!company) return { error: "Enter the company." };
  const stage = oneOf(L.STAGES, b.stage ?? "New");
  if (!stage) return { error: "Choose a valid pipeline stage." };
  const lostReason = str(b.lost_reason, 500);
  if (stage === "Lost" && !lostReason) return { error: "Enter the lost reason before marking a deal as Lost." };
  const quoted = money(b.quoted_fee), signed = money(b.signed_value);
  if (Number.isNaN(quoted) || (quoted !== null && quoted < 0)) return { error: "Quoted MSP fee must be an amount of R0 or more." };
  if (Number.isNaN(signed) || (signed !== null && signed < 0)) return { error: "Signed contract value must be an amount of R0 or more." };
  const dates: any = {};
  for (const k of ["received_date", "expected_close", "next_follow_up", "contact_date"]) {
    const d = dateOrNull(b[k]);
    if (d === undefined) return { error: `Invalid date: ${k.replace(/_/g, " ")}.` };
    dates[k] = d;
  }
  const ghl = url(b.ghl_url);
  if (ghl === undefined) return { error: "The GoHighLevel URL must start with http:// or https://." };
  const site = str(b.website, 300);
  const industry = oneOf(L.INDUSTRIES, b.industry), service = oneOf(L.SERVICES, b.service), source = oneOf(L.LEAD_SOURCES, b.lead_source);
  if (industry === undefined || service === undefined || source === undefined) return { error: "Choose industry, service and lead source from the lists." };
  const email = str(b.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  // Salesperson / setter: CEO assigns anyone; a salesperson keeps themselves on the deal.
  let salesperson = str(b.salesperson_id, 64), setter = str(b.setter_id, 64);
  for (const id of [salesperson, setter]) if (id && !ctx.people.some((p) => p.id === id)) return { error: "Unknown salesperson." };
  if (!ctx.isCEO) {
    const meId = ctx.me!.id;
    if (before) {
      // Assignments on an existing deal are the CEO's decision.
      salesperson = before.salesperson_id;
      setter = before.setter_id;
    } else if (ctx.me!.is_setter && setter === meId) {
      // A lead setter may hand a new lead to a closer.
    } else {
      salesperson = meId;
      if (setter && setter !== meId) setter = null;
    }
    if (salesperson !== meId && setter !== meId) return { error: "You can only work on deals where you are the salesperson or the lead setter." };
  }
  return {
    row: {
      company, stage, lost_reason: lostReason, quoted_fee: quoted, signed_value: signed, ...dates,
      ghl_url: ghl, website: site, industry, service, lead_source: source, email,
      contact_name: str(b.contact_name, 200), phone: str(b.phone, 60), next_action: str(b.next_action, 500), contacted_by: str(b.contacted_by, 120),
      location: str(b.location, 200), notes: str(b.notes, 4000), salesperson_id: salesperson, setter_id: setter,
    },
  };
}

async function validateActivity(ctx: Ctx, b: any, before: any): Promise<{ row: any } | { error: string }> {
  const type = oneOf(L.ACTIVITY_TYPES, b.activity_type), result = oneOf(L.ACTIVITY_RESULTS, b.result);
  if (!type || !result) return { error: "Choose the activity type and result." };
  let at: string | null | undefined = b.activity_at === undefined ? before?.activity_at ?? null : saTimestamp(b.activity_at);
  if (typeof b.activity_at === "string" && /Z$|[+-]\d{2}:\d{2}$/.test(b.activity_at)) at = new Date(b.activity_at).toISOString();
  if (at === undefined) return { error: "Invalid date / time." };
  if (at && at > new Date(Date.now() + 5 * 60_000).toISOString()) return { error: "An activity cannot be in the future." };
  // Month: from the actual date when known; otherwise the confirmed reporting month (never invented).
  const monthIn = typeof b.activity_month === "string" ? b.activity_month.slice(0, 7) : null;
  const month = at ? L.todayZA(new Date(at)).slice(0, 7) : isoMonth(monthIn);
  if (!month) return { error: "Enter the date and time, or the reporting month if the exact date is not known." };
  const setter = ctx.isCEO ? str(b.setter_id, 64) : ctx.me!.id;
  if (!setter || !ctx.people.some((p) => p.id === setter)) return { error: "Choose the lead setter." };
  const closer = str(b.closer_id, 64);
  if (closer && !ctx.people.some((p) => p.id === closer)) return { error: "Unknown closer." };
  const booked = b.meeting_booked === true || b.meeting_booked === "Yes";
  const appt = b.appointment_at ? saTimestamp(b.appointment_at) : null;
  if (appt === undefined) return { error: "Invalid appointment date." };
  if (appt && !booked) return { error: "Set Meeting booked to Yes before entering an appointment date." };
  const next = dateOrNull(b.next_follow_up);
  if (next === undefined) return { error: "Invalid next follow-up date." };
  const mins = b.call_minutes === null || b.call_minutes === undefined || b.call_minutes === "" ? null : Number(b.call_minutes);
  if (mins !== null && (!Number.isFinite(mins) || mins < 0 || mins > 600)) return { error: "Call minutes must be between 0 and 600." };
  const ref = str(b.deal_ref, 80);
  const opp = await opportunityByRef(ref);
  return {
    row: {
      activity_at: at, activity_month: `${month}-01`, setter_id: setter, closer_id: closer, deal_ref: ref, opportunity_id: opp?.id ?? null,
      company: str(b.company, 200) ?? opp?.company ?? null, activity_type: type, result,
      qualified: b.qualified === true || b.qualified === "Yes", meeting_booked: booked, appointment_at: appt,
      next_follow_up: next, notes: str(b.notes, 2000), call_minutes: mins,
    },
  };
}

async function validateMagnet(ctx: Ctx, b: any, before: any): Promise<{ row: any } | { error: string }> {
  const company = str(b.company, 200);
  if (!company) return { error: "Enter the company or prospect." };
  const type = oneOf(L.REPORT_TYPES, b.report_type);
  if (!type) return { error: "Choose the report type." };
  const status = oneOf(L.MAGNET_WORK_STATUSES, b.workflow_status ?? "Requested");
  if (!status) return { error: "Choose a valid workflow status." };
  const d: any = {};
  for (const k of ["requested_date", "due_date", "completed_date", "sent_date", "discussed_date", "next_follow_up"]) {
    const v = dateOrNull(b[k]);
    if (v === undefined) return { error: `Invalid date: ${k.replace(/_/g, " ")}.` };
    d[k] = v;
  }
  const link = url(b.report_link);
  if (link === undefined) return { error: "The report link must start with http:// or https://." };
  const hasFile = Boolean(b.report_file ?? before?.report_file);
  if (d.sent_date && !(d.completed_date && (link || hasFile))) return { error: "A report can only be marked as sent after its completion date and report link or file are recorded." };
  if (d.discussed_date && !d.sent_date) return { error: "Record the sent date before the discussed date." };
  if (d.completed_date && d.requested_date && d.completed_date < d.requested_date) return { error: "The completion date cannot be before the requested date." };
  if (d.sent_date && d.completed_date && d.sent_date < d.completed_date) return { error: "The sent date cannot be before the completion date." };
  const today = L.todayZA();
  for (const k of ["completed_date", "sent_date", "discussed_date"]) if (d[k] && d[k] > today) return { error: "Completion, sent and discussed dates cannot be in the future." };
  let owner = str(b.sales_owner_id, 64);
  if (owner && !ctx.people.some((p) => p.id === owner)) return { error: "Unknown sales owner." };
  if (!ctx.isCEO && ctx.me && !before && !owner) owner = ctx.me.id;
  if (!ctx.isCEO && before && owner !== before.sales_owner_id) owner = before.sales_owner_id; // reassignment is the CEO's
  const preparer = str(b.prepared_by_profile, 64);
  const ref = str(b.deal_ref, 80);
  const opp = await opportunityByRef(ref);
  return {
    row: {
      company, report_type: type, workflow_status: status, ...d, report_link: link, sales_owner_id: owner,
      prepared_by_name: str(b.prepared_by_name, 120), prepared_by_profile: ctx.isCEO ? preparer : before?.prepared_by_profile ?? preparer,
      next_action: str(b.next_action, 2000), deal_ref: ref, opportunity_id: opp?.id ?? null,
    },
  };
}

async function validatePayment(ctx: Ctx, b: any, before: any): Promise<{ row: any } | { error: string; status?: number }> {
  const amount = money(b.amount);
  if (amount === null || Number.isNaN(amount) || amount === 0) return { error: "Enter the MSP fee received in Rand (refunds as a negative amount)." };
  if (Math.abs(amount) > 10_000_000) return { error: "That amount looks too large. Check the figure." };
  const type = oneOf(L.RECEIPT_TYPES, b.receipt_type);
  if (type === undefined) return { error: "Choose a valid receipt type." };
  if (type === "Refund" && amount > 0) return { error: "Refunds are recorded as negative amounts (for example -4950)." };
  if (amount < 0 && type !== "Refund") return { error: "A negative amount is a refund: choose the Refund receipt type." };
  const receipt = dateOrNull(b.receipt_date);
  if (receipt === undefined) return { error: "Invalid receipt date." };
  if (receipt && receipt > L.todayZA()) return { error: "A receipt date cannot be in the future." };
  // Revenue month: the receipt date's month; without a date, the confirmed month is required.
  const monthIn = typeof b.revenue_month === "string" ? b.revenue_month.slice(0, 7) : null;
  if (receipt && monthIn && before && monthIn !== receipt.slice(0, 7) && String(before.revenue_month).slice(0, 7) !== receipt.slice(0, 7))
    return { error: `The receipt date (${receipt}) is not in the revenue month (${monthIn}). Check the date before saving.` };
  const month = receipt ? receipt.slice(0, 7) : isoMonth(monthIn);
  if (!month) return { error: "Enter the receipt date, or the revenue month if the exact date is not yet known." };
  const salesperson = ctx.isCEO ? str(b.salesperson_id, 64) : ctx.me!.id;
  if (!salesperson || !ctx.people.some((p) => p.id === salesperson)) return { error: "Choose the salesperson credited with this receipt." };
  const client = str(b.client, 200);
  if (!client) return { error: "Enter the client or company." };
  const service = oneOf(L.SERVICES, b.service);
  if (service === undefined) return { error: "Choose the service from the list." };
  const ref = str(b.payment_ref, 120);
  const all = await rows("sales_payments");
  if (ref && all.some((x) => x.id !== before?.id && upper(x.payment_ref) === upper(ref)))
    return { error: `Payment reference ${ref} has already been recorded. Each receipt is entered once.`, status: 409 };
  const dealRef = str(b.deal_ref, 80);
  // Same receipt entered twice without a reference: same deal/client, amount and date.
  if (!before && !b.confirmDuplicate) {
    const dup = all.find((x) => Number(x.amount) === amount && (x.receipt_date ?? null) === (receipt ?? null) && String(x.revenue_month).slice(0, 7) === month &&
      ((dealRef && upper(x.deal_ref) === upper(dealRef)) || String(x.client).trim().toLowerCase() === client.toLowerCase()));
    if (dup) return { error: "A receipt with the same client, amount and date is already recorded. If this is a separate payment, confirm it as a new receipt.", status: 409 };
  }
  const opp = await opportunityByRef(dealRef);
  return {
    row: {
      receipt_date: receipt, revenue_month: `${month}-01`, salesperson_id: salesperson, client, service, deal_ref: dealRef, opportunity_id: opp?.id ?? null,
      invoice_ref: str(b.invoice_ref, 120), amount, receipt_type: type, payment_ref: ref, notes: str(b.notes, 2000),
    },
  };
}
