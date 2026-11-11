/**
 * Finance & Administration Command Centre.
 *
 * Records (invoices, expenses, approval requests, budgets) are read and changed only through
 * /api/staff/finance, which checks permissions, validates, saves to the database and writes the
 * finance audit trail. The screen shows a change only after the server has saved it, then
 * refreshes. The Finance & Administration manager, the General Manager and administrators can
 * add, edit and delete; the CEO sees everything read-only. Exports are PDF.
 */
import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { formatZAR } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Check,
  Plus,
  Search,
  ShieldCheck,
  ArrowRight,
  FileDown,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  Upload,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { DEPARTMENTS } from "@/lib/departments";
import {
  exportFinanceReportPdf,
  exportRecordPdf,
  exportSectionPdf,
  type FinanceData,
  type FinApproval,
  type FinAudit,
  type FinBudget,
  type FinExpense,
  type FinInvoice,
  type Period,
} from "@/lib/finance-pdf";

type Kind = "invoices" | "expenses" | "approvals" | "budgets";
type FinanceResponse = FinanceData & { canEdit: boolean; me: string };

const INVOICE_STATUSES = ["Awaiting Payment", "Paid & Verified", "Overdue"];
const EXPENSE_CATEGORIES = ["Software & SaaS", "Media & Tools", "Contractor Payouts", "Operations & Office", "Legal & Compliance"];
const EXPENSE_STATUSES = ["Paid", "Pending Approval", "Scheduled"];
const APPROVAL_CATEGORIES = ["Software", "Contractor", "Equipment", "Client Refund", "Operational"];
const SINGULAR: Record<Kind, string> = { invoices: "invoice", expenses: "expense", approvals: "approval request", budgets: "budget" };
const KEY = ["finance", "records"];

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), "Content-Type": "application/json", ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const describe = (kind: Kind, r: any) =>
  kind === "invoices" ? `${r.invoiceNumber} — ${r.client}` : kind === "expenses" ? r.vendor : kind === "approvals" ? r.title : `${r.dept} budget`;

const statusTone = (s: string) =>
  s === "Paid & Verified" || s === "Approved" || s === "Paid"
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
    : s === "Overdue" || s === "Declined"
      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
      : "bg-amber-500/10 text-amber-600 border-amber-500/30";

/** Last 12 months plus "all records", for reporting periods. */
function periodOptions(): Period[] {
  const out: Period[] = [{ label: "All records" }];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ label: m.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }), month: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}` });
  }
  return out;
}

/** Rows that older versions of this page kept only in this browser (never saved to the database). */
const LOCAL_KEYS: Record<Kind, string> = { invoices: "msp_table_finance_invoices", expenses: "msp_table_finance_expenses", approvals: "msp_table_finance_approvals", budgets: "msp_table_finance_budgets" };
function readLocal(): Record<Kind, any[]> {
  const out = { invoices: [], expenses: [], approvals: [], budgets: [] } as Record<Kind, any[]>;
  if (typeof window === "undefined") return out;
  for (const k of Object.keys(LOCAL_KEYS) as Kind[]) {
    try {
      const v = JSON.parse(localStorage.getItem(LOCAL_KEYS[k]) || "[]");
      if (Array.isArray(v)) out[k] = v;
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function FinanceAdminDashboard() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: async () => (await api("/api/staff/finance")) as FinanceResponse });
  const data = q.data;
  const invoices: FinInvoice[] = data?.invoices ?? [];
  const expenses: FinExpense[] = data?.expenses ?? [];
  const approvals: FinApproval[] = data?.approvals ?? [];
  const budgets: FinBudget[] = data?.budgets ?? [];
  const auditLogs: FinAudit[] = data?.audit ?? [];
  const canEdit = Boolean(data?.canEdit);
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });

  // The open section follows the address (?tab=…), so sidebar links and the browser's back button
  // open the right section.
  const TABS = ["overview", "invoices", "expenses", "budgets", "approvals", "audit_reports"];
  const urlTab = useRouterState({ select: (s) => String((s.location.search as any)?.tab ?? "") });
  const navigate = useNavigate();
  const activeTab = TABS.includes(urlTab) ? urlTab : "overview";
  const setActiveTab = (t: string) => navigate({ to: "/finance", search: (t === "overview" ? {} : { tab: t }) as any });
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<{ kind: Kind; record: any | null } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: Kind; record: any } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const periods = useMemo(periodOptions, []);
  const [sectionPeriod, setSectionPeriod] = useState("all");
  const period = periods.find((p) => (p.month ?? "all") === sectionPeriod) ?? periods[0];

  // Financial calculations (from saved records only)
  const fee = (i: FinInvoice) => Number(i.monthlyServiceFeeZar) || 0;
  const totalBookedMonthlyRevenue = invoices.reduce((a, i) => a + fee(i), 0);
  const verifiedInvoices = invoices.filter((i) => i.paymentStatus === "Paid & Verified");
  const verifiedCashCollected = verifiedInvoices.reduce((a, i) => a + fee(i), 0);
  const overdueInvoices = invoices.filter((i) => i.paymentStatus === "Overdue");
  const overdueReceivables = overdueInvoices.reduce((a, i) => a + fee(i), 0);
  const awaitingInvoices = invoices.filter((i) => i.paymentStatus === "Awaiting Payment");
  const awaitingReceivables = awaitingInvoices.reduce((a, i) => a + fee(i), 0);
  const collectionRate = totalBookedMonthlyRevenue > 0 ? Math.round((verifiedCashCollected / totalBookedMonthlyRevenue) * 100) : 0;
  const totalExpenses = expenses.reduce((a, e) => a + (Number(e.amountZar) || 0), 0);
  const netAgencyProfit = verifiedCashCollected - totalExpenses;
  const pendingApprovals = approvals.filter((a) => a.status === "Pending");

  const filteredInvoices = useMemo(() => {
    const s = invoiceSearch.toLowerCase();
    return invoices.filter(
      (inv) =>
        (!s || [inv.client, inv.invoiceNumber, inv.package].some((v) => String(v ?? "").toLowerCase().includes(s))) &&
        (statusFilter === "all" || inv.paymentStatus === statusFilter),
    );
  }, [invoices, invoiceSearch, statusFilter]);

  // Fees per client, from invoices actually recorded (no estimates).
  const byClient = useMemo(() => {
    const m = new Map<string, { invoiced: number; verified: number; count: number }>();
    for (const i of invoices) {
      const r = m.get(i.client) ?? { invoiced: 0, verified: 0, count: 0 };
      r.invoiced += fee(i);
      r.count += 1;
      if (i.paymentStatus === "Paid & Verified") r.verified += fee(i);
      m.set(i.client, r);
    }
    return Array.from(m, ([client, v]) => ({ client, ...v })).sort((a, b) => b.invoiced - a.invoiced);
  }, [invoices]);

  const act = async (label: string, path: string, method: string, body?: unknown, success?: string) => {
    setBusy(label);
    try {
      await api(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
      await refresh();
      if (success) toast.success(success);
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleVerifyPayment = (inv: FinInvoice) =>
    act(`verify-${inv.id}`, `/api/staff/finance/invoices/${encodeURIComponent(inv.id)}/verify`, "POST", undefined, `Payment verified: ${inv.invoiceNumber} (${formatZAR(inv.monthlyServiceFeeZar)}).`);

  const handleDecision = (app: FinApproval, status: "Approved" | "Declined") =>
    act(`decide-${app.id}`, `/api/staff/finance/approvals/${encodeURIComponent(app.id)}/decision`, "POST", { status }, `${app.title} ${status.toLowerCase()}.`);

  const confirmDelete = async () => {
    if (!deleting) return;
    const { kind, record } = deleting;
    const ok = await act(`delete-${record.id}`, `/api/staff/finance/${kind}/${encodeURIComponent(record.id)}`, "DELETE", undefined, `Deleted ${SINGULAR[kind]}: ${describe(kind, record)}.`);
    if (ok) setDeleting(null);
  };

  const exportData: FinanceData = { invoices, expenses, approvals, budgets, audit: auditLogs };

  const RowActions = ({ kind, record }: { kind: Kind; record: any }) => (
    <div className="flex items-center justify-end gap-0.5">
      <Button size="icon" variant="ghost" className="h-7 w-7" title="Download PDF" aria-label={`Download ${SINGULAR[kind]} PDF`} onClick={() => exportRecordPdf(kind, record, data?.me)}>
        <FileDown className="h-3.5 w-3.5" />
      </Button>
      {canEdit && (
        <>
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" aria-label={`Edit ${SINGULAR[kind]}`} onClick={() => setEditing({ kind, record })}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700" title="Delete" aria-label={`Delete ${SINGULAR[kind]}`} onClick={() => setDeleting({ kind, record })}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );

  const SectionExport = ({ kind, label }: { kind: "invoices" | "expenses" | "approvals" | "budgets" | "audit"; label?: string }) => (
    <Button
      size="sm"
      variant="outline"
      className="h-8 text-xs"
      onClick={() =>
        exportSectionPdf(kind, kind === "invoices" ? { ...exportData, invoices: filteredInvoices } : exportData, period, data?.me)
      }
    >
      <FileDown className="mr-1 h-3.5 w-3.5" /> {label ?? "Export PDF"}
    </Button>
  );

  if (q.isLoading)
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading finance records…
      </div>
    );
  if (q.error)
    return <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">{(q.error as Error).message}</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Role Authority Banner ────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-[#21172f] via-[#1a1026] to-[#10081a] p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 uppercase tracking-wider text-[10px]">Finance & Administration</Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40 text-[10px]">Payment Verification Gate Enforced</Badge>
              {!canEdit && (
                <Badge variant="outline" className="border-white/30 text-white/80 text-[10px]">
                  <Eye className="mr-1 h-3 w-3" /> Read-only
                </Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
              <Banknote className="h-7 w-7 text-emerald-400" />
              Finance & Administration Command Centre
            </h1>
            <p className="mt-1 text-sm text-purple-200/80 max-w-3xl">
              Manage client invoicing, enforce the payment verification gate before onboarding clearance, and maintain budget controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setExportOpen(true)} className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs h-9">
              <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export Report (PDF)
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => setEditing({ kind: "invoices", record: null })} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow text-xs gap-1.5 h-9">
                <Plus className="h-4 w-4" /> Issue Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── My attendance (clock in / out) ─────────────────────────────── */}
      <StaffAttendanceWidget />

      {canEdit && <LocalRecordsNotice onImported={refresh} />}

      {/* ─── Financial Boundary Notice ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-primary/30 bg-primary/10 text-foreground text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Financial Boundary Rule:</strong> Only MSP's own agency fees are tracked here. Client ad spend is paid directly to Meta, TikTok and Google and is not MSP revenue. Verified client payments clear the gate to unlock Operations 2-day client intake.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Audited</Badge>
      </div>

      {/* ─── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Invoiced Agency Fees</span>
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(totalBookedMonthlyRevenue)}</p>
          <p className="text-[11px] text-muted-foreground mt-2">{invoices.length} invoice{invoices.length === 1 ? "" : "s"} recorded</p>
        </Card>
        <Card className="p-4 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Verified Cash Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2">{formatZAR(verifiedCashCollected)}</p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{verifiedInvoices.length} invoices cleared</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{collectionRate}% collection</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
          </div>
        </Card>
        <Card className="p-4 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Overdue Receivables</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 mt-2">{formatZAR(overdueReceivables)}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-2">
            {overdueInvoices.length} overdue invoice{overdueInvoices.length === 1 ? "" : "s"}
          </p>
        </Card>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList className="bg-muted/70 p-1 rounded-lg border border-border flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="overview" className="text-xs px-3 py-1.5">Financial Overview</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs px-3 py-1.5">Invoices & Verification Gate ({invoices.length})</TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs px-3 py-1.5">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs px-3 py-1.5">Budgets & Clients</TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs px-3 py-1.5">Financial Approvals ({pendingApprovals.length} pending)</TabsTrigger>
            <TabsTrigger value="audit_reports" className="text-xs px-3 py-1.5">Audit Trail & Exports</TabsTrigger>
          </TabsList>
          {activeTab !== "overview" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              PDF period
              <select value={sectionPeriod} onChange={(e) => setSectionPeriod(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground" aria-label="PDF reporting period">
                {periods.map((p) => (
                  <option key={p.month ?? "all"} value={p.month ?? "all"}>{p.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Card className="p-5 border-border">
                <div className="mb-3 border-b border-border pb-2.5">
                  <h3 className="text-sm font-bold text-foreground">Cash Collection Status</h3>
                  <p className="text-xs text-muted-foreground">Billing and payment verification across all recorded invoices</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Verified & Banked</span>
                    <p className="text-xl font-bold text-emerald-500 mt-1">{formatZAR(verifiedCashCollected)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{verifiedInvoices.length} invoices cleared gate</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Awaiting Payment</span>
                    <p className="text-xl font-bold text-amber-500 mt-1">{formatZAR(awaitingReceivables)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{awaitingInvoices.length} invoices</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/5">
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Overdue Receivables</span>
                    <p className="text-xl font-bold text-rose-500 mt-1">{formatZAR(overdueReceivables)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{overdueInvoices.length} invoices past due</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Unverified Invoices Awaiting Payment Gate Action</h3>
                    <p className="text-xs text-muted-foreground">Verify client receipts to unlock onboarding intake</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setActiveTab("invoices")}>
                    All Invoices <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="divide-y divide-border text-xs">
                  {invoices.filter((i) => i.paymentStatus !== "Paid & Verified").length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No unverified invoices.</div>
                  ) : (
                    invoices
                      .filter((i) => i.paymentStatus !== "Paid & Verified")
                      .map((inv) => (
                        <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-muted-foreground">{inv.invoiceNumber}</span>
                              <span className="font-bold text-foreground">{inv.client}</span>
                              {inv.paymentStatus === "Overdue" && <Badge variant="destructive" className="text-[9px] py-0 px-1.5">OVERDUE</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Agency Fee: <strong className="text-foreground">{formatZAR(inv.monthlyServiceFeeZar)}</strong> &bull; Due: {inv.dueDate}
                            </p>
                          </div>
                          {canEdit && (
                            <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={busy === `verify-${inv.id}`} onClick={() => handleVerifyPayment(inv)}>
                              <Check className="h-3 w-3 mr-1" /> Verify Payment
                            </Button>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-5 border-border flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Financial Health Summary</h3>
                  <p className="text-xs text-muted-foreground mb-4">All recorded invoices and expenses</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted-foreground">Gross Invoiced Revenue:</span>
                      <span className="font-bold text-foreground">{formatZAR(totalBookedMonthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted-foreground">Verified Cash Received:</span>
                      <span className="font-bold text-emerald-500">{formatZAR(verifiedCashCollected)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted-foreground">Operating Expenses:</span>
                      <span className="font-bold text-foreground">{formatZAR(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-border font-semibold">
                      <span className="text-foreground">Net Operating Cash Flow:</span>
                      <span className={`font-bold ${netAgencyProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{formatZAR(netAgencyProfit)}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-2">
                  {canEdit && (
                    <Button size="sm" className="w-full text-xs bg-primary text-white" onClick={() => setEditing({ kind: "expenses", record: null })}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Record Operating Expense
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setActiveTab("approvals")}>
                    Review Financial Approvals ({pendingApprovals.length})
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── INVOICES ── */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Client Billing & Payment Verification Gate</h3>
                <p className="text-xs text-muted-foreground">Verify incoming EFT and card payments. Verified status signals Operations to begin onboarding.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search client or invoice #..." value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} className="pl-8 text-xs h-8" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground" aria-label="Payment status">
                  <option value="all">All Statuses</option>
                  {INVOICE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <SectionExport kind="invoices" />
                {canEdit && (
                  <Button size="sm" onClick={() => setEditing({ kind: "invoices", record: null })} className="h-8 text-xs bg-primary text-white font-semibold">
                    <Plus className="h-3.5 w-3.5 mr-1" /> New Invoice
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase font-semibold text-muted-foreground text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Client & Package</th>
                    <th className="py-2.5 px-3">Monthly Agency Fee</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Verification Gate</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-muted-foreground">No invoices available.</td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3 font-mono text-muted-foreground font-semibold">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{inv.client}</div>
                          <div className="text-[11px] text-muted-foreground">{inv.package || "—"}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">{formatZAR(inv.monthlyServiceFeeZar)}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{inv.dueDate}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={`text-[10px] font-semibold ${statusTone(inv.paymentStatus)}`}>{inv.paymentStatus}</Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {inv.paymentStatus === "Paid & Verified" ? (
                            <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Cleared ({inv.verifiedAt?.split(" ")[0]})</span>
                            </div>
                          ) : canEdit ? (
                            <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={busy === `verify-${inv.id}`} onClick={() => handleVerifyPayment(inv)}>
                              <Check className="h-3 w-3 mr-1" /> Verify Payment
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Not verified</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <RowActions kind="invoices" record={inv} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── EXPENSES ── */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Operating Expenses</h3>
                <p className="text-xs text-muted-foreground">Vendor payments, specialist disbursements and software overhead.</p>
              </div>
              <div className="flex gap-2">
                <SectionExport kind="expenses" />
                {canEdit && (
                  <Button size="sm" onClick={() => setEditing({ kind: "expenses", record: null })} className="h-8 text-xs bg-primary text-white font-semibold">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Log Expense
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase font-semibold text-muted-foreground text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vendor / Purpose</th>
                    <th className="py-2.5 px-3">Amount (ZAR)</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">No expenses recorded yet.</td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3"><Badge variant="outline" className="text-[10px] bg-secondary/50">{exp.category}</Badge></td>
                        <td className="py-3 px-3 font-semibold text-foreground">{exp.vendor}</td>
                        <td className="py-3 px-3 font-bold text-foreground">{formatZAR(exp.amountZar)}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{exp.date}</td>
                        <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${statusTone(exp.status)}`}>{exp.status}</Badge></td>
                        <td className="py-3 px-3"><RowActions kind="expenses" record={exp} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
                {expenses.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border font-semibold">
                      <td className="py-2.5 px-3" colSpan={2}>Total</td>
                      <td className="py-2.5 px-3">{formatZAR(totalExpenses)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── BUDGETS & CLIENTS ── */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-border space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">Operating Budgets vs Actuals</h3>
                  <p className="text-xs text-muted-foreground">Departmental cost allocations</p>
                </div>
                <div className="flex gap-2">
                  <SectionExport kind="budgets" label="PDF" />
                  {canEdit && (
                    <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ kind: "budgets", record: null })}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Budget
                    </Button>
                  )}
                </div>
              </div>
              {budgets.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">No budget records available.</div>
              ) : (
                <div className="space-y-3.5 text-xs pt-1">
                  {budgets.map((item) => {
                    const pct = item.budget ? Math.round((item.actual / item.budget) * 100) : 0;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold text-foreground">{item.dept}</span>
                          <span className="ml-auto font-mono text-muted-foreground">
                            {formatZAR(item.actual)} / {formatZAR(item.budget)} ({pct}%)
                          </span>
                          <RowActions kind="budgets" record={item} />
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div className={`h-2 rounded-full ${pct > 90 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-5 border-border space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Agency Fees by Client</h3>
                <p className="text-xs text-muted-foreground">Invoiced and verified agency fees per client, from recorded invoices</p>
              </div>
              {byClient.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">No invoices recorded yet.</div>
              ) : (
                <div className="space-y-2 text-xs pt-1">
                  {byClient.map((c) => (
                    <div key={c.client} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{c.client}</p>
                        <p className="text-[11px] text-muted-foreground">{c.count} invoice{c.count === 1 ? "" : "s"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatZAR(c.invoiced)}</p>
                        <p className="text-[10px] text-emerald-600">{formatZAR(c.verified)} verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ── APPROVALS ── */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Financial Approvals Queue</h3>
                <p className="text-xs text-muted-foreground">Expenditure requests requiring Finance & Administration authorisation.</p>
              </div>
              <div className="flex gap-2">
                <SectionExport kind="approvals" />
                {canEdit && (
                  <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ kind: "approvals", record: null })}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> New Request
                  </Button>
                )}
              </div>
            </div>
            {approvals.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-xs">No approval requests.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{app.title}</span>
                        <Badge variant="outline" className="text-[10px]">{app.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusTone(app.status)}`}>{app.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested by: <strong className="text-foreground">{app.requestedBy}</strong> ({app.department}) &bull; Date: {app.date}
                      </p>
                      {app.notes && <p className="text-[11px] text-muted-foreground italic">&quot;{app.notes}&quot;</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</span>
                        <p className="text-sm font-bold text-foreground">{formatZAR(app.amountZar)}</p>
                      </div>
                      {app.status === "Pending" && canEdit && (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={busy === `decide-${app.id}`} onClick={() => handleDecision(app, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10" disabled={busy === `decide-${app.id}`} onClick={() => handleDecision(app, "Declined")}>
                            Decline
                          </Button>
                        </div>
                      )}
                      <RowActions kind="approvals" record={app} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── AUDIT TRAIL & EXPORTS ── */}
        <TabsContent value="audit_reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-border space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">Financial Audit Trail</h3>
                  <p className="text-xs text-muted-foreground">Every change, verification, edit and deletion. Entries cannot be edited or deleted.</p>
                </div>
                <SectionExport kind="audit" label="PDF" />
              </div>
              {auditLogs.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">No transactions recorded yet.</div>
              ) : (
                <div className="max-h-[32rem] space-y-2.5 overflow-y-auto pr-1 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground font-mono">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground break-words">{log.detail}</p>
                      <p className="text-[10px] text-muted-foreground/75 font-mono">By: {log.actor}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5 border-border space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">PDF Reports</h3>
                <p className="text-xs text-muted-foreground">
                  Download the complete Finance & Administration report, or one section, for a month or for all records. Every PDF has totals in rand and page numbers.
                </p>
                <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-500 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>External Accounting: Xero / Sage not connected</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Invoices and verified collections are stored in the MSP database. There is no live sync with Xero or Sage Cloud Accounting.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => setExportOpen(true)}>
                  <FileDown className="h-4 w-4 mr-1.5" /> Download Finance Report (PDF)
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {editing && (
        <RecordDialog
          kind={editing.kind}
          record={editing.record}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            await refresh();
            toast.success(msg);
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {deleting ? SINGULAR[deleting.kind] : "record"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? <strong className="text-foreground">{describe(deleting.kind, deleting.record)}</strong> : null} will be permanently removed from the finance records and all totals. This cannot be undone. The deletion is recorded in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={busy?.startsWith("delete-")}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {busy?.startsWith("delete-") ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} periods={periods} data={exportData} me={data?.me} />
    </div>
  );
}

// ── Create / edit dialog (all record types) ─────────────────────────────────
function RecordDialog({ kind, record, onClose, onSaved }: { kind: Kind; record: any | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const isNew = !record;
  const [f, setF] = useState<Record<string, any>>(() =>
    record
      ? { ...record }
      : kind === "invoices"
        ? { client: "", package: "", monthlyServiceFeeZar: "", dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), paymentStatus: "Awaiting Payment" }
        : kind === "expenses"
          ? { vendor: "", category: EXPENSE_CATEGORIES[0], amountZar: "", date: new Date().toISOString().slice(0, 10), status: "Paid" }
          : kind === "approvals"
            ? { title: "", department: "", requestedBy: "", amountZar: "", category: APPROVAL_CATEGORIES[0], date: new Date().toISOString().slice(0, 10), notes: "" }
            : { dept: "", budget: "", actual: "" },
  );
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: any) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));

  const fields: Record<Kind, string[]> = {
    invoices: ["invoiceNumber", "client", "package", "monthlyServiceFeeZar", "dueDate", "paymentStatus"],
    expenses: ["vendor", "category", "amountZar", "date", "status"],
    approvals: ["title", "department", "requestedBy", "amountZar", "category", "date", "notes"],
    budgets: ["dept", "budget", "actual"],
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(fields[kind].filter((k) => !(isNew && k === "invoiceNumber")).map((k) => [k, f[k]]));
      if (isNew) await api(`/api/staff/finance/${kind}`, { method: "POST", body: JSON.stringify(body) });
      else await api(`/api/staff/finance/${kind}/${encodeURIComponent(record.id)}`, { method: "PATCH", body: JSON.stringify(body) });
      onSaved(isNew ? `${SINGULAR[kind][0].toUpperCase()}${SINGULAR[kind].slice(1)} saved.` : `Changes to the ${SINGULAR[kind]} saved.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const select = (k: string, opts: string[], label: string) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium" htmlFor={`fin-${k}`}>{label}</Label>
      <select id={`fin-${k}`} value={f[k] ?? ""} onChange={set(k)} required className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground">
        {opts.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
  const input = (k: string, label: string, type = "text", required = true, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium" htmlFor={`fin-${k}`}>{label}{required ? " *" : ""}</Label>
      <Input id={`fin-${k}`} type={type} value={f[k] ?? ""} onChange={set(k)} required={required} placeholder={placeholder} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} className="text-xs h-8" />
    </div>
  );
  const deptNames = DEPARTMENTS.map((d) => d.name);
  const titles: Record<Kind, string> = { invoices: "Client Invoice", expenses: "Operating Expense", approvals: "Financial Approval Request", budgets: "Department Budget" };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{isNew ? "New" : "Edit"} {titles[kind]}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {kind === "invoices" ? "MSP agency fees only. Client ad spend is paid directly to the platforms and is not invoiced here." : "Amounts in South African Rand (ZAR)."}
            {!isNew && " The change is recorded in the audit trail."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3.5 py-1">
          {kind === "invoices" && (
            <>
              {!isNew && input("invoiceNumber", "Invoice number")}
              {input("client", "Client business name")}
              {input("package", "Service package", "text", false)}
              <div className="grid grid-cols-2 gap-2.5">
                {input("monthlyServiceFeeZar", "Monthly agency fee (R)", "number")}
                {input("dueDate", "Payment due date", "date")}
              </div>
              {select("paymentStatus", INVOICE_STATUSES, "Payment status")}
            </>
          )}
          {kind === "expenses" && (
            <>
              {input("vendor", "Vendor / payee")}
              <div className="grid grid-cols-2 gap-2.5">
                {select("category", EXPENSE_CATEGORIES, "Category")}
                {input("amountZar", "Amount (R)", "number")}
                {input("date", "Date", "date")}
                {select("status", EXPENSE_STATUSES, "Status")}
              </div>
            </>
          )}
          {kind === "approvals" && (
            <>
              {input("title", "What the money is for")}
              <div className="grid grid-cols-2 gap-2.5">
                {select("department", ["", ...deptNames], "Department")}
                {input("requestedBy", "Requested by")}
                {input("amountZar", "Amount (R)", "number")}
                {select("category", APPROVAL_CATEGORIES, "Category")}
                {input("date", "Date", "date")}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium" htmlFor="fin-notes">Notes</Label>
                <Textarea id="fin-notes" value={f.notes ?? ""} onChange={set("notes")} rows={3} className="text-xs" />
              </div>
            </>
          )}
          {kind === "budgets" && (
            <>
              {select("dept", ["", ...deptNames], "Department")}
              <div className="grid grid-cols-2 gap-2.5">
                {input("budget", "Budget (R)", "number")}
                {input("actual", "Actual spend (R)", "number", false)}
              </div>
            </>
          )}
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-primary text-white font-semibold" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Save" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Export (PDF) dialog ─────────────────────────────────────────────────────
function ExportDialog({ open, onClose, periods, data, me }: { open: boolean; onClose: () => void; periods: Period[]; data: FinanceData; me?: string }) {
  const [p, setP] = useState("all");
  const [what, setWhat] = useState<"report" | "invoices" | "expenses" | "approvals" | "budgets" | "audit">("report");
  const period = periods.find((x) => (x.month ?? "all") === p) ?? periods[0];
  const go = () => {
    if (what === "report") exportFinanceReportPdf(data, period, me);
    else exportSectionPdf(what, data, period, me);
    toast.success("PDF downloaded", { description: `${period.label}` });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Export to PDF</DialogTitle>
          <DialogDescription className="text-xs">Invoices are grouped by due date; expenses and approvals by their date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="exp-what">Report</Label>
            <select id="exp-what" value={what} onChange={(e) => setWhat(e.target.value as any)} className="w-full h-9 text-xs rounded-md border border-input bg-background px-2">
              <option value="report">Complete Finance & Administration report</option>
              <option value="invoices">Invoices & payment verification</option>
              <option value="expenses">Operating expenses</option>
              <option value="approvals">Financial approval requests</option>
              <option value="budgets">Budgets vs actual</option>
              <option value="audit">Financial audit trail</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="exp-period">Reporting period</Label>
            <select id="exp-period" value={p} onChange={(e) => setP(e.target.value)} className="w-full h-9 text-xs rounded-md border border-input bg-background px-2">
              {periods.map((x) => (
                <option key={x.month ?? "all"} value={x.month ?? "all"}>{x.label}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={go}>
            <FileDown className="mr-1 h-3.5 w-3.5" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Records an older version of this page kept only in this browser ─────────
function LocalRecordsNotice({ onImported }: { onImported: () => void }) {
  const [local, setLocal] = useState<Record<Kind, any[]> | null>(null);
  const [importing, setImporting] = useState(false);
  useEffect(() => setLocal(readLocal()), []);
  const count = local ? Object.values(local).reduce((a, x) => a + x.length, 0) : 0;
  if (!local || !count) return null;
  const clear = () => {
    for (const k of Object.values(LOCAL_KEYS)) localStorage.removeItem(k);
    setLocal(null);
  };
  const importAll = async () => {
    setImporting(true);
    let ok = 0;
    const failed: string[] = [];
    for (const kind of Object.keys(local) as Kind[]) {
      for (const r of local[kind]) {
        try {
          await api(`/api/staff/finance/${kind}`, { method: "POST", body: JSON.stringify(r) });
          ok++;
        } catch (e: any) {
          failed.push(`${describe(kind, r)}: ${e.message}`);
        }
      }
    }
    setImporting(false);
    if (!failed.length) clear();
    onImported();
    if (failed.length) toast.warning(`${ok} saved, ${failed.length} not saved`, { description: failed.slice(0, 3).join("; ") });
    else toast.success(`${ok} record${ok === 1 ? "" : "s"} saved to the database.`);
  };
  return (
    <div role="status" className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
      <span>
        <strong>{count} finance record{count === 1 ? " was" : "s were"} only saved in this browser</strong> by an older version of this page and never reached the database
        ({(Object.keys(local) as Kind[]).filter((k) => local[k].length).map((k) => `${local[k].length} ${k}`).join(", ")}). Save them to the database, or discard them.
      </span>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => confirm("Discard these unsaved records from this browser?") && clear()} disabled={importing}>
          <X className="mr-1 h-3.5 w-3.5" /> Discard
        </Button>
        <Button size="sm" className="h-8 text-xs" onClick={importAll} disabled={importing}>
          <Upload className="mr-1 h-3.5 w-3.5" /> {importing ? "Saving…" : "Save to database"}
        </Button>
      </div>
    </div>
  );
}
