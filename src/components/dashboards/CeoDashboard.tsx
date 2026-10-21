import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Flame,
  Eye,
  Clock,
  Crown,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Timer,
  UserCheck,
  Building2,
  CalendarClock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  MailWarning,
  ThumbsUp,
  ThumbsDown,
  Clipboard,
  Target,
  TrendingDown,
  TrendingUp,
  Banknote,
  CheckSquare,
  Users,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Activity,
  Layers,
  ArrowUpRight,
  Check,
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
  Cell,
} from "recharts";

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface ActionItem {
  id: string;
  severity: "critical" | "high" | "medium";
  priorityLabel: string;
  status: "new" | "in_progress" | "awaiting_decision" | "overdue" | "resolved";
  client: string;
  department: string;
  service: string;
  overdueMilestone: string;
  originalDue: string;
  currentDue: string;
  workingHoursLate: number;
  currentBlocker: string;
  blockerDetail: string;
  businessImpact: string;
  taskOwnerRole: string;
  taskOwnerName: string;
  managerRole: string;
  managerName: string;
  delayCategory: string;
  nextAction: string;
  nextActionDeadline: string;
  escalationRecipientRole: string;
  clientElapsedTimeHrs: number;
  internalServiceTimeHrs: number;
  stageTimeHrs: number;
  clientPromiseStatus: "intact" | "at-risk" | "breached";
  clientLastContacted: string;
  timeline: TimelineEvent[];
  ceoDecisionRequired: boolean;
  ceoDecisionType?: string;
}

export interface TimelineEvent {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  type: "system" | "manager" | "staff" | "client" | "ceo";
}

export interface ManagerCommitment {
  id: string;
  managerName: string;
  managerRole: string;
  promise: string;
  promisedDeadline: string;
  client: string;
  status: "on-track" | "overdue" | "completed" | "missed";
  hoursOverdue?: number;
  lastUpdate: string;
  lastUpdateDetail: string;
}

export interface ClientRisk {
  id: string;
  client: string;
  riskLevel: "critical" | "high" | "watch";
  riskSignals: string[];
  daysSinceLastDelivery: number;
  openMilestones: number;
  overdueMilestones: number;
  monthlyRevenue: string;
  accountManager: string;
  recommendedAction: string;
}

export interface TodayCommitment {
  id: string;
  client: string;
  deliverable: string;
  promisedBy: string;
  deadline: string;
  ownerName: string;
  ownerRole: string;
  status: "on-track" | "at-risk" | "delivered";
  progressPct: number;
}

export interface DepartmentScorecard {
  id: string;
  name: string;
  lead: string;
  targetSla: number;
  actualSla: number;
  monthlyRevenue: string;
  activeWorkload: number;
  overdueIssues: number;
  health: "healthy" | "warning" | "critical";
  highlight: string;
}

/* ─── Mock Enterprise Data ─────────────────────────────────────────────────── */

const INITIAL_ACTION_QUEUE: ActionItem[] = [];

const DEPARTMENT_SCORECARDS: DepartmentScorecard[] = [
  {
    id: "dep-1",
    name: "Media Buying (Paid Ads)",
    lead: "Department Manager",
    targetSla: 95,
    actualSla: 100,
    monthlyRevenue: "R0",
    activeWorkload: 0,
    overdueIssues: 0,
    health: "healthy",
    highlight: "No active blockers; ready for official assignments.",
  },
  {
    id: "dep-2",
    name: "Tech Delivery & Automation",
    lead: "Tech Delivery Lead",
    targetSla: 90,
    actualSla: 100,
    monthlyRevenue: "R0",
    activeWorkload: 0,
    overdueIssues: 0,
    health: "healthy",
    highlight: "Infrastructure operational; ready for campaign deliverables.",
  },
  {
    id: "dep-3",
    name: "Web Design & Development",
    lead: "Design Lead",
    targetSla: 90,
    actualSla: 100,
    monthlyRevenue: "R0",
    activeWorkload: 0,
    overdueIssues: 0,
    health: "healthy",
    highlight: "Design systems ready; awaiting client asset packs.",
  },
  {
    id: "dep-4",
    name: "Client Strategy & Sales",
    lead: "Sales Lead",
    targetSla: 95,
    actualSla: 100,
    monthlyRevenue: "R0",
    activeWorkload: 0,
    overdueIssues: 0,
    health: "healthy",
    highlight: "Sales pipelines operational; 0 overdue deliverables.",
  },
  {
    id: "dep-5",
    name: "Client Success & Retention",
    lead: "Client Success Lead",
    targetSla: 98,
    actualSla: 100,
    monthlyRevenue: "R0",
    activeWorkload: 0,
    overdueIssues: 0,
    health: "healthy",
    highlight: "Account health optimal; zero escalated issues.",
  },
];

const MANAGER_COMMITMENTS: ManagerCommitment[] = [];

const CLIENT_RISKS: ClientRisk[] = [];

const TODAY_COMMITMENTS: TodayCommitment[] = [];

const STRATEGIC_DECISIONS: any[] = [];

/* ─── Main Component ──────────────────────────────────────────────────────── */

export function CeoDashboard() {
  const navigate = useNavigate();
  const [actionQueue, setActionQueue] = useState<ActionItem[]>(INITIAL_ACTION_QUEUE);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [queueTab, setQueueTab] = useState<"all" | "critical" | "decision" | "overdue" | "resolved">("all");
  const [searchCommitment, setSearchCommitment] = useState("");
  const [ceoNotes, setCeoNotes] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);

  // Toggle item accordion
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Immediate status actions
  const handleAcknowledge = (id: string) => {
    setActionQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "in_progress" } : item))
    );
    toast.success("Item acknowledged. Operations team notified.");
  };

  const handleApproveOverride = (id: string) => {
    setActionQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "in_progress",
              ceoDecisionRequired: false,
              timeline: [
                ...item.timeline,
                {
                  timestamp: "Just now",
                  actor: "CEO (Executive Override)",
                  action: "Budget Approved",
                  detail: "CEO directly authorized ad spend budget. Operations instructed to deploy.",
                  type: "ceo",
                },
              ],
            }
          : item
      )
    );
    toast.success("Executive Override Approved: Budget released to Operations.");
  };

  const handleResolve = (id: string) => {
    setActionQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item))
    );
    toast.success("Issue marked as resolved and archived into audit log.");
  };

  const handleExportBriefing = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Executive Briefing PDF generated and downloaded.");
    }, 1200);
  };

  const handleRefresh = () => {
    toast.info("Refreshed executive telemetry data across all 5 health pillars.");
  };

  // Counts for tabs
  const criticalCount = actionQueue.filter((i) => i.severity === "critical" && i.status !== "resolved").length;
  const decisionCount = actionQueue.filter((i) => i.ceoDecisionRequired && i.status !== "resolved").length;
  const overdueCount = actionQueue.filter((i) => i.workingHoursLate > 0 && i.status !== "resolved").length;
  const resolvedCount = actionQueue.filter((i) => i.status === "resolved").length;
  const activeCount = actionQueue.filter((i) => i.status !== "resolved").length;

  const filteredQueue = actionQueue.filter((item) => {
    if (queueTab === "all") return true;
    if (queueTab === "critical") return item.severity === "critical" && item.status !== "resolved";
    if (queueTab === "decision") return item.ceoDecisionRequired && item.status !== "resolved";
    if (queueTab === "overdue") return item.workingHoursLate > 0 && item.status !== "resolved";
    if (queueTab === "resolved") return item.status === "resolved";
    return true;
  });

  const filteredCommitments = TODAY_COMMITMENTS.filter(
    (c) =>
      c.client.toLowerCase().includes(searchCommitment.toLowerCase()) ||
      c.deliverable.toLowerCase().includes(searchCommitment.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchCommitment.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. EXECUTIVE HEADER & CONTROLS                                        */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <Crown className="h-3.5 w-3.5" /> Mavis Strategic Partners
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Active
              </span>
              <span className="text-xs text-muted-foreground">
                Reporting Period: <strong className="text-foreground">October 2026 (Q4 MTD)</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Executive Command Centre
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Consolidated enterprise operations, revenue velocity, client health radar, and real-time intervention queue for executive leadership.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
            </Button>
            <Button
              size="sm"
              onClick={handleExportBriefing}
              disabled={isExporting}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? "Generating PDF..." : "Export Executive Briefing"}
            </Button>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. EXECUTIVE KPI OVERVIEW (5 Core Enterprise Metrics)                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-[#3b1d4d] dark:text-primary" /> Core Executive KPI Overview
          </h2>
          <span className="text-xs text-muted-foreground">Target vs Actual · Click any card for detailed records</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* KPI 1: Revenue Health */}
          <Link
            to="/ceo/revenue"
            className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-[#3b1d4d]/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Revenue Health</span>
              <Banknote className="h-4 w-4 text-[#3b1d4d] dark:text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">R520,000</span>
              <span className="text-xs text-muted-foreground">/ R650k target</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> +12.4% MoM
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                80% of Target
              </Badge>
            </div>
            <Progress value={80} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              Cash collected · Healthy margin
            </p>
          </Link>

          {/* KPI 2: Sales Pipeline */}
          <Link
            to="/ceo/sales"
            className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-[#3b1d4d]/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Sales Pipeline</span>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">R185,000</span>
              <span className="text-xs text-muted-foreground">Won</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> +18.2% MoM
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                14 New Leads
              </Badge>
            </div>
            <Progress value={74} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              R420k weighted pipeline · 28% win rate
            </p>
          </Link>

          {/* KPI 3: Client Health */}
          <Link
            to="/ceo/clients"
            className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-[#3b1d4d]/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Client Health</span>
              <Building2 className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">100%</span>
              <span className="text-xs text-muted-foreground">Retention</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> 0 Breaches
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                2 Active Accounts
              </Badge>
            </div>
            <Progress value={100} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              Makurung & Imigidi in good standing
            </p>
          </Link>

          {/* KPI 4: Delivery Performance */}
          <Link
            to="/ceo/delivery"
            className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-[#3b1d4d]/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Delivery Health</span>
              <CheckSquare className="h-4 w-4 text-[#3b1d4d] dark:text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">100%</span>
              <span className="text-xs text-muted-foreground">On-Time SLA</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Clock className="h-3 w-3" /> 0 Overdue
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                0 Due Today
              </Badge>
            </div>
            <Progress value={100} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              All systems operational · Ready for live tasks
            </p>
          </Link>

          {/* KPI 5: Team Performance */}
          <Link
            to="/ceo/team"
            className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-[#3b1d4d]/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Team Health</span>
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">88.0%</span>
              <span className="text-xs text-muted-foreground">Capacity</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Optimal
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                42 Tasks Live
              </Badge>
            </div>
            <Progress value={88} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              1 manager approval outstanding
            </p>
          </Link>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 3. FIVE INTERACTIVE HEALTH VIEWS                                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#3b1d4d] dark:text-primary" /> Five Executive Health Views
          </h2>
          <span className="text-xs text-muted-foreground">Balanced operational pillars with direct drill-down links</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Health Card 1: Revenue Health */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Revenue Health</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Healthy
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">R520k</p>
              <p className="text-xs text-muted-foreground">Booked target: R650,000</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue Debt:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">R60,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Margin:</span>
                  <span className="font-semibold text-foreground">68.2%</span>
                </div>
              </div>
            </div>
            <Link
              to="/ceo/revenue"
              className="mt-4 inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-[#3b1d4d] dark:text-primary transition-colors hover:bg-muted"
            >
              <span>View Revenue Records</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Health Card 2: Sales Health */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Sales Health</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  On Target
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">R185k</p>
              <p className="text-xs text-muted-foreground">Verified deals closed MTD</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pipeline Size:</span>
                  <span className="font-semibold text-foreground">R420,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Intake:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">14 New</span>
                </div>
              </div>
            </div>
            <Link
              to="/ceo/sales"
              className="mt-4 inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-[#3b1d4d] dark:text-primary transition-colors hover:bg-muted"
            >
              <span>View Sales Pipeline</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Health Card 3: Client Health */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Client Health</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Optimal
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">2 Accounts</p>
              <p className="text-xs text-muted-foreground">Makurung & Imigidi Active</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">At-Risk MRR:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">R0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSAT Score:</span>
                  <span className="font-semibold text-foreground">5.0 / 5.0</span>
                </div>
              </div>
            </div>
            <Link
              to="/ceo/clients"
              className="mt-4 inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-[#3b1d4d] dark:text-primary transition-colors hover:bg-muted"
            >
              <span>View Client Directory</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Health Card 4: Delivery Health */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Delivery Health</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Optimal
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Deliverables on-time SLA</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Today:</span>
                  <span className="font-semibold text-foreground">0 tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked Work:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 tasks</span>
                </div>
              </div>
            </div>
            <Link
              to="/ceo/delivery"
              className="mt-4 inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-[#3b1d4d] dark:text-primary transition-colors hover:bg-muted"
            >
              <span>View Delivery Workflows</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Health Card 5: Team Health */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Team Health</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Optimal
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">88.0%</p>
              <p className="text-xs text-muted-foreground">Workforce utilization</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Workload:</span>
                  <span className="font-semibold text-foreground">42 tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manager Overdue:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">1 approval</span>
                </div>
              </div>
            </div>
            <Link
              to="/ceo/team"
              className="mt-4 inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-[#3b1d4d] dark:text-primary transition-colors hover:bg-muted"
            >
              <span>View Team Scorecards</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 4. PRIORITY INTERVENTION QUEUE (Executive Inbox Worklist)             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border overflow-hidden shadow-xs">
        {/* Inbox Header */}
        <div className="border-b border-border bg-muted/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                <h2 className="text-base font-bold text-foreground">
                  Priority Intervention Queue
                </h2>
                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-xs">
                  {criticalCount} Critical
                </Badge>
                {decisionCount > 0 && (
                  <Badge className="bg-[#3b1d4d] text-white text-xs">
                    {decisionCount} Awaiting Decision
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Actionable executive worklist. Every delayed milestone with root blocker, financial impact, and 1-click CEO resolution triggers.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background p-1">
              <button
                onClick={() => setQueueTab("all")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  queueTab === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({actionQueue.length})
              </button>
              <button
                onClick={() => setQueueTab("critical")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  queueTab === "critical" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setQueueTab("decision")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  queueTab === "decision" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Decisions ({decisionCount})
              </button>
              <button
                onClick={() => setQueueTab("overdue")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  queueTab === "overdue" ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overdue ({overdueCount})
              </button>
              <button
                onClick={() => setQueueTab("resolved")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  queueTab === "resolved" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Inbox Items List */}
        <div className="divide-y divide-border">
          {actionQueue.length === 0 ? (
            <div className="p-10 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-bold text-foreground">No tasks have been assigned yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Tasks assigned to employees will appear here.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">No upcoming deadlines.</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-foreground">No items in this queue category</p>
              <p className="text-xs text-muted-foreground mt-0.5">All items have been addressed or resolved.</p>
            </div>
          ) : (
            filteredQueue.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const isCritical = item.severity === "critical";
              const isHigh = item.severity === "high";

              return (
                <div key={item.id} className="transition-colors">
                  {/* Collapsed Item Banner */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className={`cursor-pointer px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors hover:bg-muted/40 ${
                      isExpanded ? "bg-muted/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isCritical ? (
                          <ShieldAlert className="h-4 w-4 text-rose-500" />
                        ) : isHigh ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : isHigh
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            }`}
                          >
                            {item.priorityLabel}
                          </Badge>
                          <span className="text-sm font-bold text-foreground">{item.client}</span>
                          <span className="text-xs text-muted-foreground">— {item.service}</span>
                          {item.ceoDecisionRequired && item.status !== "resolved" && (
                            <Badge className="bg-[#3b1d4d] text-white text-[10px] uppercase font-bold">
                              CEO Decision Required
                            </Badge>
                          )}
                          {item.status === "resolved" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase font-bold">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          <strong className="text-foreground">{item.overdueMilestone}</strong> ·{" "}
                          <span className={isCritical ? "font-bold text-rose-600 dark:text-rose-400" : "font-medium text-amber-600"}>
                            {item.workingHoursLate} working hrs overdue
                          </span>{" "}
                          · Blocker: <span className="text-foreground font-medium">{item.currentBlocker}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                        Impact: <strong className="text-foreground">{item.businessImpact.split(";")[0]}</strong>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Item Workspace */}
                  {isExpanded && (
                    <div className="border-t border-border bg-card px-5 py-5 space-y-4">
                      {/* Grid for Context & Clocks */}
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {/* 2 Cols: Context & Accountability */}
                        <div className="space-y-3 lg:col-span-2">
                          {/* Blocker and Business Impact */}
                          <div className="rounded-lg border border-border p-3.5 bg-muted/15 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Root Cause & Context
                              </h4>
                              <span className="text-xs text-muted-foreground font-mono">
                                Deadline: {item.currentDue}
                              </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {item.blockerDetail}
                            </p>
                            <div className="mt-2 rounded border border-rose-500/20 bg-rose-500/5 p-2 text-xs">
                              <span className="font-semibold text-rose-600 dark:text-rose-400">Business Impact: </span>
                              <span className="text-foreground">{item.businessImpact}</span>
                            </div>
                          </div>

                          {/* Accountability Chain */}
                          <div className="rounded-lg border border-border p-3.5 bg-card">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-[#3b1d4d] dark:text-primary" /> Accountability Trail
                            </h4>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
                              <div className="rounded-md border border-border p-2.5">
                                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Task Owner</span>
                                <strong className="text-sm font-bold text-foreground">{item.taskOwnerName}</strong>
                                <span className="block text-muted-foreground">{item.taskOwnerRole}</span>
                              </div>
                              <div className="rounded-md border border-border p-2.5">
                                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Accountable Lead</span>
                                <strong className="text-sm font-bold text-foreground">{item.managerName}</strong>
                                <span className="block text-muted-foreground">{item.managerRole}</span>
                              </div>
                              <div className="rounded-md border border-border p-2.5">
                                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Escalation Recipient</span>
                                <strong className="text-sm font-bold text-foreground">{item.escalationRecipientRole}</strong>
                                <span className="block text-muted-foreground">Direct Telemetry Link</span>
                              </div>
                            </div>
                          </div>

                          {/* Next Recommended Action */}
                          <div className="rounded-lg border border-[#3b1d4d]/30 bg-[#3b1d4d]/5 dark:border-primary/30 dark:bg-primary/5 p-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b1d4d] dark:text-primary mb-1 flex items-center gap-1.5">
                              <ArrowRight className="h-3.5 w-3.5" /> Next Recommended Action
                            </h4>
                            <p className="text-sm font-semibold text-foreground">{item.nextAction}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Timer className="h-3 w-3" /> Target Completion: <strong className="text-foreground">{item.nextActionDeadline}</strong>
                            </p>
                          </div>
                        </div>

                        {/* 1 Col: Delivery Clocks & CEO Decisions */}
                        <div className="space-y-3">
                          {/* Delivery Clocks */}
                          <div className="rounded-lg border border-border p-3.5 bg-card space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> SLA Delivery Clocks
                            </h4>
                            <div className="flex justify-between text-xs py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Gross Client Age:</span>
                              <strong className="text-foreground font-mono">{item.clientElapsedTimeHrs} Hours</strong>
                            </div>
                            <div className="flex justify-between text-xs py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Internal Service Time:</span>
                              <strong className="text-[#3b1d4d] dark:text-primary font-mono">{item.internalServiceTimeHrs} Working Hrs</strong>
                            </div>
                            <div className="flex justify-between text-xs py-1">
                              <span className="text-muted-foreground">Stuck at Current Stage:</span>
                              <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">{item.stageTimeHrs} Working Hrs</strong>
                            </div>
                          </div>

                          {/* Client Promise Badge */}
                          <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-muted-foreground">Client Promise Status:</span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  item.clientPromiseStatus === "breached"
                                    ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                    : item.clientPromiseStatus === "at-risk"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                }`}
                              >
                                {item.clientPromiseStatus.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Last client contact: {item.clientLastContacted}
                            </p>
                          </div>

                          {/* CEO Note box */}
                          <div className="rounded-lg border border-border p-3 bg-card">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center gap-1">
                              <Clipboard className="h-3 w-3" /> CEO Note & Directive
                            </label>
                            <textarea
                              className="w-full rounded border border-border bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#3b1d4d]"
                              rows={2}
                              placeholder="Record executive instruction for Ops..."
                              value={ceoNotes[item.id] || ""}
                              onChange={(e) => setCeoNotes({ ...ceoNotes, [item.id]: e.target.value })}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-1.5 w-full text-xs h-7"
                              onClick={() => {
                                if (ceoNotes[item.id]?.trim()) {
                                  toast.success(`Directive saved: "${ceoNotes[item.id]}"`);
                                  setCeoNotes({ ...ceoNotes, [item.id]: "" });
                                }
                              }}
                            >
                              <Send className="mr-1 h-3 w-3" /> Save Directive
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Action Triggers Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 gap-1.5"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Full Audit Trail ({item.timeline.length} Events)
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
                          {item.status !== "in_progress" && item.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1.5"
                              onClick={() => handleAcknowledge(item.id)}
                            >
                              <Check className="h-3.5 w-3.5" /> Acknowledge
                            </Button>
                          )}

                          {item.ceoDecisionRequired && item.status !== "resolved" && (
                            <Button
                              size="sm"
                              className="bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs h-8 gap-1.5 shadow-xs"
                              onClick={() => handleApproveOverride(item.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve CEO Override
                            </Button>
                          )}

                          {item.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => handleResolve(item.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 5. DEPARTMENT SCORECARDS & COMPARATIVE ANALYTICS                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Scorecard Table (2 Cols) */}
        <Card className="border-border overflow-hidden lg:col-span-2 shadow-xs">
          <div className="border-b border-border bg-muted/20 p-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
              Department Performance Scorecards
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparison of departmental performance against agreed SLA and revenue targets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3.5">Department & Lead</th>
                  <th className="p-3.5 text-center">SLA Compliance</th>
                  <th className="p-3.5 text-right">Revenue Contributed</th>
                  <th className="p-3.5 text-center">Active Load</th>
                  <th className="p-3.5">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEPARTMENT_SCORECARDS.map((dep) => (
                  <tr key={dep.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5">
                      <strong className="text-sm text-foreground block">{dep.name}</strong>
                      <span className="text-muted-foreground text-[11px]">Lead: {dep.lead}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-bold font-mono text-xs ${
                          dep.actualSla >= dep.targetSla ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}>
                          {dep.actualSla}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">Target: {dep.targetSla}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-foreground">
                      {dep.monthlyRevenue}
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge variant="outline" className="text-xs">
                        {dep.activeWorkload} tasks
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          dep.health === "healthy"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {dep.health === "healthy" ? "On Target" : "Attention Needed"}
                      </Badge>
                      <span className="block text-[10px] text-muted-foreground mt-1 truncate max-w-[180px]">
                        {dep.highlight}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Comparative Chart (1 Col) */}
        <Card className="border-border p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">SLA Target vs Actual</h3>
              <Badge variant="outline" className="text-[10px]">Q4 Benchmark</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Real-time delivery SLA compliance against company benchmark by department.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DEPARTMENT_SCORECARDS.map((d) => ({
                    name: d.name.split(" ")[0],
                    Target: d.targetSla,
                    Actual: d.actualSla,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Target" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" fill="#3b1d4d" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-muted/40 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-foreground">Executive Takeaway:</span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Media Buying is 10% below target due to managerial approval delays. CRM & Sales are performing above benchmark.
            </p>
          </div>
        </Card>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 6. TODAY'S CLIENT COMMITMENTS                                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Today's Client Commitments
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every promised client deliverable due today. Track completion without manual chasing.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter deliverables or owners..."
                value={searchCommitment}
                onChange={(e) => setSearchCommitment(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Deliverable</th>
                <th className="p-3.5">Accountable Owner</th>
                <th className="p-3.5 font-mono">Deadline</th>
                <th className="p-3.5 w-40">Progress</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCommitments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Target className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-bold text-foreground">No upcoming deadlines.</p>
                    <p className="text-xs text-muted-foreground mt-1">No tasks have been assigned yet. Tasks and commitments will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredCommitments.map((tc) => (
                <tr key={tc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-bold text-foreground">{tc.client}</td>
                  <td className="p-3.5 font-medium text-foreground max-w-[220px]">
                    {tc.deliverable}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-foreground">{tc.ownerName}</span>
                    <span className="block text-[10px] text-muted-foreground">{tc.ownerRole}</span>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-foreground">{tc.deadline}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={tc.progressPct}
                        className="h-1.5 flex-1 bg-muted"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                        {tc.progressPct}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        tc.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : tc.status === "at-risk"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      }`}
                    >
                      {tc.status === "delivered" && <CheckCircle2 className="mr-1 h-3 w-3 inline" />}
                      {tc.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 7. STRATEGIC ACTIONS & EXECUTIVE DECISIONS                            */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strategic Decisions Board */}
        <Card className="border-border overflow-hidden shadow-xs">
          <div className="border-b border-border bg-muted/20 p-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Crown className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
              Strategic Actions & Decisions Required
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-level approvals and policy decisions pending executive intervention.
            </p>
          </div>

          <div className="divide-y divide-border p-0">
            {STRATEGIC_DECISIONS.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <Crown className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#3b1d4d] dark:text-primary" />
                <p className="font-semibold text-foreground">No strategic decisions pending</p>
                <p className="mt-1">All executive approvals are up to date. No high-level policy actions required.</p>
              </div>
            ) : (
              STRATEGIC_DECISIONS.map((sd) => (
                <div key={sd.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {sd.category}
                      </Badge>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {sd.urgency}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{sd.title}</h4>
                    <p className="text-xs text-muted-foreground">{sd.impact}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs h-8 shrink-0 shadow-xs"
                    onClick={() => toast.success(`Executive action recorded for: "${sd.title}"`)}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve Decision
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Manager Accountability Feed */}
        <Card className="border-border overflow-hidden shadow-xs">
          <div className="border-b border-border bg-muted/20 p-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
              Manager Accountability Commitments
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              What each department lead promised, verified against actual delivery dates.
            </p>
          </div>

          <div className="divide-y divide-border p-0">
            {MANAGER_COMMITMENTS.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#3b1d4d] dark:text-primary" />
                <p className="font-semibold text-foreground">No manager commitments registered</p>
                <p className="mt-1">Tasks assigned to employees and department commitments will appear here.</p>
              </div>
            ) : (
              MANAGER_COMMITMENTS.map((mc) => (
                <div key={mc.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    {mc.status === "missed" ? (
                      <ThumbsDown className="h-4 w-4 text-rose-500" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{mc.managerName}</span>
                      <span className="text-xs text-muted-foreground">({mc.managerRole})</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          mc.status === "missed"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        }`}
                      >
                        {mc.status === "missed" ? `Missed · ${mc.hoursOverdue}h overdue` : "On Track"}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground font-medium">Promise: {mc.promise}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Client: <strong>{mc.client}</strong> · Promised: {mc.promisedDeadline}
                    </p>
                    <p className="text-[11px] text-muted-foreground italic">
                      Status: {mc.lastUpdateDetail}
                    </p>
                  </div>
                  {mc.status === "missed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 shrink-0 text-rose-600 border-rose-500/30"
                      onClick={() => toast.info(`Formal escalation sent to ${mc.managerName}`)}
                    >
                      <MailWarning className="mr-1 h-3 w-3" /> Escalate
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 8. EVENT TIMELINE AUDIT MODAL                                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedItem && (
        <Dialog open={Boolean(selectedItem)} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Clock className="h-5 w-5 text-[#3b1d4d] dark:text-primary" /> Full Audit Trail & Event Timeline
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedItem.client} · {selectedItem.service} · {selectedItem.overdueMilestone}
              </DialogDescription>
            </DialogHeader>

            {/* Delivery clocks summary */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg border border-border bg-muted/20">
              <div>
                <span className="text-muted-foreground block text-[11px]">Gross Client Age</span>
                <strong className="text-sm font-bold text-foreground">{selectedItem.clientElapsedTimeHrs} Hours</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Internal Service Time</span>
                <strong className="text-sm font-bold text-[#3b1d4d] dark:text-primary">{selectedItem.internalServiceTimeHrs} Working Hrs</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Stuck at Current Stage</span>
                <strong className="text-sm font-bold text-rose-600 dark:text-rose-400">{selectedItem.stageTimeHrs} Working Hrs</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 mt-2 space-y-0">
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />
              {selectedItem.timeline.map((event, i) => (
                <div key={i} className="relative flex items-start gap-3 pb-3.5">
                  <div className={`relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background shrink-0
                    ${event.type === "system" ? "border-muted-foreground/50" : ""}
                    ${event.type === "manager" ? "border-[#3b1d4d]" : ""}
                    ${event.type === "staff" ? "border-emerald-500" : ""}
                    ${event.type === "client" ? "border-amber-500" : ""}
                    ${event.type === "ceo" ? "border-rose-500" : ""}
                  `} />
                  <div className="flex-1 rounded-lg border border-border bg-card p-3 shadow-2xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground">{event.timestamp}</span>
                      <span className="text-xs font-bold text-foreground">{event.actor}</span>
                      <Badge variant="outline" className="text-[10px]">{event.action}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)} className="text-xs">
                Close Audit View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
