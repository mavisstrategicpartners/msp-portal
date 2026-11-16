/**
 * Sales Arena — shared constants and the calculation logic of "MSP Sales Arena.xlsx".
 * Pure functions (no I/O) so the server, the pages and the tests all use the same maths.
 *
 * Workbook rules reproduced here (sheet references in brackets):
 *  - Daily target = monthly target ÷ Mon–Fri working days in the month; public holidays are not
 *    excluded (Team Targets D6, Guide B41).
 *  - Weekly target = daily target × working days of the reporting week that fall inside the
 *    reporting month; weeks run Monday–Sunday and are clipped to the month (Team Targets C6, B43).
 *  - Weekend reporting dates have no day target (Target Performance H6).
 *  - Company target defaults to the sum of individual targets unless a separate company target is
 *    set; the difference is "unassigned" (Team Targets F22–F24).
 *  - Revenue = actual MSP fees received (Payments G), excluding VAT and ad spend; refunds are
 *    negative; month totals use the revenue month (Payments K) and include month-only receipts.
 *  - Week and day actuals need an actual receipt date: from max(week start, month start) up to and
 *    including the reporting date, and on the reporting date. When the month has receipts without
 *    dates, week/day percentages show "Dates pending" (Target Performance G6/J6).
 *  - Rank = position by month cash among people with non-zero month cash (Sales Arena H17).
 */

export const STAGES = ["New", "Contacted", "Qualified", "Meeting booked", "Proposal sent", "Negotiation", "Won", "Lost"] as const;
export type Stage = (typeof STAGES)[number];
export const LEAD_SOURCES = ["Meta", "Google", "TikTok", "LinkedIn", "Referral", "Outbound", "Website", "WhatsApp", "Other"] as const;
export const INDUSTRIES = ["Construction", "CCTV / Access Control", "Events / Equipment / Venues", "Solar / Backup Power", "Healthcare", "Financial Services", "Tech / Apps", "Other"] as const;
export const SERVICES = ["Meta Ads", "Google Ads", "TikTok Ads", "Multi-platform Ads", "Website", "App Development", "SEO", "CRM / Automation", "AI / WhatsApp Agent", "Sales Performance", "Training", "Other"] as const;
export const RECEIPT_TYPES = ["New client", "Renewal", "Project payment", "Refund"] as const;
export const ACTIVITY_TYPES = ["Call", "WhatsApp", "Email"] as const;
export const ACTIVITY_RESULTS = ["Connected", "No answer", "Voicemail", "Wrong number", "Replied", "Sent"] as const;
export const REPORT_TYPES = ["Competitor analysis", "Growth audit", "Combined analysis + audit"] as const;
export const MAGNET_WORK_STATUSES = ["Requested", "In preparation", "Ready for review", "Approved", "Completed - details pending", "Declined"] as const;

// ── Dates (ISO "YYYY-MM-DD", calendar arithmetic in UTC so time zones never shift a day) ──
const DAY = 86_400_000;
const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => toIso(new Date(toDate(iso).getTime() + n * DAY));
export const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(toDate(v).getTime()) && toIso(toDate(v)) === v;
export const isMonth = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}$/.test(v) && isIsoDate(`${v}-01`);
export const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
export function monthEnd(iso: string) {
  const d = toDate(monthStart(iso));
  return toIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}
export function shiftMonth(month: string, n: number) {
  const d = toDate(`${month.slice(0, 7)}-01`);
  return toIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))).slice(0, 7);
}
/** Excel WEEKDAY(d, 2): Monday = 1 … Sunday = 7. */
export const weekdayMon1 = (iso: string) => ((toDate(iso).getUTCDay() + 6) % 7) + 1;
export const isWorkday = (iso: string) => weekdayMon1(iso) <= 5;
export const weekStart = (iso: string) => addDays(iso, 1 - weekdayMon1(iso));
/** Excel NETWORKDAYS(a, b) for a ≤ b: Mon–Fri days inclusive (no holiday list); 0 when a > b. */
export function networkdays(a: string, b: string) {
  if (a > b) return 0;
  let n = 0;
  for (let d = a; d <= b; d = addDays(d, 1)) if (isWorkday(d)) n++;
  return n;
}
/** Today's date in South Africa (the portal's reporting time zone). */
export function todayZA(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
/** Reporting date for a month: today when today is in that month, otherwise the month's last day. */
export function defaultReportingDate(month: string, today = todayZA()) {
  return today.slice(0, 7) === month ? today : monthEnd(`${month}-01`);
}

export type Period = {
  reportingDate: string;
  month: string; // "YYYY-MM"
  monthStart: string;
  monthEnd: string;
  weekStart: string;
  weekEnd: string;
  /** Week clipped to the month (workbook: MAX(week start, month start) … MIN(week end, month end)). */
  weekFrom: string;
  weekTo: string;
  workdaysInMonth: number;
  workdaysInWeek: number;
  isWeekend: boolean;
};
export function period(reportingDate: string): Period {
  const ms = monthStart(reportingDate), me = monthEnd(reportingDate);
  const ws = weekStart(reportingDate), we = addDays(ws, 6);
  const weekFrom = ws > ms ? ws : ms, weekTo = we < me ? we : me;
  return {
    reportingDate, month: reportingDate.slice(0, 7), monthStart: ms, monthEnd: me, weekStart: ws, weekEnd: we, weekFrom, weekTo,
    workdaysInMonth: networkdays(ms, me), workdaysInWeek: networkdays(weekFrom, weekTo), isWeekend: !isWorkday(reportingDate),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
export function targetsFor(monthly: number, p: Period) {
  const daily = p.workdaysInMonth ? monthly / p.workdaysInMonth : 0;
  return { month: monthly, week: daily * p.workdaysInWeek, day: p.isWeekend ? 0 : daily, dailyRate: daily };
}

export type PaymentLike = { amount: number; receipt_date: string | null; revenue_month: string; salesperson_id: string };
export function actualsFor(payments: PaymentLike[], p: Period, salespersonId?: string | null) {
  const mine = salespersonId ? payments.filter((x) => x.salesperson_id === salespersonId) : payments;
  let month = 0, week = 0, day = 0, pending = 0, pendingAmount = 0;
  for (const x of mine) {
    const amt = Number(x.amount) || 0;
    if (x.revenue_month.slice(0, 10) === p.monthStart) {
      month += amt;
      if (!x.receipt_date) { pending++; pendingAmount += amt; }
    }
    if (x.receipt_date) {
      if (x.receipt_date >= p.weekFrom && x.receipt_date <= p.reportingDate) week += amt;
      if (x.receipt_date === p.reportingDate) day += amt;
    }
  }
  return { month: round2(month), week: round2(week), day: round2(day), datesPending: pending > 0, pendingCount: pending, pendingAmount: round2(pendingAmount) };
}

/** A ratio, or the workbook's text when no ratio applies. */
export type Pct = { value: number | null; label: string | null };
const pct = (actual: number, target: number, noTarget: string, pending = false): Pct =>
  pending ? { value: null, label: "Dates pending" } : target > 0 ? { value: actual / target, label: null } : { value: null, label: noTarget };

export type PerformanceRow = {
  id: string | null; // null = company
  name: string;
  target: { month: number; week: number; day: number };
  actual: { month: number; week: number; day: number };
  pct: { month: Pct; week: Pct; day: Pct };
  remaining: number;
  datesPending: boolean;
  pendingAmount: number;
  rank: number | null;
  progress: "Set target" | "Achieved" | "In progress";
};
export function performanceRow(id: string | null, name: string, monthlyTarget: number, payments: PaymentLike[], p: Period): PerformanceRow {
  const t = targetsFor(monthlyTarget, p);
  const a = actualsFor(payments, p, id);
  return {
    id, name,
    target: { month: round2(t.month), week: round2(t.week), day: round2(t.day) },
    actual: { month: a.month, week: a.week, day: a.day },
    pct: {
      month: pct(a.month, t.month, "Set target"),
      week: pct(a.week, t.week, "Set target", a.datesPending),
      day: pct(a.day, t.day, "No day target", a.datesPending),
    },
    remaining: round2(Math.max(0, t.month - a.month)),
    datesPending: a.datesPending,
    pendingAmount: a.pendingAmount,
    rank: null,
    progress: t.month === 0 ? "Set target" : a.month / t.month >= 1 ? "Achieved" : "In progress",
  };
}
/** Excel RANK(x, range, 0) by month cash; people with no month cash are not ranked. */
export function applyRanks(rows: PerformanceRow[]) {
  const cash = rows.map((r) => r.actual.month);
  for (const r of rows) r.rank = r.actual.month === 0 ? null : 1 + cash.filter((c) => c > r.actual.month).length;
  return rows;
}

export function companyTarget(explicit: number | null | undefined, individual: number[]) {
  const assigned = round2(individual.reduce((s, n) => s + (Number(n) || 0), 0));
  const total = explicit != null && explicit > 0 ? Number(explicit) : assigned;
  return { total: round2(total), assigned, unassigned: round2(total - assigned), isExplicit: explicit != null && explicit > 0 };
}

/** Week-by-week target plan for the month (Target Performance A56:I64). */
export function weeklyPlan(month: string, companyMonthly: number, people: { id: string; name: string; monthly: number }[]) {
  const ms = `${month}-01`, me = monthEnd(ms), total = networkdays(ms, me);
  const weeks: { from: string; to: string; workdays: number; company: number; people: Record<string, number> }[] = [];
  for (let a = ms; a <= me; ) {
    const b0 = addDays(a, 7 - weekdayMon1(a));
    const b = b0 < me ? b0 : me;
    const wd = networkdays(a, b);
    weeks.push({
      from: a, to: b, workdays: wd,
      company: round2(total ? (companyMonthly / total) * wd : 0),
      people: Object.fromEntries(people.map((x) => [x.id, round2(total ? (x.monthly / total) * wd : 0)])),
    });
    a = addDays(b, 1);
  }
  return weeks;
}

/** Cumulative dated cash vs target pace for each day of the month (Chart Data E:G). */
export function dailyPace(month: string, companyMonthly: number, payments: PaymentLike[], reportingDate: string) {
  const ms = `${month}-01`, me = monthEnd(ms), total = networkdays(ms, me);
  const out: { date: string; cash: number | null; pace: number }[] = [];
  for (let d = ms; d <= me; d = addDays(d, 1)) {
    const cash = d > reportingDate ? null : round2(payments.filter((x) => x.receipt_date && x.receipt_date >= ms && x.receipt_date <= d).reduce((s, x) => s + Number(x.amount), 0));
    out.push({ date: d, cash, pace: round2(total ? (companyMonthly * networkdays(ms, d)) / total : 0) });
  }
  return out;
}

export function followUpStatus(date: string | null | undefined, today: string, closed = false, done = false) {
  if (closed) return "Closed";
  if (done) return "Done";
  if (!date) return "Set follow-up";
  if (date < today) return "Overdue";
  if (date === today) return "Due today";
  return "Scheduled";
}

/** Lead magnet delivery check (Lead Magnets column O), from evidence rather than a status alone. */
export type MagnetLike = {
  workflow_status: string; completed_date: string | null; report_link: string | null; report_file?: unknown;
  sent_date: string | null; discussed_date: string | null; due_date: string | null;
};
export function magnetDelivery(m: MagnetLike, today: string) {
  const hasReport = Boolean(m.report_link || m.report_file);
  if (m.workflow_status === "Declined") return "Declined";
  if (m.sent_date && (!m.completed_date || !hasReport)) return "Check dates / link";
  if (m.sent_date && m.discussed_date) return "Discussed";
  if (m.sent_date) return "Sent";
  if (m.completed_date && hasReport) return "Completed - not sent";
  if (m.workflow_status === "Completed - details pending") return "Completed - details pending";
  if (m.completed_date && !hasReport) return "Add report link";
  if (m.due_date && m.due_date < today) return "Overdue preparation";
  return "In preparation";
}

export type ActivityLike = {
  id: string; deal_ref: string | null; activity_at: string | null; activity_month: string; setter_id: string;
  activity_type: string; result: string; qualified: boolean; meeting_booked: boolean;
};
/** Setter activity cards for a month (Sales Arena A9:J10 and the caller table A68:D73). */
export function setterSummary(acts: ActivityLike[], month: string, setterId?: string) {
  const ms = `${month}-01`;
  const rows = acts.filter((a) => a.activity_month.slice(0, 10) === ms && (!setterId || a.setter_id === setterId));
  const key = (a: ActivityLike) => (a.deal_ref ? a.deal_ref.trim().toUpperCase() : `row:${a.id}`);
  const calls = rows.filter((a) => a.activity_type === "Call");
  return {
    attempts: rows.length,
    calls: calls.length,
    connected: calls.filter((a) => a.result === "Connected").length,
    qualifiedLeads: new Set(rows.filter((a) => a.qualified).map(key)).size,
    bookedLeads: new Set(rows.filter((a) => a.meeting_booked).map(key)).size,
    undatedCalls: calls.filter((a) => !a.activity_at).length,
  };
}
/** Calls per dated day for the month (Chart Data L:N); undated calls are counted separately. */
export function dailyCalls(acts: ActivityLike[], month: string, reportingDate: string) {
  const ms = `${month}-01`, me = monthEnd(ms);
  const out: { date: string; calls: number | null; connected: number | null }[] = [];
  for (let d = ms; d <= me; d = addDays(d, 1)) {
    if (d > reportingDate) { out.push({ date: d, calls: null, connected: null }); continue; }
    const day = acts.filter((a) => a.activity_type === "Call" && a.activity_at && todayZA(new Date(a.activity_at)) === d);
    out.push({ date: d, calls: day.length, connected: day.filter((a) => a.result === "Connected").length });
  }
  return out;
}
