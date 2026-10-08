import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Flame,
  Eye,
  Clock,
  Crown,
  Send,
  MessageSquare,
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
  Zap,
  PhoneCall,
  MailWarning,
  ThumbsUp,
  ThumbsDown,
  Clipboard,
  Target,
  TrendingDown,
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

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface ActionItem {
  id: string;
  severity: "critical" | "high" | "medium";
  client: string;
  service: string;
  overdueMilestone: string;
  originalDue: string;
  currentDue: string;
  workingHoursLate: number;
  currentBlocker: string;
  blockerDetail: string;
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

interface TimelineEvent {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  type: "system" | "manager" | "staff" | "client" | "ceo";
}

interface ManagerCommitment {
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

interface ClientRisk {
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

interface TodayCommitment {
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

/* ─── Sample Data ──────────────────────────────────────────────────────────── */

const SAMPLE_ACTION_QUEUE: ActionItem[] = [
  {
    id: "act-1",
    severity: "critical",
    client: "Client Alpha",
    service: "Paid Ads (Meta Performance)",
    overdueMilestone: "Live Campaign Launch",
    originalDue: "2026-10-06 17:00",
    currentDue: "2026-10-07 12:00",
    workingHoursLate: 9,
    currentBlocker: "Budget approval pending with department manager",
    blockerDetail:
      "Media buyer submitted the budget request 2 days ago. The Media Buying Lead has not responded. Two follow-ups sent by Ops on Oct 6 and Oct 7. No reply received.",
    taskOwnerRole: "Media Buying Specialist",
    taskOwnerName: "Siya Nkosi",
    managerRole: "Media Buying Lead",
    managerName: "Thabiso Mokoena",
    delayCategory: "Manager approval",
    nextAction: "Operations to obtain manager budget sign-off by 12:00 today",
    nextActionDeadline: "2026-10-08 12:00",
    escalationRecipientRole: "Operations Lead & CEO",
    clientElapsedTimeHrs: 45,
    internalServiceTimeHrs: 27,
    stageTimeHrs: 13,
    clientPromiseStatus: "at-risk",
    clientLastContacted: "2026-10-07 09:00",
    ceoDecisionRequired: true,
    ceoDecisionType: "Override manager — approve budget directly or reassign approval",
    timeline: [
      { timestamp: "Oct 5, 09:00", actor: "Siya Nkosi", action: "Task completed", detail: "Campaign creative and audience targeting submitted for review", type: "staff" },
      { timestamp: "Oct 5, 14:30", actor: "Siya Nkosi", action: "Budget request submitted", detail: "R12,500 monthly ad spend budget sent to Media Buying Lead for approval", type: "staff" },
      { timestamp: "Oct 6, 09:15", actor: "Operations", action: "Follow-up #1", detail: "Slack message sent to Thabiso Mokoena requesting budget approval", type: "system" },
      { timestamp: "Oct 6, 17:00", actor: "System", action: "Milestone missed", detail: "Original due date passed — Live Campaign Launch not delivered", type: "system" },
      { timestamp: "Oct 7, 08:30", actor: "Operations", action: "Follow-up #2", detail: "Email escalation sent to Thabiso Mokoena + CC Operations Lead", type: "system" },
      { timestamp: "Oct 7, 12:00", actor: "System", action: "Deadline extended", detail: "Current due moved to Oct 7 12:00 — no approval received", type: "system" },
      { timestamp: "Oct 8, 07:45", actor: "System", action: "CEO escalation triggered", detail: "9 working hours late. Auto-escalated to CEO queue.", type: "system" },
    ],
  },
  {
    id: "act-2",
    severity: "high",
    client: "Apex Solar SA",
    service: "CRM & AI Automation",
    overdueMilestone: "GHL WhatsApp Qualification Journey",
    originalDue: "2026-10-07 17:00",
    currentDue: "2026-10-08 17:00",
    workingHoursLate: 4,
    currentBlocker: "Awaiting client delegate link for Meta Business Manager",
    blockerDetail:
      "The CRM specialist cannot connect WhatsApp to GHL without the client's Meta Business Manager delegate access. The account manager requested this from the client on Oct 6. Client acknowledged but has not provided it yet.",
    taskOwnerRole: "CRM & Automation Specialist",
    taskOwnerName: "Lesego Molefe",
    managerRole: "Tech Delivery Lead",
    managerName: "Kabelo Dlamini",
    delayCategory: "Client input or approval",
    nextAction: "Account manager follow-up scheduled with client point of contact",
    nextActionDeadline: "2026-10-08 14:00",
    escalationRecipientRole: "Operations Lead",
    clientElapsedTimeHrs: 32,
    internalServiceTimeHrs: 18,
    stageTimeHrs: 8,
    clientPromiseStatus: "intact",
    clientLastContacted: "2026-10-07 16:00",
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
    client: "BrightPath Education",
    service: "Website Development",
    overdueMilestone: "Homepage Wireframe Approval",
    originalDue: "2026-10-08 12:00",
    currentDue: "2026-10-08 17:00",
    workingHoursLate: 1,
    currentBlocker: "Design revisions requested by client — round 3",
    blockerDetail:
      "Client has requested a third round of revisions on the homepage wireframe. Designer completed round 2 on Oct 7. The account manager is pushing back gently on scope creep.",
    taskOwnerRole: "Web Designer",
    taskOwnerName: "Naledi Khumalo",
    managerRole: "Design Lead",
    managerName: "Zanele Sithole",
    delayCategory: "Client revision cycle",
    nextAction: "Design lead to present final wireframe with revision limit notice",
    nextActionDeadline: "2026-10-08 15:00",
    escalationRecipientRole: "Design Lead",
    clientElapsedTimeHrs: 60,
    internalServiceTimeHrs: 22,
    stageTimeHrs: 5,
    clientPromiseStatus: "intact",
    clientLastContacted: "2026-10-08 08:30",
    ceoDecisionRequired: false,
    timeline: [
      { timestamp: "Oct 6, 14:00", actor: "Naledi Khumalo", action: "Wireframe v1 delivered", detail: "Initial homepage wireframe sent to client via email", type: "staff" },
      { timestamp: "Oct 7, 09:00", actor: "Client", action: "Revisions requested", detail: "Client requested colour and layout changes", type: "client" },
      { timestamp: "Oct 7, 16:00", actor: "Naledi Khumalo", action: "Wireframe v2 delivered", detail: "Updated design sent — addressed all client feedback", type: "staff" },
      { timestamp: "Oct 8, 08:30", actor: "Client", action: "Round 3 revisions", detail: "Client wants further adjustments to hero section", type: "client" },
    ],
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
    lastUpdateDetail: "Two follow-ups sent (Oct 6, Oct 7). No reply. Not read.",
  },
  {
    id: "mc-2",
    managerName: "Kabelo Dlamini",
    managerRole: "Tech Delivery Lead",
    promise: "Ensure CRM onboarding completes for Apex Solar",
    promisedDeadline: "2026-10-08 17:00",
    client: "Apex Solar SA",
    status: "on-track",
    lastUpdate: "2026-10-08 08:15",
    lastUpdateDetail: "Confirmed account manager will follow up with client by 14:00 today for Meta delegate link.",
  },
  {
    id: "mc-3",
    managerName: "Zanele Sithole",
    managerRole: "Design Lead",
    promise: "Present final wireframe with revision-limit notice to BrightPath",
    promisedDeadline: "2026-10-08 15:00",
    client: "BrightPath Education",
    status: "on-track",
    lastUpdate: "2026-10-08 09:00",
    lastUpdateDetail: "Wireframe v3 in progress. Will send with formal scope-limit letter.",
  },
];

const CLIENT_RISKS: ClientRisk[] = [
  {
    id: "cr-1",
    client: "Client Alpha",
    riskLevel: "critical",
    riskSignals: [
      "Campaign launch 9 hrs overdue",
      "Client invoiced but service not yet live",
      "No internal budget sign-off after 2 days",
    ],
    daysSinceLastDelivery: 5,
    openMilestones: 3,
    overdueMilestones: 1,
    monthlyRevenue: "R25,000",
    accountManager: "Thando Mthembu",
    recommendedAction: "CEO to call client personally to assure delivery within 24 hrs",
  },
  {
    id: "cr-2",
    client: "Omega Corp",
    riskLevel: "high",
    riskSignals: [
      "Sales follow-up overdue by 3 days",
      "Proposal sent but no response",
      "Competitor pitch mentioned by contact",
    ],
    daysSinceLastDelivery: 0,
    openMilestones: 0,
    overdueMilestones: 0,
    monthlyRevenue: "R45,000 (pipeline)",
    accountManager: "Sales Team",
    recommendedAction: "Senior sales call to re-engage before competitor closes",
  },
  {
    id: "cr-3",
    client: "Global Logistics",
    riskLevel: "watch",
    riskSignals: [
      "Initial contact never made",
      "Lead sitting unassigned for 4 days",
    ],
    daysSinceLastDelivery: 0,
    openMilestones: 0,
    overdueMilestones: 0,
    monthlyRevenue: "Unknown",
    accountManager: "Unassigned",
    recommendedAction: "Assign to sales rep immediately — potential lost lead",
  },
];

const TODAY_COMMITMENTS: TodayCommitment[] = [
  {
    id: "tc-1",
    client: "Apex Solar SA",
    deliverable: "GHL WhatsApp Qualification Journey",
    promisedBy: "Account Manager",
    deadline: "17:00",
    ownerName: "Lesego Molefe",
    ownerRole: "CRM Specialist",
    status: "at-risk",
    progressPct: 60,
  },
  {
    id: "tc-2",
    client: "BrightPath Education",
    deliverable: "Homepage Wireframe Final + Revision Limit Notice",
    promisedBy: "Design Lead",
    deadline: "15:00",
    ownerName: "Naledi Khumalo",
    ownerRole: "Web Designer",
    status: "on-track",
    progressPct: 75,
  },
  {
    id: "tc-3",
    client: "TechNova",
    deliverable: "Operations Handover Pack",
    promisedBy: "Sales Lead",
    deadline: "12:00",
    ownerName: "Thando Mthembu",
    ownerRole: "Account Manager",
    status: "delivered",
    progressPct: 100,
  },
  {
    id: "tc-4",
    client: "Client Alpha",
    deliverable: "Campaign Budget Approval & Go-Live",
    promisedBy: "Operations Lead",
    deadline: "12:00",
    ownerName: "Operations",
    ownerRole: "Operations Lead",
    status: "at-risk",
    progressPct: 20,
  },
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const severityConfig = {
  critical: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-600 text-white", label: "CRITICAL", dot: "bg-rose-500" },
  high: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-600 text-white", label: "HIGH", dot: "bg-amber-500" },
  medium: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-600 text-white", label: "MEDIUM", dot: "bg-blue-500" },
};

const promiseStatusConfig = {
  intact: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Promise Intact" },
  "at-risk": { bg: "bg-amber-500/10", text: "text-amber-600", label: "Promise At Risk" },
  breached: { bg: "bg-rose-500/10", text: "text-rose-600", label: "Promise Breached" },
};

const commitmentStatusConfig = {
  "on-track": { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  overdue: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  completed: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  missed: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30" },
};

const riskConfig = {
  critical: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  high: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  watch: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
};

const timelineTypeConfig = {
  system: "border-muted-foreground/30 bg-muted/40",
  manager: "border-primary/30 bg-primary/5",
  staff: "border-emerald-500/30 bg-emerald-500/5",
  client: "border-amber-500/30 bg-amber-500/5",
  ceo: "border-rose-500/30 bg-rose-500/5",
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export function CeoDashboard() {
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["act-1"]));
  const [ceoNotes, setCeoNotes] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const criticalCount = SAMPLE_ACTION_QUEUE.filter((i) => i.severity === "critical").length;
  const highCount = SAMPLE_ACTION_QUEUE.filter((i) => i.severity === "high").length;
  const ceoDecisionCount = SAMPLE_ACTION_QUEUE.filter((i) => i.ceoDecisionRequired).length;
  const missedPromises = MANAGER_COMMITMENTS.filter((c) => c.status === "missed").length;
  const atRiskClients = CLIENT_RISKS.filter((r) => r.riskLevel === "critical").length;
  const todayAtRisk = TODAY_COMMITMENTS.filter((c) => c.status === "at-risk").length;

  return (
    <div className="space-y-6">
      {/* ═══ SECTION 1: Morning Briefing Strip ═══════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <BriefingCard
          icon={<Flame className="h-4 w-4" />}
          label="Critical Interventions"
          value={criticalCount}
          color="rose"
        />
        <BriefingCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="High Priority"
          value={highCount}
          color="amber"
        />
        <BriefingCard
          icon={<Crown className="h-4 w-4" />}
          label="Awaiting CEO Decision"
          value={ceoDecisionCount}
          color="violet"
        />
        <BriefingCard
          icon={<XCircle className="h-4 w-4" />}
          label="Missed Manager Promises"
          value={missedPromises}
          color="rose"
        />
        <BriefingCard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="At-Risk Clients"
          value={atRiskClients}
          color="amber"
        />
        <BriefingCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Today At Risk"
          value={todayAtRisk}
          color="blue"
        />
      </div>

      {/* ═══ SECTION 2: Intervention Queue ════════════════════════════════════ */}
      <Card className="border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4.5 w-4.5 text-rose-500" /> Intervention Queue
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every delayed milestone with full blocker context, accountability trail, and CEO action options.
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30 shrink-0">
            {SAMPLE_ACTION_QUEUE.length} Items Requiring Visibility
          </Badge>
        </div>

        <div className="divide-y divide-border">
          {SAMPLE_ACTION_QUEUE.map((item) => {
            const sev = severityConfig[item.severity];
            const promiseStatus = promiseStatusConfig[item.clientPromiseStatus];
            const isExpanded = expandedItems.has(item.id);

            return (
              <div key={item.id} className="group">
                {/* ─ Collapsed summary row ─ */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-muted/30 ${isExpanded ? "bg-muted/20" : ""}`}
                >
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${sev.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.text}`}>
                        {sev.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">{item.client}</span>
                      <span className="text-xs text-muted-foreground">— {item.service}</span>
                      {item.ceoDecisionRequired && (
                        <Badge className="bg-violet-600 text-white text-[10px] uppercase font-bold">
                          CEO Decision Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong className="text-foreground">{item.overdueMilestone}</strong> ·{" "}
                      <span className={`font-bold ${sev.text}`}>{item.workingHoursLate} working hrs late</span> ·{" "}
                      Blocked by: <span className="text-amber-600 dark:text-amber-400 font-medium">{item.currentBlocker}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* ─ Expanded detail panel ─ */}
                {isExpanded && (
                  <div className={`px-4 pb-5 pt-1 border-t ${sev.border} ${sev.bg}`}>
                    <div className="grid gap-4 lg:grid-cols-3 mt-3">
                      {/* Column 1: Full context */}
                      <div className="space-y-3 lg:col-span-2">
                        {/* Blocker detail */}
                        <div className="rounded-lg border border-border bg-card p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5" /> Full Blocker Context
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">{item.blockerDetail}</p>
                        </div>

                        {/* Accountability chain */}
                        <div className="rounded-lg border border-border bg-card p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5" /> Accountability Chain
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-md border border-border p-2.5">
                              <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Task Owner</span>
                              <strong className="text-sm">{item.taskOwnerName}</strong>
                              <span className="block text-muted-foreground">{item.taskOwnerRole}</span>
                            </div>
                            <div className="rounded-md border border-border p-2.5">
                              <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Accountable Manager</span>
                              <strong className="text-sm">{item.managerName}</strong>
                              <span className="block text-muted-foreground">{item.managerRole}</span>
                            </div>
                            <div className="rounded-md border border-border p-2.5">
                              <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Escalation Recipient</span>
                              <strong className="text-sm">{item.escalationRecipientRole}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Next action + deadline */}
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5" /> Confirmed Next Action
                          </h4>
                          <p className="text-sm font-semibold text-foreground">{item.nextAction}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Timer className="inline h-3 w-3 mr-1" />
                            Deadline: <strong className="text-foreground">{item.nextActionDeadline}</strong>
                          </p>
                        </div>

                        {/* CEO decision box (only if required) */}
                        {item.ceoDecisionRequired && (
                          <div className="rounded-lg border-2 border-violet-500/40 bg-violet-500/[0.06] p-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5 flex items-center gap-1.5">
                              <Crown className="h-3.5 w-3.5" /> CEO Decision Required
                            </h4>
                            <p className="text-sm font-semibold text-foreground">{item.ceoDecisionType}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Button
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                                onClick={() => {
                                  toast.success("Decision recorded: Override approved. Budget approval escalated to CEO.");
                                }}
                              >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve Override
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8"
                                onClick={() => {
                                  toast.info("Escalation instruction sent to Operations Lead.");
                                }}
                              >
                                <Send className="mr-1.5 h-3.5 w-3.5" /> Instruct Ops Lead
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8"
                                onClick={() => {
                                  toast("Phone call reminder set for Thabiso Mokoena.");
                                }}
                              >
                                <PhoneCall className="mr-1.5 h-3.5 w-3.5" /> Call Manager
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Column 2: Delivery clocks + promise + quick actions */}
                      <div className="space-y-3">
                        {/* Delivery clocks */}
                        <div className="rounded-lg border border-border bg-card p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Delivery Clocks
                          </h4>
                          <div className="space-y-2.5">
                            <ClockStat label="Gross Client Age" value={`${item.clientElapsedTimeHrs} hrs`} />
                            <ClockStat label="Internal Service Time" value={`${item.internalServiceTimeHrs} working hrs`} accent />
                            <ClockStat label="Stuck at Current Stage" value={`${item.stageTimeHrs} working hrs`} warning />
                          </div>
                        </div>

                        {/* Client promise status */}
                        <div className={`rounded-lg border border-border p-3.5 ${promiseStatus.bg}`}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Client Promise
                          </h4>
                          <Badge className={`${promiseStatus.bg} ${promiseStatus.text} border text-xs font-bold`}>
                            {promiseStatus.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            Last contacted: {item.clientLastContacted}
                          </p>
                        </div>

                        {/* Delay classification */}
                        <div className="rounded-lg border border-border bg-card p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Delay Classification
                          </h4>
                          <Badge variant="outline" className="text-xs">{item.delayCategory}</Badge>
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            Original due: {item.originalDue}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Current due: {item.currentDue}
                          </p>
                        </div>

                        {/* CEO note */}
                        <div className="rounded-lg border border-border bg-card p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Clipboard className="h-3.5 w-3.5" /> CEO Note
                          </h4>
                          <textarea
                            className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            rows={2}
                            placeholder="Add a note or instruction…"
                            value={ceoNotes[item.id] ?? ""}
                            onChange={(e) => setCeoNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full text-xs h-7"
                            onClick={() => {
                              if (ceoNotes[item.id]?.trim()) {
                                toast.success("CEO note saved and visible to Operations.");
                                setCeoNotes((prev) => ({ ...prev, [item.id]: "" }));
                              }
                            }}
                          >
                            <Send className="mr-1.5 h-3 w-3" /> Save & Notify Team
                          </Button>
                        </div>

                        {/* View full timeline */}
                        <Button
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> View Full Timeline ({item.timeline.length} events)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ═══ SECTION 3: Manager Accountability ════════════════════════════════ */}
      <Card className="border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-primary" /> Manager Accountability Feed
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            What each manager promised, when, and whether they delivered. No more WhatsApp chasing.
          </p>
        </div>
        <div className="divide-y divide-border">
          {MANAGER_COMMITMENTS.map((mc) => {
            const statusCfg = commitmentStatusConfig[mc.status];
            return (
              <div key={mc.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`shrink-0 mt-0.5 rounded-full h-8 w-8 flex items-center justify-center ${statusCfg.bg}`}>
                  {mc.status === "completed" && <CheckCircle2 className={`h-4 w-4 ${statusCfg.text}`} />}
                  {mc.status === "on-track" && <ThumbsUp className={`h-4 w-4 ${statusCfg.text}`} />}
                  {mc.status === "overdue" && <Timer className={`h-4 w-4 ${statusCfg.text}`} />}
                  {mc.status === "missed" && <ThumbsDown className={`h-4 w-4 ${statusCfg.text}`} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{mc.managerName}</span>
                    <span className="text-xs text-muted-foreground">({mc.managerRole})</span>
                    <Badge className={`text-[10px] uppercase font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      {mc.status === "missed" ? `Missed · ${mc.hoursOverdue}hrs overdue` : mc.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground mt-0.5">
                    Promise: {mc.promise}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Client: <strong>{mc.client}</strong> · Deadline: <strong>{mc.promisedDeadline}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Last update: {mc.lastUpdateDetail}
                  </p>
                </div>
                {mc.status === "missed" && (
                  <div className="shrink-0 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => toast(`Escalation message sent to ${mc.managerName}`)}
                    >
                      <MailWarning className="mr-1 h-3 w-3" /> Escalate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => toast(`Call reminder set for ${mc.managerName}`)}
                    >
                      <PhoneCall className="mr-1 h-3 w-3" /> Call
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ═══ SECTION 4: Client Risk Radar ═════════════════════════════════════ */}
      <Card className="border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="h-4.5 w-4.5 text-amber-500" /> Client Risk Radar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clients showing churn signals or delivery failures. Act before they escalate externally.
          </p>
        </div>
        <div className="divide-y divide-border">
          {CLIENT_RISKS.map((cr) => {
            const risk = riskConfig[cr.riskLevel];
            return (
              <div key={cr.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`shrink-0 mt-0.5 h-2.5 w-2.5 rounded-full ${risk.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{cr.client}</span>
                    <Badge className={`text-[10px] uppercase font-bold border ${risk.bg} ${risk.text} ${risk.border}`}>
                      {cr.riskLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">MRR: {cr.monthlyRevenue}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {cr.riskSignals.map((signal, i) => (
                      <Badge key={i} variant="outline" className={`text-[10px] ${risk.bg} ${risk.text} ${risk.border}`}>
                        {signal}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Account Manager: <strong>{cr.accountManager}</strong> ·{" "}
                    Open milestones: {cr.openMilestones} · Overdue: {cr.overdueMilestones}
                  </p>
                  <div className="mt-2 flex items-start gap-1.5 text-xs">
                    <Zap className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${risk.text}`} />
                    <span className="font-medium text-foreground">{cr.recommendedAction}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ═══ SECTION 5: Today's Commitments ═══════════════════════════════════ */}
      <Card className="border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-primary" /> Today's Client Commitments
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Everything your team promised to deliver today. Track completion without asking anyone.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Client</th>
                <th className="p-3">Deliverable</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TODAY_COMMITMENTS.map((tc) => (
                <tr key={tc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-foreground">{tc.client}</td>
                  <td className="p-3 max-w-[220px]">
                    <span className="font-medium text-foreground">{tc.deliverable}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{tc.ownerName}</span>
                    <span className="block text-[10px] text-muted-foreground">{tc.ownerRole}</span>
                  </td>
                  <td className="p-3 font-mono font-medium">{tc.deadline}</td>
                  <td className="p-3 w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            tc.status === "delivered"
                              ? "bg-emerald-500"
                              : tc.status === "at-risk"
                                ? "bg-amber-500"
                                : "bg-primary"
                          }`}
                          style={{ width: `${tc.progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                        {tc.progressPct}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        tc.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : tc.status === "at-risk"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-primary/10 text-primary border-primary/30"
                      }`}
                    >
                      {tc.status === "delivered" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {tc.status.replace("-", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ═══ Timeline Detail Modal ════════════════════════════════════════════ */}
      {selectedItem && (
        <Dialog open={Boolean(selectedItem)} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-primary" /> Event Timeline
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedItem.client} · {selectedItem.service} · {selectedItem.overdueMilestone}
              </DialogDescription>
            </DialogHeader>

            {/* Delivery clocks summary */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card">
              <div>
                <span className="text-muted-foreground block text-[11px]">Gross Client Age</span>
                <strong className="text-sm font-bold">{selectedItem.clientElapsedTimeHrs} Hours</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Internal Service Time</span>
                <strong className="text-sm font-bold text-primary">{selectedItem.internalServiceTimeHrs} Working Hrs</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Stuck at Stage</span>
                <strong className="text-sm font-bold text-rose-500">{selectedItem.stageTimeHrs} Working Hrs</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 mt-2 space-y-0">
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />
              {selectedItem.timeline.map((event, i) => (
                <div key={i} className="relative flex items-start gap-3 pb-3">
                  <div className={`relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background shrink-0
                    ${event.type === "system" ? "border-muted-foreground/50" : ""}
                    ${event.type === "manager" ? "border-primary" : ""}
                    ${event.type === "staff" ? "border-emerald-500" : ""}
                    ${event.type === "client" ? "border-amber-500" : ""}
                    ${event.type === "ceo" ? "border-rose-500" : ""}
                  `} />
                  <div className={`flex-1 rounded-lg border p-2.5 ${timelineTypeConfig[event.type]}`}>
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
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function BriefingCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  return (
    <Card className={`p-3.5 border ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </Card>
  );
}

function ClockStat({ label, value, accent, warning }: { label: string; value: string; accent?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <strong className={`font-bold ${warning ? "text-rose-500" : accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </strong>
    </div>
  );
}
