import { useState } from "react";
import { formatZAR } from "@/lib/currency";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  Send,
  Building2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export const Route = createFileRoute("/_authenticated/ceo/revenue")({
  head: () => ({ meta: [{ title: "Revenue Health — CEO Command Centre" }] }),
  component: RevenueHealthPage,
});

interface InvoiceRecord {
  id: string;
  client: string;
  service: string;
  invoiceNo: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  agingDays: number;
  status: "paid" | "due_soon" | "overdue";
  accountManager: string;
  paymentMethod: string;
  notes: string;
}

const INVOICE_DATA: InvoiceRecord[] = [
  {
    id: "inv-1",
    client: "Client Alpha",
    service: "Paid Ads (Meta Performance)",
    invoiceNo: "INV-2026-089",
    amount: 60000,
    issueDate: "2026-09-01",
    dueDate: "2026-09-30",
    agingDays: 13,
    status: "overdue",
    accountManager: "Sarah Jenkins",
    paymentMethod: "EFT / Bank Transfer",
    notes: "Ad spend funded but service retainer invoice pending CFO approval at client.",
  },
  {
    id: "inv-2",
    client: "Apex Solar SA",
    service: "CRM & AI Automation",
    invoiceNo: "INV-2026-092",
    amount: 120000,
    issueDate: "2026-10-01",
    dueDate: "2026-10-05",
    agingDays: 0,
    status: "paid",
    accountManager: "Sarah Jenkins",
    paymentMethod: "Debit Order",
    notes: "Full upfront onboarding & monthly subscription verified.",
  },
  {
    id: "inv-3",
    client: "TechNova",
    service: "Operations Handover & SEO",
    invoiceNo: "INV-2026-095",
    amount: 140000,
    issueDate: "2026-10-02",
    dueDate: "2026-10-08",
    agingDays: 0,
    status: "paid",
    accountManager: "Sarah Jenkins",
    paymentMethod: "EFT / Bank Transfer",
    notes: "Deposit received upon contract execution.",
  },
  {
    id: "inv-4",
    client: "Nexus Retail",
    service: "Growth Strategy & Paid Media",
    invoiceNo: "INV-2026-096",
    amount: 38000,
    issueDate: "2026-10-05",
    dueDate: "2026-10-15",
    agingDays: 0,
    status: "due_soon",
    accountManager: "David Cole",
    paymentMethod: "Monthly Retainer",
    notes: "Routine monthly cycle, awaiting scheduled auto-pay.",
  },
  {
    id: "inv-5",
    client: "BrightPath Education",
    service: "Web Platform Development",
    invoiceNo: "INV-2026-091",
    amount: 85000,
    issueDate: "2026-09-25",
    dueDate: "2026-10-02",
    agingDays: 11,
    status: "overdue",
    accountManager: "David Cole",
    paymentMethod: "Milestone Billing",
    notes: "Wireframe sign-off revision pause delayed release of 2nd milestone tranche.",
  },
  {
    id: "inv-6",
    client: "Vanguard Logistics",
    service: "GHL AI Receptionist",
    invoiceNo: "INV-2026-097",
    amount: 45000,
    issueDate: "2026-10-04",
    dueDate: "2026-10-18",
    agingDays: 0,
    status: "due_soon",
    accountManager: "Sarah Jenkins",
    paymentMethod: "Credit Card",
    notes: "Recurring monthly automation fee.",
  },
  {
    id: "inv-7",
    client: "Silverline Properties",
    service: "Lead Gen & Paid Search",
    invoiceNo: "INV-2026-088",
    amount: 52000,
    issueDate: "2026-09-28",
    dueDate: "2026-10-03",
    agingDays: 0,
    status: "paid",
    accountManager: "David Cole",
    paymentMethod: "EFT / Bank Transfer",
    notes: "Cleared and allocated to Q4 media budget.",
  },
  {
    id: "inv-8",
    client: "Zenith Health SA",
    service: "Content & Community Management",
    invoiceNo: "INV-2026-090",
    amount: 32000,
    issueDate: "2026-09-30",
    dueDate: "2026-10-04",
    agingDays: 0,
    status: "paid",
    accountManager: "Sarah Jenkins",
    paymentMethod: "Debit Order",
    notes: "Monthly retainer on auto-reconciliation.",
  },
];

const REVENUE_TREND_DATA = [
  { month: "May 2026", Collected: 410, Invoiced: 450 },
  { month: "Jun 2026", Collected: 440, Invoiced: 480 },
  { month: "Jul 2026", Collected: 465, Invoiced: 500 },
  { month: "Aug 2026", Collected: 480, Invoiced: 530 },
  { month: "Sep 2026", Collected: 495, Invoiced: 560 },
  { month: "Oct 2026", Collected: 520, Invoiced: 650 },
];

const AGING_BREAKDOWN = [
  { range: "Current (<15d)", amount: 460 },
  { range: "15–30 Days", amount: 80 },
  { range: "31–60 Days", amount: 50 },
  { range: "60+ Days", amount: 10 },
];

function RevenueHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "due_soon" | "overdue">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const filteredInvoices = INVOICE_DATA.filter((inv) => {
    const matchesSearch =
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.accountManager.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return inv.status === statusFilter;
  });

  const totalCollected = INVOICE_DATA.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = INVOICE_DATA.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
  const totalDueSoon = INVOICE_DATA.filter((i) => i.status === "due_soon").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Breadcrumb & Executive Navigation ─────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/ceo" className="hover:text-foreground inline-flex items-center gap-1 font-medium text-[#3b1d4d] dark:text-primary">
          <ArrowLeft className="h-3 w-3" /> Executive Command Centre
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Revenue & Financial Health</span>
      </div>

      {/* ─── Executive Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <Banknote className="h-3.5 w-3.5" /> Financial Telemetry
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                Q4 Target: R650,000
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Revenue & Financial Health
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time monitoring of cash collections, monthly billed retainers, aged debt, and gross margin integrity for Mavis Strategic Partners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Financial records re-synced with Xero & payment gateways.")}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-sync Ledger
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Invoice and collections register exported to CSV.")}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Ledger CSV
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 Professional KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Cash Collected</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              On Track
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">R520,000</span>
            <span className="text-xs text-muted-foreground">/ R650k target</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +12.4% MoM
            </span>
            <span className="text-muted-foreground">80.0% Paced</span>
          </div>
          <Progress value={80} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Booked Revenue</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Committed
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">R650,000</span>
            <span className="text-xs text-muted-foreground">Total Invoiced</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> 100% of Target
            </span>
            <span className="text-muted-foreground">R480k Retainers</span>
          </div>
          <Progress value={100} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Overdue Debt</span>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">
              Critical Risk
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">R60,000</span>
            <span className="text-xs text-muted-foreground">2 Accounts</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" /> 9.2% of Total
            </span>
            <span className="text-muted-foreground">Client Alpha (13d)</span>
          </div>
          <Progress value={20} className="mt-2.5 h-1.5 bg-muted [&>div]:bg-rose-500" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Gross Operating Margin</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Healthy
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">68.2%</span>
            <span className="text-xs text-muted-foreground">Target: 65%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +3.2% vs Benchmark
            </span>
            <span className="text-muted-foreground">Media spend excl.</span>
          </div>
          <Progress value={68.2} className="mt-2.5 h-1.5 bg-muted" />
        </Card>
      </div>

      {/* ─── Financial Charts Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Cash Collection Trend (2 Cols) */}
        <Card className="border-border p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">6-Month Cash Inflow vs Billed Target (R '000)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Historical trajectory showing collection realization pace.</p>
            </div>
            <Badge variant="outline" className="text-xs">May – Oct 2026</Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b1d4d" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b1d4d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area type="monotone" dataKey="Invoiced" stroke="#10b981" fillOpacity={1} fill="url(#colorInvoiced)" />
                <Area type="monotone" dataKey="Collected" stroke="#3b1d4d" fillOpacity={1} fill="url(#colorCollected)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Debt Aging Breakdown (1 Col) */}
        <Card className="border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Accounts Receivable Aging</h3>
              <Badge variant="outline" className="text-xs">Total R600k</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Distribution of billed invoices by age bracket.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AGING_BREAKDOWN} layout="vertical" margin={{ top: 10, right: 20, left: 25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="range" type="category" tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="amount" fill="#3b1d4d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">Aging Risk Alert:</span>
            <p className="text-foreground text-[11px] leading-relaxed">
              Client Alpha (R60k) has passed 13 days past due. Automatic reminders active; requires Ops Manager sign-off.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Interactive Invoices & Ledger Table ───────────────────────────── */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Executive Billing & Invoice Register
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete audit trail of monthly invoices, payment methods, and automated collection statuses.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter client, invoice #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background w-full sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({INVOICE_DATA.length})
                </button>
                <button
                  onClick={() => setStatusFilter("paid")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "paid" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setStatusFilter("due_soon")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "due_soon" ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Due
                </button>
                <button
                  onClick={() => setStatusFilter("overdue")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "overdue" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overdue
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Client & Service</th>
                <th className="p-3.5 font-mono">Invoice #</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Account Lead</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <strong className="text-sm text-foreground block">{inv.client}</strong>
                    <span className="text-muted-foreground text-[11px]">{inv.service}</span>
                  </td>
                  <td className="p-3.5 font-mono text-muted-foreground font-semibold">
                    {inv.invoiceNo}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-sm text-foreground">
                    {formatZAR(inv.amount)}
                  </td>
                  <td className="p-3.5 text-muted-foreground">{inv.issueDate}</td>
                  <td className={`p-3.5 font-medium ${inv.status === "overdue" ? "text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"}`}>
                    {inv.dueDate}
                    {inv.status === "overdue" && (
                      <span className="block text-[10px] text-rose-500 font-normal">
                        ({inv.agingDays} days late)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-foreground">{inv.accountManager}</td>
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        inv.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : inv.status === "due_soon"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      }`}
                    >
                      {inv.status === "paid" && <CheckCircle2 className="mr-1 h-3 w-3 inline" />}
                      {inv.status === "overdue" && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
                      {inv.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(inv);
                      }}
                    >
                      Inspect <ChevronRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Invoice Detail Modal ──────────────────────────────────────────── */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <FileText className="h-5 w-5 text-[#3b1d4d] dark:text-primary" />
                Invoice Inspection — {selectedInvoice.invoiceNo}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedInvoice.client} · {selectedInvoice.service}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Billed Amount</span>
                  <strong className="text-lg font-bold text-foreground">
                    {formatZAR(selectedInvoice.amount)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Payment Status</span>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-[10px] font-bold ${
                      selectedInvoice.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : selectedInvoice.status === "due_soon"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                    }`}
                  >
                    {selectedInvoice.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Due Date</span>
                  <span className="text-foreground font-semibold">{selectedInvoice.dueDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Payment Method</span>
                  <span className="text-foreground font-semibold">{selectedInvoice.paymentMethod}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Collections Notes:</span>
                <p className="text-muted-foreground leading-relaxed">{selectedInvoice.notes}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedInvoice.status === "overdue" && (
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1.5"
                  onClick={() => {
                    toast.success(`Collections reminder dispatched to ${selectedInvoice.client}.`);
                    setSelectedInvoice(null);
                  }}
                >
                  <Mail className="h-3.5 w-3.5" /> Dispatch Urgent Reminder
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedInvoice(null)}
              >
                Close View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
