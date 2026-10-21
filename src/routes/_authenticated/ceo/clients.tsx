import { useState } from "react";
import { formatZAR } from "@/lib/currency";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Mail,
  ChevronRight,
  ExternalLink,
  Users,
  Smile,
  ShieldCheck,
  Zap,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/ceo/clients")({
  head: () => ({ meta: [{ title: "Client Health — CEO Command Centre" }] }),
  component: ClientHealthPage,
});

interface ClientRecord {
  id: string;
  client: string;
  industry: string;
  mrr: number;
  healthStatus: "healthy" | "warning" | "critical";
  healthScore: number;
  riskFactor: string;
  accountManager: string;
  lastCheckIn: string;
  nextReview: string;
  sentiment: string;
  openMilestones: number;
  notes: string;
}

const CLIENT_RECORDS: ClientRecord[] = [
  {
    id: "cl-1",
    client: "Client Alpha",
    industry: "Financial Brokerage",
    mrr: 25000,
    healthStatus: "critical",
    healthScore: 42,
    riskFactor: "Live Campaign Launch 9 working hrs late",
    accountManager: "Sarah Jenkins",
    lastCheckIn: "Yesterday, 09:00 SAST",
    nextReview: "Today, 12:00 SAST",
    sentiment: "Client inquiring why paid ads are not yet live after funding budget.",
    openMilestones: 3,
    notes: "Requires CEO budget override to unblock Media Buying Lead approval.",
  },
  {
    id: "cl-2",
    client: "Nexus Retail Group",
    industry: "Consumer Electronics",
    mrr: 38000,
    healthStatus: "warning",
    healthScore: 68,
    riskFactor: "No executive contact for 14 days; check-in overdue",
    accountManager: "David Cole",
    lastCheckIn: "14 days ago",
    nextReview: "Today, 15:00 SAST",
    sentiment: "Low engagement; marketing director on annual leave.",
    openMilestones: 1,
    notes: "David Cole scheduled to reach acting brand manager today.",
  },
  {
    id: "cl-3",
    client: "Apex Solar SA",
    industry: "Clean Energy",
    mrr: 120000,
    healthStatus: "healthy",
    healthScore: 92,
    riskFactor: "Meta Business delegate access pending (minor)",
    accountManager: "Sarah Jenkins",
    lastCheckIn: "Yesterday, 16:00 SAST",
    nextReview: "Tomorrow, 10:00 SAST",
    sentiment: "Very satisfied with initial CRM automation wireframes.",
    openMilestones: 2,
    notes: "High potential for nationwide expansion contract in Q1 2027.",
  },
  {
    id: "cl-4",
    client: "TechNova Solutions",
    industry: "Enterprise Software",
    mrr: 140000,
    healthStatus: "healthy",
    healthScore: 96,
    riskFactor: "None (Onboarding smoothly)",
    accountManager: "Sarah Jenkins",
    lastCheckIn: "Today, 11:00 SAST",
    nextReview: "Oct 15, 2026",
    sentiment: "Impressed with speed of Operations handover pack delivery.",
    openMilestones: 4,
    notes: "Contract executed for 6-month initial term.",
  },
  {
    id: "cl-5",
    client: "BrightPath Education",
    industry: "Higher Ed & EdTech",
    mrr: 85000,
    healthStatus: "warning",
    healthScore: 74,
    riskFactor: "Round 3 revision loop on homepage wireframe",
    accountManager: "David Cole",
    lastCheckIn: "Today, 08:30 SAST",
    nextReview: "Today, 16:00 SAST",
    sentiment: "Client demanding minor layout tweaks beyond agreed scope.",
    openMilestones: 2,
    notes: "Design lead issuing formal scope-limit notice with final delivery.",
  },
  {
    id: "cl-6",
    client: "Silverline Properties",
    industry: "Real Estate Development",
    mrr: 52000,
    healthStatus: "healthy",
    healthScore: 88,
    riskFactor: "None (Pacing on Google Ads CPL)",
    accountManager: "David Cole",
    lastCheckIn: "Oct 6, 2026",
    nextReview: "Oct 20, 2026",
    sentiment: "Cost per lead reduced by 22% in first 30 days.",
    openMilestones: 1,
    notes: "Scheduled for quarterly strategy review next week.",
  },
  {
    id: "cl-7",
    client: "Zenith Health SA",
    industry: "Private Healthcare",
    mrr: 32000,
    healthStatus: "healthy",
    healthScore: 94,
    riskFactor: "None (Routine recurring)",
    accountManager: "Sarah Jenkins",
    lastCheckIn: "Oct 7, 2026",
    nextReview: "Oct 21, 2026",
    sentiment: "Consistent high engagement across patient community channels.",
    openMilestones: 1,
    notes: "Stable retainer account with 100% on-time milestone delivery.",
  },
];

const HEALTH_DISTRIBUTION = [
  { name: "Healthy (Green)", count: 12, fill: "#10b981" },
  { name: "Warning (Amber)", count: 3, fill: "#f59e0b" },
  { name: "Critical (Red)", count: 1, fill: "#e11d48" },
];

const RETENTION_TREND = [
  { month: "May 2026", rate: 96 },
  { month: "Jun 2026", rate: 97 },
  { month: "Jul 2026", rate: 95 },
  { month: "Aug 2026", rate: 95 },
  { month: "Sep 2026", rate: 96.5 },
  { month: "Oct 2026", rate: 94.1 },
];

function ClientHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  const filteredClients = CLIENT_RECORDS.filter((cl) => {
    const matchesSearch =
      cl.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.accountManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.riskFactor.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (healthFilter === "all") return true;
    return cl.healthStatus === healthFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/ceo" className="hover:text-foreground inline-flex items-center gap-1 font-medium text-[#3b1d4d] dark:text-primary">
          <ArrowLeft className="h-3 w-3" /> Executive Command Centre
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Client Health & Retention</span>
      </div>

      {/* ─── Executive Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <Building2 className="h-3.5 w-3.5" /> Retention Telemetry
              </span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                1 Account in Breach
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Client Health & Retention Radar
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time monitoring of client satisfaction, delivery promises, NPS sentiment, and proactive intervention before contract renewals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Client health scores recalculated against delivery milestones.")}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Recalculate Health
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Client account risk register exported to CSV.")}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Client Register
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Accounts</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              16 Retainers
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">16 Clients</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> 12 Green (75%)
            </span>
            <span className="text-muted-foreground">3 Amber · 1 Red</span>
          </div>
          <Progress value={75} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Retention Rate</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
              Attention
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">94.1%</span>
            <span className="text-xs text-muted-foreground">Target: 98%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-3 w-3" /> -2.4% vs Sep
            </span>
            <span className="text-muted-foreground">1 Churn Risk</span>
          </div>
          <Progress value={94.1} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Average CSAT Score</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Excellent
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">4.8 / 5.0</span>
            <span className="text-xs text-muted-foreground">Verified</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <Smile className="h-3 w-3" /> 24 Reviews
            </span>
            <span className="text-muted-foreground">96% Positive</span>
          </div>
          <Progress value={96} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">At-Risk MRR</span>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">
              R25,000 at Risk
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">3.8%</span>
            <span className="text-xs text-muted-foreground">of Total MRR</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" /> Client Alpha
            </span>
            <span className="text-muted-foreground">R650k Base</span>
          </div>
          <Progress value={3.8} className="mt-2.5 h-1.5 bg-muted [&>div]:bg-rose-500" />
        </Card>
      </div>

      {/* ─── Client Visualizations Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Retention Trajectory (2 Cols) */}
        <Card className="border-border p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">6-Month Client Retention Trajectory (%)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Historical account stability and monthly retention rate.</p>
            </div>
            <Badge variant="outline" className="text-xs">Benchmark: 98%</Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RETENTION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="rate" fill="#3b1d4d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Account Health Distribution (1 Col) */}
        <Card className="border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Health Tier Breakdown</h3>
              <Badge variant="outline" className="text-xs">16 Accounts</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Current account stability segmentation.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HEALTH_DISTRIBUTION} layout="vertical" margin={{ top: 10, right: 20, left: 25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {HEALTH_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Executive Priority:</span>
            <p className="text-foreground text-[11px] leading-relaxed">
              Client Alpha requires immediate CEO override. Nexus Retail requires a 14-day touchpoint recovery call.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Client Accounts Directory Table ──────────────────────────────── */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Client Accounts & Health Directory
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full list of active retained clients with real-time health score, primary risk, and accountable AM.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter client, AM, risk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background w-full sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setHealthFilter("all")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    healthFilter === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({CLIENT_RECORDS.length})
                </button>
                <button
                  onClick={() => setHealthFilter("healthy")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    healthFilter === "healthy" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Green
                </button>
                <button
                  onClick={() => setHealthFilter("warning")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    healthFilter === "warning" ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Amber
                </button>
                <button
                  onClick={() => setHealthFilter("critical")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    healthFilter === "critical" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Red
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Client & Industry</th>
                <th className="p-3.5 text-right">MRR</th>
                <th className="p-3.5 text-center">Health Score</th>
                <th className="p-3.5">Primary Risk Signal</th>
                <th className="p-3.5">Account Manager</th>
                <th className="p-3.5">Next Touchpoint</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y border-border">
              {filteredClients.map((cl) => (
                <tr
                  key={cl.id}
                  onClick={() => setSelectedClient(cl)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <strong className="text-sm text-foreground block">{cl.client}</strong>
                    <span className="text-muted-foreground text-[11px]">{cl.industry}</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-sm text-foreground">
                    {formatZAR(cl.mrr)}
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        cl.healthStatus === "healthy"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : cl.healthStatus === "warning"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      }`}
                    >
                      {cl.healthStatus.toUpperCase()} ({cl.healthScore}/100)
                    </Badge>
                  </td>
                  <td className="p-3.5 max-w-[240px]">
                    <span className={`block font-medium truncate ${
                      cl.healthStatus === "critical" ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground"
                    }`}>
                      {cl.riskFactor}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Last: {cl.lastCheckIn}</span>
                  </td>
                  <td className="p-3.5 text-foreground">{cl.accountManager}</td>
                  <td className="p-3.5 font-medium text-muted-foreground">{cl.nextReview}</td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(cl);
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

      {/* ─── Client Detail Inspection Modal ────────────────────────────────── */}
      {selectedClient && (
        <Dialog open={Boolean(selectedClient)} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Building2 className="h-5 w-5 text-[#3b1d4d] dark:text-primary" />
                Account Health Inspection — {selectedClient.client}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedClient.industry} · Monitored MRR: {formatZAR(selectedClient.mrr)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Monthly Retainer</span>
                  <strong className="text-lg font-bold text-foreground">
                    {formatZAR(selectedClient.mrr)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Account Health Score</span>
                  <strong className="text-lg font-bold text-[#3b1d4d] dark:text-primary">
                    {selectedClient.healthScore} / 100
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Account Manager</span>
                  <span className="text-foreground font-semibold">{selectedClient.accountManager}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Last Contact</span>
                  <span className="text-foreground font-semibold">{selectedClient.lastCheckIn}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Client Feedback & Sentiment:</span>
                <p className="text-muted-foreground leading-relaxed italic">"{selectedClient.sentiment}"</p>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Executive Action Plan:</span>
                <p className="text-foreground leading-relaxed">{selectedClient.notes}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedClient(null)}
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
