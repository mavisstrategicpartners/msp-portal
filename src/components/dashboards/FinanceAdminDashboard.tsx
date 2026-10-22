import { useState, useMemo } from "react";
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
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Plus,
  Filter,
  Search,
  Download,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  XCircle,
  TrendingDown,
  PieChart,
  Lock,
  RotateCcw,
} from "lucide-react";
import { useSupabaseTable } from "@/lib/useSupabaseTable.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  package: string;
  monthlyServiceFeeZar: number; // Pure MSP agency fee
  clientMediaSpendZar: number;  // Direct ad spend on Meta/Google
  paymentStatus: "Paid & Verified" | "Awaiting Payment" | "Overdue";
  dueDate: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ExpenseItem {
  id: string;
  category: "Software & SaaS" | "Media & Tools" | "Contractor Payouts" | "Operations & Office" | "Legal & Compliance";
  vendor: string;
  amountZar: number;
  date: string;
  status: "Paid" | "Pending Approval" | "Scheduled";
  approvedBy?: string;
}

export interface FinancialApprovalItem {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  amountZar: number;
  category: "Software" | "Contractor" | "Equipment" | "Client Refund" | "Operational";
  status: "Pending" | "Approved" | "Declined";
  date: string;
  notes: string;
}

export interface BudgetRecord {
  id: string;
  dept: string;
  budget: number;
  actual: number;
}

export interface FinanceAuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
}

const DEFAULT_INVOICES: ClientInvoice[] = [];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-seed-1",
    vendor: "Google Cloud & Workspace",
    category: "Software & SaaS",
    amountZar: 14850,
    date: "2026-10-05",
    status: "Paid",
    approvedBy: "Finance & Administration Manager",
  },
  {
    id: "exp-seed-2",
    vendor: "Meta Business Ads Infrastructure",
    category: "Media & Tools",
    amountZar: 28500,
    date: "2026-10-12",
    status: "Paid",
    approvedBy: "Finance & Administration Manager",
  },
];

const DEFAULT_APPROVALS: FinancialApprovalItem[] = [
  {
    id: "app-seed-1",
    title: "High-Performance Workstation Upgrade",
    department: "Operations",
    requestedBy: "Technical Lead",
    amountZar: 32000,
    category: "Equipment",
    status: "Pending",
    date: "2026-10-18",
    notes: "Upgraded rendering hardware required for 4K video client deliverable batch.",
  },
];

const DEFAULT_BUDGETS: BudgetRecord[] = [
  { id: "b-ops", dept: "Operations & Delivery", budget: 120000, actual: 84500 },
  { id: "b-mkt", dept: "Media & Client Performance", budget: 250000, actual: 198000 },
  { id: "b-tech", dept: "Software & Technology", budget: 65000, actual: 42300 },
  { id: "b-sales", dept: "Sales & Client Acquisition", budget: 80000, actual: 61000 },
  { id: "b-admin", dept: "Executive & Administration", budget: 50000, actual: 38200 },
];

const DEFAULT_AUDIT_LOGS: FinanceAuditLog[] = [
  {
    id: "audit-init-1",
    time: "2026-10-01 08:30",
    actor: "System / Finance Engine",
    action: "Fiscal Control Initialized",
    detail: "October 2026 fiscal cycle opened with gate controls active",
  },
];

export function FinanceAdminDashboard() {
  // HOOKS PERSISTENT VIA SUPABASE WITH AUTOMATIC LOCALSTORAGE FALLBACK
  const [invoicesRaw, setInvoices, loading] = useSupabaseTable("finance_invoices", DEFAULT_INVOICES);
  const invoices: ClientInvoice[] = (invoicesRaw as ClientInvoice[]) || DEFAULT_INVOICES;
  const [expensesRaw, setExpenses] = useSupabaseTable("finance_expenses", DEFAULT_EXPENSES);
  const expenses: ExpenseItem[] = (expensesRaw as ExpenseItem[]) || DEFAULT_EXPENSES;
  const [approvalsRaw, setApprovals] = useSupabaseTable("finance_approvals", DEFAULT_APPROVALS);
  const approvals: FinancialApprovalItem[] = (approvalsRaw as FinancialApprovalItem[]) || DEFAULT_APPROVALS;
  const [budgetsRaw, setBudgets] = useSupabaseTable("finance_budgets", DEFAULT_BUDGETS);
  const budgets: BudgetRecord[] = (budgetsRaw as BudgetRecord[]) || DEFAULT_BUDGETS;
  const [auditLogsRaw, setAuditLogs] = useSupabaseTable("finance_audit_trail", DEFAULT_AUDIT_LOGS);
  const auditLogs: FinanceAuditLog[] = (auditLogsRaw as FinanceAuditLog[]) || DEFAULT_AUDIT_LOGS;

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState("overview");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Invoice Modal State
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newPackage, setNewPackage] = useState("");
  const [newAgencyFee, setNewAgencyFee] = useState("35000");
  const [newMediaSpend, setNewMediaSpend] = useState("50000");
  const [newDueDate, setNewDueDate] = useState("");

  // Add Expense Modal State
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseItem["category"]>("Software & SaaS");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Approval Action State
  const [selectedApproval, setSelectedApproval] = useState<FinancialApprovalItem | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  // Financial Calculations
  const totalBookedMonthlyRevenue = invoices.reduce((acc, inv) => acc + (Number(inv.monthlyServiceFeeZar) || 0), 0);
  const totalClientMediaSpend = invoices.reduce((acc, inv) => acc + (Number(inv.clientMediaSpendZar) || 0), 0);
  
  const verifiedInvoices = invoices.filter((inv) => inv.paymentStatus === "Paid & Verified");
  const verifiedCashCollected = verifiedInvoices.reduce((acc, inv) => acc + (Number(inv.monthlyServiceFeeZar) || 0), 0);
  
  const overdueInvoices = invoices.filter((inv) => inv.paymentStatus === "Overdue");
  const overdueReceivables = overdueInvoices.reduce((acc, inv) => acc + (Number(inv.monthlyServiceFeeZar) || 0), 0);
  
  const awaitingInvoices = invoices.filter((inv) => inv.paymentStatus === "Awaiting Payment");
  const awaitingReceivables = awaitingInvoices.reduce((acc, inv) => acc + (Number(inv.monthlyServiceFeeZar) || 0), 0);

  const collectionRate = totalBookedMonthlyRevenue > 0
    ? Math.round((verifiedCashCollected / totalBookedMonthlyRevenue) * 100)
    : 0;

  const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amountZar) || 0), 0);
  const netAgencyProfit = verifiedCashCollected - totalExpenses;

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        invoiceSearch === "" ||
        inv.client.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.package.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, invoiceSearch, statusFilter]);

  // Payment Verification Gate Handler
  const handleVerifyPayment = (id: string) => {
    const today = new Date().toISOString().replace("T", " ").substring(0, 16);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              paymentStatus: "Paid & Verified",
              verifiedAt: today,
              verifiedBy: "Finance & Administration Manager",
            }
          : inv
      )
    );
    const targetInv = invoices.find((i) => i.id === id);
    if (targetInv) {
      setAuditLogs((prev) => [
        {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          time: today,
          actor: "Finance & Administration Manager",
          action: "Payment Gate Clearance",
          detail: `${targetInv.invoiceNumber} verified (${formatZAR(targetInv.monthlyServiceFeeZar)})`,
        },
        ...prev,
      ]);
    }
    toast.success("Payment Verified & Gate Clearance Recorded! 🚀", {
      description: "Financial clearance confirmed. Operations Onboarding Intake clock is now officially unlocked.",
    });
  };

  // Create Invoice Handler
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim()) {
      toast.error("Client name is required.");
      return;
    }

    const today = new Date().toISOString().replace("T", " ").substring(0, 16);
    const nextNum = `INV-2026-00${invoices.length + 1}`;
    const newInv: ClientInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNum,
      client: newClient.trim(),
      package: newPackage.trim() || "Performance Growth Retainer",
      monthlyServiceFeeZar: Number(newAgencyFee) || 35000,
      clientMediaSpendZar: Number(newMediaSpend) || 0,
      paymentStatus: "Awaiting Payment",
      dueDate: newDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    };

    setInvoices((prev) => [newInv, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: today,
        actor: "Finance & Administration Manager",
        action: "Invoice Issued",
        detail: `${nextNum} ${newInv.client} (${formatZAR(newInv.monthlyServiceFeeZar)})`,
      },
      ...prev,
    ]);
    toast.success("Client Invoice Issued", {
      description: `${nextNum} for ${newInv.client} (${formatZAR(newInv.monthlyServiceFeeZar)}) added to billing records.`,
    });

    setCreateInvoiceOpen(false);
    setNewClient("");
    setNewPackage("");
    setNewDueDate("");
  };

  // Add Expense Handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseVendor.trim() || !expenseAmount) {
      toast.error("Vendor and amount are required.");
      return;
    }

    const today = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      vendor: expenseVendor.trim(),
      category: expenseCategory,
      amountZar: Number(expenseAmount) || 0,
      date: new Date().toISOString().split("T")[0],
      status: "Paid",
      approvedBy: "Finance & Administration Manager",
    };

    setExpenses((prev) => [newExp, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: today,
        actor: "Finance & Administration Manager",
        action: "Operating Expense Disbursed",
        detail: `${newExp.vendor} (${formatZAR(newExp.amountZar)})`,
      },
      ...prev,
    ]);
    toast.success("Expense Recorded", {
      description: `${newExp.vendor} (${formatZAR(newExp.amountZar)}) logged under ${newExp.category}.`,
    });

    setAddExpenseOpen(false);
    setExpenseVendor("");
    setExpenseAmount("");
  };

  // Approval Decision Handler
  const handleDecisionApproval = (status: "Approved" | "Declined") => {
    if (!selectedApproval) return;

    const today = new Date().toISOString().replace("T", " ").substring(0, 16);
    setApprovals((prev) =>
      prev.map((app) => (app.id === selectedApproval.id ? { ...app, status } : app))
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: today,
        actor: "Finance & Administration Manager",
        action: `Expenditure ${status}`,
        detail: `${selectedApproval.title} (${formatZAR(selectedApproval.amountZar)})`,
      },
      ...prev,
    ]);

    if (status === "Approved") {
      toast.success("Financial Expenditure Approved", {
        description: `${selectedApproval.title} (${formatZAR(selectedApproval.amountZar)}) approved for disbursement.`,
      });
    } else {
      toast.error("Financial Request Declined", {
        description: `${selectedApproval.title} has been rejected with audit note.`,
      });
    }

    setApprovalModalOpen(false);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = "InvoiceNumber,Client,Package,MonthlyAgencyFeeZAR,ClientMediaSpendZAR,PaymentStatus,DueDate,VerifiedAt\n";
    const rows = invoices
      .map(
        (i) =>
          `"${i.invoiceNumber}","${i.client}","${i.package}",${i.monthlyServiceFeeZar},${i.clientMediaSpendZar},"${i.paymentStatus}","${i.dueDate}","${i.verifiedAt || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MSP_Invoices_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial Report Exported (CSV)", {
      description: "Detailed invoices file downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Role Authority Banner ────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-[#21172f] via-[#1a1026] to-[#10081a] p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 uppercase tracking-wider text-[10px]">
                Finance & Administration
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40 text-[10px]">
                Payment Verification Gate Enforced
              </Badge>
              <span className="text-xs text-purple-200/60 font-mono">
                SAST 08:00–17:00 &bull; Financial Boundary Active
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
              <Banknote className="h-7 w-7 text-emerald-400" />
              Finance & Administration Command Centre
            </h1>
            <p className="mt-1 text-sm text-purple-200/80 max-w-3xl">
              Strict financial oversight: Manage client invoicing, enforce the payment verification gate before onboarding clearance, separate agency fees from client media spend, and maintain budget controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs h-9 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Report (CSV)
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateInvoiceOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Issue Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Financial Boundary Notice ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-primary/30 bg-primary/10 text-foreground text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Financial Boundary Rule:</strong> Agency service fees are separated from direct client media spend. Verified client payments clear the gate to unlock Operations 2-day client intake.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
          Audited
        </Badge>
      </div>

      {/* ─── Financial Telemetry KPI Cards ─────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Invoiced Agency Fees */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Invoiced Agency Fees</span>
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(totalBookedMonthlyRevenue)}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Pure agency service retainers (excludes client ad spend)
          </p>
        </Card>

        {/* Metric 2: Verified Cash Collected */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-emerald-500/40 transition">
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

        {/* Metric 3: Overdue Receivables */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Overdue Receivables</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 mt-2">{formatZAR(overdueReceivables)}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-2">
            {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} requiring payment follow-up
          </p>
        </Card>

        {/* Metric 4: Client Media Spend Under Management */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Client Ad Spend Managed</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(totalClientMediaSpend)}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Direct client ad spend on Meta & Google (Zero agency markup)
          </p>
        </Card>
      </div>

      {/* ─── Sub-Navigation Tabs ─────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/70 p-1 rounded-lg border border-border flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Invoices & Verification Gate ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Revenue & Expenses
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Budgets & Profitability
          </TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Financial Approvals ({approvals.filter((a) => a.status === "Pending").length} pending)
          </TabsTrigger>
          <TabsTrigger value="audit_reports" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Audit Trail & Exports
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Left 2 cols: Cash position & Gate Status */}
            <div className="md:col-span-2 space-y-4">
              <Card className="p-5 border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Cash Collection Velocity & Status</h3>
                    <p className="text-xs text-muted-foreground">Current month billing and payment verification breakdown</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    SAST Real-time
                  </Badge>
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
                    <p className="text-[10px] text-muted-foreground mt-0.5">{awaitingInvoices.length} invoices in window</p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/5">
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Overdue Receivables</span>
                    <p className="text-xl font-bold text-rose-500 mt-1">{formatZAR(overdueReceivables)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{overdueInvoices.length} invoice past due</p>
                  </div>
                </div>
              </Card>

              {/* Action Required: Unverified Payments */}
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
                  {invoices.filter((inv) => inv.paymentStatus !== "Paid & Verified").length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No invoices available.
                    </div>
                  ) : (
                    invoices
                      .filter((inv) => inv.paymentStatus !== "Paid & Verified")
                      .map((inv) => (
                        <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-muted-foreground">{inv.invoiceNumber}</span>
                              <span className="font-bold text-foreground">{inv.client}</span>
                              {inv.paymentStatus === "Overdue" && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1.5">OVERDUE</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Agency Fee: <strong className="text-foreground">{formatZAR(inv.monthlyServiceFeeZar)}</strong> &bull; Media Spend: {formatZAR(inv.clientMediaSpendZar)} &bull; Due: {inv.dueDate}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => handleVerifyPayment(inv.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Verify Payment
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right col: Operating Margin & Quick Expense Action */}
            <div className="space-y-4">
              <Card className="p-5 border-border flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Financial Health Summary</h3>
                  <p className="text-xs text-muted-foreground mb-4">October 2026 Monthly Snapshot</p>

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
                      <span className={`font-bold ${netAgencyProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {formatZAR(netAgencyProfit)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    size="sm"
                    className="w-full text-xs bg-primary text-white"
                    onClick={() => setAddExpenseOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Record Operating Expense
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setActiveTab("approvals")}
                  >
                    Review Financial Approvals ({approvals.filter((a) => a.status === "Pending").length})
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: INVOICES & VERIFICATION GATE ─────────────────────────── */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Client Billing & Payment Verification Gate</h3>
                <p className="text-xs text-muted-foreground">
                  Verify incoming EFT and card payments. Verified status signals Operations to begin onboarding.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search client or invoice #..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid & Verified">Paid & Verified</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Overdue">Overdue</option>
                </select>

                <Button size="sm" onClick={() => setCreateInvoiceOpen(true)} className="h-8 text-xs bg-primary text-white font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Invoice
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase font-semibold text-muted-foreground text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Client & Package</th>
                    <th className="py-2.5 px-3">Monthly Agency Fee</th>
                    <th className="py-2.5 px-3">Client Media Spend</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Verification Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-muted-foreground text-xs">
                        No invoices available.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3 font-mono text-muted-foreground font-semibold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{inv.client}</div>
                          <div className="text-[11px] text-muted-foreground">{inv.package}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">
                          {formatZAR(inv.monthlyServiceFeeZar)}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {formatZAR(inv.clientMediaSpendZar)}
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">
                          {inv.dueDate}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              inv.paymentStatus === "Paid & Verified"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold"
                                : inv.paymentStatus === "Overdue"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-semibold"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold"
                            }`}
                          >
                            {inv.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {inv.paymentStatus === "Paid & Verified" ? (
                            <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Cleared ({inv.verifiedAt?.split(" ")[0]})</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              onClick={() => handleVerifyPayment(inv.id)}
                            >
                              <Check className="h-3 w-3 mr-1" /> Verify Payment
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 3: REVENUE & EXPENSES ──────────────────────────────────── */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Agency Revenue & Operating Expenses</h3>
                <p className="text-xs text-muted-foreground">
                  Track vendor payments, specialist disbursements, and software overhead.
                </p>
              </div>
              <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="h-8 text-xs bg-primary text-white font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Expense
              </Button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px] bg-secondary/50">
                            {exp.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">{exp.vendor}</td>
                        <td className="py-3 px-3 font-bold text-foreground">{formatZAR(exp.amountZar)}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{exp.date}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          >
                            {exp.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 4: BUDGETS & PROFITABILITY ─────────────────────────────── */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-border space-y-4">
              <h3 className="text-base font-bold text-foreground">Monthly Operating Budgets vs Actuals</h3>
              <p className="text-xs text-muted-foreground">Monitored departmental cost allocations for October 2026</p>

              {budgets.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">
                  No budget records available.
                </div>
              ) : (
                <div className="space-y-3.5 text-xs pt-1">
                  {budgets.map((item) => {
                    const pct = Math.round((item.actual / item.budget) * 100);
                    return (
                      <div key={item.dept} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-foreground">{item.dept}</span>
                          <span className="font-mono text-muted-foreground">
                            {formatZAR(item.actual)} / {formatZAR(item.budget)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${pct > 90 ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-5 border-border space-y-4">
              <h3 className="text-base font-bold text-foreground">Client Retainer Profitability</h3>
              <p className="text-xs text-muted-foreground">Gross contribution margin per active account</p>

              {invoices.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">
                  No financial data available for this reporting period.
                </div>
              ) : (
                <div className="space-y-2 text-xs pt-1">
                  {invoices.slice(0, 5).map((inv) => {
                    const estimatedCost = inv.monthlyServiceFeeZar * 0.35; // 35% delivery cost estimate
                    const margin = inv.monthlyServiceFeeZar - estimatedCost;
                    const marginPct = Math.round((margin / inv.monthlyServiceFeeZar) * 100);
                    return (
                      <div key={inv.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{inv.client}</p>
                          <p className="text-[11px] text-muted-foreground">{inv.package}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-500">{formatZAR(margin)}</p>
                          <p className="text-[10px] text-muted-foreground">{marginPct}% gross margin</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 5: FINANCIAL APPROVALS ──────────────────────────────────── */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Financial Approvals Queue</h3>
                <p className="text-xs text-muted-foreground">
                  Departmental expense requests requiring Finance & Administration Manager authorization.
                </p>
              </div>
            </div>

            {approvals.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-xs">
                No pending approvals.
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{app.title}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {app.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            app.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : app.status === "Declined"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested by: <strong className="text-foreground">{app.requestedBy}</strong> ({app.department}) &bull; Date: {app.date}
                      </p>
                      <p className="text-[11px] text-muted-foreground italic">&quot;{app.notes}&quot;</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</span>
                        <p className="text-sm font-bold text-foreground">{formatZAR(app.amountZar)}</p>
                      </div>

                      {app.status === "Pending" ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => {
                              setSelectedApproval(app);
                              handleDecisionApproval("Approved");
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                            onClick={() => {
                              setSelectedApproval(app);
                              handleDecisionApproval("Declined");
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">Decided</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── TAB 6: AUDIT TRAIL & EXPORTS ─────────────────────────────────── */}
        <TabsContent value="audit_reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-border space-y-4">
              <h3 className="text-base font-bold text-foreground">Financial Audit Trail</h3>
              <p className="text-xs text-muted-foreground">Immutable record of financial transactions and gate verifications</p>

              {auditLogs.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {auditLogs.map((log, idx) => (
                    <div key={log.id || idx} className="p-3 rounded-lg border border-border bg-card space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground font-mono">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{log.detail}</p>
                      <p className="text-[10px] text-muted-foreground/75 font-mono">By: {log.actor}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5 border-border space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Accounting Software Integration Status</h3>
                <p className="text-xs text-muted-foreground">
                  Direct ledger sync with external accounting infrastructure
                </p>

                <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-500 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>External Accounting Standby: Xero / Sage Cloud</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Direct two-way synchronization with Xero or Sage Cloud Accounting is currently in standby mode pending production API credentials. All financial invoices and verified collections are currently audited and stored natively in the MSP database.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  size="sm"
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download Invoices & Collections CSV
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL: CREATE INVOICE ────────────────────────────────────────── */}
      <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Issue New Client Invoice</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate an official MSP service invoice. Service fee is separated from media ad spend.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Client Business Name *</Label>
              <Input
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="e.g. Apex Solar SA"
                required
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Service Package</Label>
              <Input
                value={newPackage}
                onChange={(e) => setNewPackage(e.target.value)}
                placeholder="e.g. Performance Ads + WhatsApp CRM"
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Monthly Agency Fee (ZAR) *</Label>
                <Input
                  type="number"
                  value={newAgencyFee}
                  onChange={(e) => setNewAgencyFee(e.target.value)}
                  placeholder="35000"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Client Direct Media Spend (ZAR)</Label>
                <Input
                  type="number"
                  value={newMediaSpend}
                  onChange={(e) => setNewMediaSpend(e.target.value)}
                  placeholder="50000"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Payment Due Date</Label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateInvoiceOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Generate Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: RECORD EXPENSE ────────────────────────────────────────── */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Record Operating Expense</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Log overhead, software subscriptions, or specialist contractor payouts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Vendor / Payee *</Label>
              <Input
                value={expenseVendor}
                onChange={(e) => setExpenseVendor(e.target.value)}
                placeholder="e.g. GoHighLevel / Contractor Name"
                required
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Category</Label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Media & Tools">Media & Tools</option>
                  <option value="Contractor Payouts">Contractor Payouts</option>
                  <option value="Operations & Office">Operations & Office</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Amount (ZAR) *</Label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="4500"
                  required
                  className="text-xs h-8"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddExpenseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Record Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
