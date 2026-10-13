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
  DollarSign,
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

const INITIAL_ACTION_QUEUE: ActionItem[] = [
  {
    id: "act-1",
    severity: "critical",
    priorityLabel: "P1 — Critical",
    status: "awaiting_decision",
    client: "Client Alpha",
    department: "Media Buying",
    service: "Paid Ads (Meta Performance)",
    overdueMilestone: "Live Campaign Launch",
    originalDue: "2026-10-06 17:00",
    currentDue: "2026-10-07 12:00",
    workingHoursLate: 9,
    currentBlocker: "Budget approval pending with department manager",
    blockerDetail:
      "Media buyer submitted R12,500 ad spend budget 2 days ago. The Media Buying Lead has not responded after 2 operational reminders. Campaign is halted while client has already funded account.",
    businessImpact: "R25,000 monthly retainer at immediate churn risk; client expectation breached.",
    taskOwnerRole: "Media Buying Specialist",
    taskOwnerName: "Siya Nkosi",
    managerRole: "Media Buying Lead",
    managerName: "Thabiso Mokoena",
    delayCategory: "Manager approval bottleneck",
    nextAction: "Operations to obtain manager budget sign-off or CEO override by 12:00 today",
    nextActionDeadline: "Today, 12:00 SAST",
    escalationRecipientRole: "Operations Lead & CEO",
    clientElapsedTimeHrs: 45,
    internalServiceTimeHrs: 27,
    stageTimeHrs: 13,
    clientPromiseStatus: "at-risk",
    clientLastContacted: "Yesterday, 09:00 SAST",
    ceoDecisionRequired: true,
    ceoDecisionType: "Approve executive budget override or reassign authorization to Operations Lead.",
    timeline: [
      { timestamp: "Oct 5, 09:00", actor: "Siya Nkosi", action: "Task completed", detail: "Campaign creative and audience targeting submitted for review", type: "staff" },
      { timestamp: "Oct 5, 14:30", actor: "Siya Nkosi", action: "Budget request submitted", detail: "R12,500 monthly ad spend budget sent to Media Buying Lead for approval", type: "staff" },
      { timestamp: "Oct 6, 09:15", actor: "Operations", action: "Follow-up #1", detail: "Internal message sent to Thabiso Mokoena requesting budget approval", type: "system" },
      { timestamp: "Oct 6, 17:00", actor: "System", action: "Milestone missed", detail: "Original due date passed — Live Campaign Launch not delivered", type: "system" },
      { timestamp: "Oct 7, 08:30", actor: "Operations", action: "Follow-up #2", detail: "Email escalation sent to Thabiso Mokoena + CC Operations Lead", type: "system" },
      { timestamp: "Oct 7, 12:00", actor: "System", action: "Deadline extended", detail: "Current due moved to Oct 7 12:00 — no approval received", type: "system" },
      { timestamp: "Oct 8, 07:45", actor: "System", action: "CEO escalation triggered", detail: "9 working hours late. Auto-escalated to CEO queue.", type: "system" },
    ],
  },
  {
    id: "act-2",
    severity: "high",
    priorityLabel: "P2 — High Priority",
    status: "in_progress",
    client: "Apex Solar SA",
    department: "Tech & Automation",
    service: "CRM & AI Automation",
    overdueMilestone: "GHL WhatsApp Qualification Journey",
    originalDue: "2026-10-07 17:00",
    currentDue: "2026-10-08 17:00",
    workingHoursLate: 4,
    currentBlocker: "Awaiting client delegate link for Meta Business Manager",
    blockerDetail:
      "CRM specialist cannot connect WhatsApp API to GoHighLevel without client delegate access. Account manager contacted POC on Oct 6. Client confirmed receipt but has not issued access.",
    businessImpact: "Delayed go-live prevents 35 daily solar leads from automated qualification.",
    taskOwnerRole: "CRM & Automation Specialist",
    taskOwnerName: "Lesego Molefe",
    managerRole: "Tech Delivery Lead",
    managerName: "Kabelo Dlamini",
    delayCategory: "Client input dependency",
    nextAction: "Account manager phone call scheduled with Apex Solar POC at 14:00 today",
    nextActionDeadline: "Today, 14:00 SAST",
    escalationRecipientRole: "Operations Lead",
    clientElapsedTimeHrs: 32,
    internalServiceTimeHrs: 18,
    stageTimeHrs: 8,
    clientPromiseStatus: "intact",
    clientLastContacted: "Yesterday, 16:00 SAST",
    ceoDecisionRequired: false,
    timeline: [
      { timestamp: "Oct 6, 10:00", actor: "Lesego Molefe", action: "Access requested", detail: "Sent Meta Business Manager delegate request to Account Manager", type: "staff" },
      { timestamp: "Oct 6, 14:00", actor: "Account Manager", action: "Client contacted", detail: "WhatsApp message to Apex Solar POC requesting delegate link", type: "manager" },
      { timestamp: "Oct 7, 09:00", actor: "Apex Solar POC", action: "Acknowledged", detail: "Client replied: 'Will send by end of day'", type: "client" },
      { timestamp: "Oct 7, 17:00", actor: "System", action: "Milestone missed", detail: "GHL WhatsApp Qualification Journey not delivered — waiting on client", type: "system" },
      { timestamp: "Oct 8, 08:00", actor: "System", action: "Escalated to queue", detail: "4 working hours late. Added to CEO visibility queue.", type: "system" },
    ],
  },
  {
    id: "act-3",
    severity: "medium",
    priorityLabel: "P3 — Medium",
    status: "new",
    client: "BrightPath Education",
    department: "Web Design",
    service: "Website Development",
    overdueMilestone: "Homepage Wireframe Approval",
    originalDue: "2026-10-08 12:00",
    currentDue: "2026-10-08 17:00",
    workingHoursLate: 1,
    currentBlocker: "Scope revision cycle (Round 3 requested without signed change order)",
    blockerDetail:
      "Client requested third round of revisions on homepage hero section. Standard contract includes 2 rounds. Design lead preparing revised package with revision limit notice.",
    businessImpact: "Scope creep risk of 8 unpaid design hours if not formally capped.",
    taskOwnerRole: "Web Designer",
    taskOwnerName: "Naledi Khumalo",
    managerRole: "Design Lead",
    managerName: "Zanele Sithole",
    delayCategory: "Client revision cycle",
    nextAction: "Design lead to deliver final wireframe with formal revision-limit notice",
    nextActionDeadline: "Today, 15:00 SAST",
    escalationRecipientRole: "Design Lead",
    clientElapsedTimeHrs: 60,
    internalServiceTimeHrs: 22,
    stageTimeHrs: 5,
    clientPromiseStatus: "intact",
    clientLastContacted: "Today, 08:30 SAST",
    ceoDecisionRequired: false,
    timeline: [
      { timestamp: "Oct 6, 14:00", actor: "Naledi Khumalo", action: "Wireframe v1 delivered", detail: "Initial homepage wireframe sent to client via email", type: "staff" },
      { timestamp: "Oct 7, 09:00", actor: "Client", action: "Revisions requested", detail: "Client requested colour and layout changes", type: "client" },
      { timestamp: "Oct 7, 16:00", actor: "Naledi Khumalo", action: "Wireframe v2 delivered", detail: "Updated design sent — addressed all client feedback", type: "staff" },
      { timestamp: "Oct 8, 08:30", actor: "Client", action: "Round 3 revisions", detail: "Client wants further adjustments to hero section", type: "client" },
    ],
  },
];

const DEPARTMENT_SCORECARDS: DepartmentScorecard[] = [
  {
    id: "dep-1",
    name: "Media Buying (Paid Ads)",
    lead: "Thabiso Mokoena",
    targetSla: 95,
    actualSla: 85,
    monthlyRevenue: "R210,000",
    activeWorkload: 14,
    overdueIssues: 1,
    health: "warning",
    highlight: "1 budget sign-off overdue by 9 hours (Client Alpha).",
  },
  {
    id: "dep-2",
    name: "Tech Delivery & Automation",
    lead: "Kabelo Dlamini",
    targetSla: 90,
    actualSla: 94,
    monthlyRevenue: "R180,000",
    activeWorkload: 11,
    overdueIssues: 0,
    health: "healthy",
    highlight: "Apex Solar integration awaiting client delegate token.",
  },
  {
    id: "dep-3",
    name: "Web Design & Development",
    lead: "Zanele Sithole",
    targetSla: 90,
    actualSla: 92,
    monthlyRevenue: "R140,000",
    activeWorkload: 9,
    overdueIssues: 0,
    health: "healthy",
    highlight: "BrightPath wireframe final delivery on schedule today.",
  },
  {
    id: "dep-4",
    name: "Client Strategy & Sales",
    lead: "Sarah Jenkins",
    targetSla: 95,
    actualSla: 96,
    monthlyRevenue: "R185,000",
    activeWorkload: 14,
    overdueIssues: 0,
    health: "healthy",
    highlight: "TechNova R140k contract closed; Handover pack completed.",
  },
  {
    id: "dep-5",
    name: "Client Success & Retention",
    lead: "David Cole",
    targetSla: 98,
    actualSla: 94,
    monthlyRevenue: "R650,000 (Base)",
    activeWorkload: 16,
    overdueIssues: 1,
    health: "warning",
    highlight: "Nexus Retail 14-day check-in overdue; scheduling recovery call.",
  },
];

const MANAGER_COMMITMENTS: ManagerCommitment[] = [
  {
    id: "mc-1",
    managerName: "Thabiso Mokoena",
    managerRole: "Media Buying Lead",
    promise: "Approve ad budget for Client Alpha campaign",
    promisedDeadline: "2026-10-06 17:00",
    client: "Client Alpha",
    status: "missed",
    hoursOverdue: 18,
    lastUpdate: "No response",
    lastUpdateDetail: "Two operational follow-ups sent (Oct 6, Oct 7). No reply.",
  },
  {
    id: "mc-2",
    managerName: "Kabelo Dlamini",
    managerRole: "Tech Delivery Lead",
    promise: "Ensure CRM onboarding completes for Apex Solar",
    promisedDeadline: "2026-10-08 17:00",
    client: "Apex Solar SA",
    status: "on-track",
    lastUpdate: "Today, 08:15",
    lastUpdateDetail: "Account manager confirmed client check-in at 14:00 today.",
  },
  {
    id: "mc-3",
    managerName: "Zanele Sithole",
    managerRole: "Design Lead",
    promise: "Deliver final wireframe with scope notice to BrightPath",
    promisedDeadline: "2026-10-08 15:00",
    client: "BrightPath Education",
    status: "on-track",
    lastUpdate: "Today, 09:00",
    lastUpdateDetail: "Wireframe v3 completed. Scope-limit notice attached.",
  },
];

const CLIENT_RISKS: ClientRisk[] = [
  {
    id: "cr-1",
    client: "Client Alpha",
    riskLevel: "critical",
    riskSignals: [
      "Campaign launch 9 hrs overdue",
      "Client invoiced and funded ad spend",
      "Internal budget sign-off stuck 2 days",
    ],
    daysSinceLastDelivery: 5,
    openMilestones: 3,
    overdueMilestones: 1,
    monthlyRevenue: "R25,000",
    accountManager: "Sarah Jenkins",
    recommendedAction: "CEO budget override & direct phone call to assure 24h launch",
  },
  {
    id: "cr-2",
    client: "Nexus Retail",
    riskLevel: "high",
    riskSignals: [
      "No account contact for 14 days",
      "Executive quarterly review unscheduled",
      "Renewal due in 45 days",
    ],
    daysSinceLastDelivery: 14,
    openMilestones: 1,
    overdueMilestones: 0,
    monthlyRevenue: "R38,000",
    accountManager: "David Cole",
    recommendedAction: "Client Success lead to schedule executive review call today",
  },
  {
    id: "cr-3",
    client: "Omega Corp",
    riskLevel: "watch",
    riskSignals: [
      "Proposal sent 5 days ago",
      "Competitor pitch mentioned by CFO",
    ],
    daysSinceLastDelivery: 0,
    openMilestones: 0,
    overdueMilestones: 0,
    monthlyRevenue: "R45,000 (Pipeline)",
    accountManager: "Sarah Jenkins",
    recommendedAction: "Senior executive touchpoint before proposal expires Friday",
  },
];

const TODAY_COMMITMENTS: TodayCommitment[] = [
  {
    id: "tc-1",
    client: "Client Alpha",
    deliverable: "Campaign Budget Approval & Go-Live",
    promisedBy: "Operations Lead",
    deadline: "12:00 SAST",
    ownerName: "Operations Lead",
    ownerRole: "Operations Lead",
    status: "at-risk",
    progressPct: 20,
  },
  {
    id: "tc-2",
    client: "BrightPath Education",
    deliverable: "Homepage Wireframe Final + Revision Notice",
    promisedBy: "Design Lead",
    deadline: "15:00 SAST",
    ownerName: "Naledi Khumalo",
    ownerRole: "Web Designer",
    status: "on-track",
    progressPct: 80,
  },
  {
    id: "tc-3",
    client: "Apex Solar SA",
    deliverable: "GHL WhatsApp Qualification Journey",
    promisedBy: "Account Manager",
    deadline: "17:00 SAST",
    ownerName: "Lesego Molefe",
    ownerRole: "CRM Specialist",
    status: "at-risk",
    progressPct: 65,
  },
  {
    id: "tc-4",
    client: "TechNova",
    deliverable: "Operations Handover Pack & SLA Welcome",
    promisedBy: "Sales Lead",
    deadline: "11:00 SAST",
    ownerName: "Sarah Jenkins",
    ownerRole: "Account Manager",
    status: "delivered",
    progressPct: 100,
  },
];

const STRATEGIC_DECISIONS = [
  {
    id: "sd-1",
    title: "Override Media Buying Lead budget sign-off for Client Alpha",
    urgency: "Immediate — Before 12:00",
    impact: "Unblocks R25,000 retainer & live ad campaign immediately.",
    status: "Pending CEO Approval",
    category: "Operational Governance",
  },
  {
    id: "sd-2",
    title: "Approve Q4 Tech Delivery headcount expansion (Senior Automation Dev)",
    urgency: "Due Tomorrow, 17:00",
    impact: "Prevents GHL onboarding bottleneck as active pipeline hits 14 accounts.",
    status: "Review Required",
    category: "Resource Allocation",
  },
  {
    id: "sd-3",
    title: "Sign off formal scope-limit notice for BrightPath Education",
    urgency: "Today, 14:00",
    impact: "Caps unpaid revision cycles and establishes professional boundary.",
    status: "Ready for Execution",
    category: "Contract Compliance",
  },
];

/* ─── Main Component ──────────────────────────────────────────────────────── */

export function CeoDashboard() {
  const navigate = useNavigate();
  const [actionQueue, setActionQueue] = useState<ActionItem[]>(INITIAL_ACTION_QUEUE);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["act-1"]));
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
              <DollarSign className="h-4 w-4 text-[#3b1d4d] dark:text-primary transition-transform group-hover:scale-110" />
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
              <span className="text-2xl font-bold tracking-tight text-foreground">94.1%</span>
              <span className="text-xs text-muted-foreground">Retention</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <TrendingDown className="h-3 w-3" /> 1 Breach
              </span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                12G · 3A · 1R
              </Badge>
            </div>
            <Progress value={94} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              16 accounts · Client Alpha at risk
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
              <span className="text-2xl font-bold tracking-tight text-foreground">94.0%</span>
              <span className="text-xs text-muted-foreground">On-Time SLA</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" /> 2 Overdue
              </span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                8 Due Today
              </Badge>
            </div>
            <Progress value={94} className="mt-3 h-1.5 bg-muted" />
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              2 approvals pending in Media Buying
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
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                  Warning
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">16 Accounts</p>
              <p className="text-xs text-muted-foreground">12 Healthy · 3 Watch · 1 Red</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">At-Risk MRR:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">R25,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSAT Score:</span>
                  <span className="font-semibold text-foreground">4.8 / 5.0</span>
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
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                  SLA Watch
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">94.0%</p>
              <p className="text-xs text-muted-foreground">Deliverables on-time SLA</p>
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Today:</span>
                  <span className="font-semibold text-foreground">8 tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked Work:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">2 tasks</span>
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
          {filteredQueue.length === 0 ? (
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
              {filteredCommitments.map((tc) => (
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
              ))}
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
            {STRATEGIC_DECISIONS.map((sd) => (
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
            ))}
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
            {MANAGER_COMMITMENTS.map((mc) => (
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
            ))}
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
