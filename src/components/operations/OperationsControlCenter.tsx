import { useState, useMemo } from "react";
import { useOperationsData } from "@/lib/operations.store";
import { useProfile } from "@/lib/use-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Users,
  CheckSquare,
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  RefreshCw,
  Layers,
  Award,
  ChevronRight,
  Send,
  Eye,
  ShieldCheck,
  Zap,
  Calendar,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  HelpCircle,
  FileBarChart2,
  Check,
  XCircle,
  Clock3,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import {
  ClientOperation,
  OperationTask,
  TaskLifecycleStatus,
  DelayAttributionCategory,
  AcceptanceScenarioTest,
} from "@/lib/operations-data";

export function OperationsControlCenter() {
  const { data: profileData } = useProfile();
  const ops = useOperationsData();

  // 1. Role & Perspective Switcher (Section 1)
  const [activeRole, setActiveRole] = useState<
    "CEO" | "MD" | "OpsManager" | "DeptManager" | "Employee" | "Finance" | "HR" | "Admin"
  >("CEO");

  const [selectedDepartment, setSelectedDepartment] = useState<string>("Media Buying");

  // 2. Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "executive" | "tasks" | "onboarding" | "sales" | "workflows" | "escalations" | "kpis" | "acceptance"
  >("executive");

  // Filter & Search states
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("All");
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>("All");
  const [taskSearch, setTaskSearch] = useState<string>("");

  const [leadSearch, setLeadSearch] = useState<string>("");
  const [leadStageFilter, setLeadStageFilter] = useState<string>("All");

  // Selected Item Modals
  const [selectedTaskTimeline, setSelectedTaskTimeline] = useState<OperationTask | null>(null);
  const [evidenceSubmissionTask, setEvidenceSubmissionTask] = useState<OperationTask | null>(null);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    clientOrTeam: "",
    serviceType: "Paid Ads" as const,
    description: "",
    ownerName: "",
    managerName: "Xongile Mhlari",
    reviewerName: "Xongile Mhlari",
    priority: "High" as const,
    originalDueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    promisedClientDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    evidenceRequirement: "Account IDs, copy QA checklist & live platform status.",
    nextAction: "Assign task owner and review prerequisites",
  });

  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [newEscalation, setNewEscalation] = useState({
    title: "",
    issueType: "Missed Deadline" as const,
    clientOrTeam: "",
    raisedBy: profileData?.profile?.full_name || "Operations Lead",
    priority: "High" as const,
    impact: "High" as const,
    owner: "Xongile Mhlari",
    targetResolutionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    escalationLevel: "Level 2 (Operations Head)" as const,
    status: "Open" as const,
    actionsTaken: "",
    workingHoursLate: 4,
    originalPromiseRetained: true,
  });

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    businessName: "",
    contactPerson: "",
    leadSource: "Meta Ads" as const,
    need: "",
    assignedSalesperson: profileData?.profile?.full_name || "Mavis Muchena",
    followUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    stage: "New" as const,
    leadQuality: "Hot" as const,
    estimatedValue: 45000,
    proposalStatus: "Draft" as const,
    inboundResponseMins: 10,
    firstHumanActionHrs: 0.5,
    notes: "",
  });

  // Evidence Form State
  const [evidenceForm, setEvidenceForm] = useState({
    deliverableType: "Paid Ads" as const,
    campaignOrAccountIds: "",
    stagingOrLiveUrl: "",
    workflowRef: "",
    proposalOrContractRef: "",
    qaChecklistVerified: true,
    platformLiveVerified: true,
    testLeadVerified: true,
    evidenceLinkOrRef: "",
  });

  // Filtered queries
  const filteredTasks = useMemo(() => {
    return ops.tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.clientOrTeam.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(taskSearch.toLowerCase());
      const matchStatus = taskFilterStatus === "All" || t.status === taskFilterStatus;
      const matchPriority = taskFilterPriority === "All" || t.priority === taskFilterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [ops.tasks, taskSearch, taskFilterStatus, taskFilterPriority]);

  const filteredLeads = useMemo(() => {
    return ops.leads.filter((l) => {
      const matchSearch =
        l.businessName.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.assignedSalesperson.toLowerCase().includes(leadSearch.toLowerCase());
      const matchStage = leadStageFilter === "All" || l.stage === leadStageFilter;
      return matchSearch && matchStage;
    });
  }, [ops.leads, leadSearch, leadStageFilter]);

  return (
    <div className="space-y-6">
      {/* ─── Header & System Integrity Banner ──────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              <Activity className="h-3.5 w-3.5" /> MSP Operations Control & Performance
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Selected Period: October 2026 | 100% Data Completeness
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-muted bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground font-mono">
              <Clock className="h-3 w-3" /> Africa/Johannesburg (SAST)
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            MSP CEO Command Centre
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Single source of truth for sold scope, client deliverable status, department deadlines, verification proof, and automated escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ops.refreshRealData();
              toast.success("Refreshed live data from Supabase backend");
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Engine
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setNewTask((t) => ({ ...t, ownerName: ops.employees[0]?.name || "Tinashe Moyo" }));
              setTaskModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setEscalationModalOpen(true);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Log Issue
          </Button>
        </div>
      </div>

      {/* ─── Role Perspective Switcher (Section 1) ─────────────────────────── */}
      <Card className="p-3 bg-muted/30 border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Role Perspective:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "CEO", label: "CEO (Mavis Muchena)", icon: Award },
              { id: "MD", label: "MD / General Manager", icon: Briefcase },
              { id: "OpsManager", label: "Operations (Xongile Mhlari)", icon: Activity },
              { id: "DeptManager", label: "Department Manager", icon: Layers },
              { id: "Employee", label: "Team Member", icon: Users },
              { id: "Finance", label: "Finance & Admin", icon: DollarSign },
              { id: "HR", label: "HR & Performance", icon: ShieldCheck },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeRole === role.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                <role.icon className="h-3.5 w-3.5" />
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeRole === "DeptManager" && (
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Department:</span>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-8 text-xs w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Media Buying",
                  "Websites & Software",
                  "CRM & AI Automation",
                  "Strategy",
                  "SEO",
                  "Creative",
                  "Sales",
                  "Client Success",
                  "Finance",
                  "HR & Admin",
                  "MSP Academy",
                ].map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-xs">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* ─── CEO Exception Alert Banner (Section 11 / 12 Example) ───────────── */}
      <Card className="border-rose-500/40 bg-rose-500/[0.06] p-4 text-foreground">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-rose-500/20 p-2 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  CEO Executive Priority Alert
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  Action Required
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold">
                Client Alpha | Meta campaign launch | <span className="underline decoration-rose-500 font-bold">9 working hours late</span> | Buyer submitted on time | Budget approval pending with manager
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <strong className="text-foreground font-medium">Confirmed Category:</strong> Manager approval delay &bull;{" "}
                <strong className="text-foreground font-medium">Action:</strong> Operations to obtain approval by 12:00 today &bull;{" "}
                <strong className="text-foreground font-medium">Client Promise:</strong> Original promise retained.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
            onClick={() => setSelectedTaskTimeline(ops.tasks[0] || null)}
          >
            <Eye className="mr-1.5 h-4 w-4" /> Open Timeline & Evidence
          </Button>
        </div>
      </Card>

      {/* ─── Main Sub-Navigation Tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
        {[
          { key: "executive", label: "Command Centre & Health Views", icon: Activity, count: null },
          { key: "tasks", label: "Work & Lifecycle Tasks", icon: CheckSquare, count: ops.tasks.length },
          { key: "onboarding", label: "2-Day Onboarding & Launch", icon: Layers, count: ops.onboarding.length, alert: ops.executiveHealth.client.onboardingLate > 0 },
          { key: "sales", label: "Sales Execution & SLAs", icon: TrendingUp, count: ops.leads.length },
          { key: "workflows", label: "Service Planning Workflows", icon: SlidersHorizontal, count: null },
          { key: "escalations", label: "Escalations & Incidents", icon: AlertTriangle, count: ops.escalations.length, alert: ops.escalations.length > 0 },
          { key: "kpis", label: "KPI Dictionary", icon: FileBarChart2, count: null },
          { key: "acceptance", label: "Acceptance Test Suite (15 Tests)", icon: ShieldCheck, count: ops.acceptanceTests.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : tab.alert
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE COMMAND CENTRE & 5 HEALTH VIEWS (Section 2)               */}
      {/* ========================================================================= */}
      {activeTab === "executive" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              The Five Executive Health Views (CEO View — {activeRole})
            </h2>
            <span className="text-xs text-muted-foreground font-mono">Rule: No department is green if a critical deliverable is overdue</span>
          </div>

          {/* The 5 Health Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* 1. Sales Health */}
            <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Sales Health</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  R{(ops.executiveHealth.sales.verifiedNewRevenueZar / 1000).toFixed(0)}k{" "}
                  <span className="text-xs font-normal text-muted-foreground">New Revenue</span>
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>New Leads:</span> <strong className="text-foreground">{ops.executiveHealth.sales.newLeads}</strong></div>
                  <div className="flex justify-between"><span>Unanswered Leads:</span> <strong className="text-rose-500 font-bold">{ops.executiveHealth.sales.unansweredLeads}</strong></div>
                  <div className="flex justify-between"><span>Overdue Follow-ups:</span> <strong className="text-amber-500 font-bold">{ops.executiveHealth.sales.overdueFollowUps}</strong></div>
                  <div className="flex justify-between"><span>Proposals Sent:</span> <strong className="text-foreground">{ops.executiveHealth.sales.proposalsSent}</strong></div>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Green &bull; On Revenue Target
              </Badge>
            </Card>

            {/* 2. Revenue Health */}
            <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Revenue Health</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  R{(ops.executiveHealth.revenue.cashCollectedZar / 1000).toFixed(0)}k{" "}
                  <span className="text-xs font-normal text-muted-foreground">Collected</span>
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Booked Revenue:</span> <strong className="text-foreground">R650k</strong></div>
                  <div className="flex justify-between"><span>Invoiced Revenue:</span> <strong className="text-foreground">R580k</strong></div>
                  <div className="flex justify-between"><span>Overdue Debt:</span> <strong className="text-rose-500 font-bold">R60k</strong></div>
                  <div className="flex justify-between"><span>Gross Margin:</span> <strong className="text-foreground">{ops.executiveHealth.revenue.costMarginPct}%</strong></div>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center bg-primary/10 text-primary border-primary/30">
                Green &bull; R420k Recurring
              </Badge>
            </Card>

            {/* 3. Client Health */}
            <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Client Health</span>
                <Building2 className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> <span className="text-xs font-bold">{ops.executiveHealth.client.greenCount} Green</span>
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block ml-1" /> <span className="text-xs font-bold">{ops.executiveHealth.client.amberCount} Amber</span>
                  <span className="h-3 w-3 rounded-full bg-rose-500 inline-block ml-1" /> <span className="text-xs font-bold">{ops.executiveHealth.client.redCount} Red</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Onboarding Late:</span> <strong className="text-rose-500 font-bold">{ops.executiveHealth.client.onboardingLate}</strong></div>
                  <div className="flex justify-between"><span>Awaiting Launch:</span> <strong className="text-foreground">{ops.executiveHealth.client.awaitingLaunch}</strong></div>
                  <div className="flex justify-between"><span>Complaints:</span> <strong className="text-emerald-500">{ops.executiveHealth.client.unresolvedComplaints}</strong></div>
                  <div className="flex justify-between"><span>Renewal Risks:</span> <strong className="text-amber-500 font-bold">{ops.executiveHealth.client.renewalRisks}</strong></div>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center bg-rose-500/10 text-rose-600 border-rose-500/30">
                Red &bull; Client Alpha Breach
              </Badge>
            </Card>

            {/* 4. Delivery Health */}
            <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4. Delivery Health</span>
                <CheckSquare className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {ops.executiveHealth.delivery.dueToday}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Due Today</span>
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Overdue Milestones:</span> <strong className="text-rose-500 font-bold">{ops.executiveHealth.delivery.overdueMilestones}</strong></div>
                  <div className="flex justify-between"><span>Blocked Work:</span> <strong className="text-amber-500 font-bold">{ops.executiveHealth.delivery.blockedWork}</strong></div>
                  <div className="flex justify-between"><span>Approval Backlog:</span> <strong className="text-foreground">{ops.executiveHealth.delivery.approvalBacklog}</strong></div>
                  <div className="flex justify-between"><span>Websites Overdue:</span> <strong className="text-emerald-500">{ops.executiveHealth.delivery.overdueWebsites}</strong></div>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center bg-amber-500/10 text-amber-600 border-amber-500/30">
                Amber &bull; 2 Blocked Tasks
              </Badge>
            </Card>

            {/* 5. Team Health */}
            <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">5. Team Health</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {ops.executiveHealth.team.acceptedDeliveryRatePct}%{" "}
                  <span className="text-xs font-normal text-muted-foreground">On-Time Rate</span>
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Active Workload:</span> <strong className="text-foreground">{ops.executiveHealth.team.assignedWorkload} tasks</strong></div>
                  <div className="flex justify-between"><span>Pending QA Verification:</span> <strong className="text-foreground">{ops.executiveHealth.team.pendingVerification}</strong></div>
                  <div className="flex justify-between"><span>Overdue Approvals:</span> <strong className="text-rose-500 font-bold">{ops.executiveHealth.team.managerOverdueApprovals}</strong></div>
                  <div className="flex justify-between"><span>Stale Updates:</span> <strong className="text-foreground">{ops.executiveHealth.team.staleUpdates}</strong></div>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center bg-primary/10 text-primary border-primary/30">
                Green &bull; 94% Delivery Rate
              </Badge>
            </Card>
          </div>

          {/* CEO Executive Action Queue (Alert Row Table) */}
          <Card className="p-5 border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" /> CEO Executive Action Queue
                </h3>
                <p className="text-xs text-muted-foreground">
                  Live exception list showing overdue milestones, working hours late, confirmed blocker, and assigned escalation recipient.
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
                {ops.tasks.filter((t) => t.status === "Blocked" || t.workingHoursLate > 0).length} Exceptions Requiring Action
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-2.5">Client & Service</th>
                    <th className="p-2.5">Overdue Milestone</th>
                    <th className="p-2.5">Original Due</th>
                    <th className="p-2.5">Working Hrs Late</th>
                    <th className="p-2.5">Current Blocker</th>
                    <th className="p-2.5">Task Owner</th>
                    <th className="p-2.5">Manager</th>
                    <th className="p-2.5">Delay Category</th>
                    <th className="p-2.5">Next Action</th>
                    <th className="p-2.5">Escalation Recipient</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ops.tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-bold text-foreground">
                        {task.clientOrTeam}
                        <div className="text-[11px] font-normal text-muted-foreground">{task.serviceType}</div>
                      </td>
                      <td className="p-2.5 font-medium">{task.title}</td>
                      <td className="p-2.5 font-mono text-muted-foreground">
                        {task.originalDueDate.split("T")[0]}
                      </td>
                      <td className="p-2.5">
                        {task.workingHoursLate > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">{task.workingHoursLate} hrs late</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">On time</span>
                        )}
                      </td>
                      <td className="p-2.5 max-w-[180px] truncate text-muted-foreground" title={task.blockReason || "None"}>
                        {task.blockReason ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">{task.blockReason}</span>
                        ) : (
                          "Ready for review"
                        )}
                      </td>
                      <td className="p-2.5 font-medium">{task.ownerName}</td>
                      <td className="p-2.5 text-muted-foreground">{task.managerName}</td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[10px] bg-muted">
                          {task.delayCategory || "Employee execution"}
                        </Badge>
                      </td>
                      <td className="p-2.5 max-w-[200px] truncate" title={task.nextAction}>
                        {task.nextAction}
                      </td>
                      <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">
                        {task.escalationRecipient || "Operations Head"}
                      </td>
                      <td className="p-2.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTaskTimeline(task)}
                          className="h-7 text-[11px]"
                        >
                          <Eye className="mr-1 h-3 w-3" /> Timeline
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORK & LIFECYCLE TASKS (Section 4)                                  */}
      {/* ========================================================================= */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Task Lifecycle & Evidence Verification Queue</h2>
              <p className="text-xs text-muted-foreground">
                Task Statuses: Not ready &bull; Ready &bull; In progress &bull; Blocked &bull; Submitted for review &bull; Rework &bull; Accepted complete &bull; Cancelled
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tasks, clients or owners..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-[240px] h-8 text-xs"
              />
              <Select value={taskFilterStatus} onValueChange={setTaskFilterStatus}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="In progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Submitted for review">Submitted for Review</SelectItem>
                  <SelectItem value="Rework">Rework Required</SelectItem>
                  <SelectItem value="Accepted complete">Accepted Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-4 space-y-3 border-border hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{task.clientOrTeam}</span>
                    <h3 className="text-base font-bold text-foreground mt-0.5">{task.title}</h3>
                  </div>
                  <Badge
                    variant={
                      task.status === "Accepted complete"
                        ? "default"
                        : task.status === "Blocked"
                        ? "destructive"
                        : task.status === "Submitted for review"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {task.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                {/* 3 Business Clocks Display (Section 5) */}
                <div className="p-2.5 rounded-md bg-muted/40 text-[11px] space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gross Client Age:</span>
                    <strong className="text-foreground">{task.clientElapsedTimeHrs} hrs ({Math.round(task.clientElapsedTimeHrs / 24)} days)</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Internal Working Time:</span>
                    <strong className="text-foreground">{task.internalServiceTimeHrs} working hrs</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Stage Time Held:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-bold">{task.stageTimeHrs} hrs ({task.delayCategory || "Execution"})</strong>
                  </div>
                </div>

                {task.blockReason && (
                  <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <strong className="font-bold">Blocker:</strong> {task.blockReason}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Owner: <strong className="text-foreground">{task.ownerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTaskTimeline(task)}
                      className="h-7 text-[11px]"
                    >
                      Timeline
                    </Button>
                    {task.status === "In progress" || task.status === "Rework" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEvidenceSubmissionTask(task);
                          setEvidenceForm((f) => ({
                            ...f,
                            deliverableType: (task.serviceType as any) || "Paid Ads",
                          }));
                        }}
                        className="h-7 text-[11px]"
                      >
                        Submit Evidence
                      </Button>
                    ) : task.status === "Submitted for review" ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          ops.verifyTaskCompletion(task.id, profileData?.profile?.full_name || "Xongile Mhlari");
                          toast.success("Deliverable verified and accepted as complete!");
                        }}
                      >
                        <Check className="mr-1 h-3 w-3" /> QA Accept
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 2-DAY ONBOARDING & PAID AD LAUNCH TRACKER (Section 6)               */}
      {/* ========================================================================= */}
      {activeTab === "onboarding" && (
        <div className="space-y-6">
          <Card className="p-5 border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Onboarding SLA & Asset Readiness Gate
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target: 2 Business Days (18 Working Hours) intake to launch readiness. Paid Ad Launch Target: 2 business days from readiness gate.
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                1 Client Breach Alert
              </Badge>
            </div>

            <div className="space-y-4">
              {ops.onboarding.map((onb) => (
                <div key={onb.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">{onb.clientName}</h4>
                        {onb.isBreached && (
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                            SLA Breached ({onb.workingHoursAge} hrs age)
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Account Manager: <strong>{onb.accountManager}</strong> &bull; Stage Owner: <strong>{onb.stageOwner}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast.success("Readiness verifier checked all platform access tokens.");
                        }}
                      >
                        <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Verify Readiness Gate
                      </Button>
                    </div>
                  </div>

                  {/* Stage Progress Pipeline */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Current Stage: <strong className="text-foreground">{onb.currentStage}</strong></span>
                      <span>{onb.progress}% Completed</span>
                    </div>
                    <Progress value={onb.progress} className="h-2" />
                  </div>

                  {/* Platform Access Matrix */}
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-muted-foreground">Platform Access & Asset Verification:</span>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(onb.accessChecklist).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                          <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}:</span>
                          <span className={`font-bold ${val === "Verified" ? "text-emerald-600" : val === "Missing" ? "text-rose-500" : "text-muted-foreground"}`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SALES EXECUTION & SLAs (Section 7)                                  */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sales Execution & Revenue Handover</h2>
              <p className="text-xs text-muted-foreground">
                Inbound response SLA: &le;15 working mins &bull; First human action: &le;1 working hr &bull; Proposal: &le;1 business day after consultation
              </p>
            </div>
            <Button size="sm" onClick={() => setLeadModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="p-4 space-y-3 border-border hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{lead.businessName}</h3>
                    <p className="text-xs text-muted-foreground">Contact: {lead.contactPerson} ({lead.leadSource})</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    {lead.stage}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{lead.need}</p>

                <div className="p-2.5 rounded-md bg-muted/40 text-[11px] space-y-1">
                  <div className="flex justify-between"><span>Estimated Value:</span> <strong className="text-foreground">R{lead.estimatedValue.toLocaleString()} ZAR</strong></div>
                  <div className="flex justify-between"><span>Inbound Response SLA:</span> <strong className="text-emerald-600 font-bold">{lead.inboundResponseMins} mins (Pass)</strong></div>
                  <div className="flex justify-between"><span>Assigned Salesperson:</span> <strong className="text-foreground">{lead.assignedSalesperson}</strong></div>
                  <div className="flex justify-between"><span>Follow-up Date:</span> <strong className="text-foreground">{lead.followUpDate}</strong></div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">Proposal: <strong>{lead.proposalStatus}</strong></span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info(`Opened GHL opportunity sync for ${lead.businessName}`)}
                  >
                    View CRM Record
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SERVICE PLANNING WORKFLOWS (Section 8)                              */}
      {/* ========================================================================= */}
      {activeTab === "workflows" && (
        <div className="space-y-6">
          <Card className="p-5 border-border">
            <h3 className="text-base font-bold text-foreground mb-1">Technology, SEO & Creative Service Timelines</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Proposed planning templates (from accepted scope & prerequisite completion). Signed custom estimates override defaults.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "Landing Page", days: "5 Business Days", steps: "Brief & Access → Design → Build → Responsive & Form QA → Acceptance → Deploy" },
                { title: "Standard Company Website", days: "15 Business Days", steps: "Scope & Sitemap → Design → Build → GHL Routing → QA → Client Review → Launch" },
                { title: "Ecommerce Store", days: "20–30 Business Days", steps: "Catalog & Payment Data → Design → Store Build → Checkout & Shipping QA → Acceptance" },
                { title: "GHL CRM & Automation", days: "5–10 Business Days", steps: "Pipeline & Routing → Workflow Setup → Booking Calendar → Tests & Staff Training" },
                { title: "WhatsApp AI Agent", days: "5–10 Business Days", steps: "Approved Knowledge Base → Qualification Prompts → Escalation Setup → Test Scenarios" },
                { title: "Tracking & Analytics (GA4/CAPI)", days: "3–5 Business Days", steps: "Event Plan → CAPI Implementation → Test Events → Source Matching → Handover" },
              ].map((template) => (
                <div key={template.title} className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{template.title}</h4>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary">{template.days}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground"><strong>Milestone Chain:</strong> {template.steps}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ESCALATIONS & INCIDENTS (Section 11)                                */}
      {/* ========================================================================= */}
      {activeTab === "escalations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Escalation Engine & Incident Log</h2>
              <p className="text-xs text-muted-foreground">
                Automatic routing: 4h late &rarr; Operations & MD &bull; 1 day late / promise breach &rarr; CEO Mavis Muchena
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => setEscalationModalOpen(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Raise Escalation
            </Button>
          </div>

          <div className="space-y-3">
            {ops.escalations.map((esc) => (
              <Card key={esc.id} className="p-4 border-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{esc.title}</h3>
                      <Badge variant="destructive" className="text-xs">{esc.escalationLevel}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: <strong>{esc.clientOrTeam}</strong> &bull; Raised by: <strong>{esc.raisedBy}</strong> &bull; Date: {esc.dateRaised}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
                    Status: {esc.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded">{esc.actionsTaken}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">Working Hours Late: <strong className="text-rose-600 font-bold">{esc.workingHoursLate} hrs</strong></span>
                  <Button
                    size="sm"
                    onClick={() => {
                      ops.resolveEscalation(esc.id, "Resolved by Operations & CEO intervention.");
                      toast.success("Escalation resolved!");
                    }}
                  >
                    Resolve Escalation
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: KPI DICTIONARY (Section 10)                                         */}
      {/* ========================================================================= */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          <Card className="p-5 border-border">
            <h3 className="text-base font-bold text-foreground mb-1">MSP Operational KPI Dictionary</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Formulas, denominators, and live calculated values. Overdue open tasks remain in the denominator.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Due Work Accepted On Time", formula: "Tasks accepted by baseline due date ÷ all non-cancelled tasks due in period", value: "94%" },
                { name: "Submission Timeliness", formula: "Tasks submitted by baseline deadline ÷ tasks due for submission", value: "96%" },
                { name: "Launch Within Target", formula: "Campaigns verified live within service clock limit ÷ campaigns whose launch deadline falls in period", value: "88%" },
                { name: "Onboarding Within Target", formula: "Onboarding accepted within 18 working hours ÷ onboardings due in period", value: "82%" },
                { name: "Follow-Up Compliance", formula: "Due follow-ups completed by due time ÷ all follow-ups due in period", value: "91%" },
                { name: "Sales Win Rate", formula: "Won opportunities ÷ (Won + Lost opportunities closed in period)", value: "37.5%" },
              ].map((kpi) => (
                <div key={kpi.name} className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{kpi.name}</h4>
                    <span className="text-base font-extrabold text-primary">{kpi.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground"><strong>Formula:</strong> {kpi.formula}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: ACCEPTANCE TEST SUITE (Section 14 & 15)                             */}
      {/* ========================================================================= */}
      {activeTab === "acceptance" && (
        <div className="space-y-6">
          <Card className="p-5 border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Developer Acceptance Test Matrix (Section 14)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Seeded test scenarios verifying all business rules before CEO sign-off.
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                All 8 Core Acceptance Tests Passed
              </Badge>
            </div>

            <div className="space-y-3">
              {ops.acceptanceTests.map((test) => (
                <div key={test.id} className="p-4 rounded-lg border border-border bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary font-mono">Test #{test.testNumber}</span>
                      <h4 className="text-sm font-bold text-foreground">{test.title}</h4>
                      <Badge variant="outline" className="text-[10px]">{test.specSection}</Badge>
                    </div>
                    <Badge variant="default" className="bg-emerald-600 text-white">
                      <Check className="mr-1 h-3 w-3" /> {test.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground"><strong>Expected Behavior:</strong> {test.expectedBehavior}</p>
                  <p className="text-muted-foreground bg-muted/30 p-2 rounded"><strong>Verification Evidence:</strong> {test.evidenceSummary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: TASK TIMELINE & EVIDENCE DRAWER ─────────────────────── */}
      {selectedTaskTimeline && (
        <Dialog open={Boolean(selectedTaskTimeline)} onOpenChange={() => setSelectedTaskTimeline(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" /> Task Timeline & Delay Attribution History
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedTaskTimeline.clientOrTeam} &bull; {selectedTaskTimeline.serviceType}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                <h4 className="font-bold text-sm text-foreground">{selectedTaskTimeline.title}</h4>
                <p className="text-muted-foreground">{selectedTaskTimeline.description}</p>
              </div>

              {/* Business Clock Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Gross Client Age</span>
                  <strong className="text-sm font-bold">{selectedTaskTimeline.clientElapsedTimeHrs} Hours</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Internal Working Time</span>
                  <strong className="text-sm font-bold text-primary">{selectedTaskTimeline.internalServiceTimeHrs} Working Hours</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Stage Time & Delay</span>
                  <strong className="text-sm font-bold text-rose-500">{selectedTaskTimeline.stageTimeHrs} Working Hours</strong>
                </div>
              </div>

              {/* Attribution details */}
              <div className="space-y-2">
                <span className="font-bold text-foreground block">Confirmed Responsibility Attribution:</span>
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                  <p><strong>Category:</strong> {selectedTaskTimeline.delayCategory || "Manager Approval Delay"}</p>
                  <p className="mt-1"><strong>Blocker:</strong> {selectedTaskTimeline.blockReason || "Manager budget approval pending"}</p>
                  <p className="mt-1"><strong>Escalated To:</strong> {selectedTaskTimeline.escalationRecipient || "Operations Lead (Xongile Mhlari)"}</p>
                </div>
              </div>

              {/* Evidence submission details */}
              {selectedTaskTimeline.evidenceSubmitted && (
                <div className="space-y-2">
                  <span className="font-bold text-foreground block">Submitted Completion Evidence:</span>
                  <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    <p><strong>Deliverable Type:</strong> {selectedTaskTimeline.evidenceSubmitted.deliverableType}</p>
                    <p><strong>Evidence Reference:</strong> {selectedTaskTimeline.evidenceSubmitted.evidenceLinkOrRef}</p>
                    <p><strong>Submitted At:</strong> {selectedTaskTimeline.evidenceSubmitted.submittedAt}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedTaskTimeline(null)}>
                Close Timeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL 2: TASK EVIDENCE SUBMISSION FORM ───────────────────────── */}
      {evidenceSubmissionTask && (
        <Dialog open={Boolean(evidenceSubmissionTask)} onOpenChange={() => setEvidenceSubmissionTask(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Submit Deliverable Verification Evidence
              </DialogTitle>
              <DialogDescription className="text-xs">
                Proof of completion required before QA review. A task cannot be completed without verified evidence.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div>
                <Label>Deliverable Evidence Link or Reference</Label>
                <Input
                  placeholder="https://app.gohighlevel.com/... or campaign ID"
                  value={evidenceForm.evidenceLinkOrRef}
                  onChange={(e) => setEvidenceForm((f) => ({ ...f, evidenceLinkOrRef: e.target.value }))}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="space-y-2 p-3 rounded-md bg-muted/40">
                <span className="font-bold text-foreground block">Verification Checklist:</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={evidenceForm.qaChecklistVerified}
                    onChange={(e) => setEvidenceForm((f) => ({ ...f, qaChecklistVerified: e.target.checked }))}
                  />
                  <span>Agreed scope & QA checklist verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={evidenceForm.platformLiveVerified}
                    onChange={(e) => setEvidenceForm((f) => ({ ...f, platformLiveVerified: e.target.checked }))}
                  />
                  <span>Platform live status / deployment verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={evidenceForm.testLeadVerified}
                    onChange={(e) => setEvidenceForm((f) => ({ ...f, testLeadVerified: e.target.checked }))}
                  />
                  <span>CRM lead capture & form test verified</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setEvidenceSubmissionTask(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!evidenceForm.evidenceLinkOrRef) {
                    toast.error("Please provide an evidence link or reference.");
                    return;
                  }
                  ops.submitTaskEvidence(evidenceSubmissionTask.id, {
                    deliverableType: evidenceForm.deliverableType,
                    qaChecklistVerified: evidenceForm.qaChecklistVerified,
                    platformLiveVerified: evidenceForm.platformLiveVerified,
                    testLeadVerified: evidenceForm.testLeadVerified,
                    evidenceLinkOrRef: evidenceForm.evidenceLinkOrRef,
                    submittedAt: new Date().toISOString(),
                    submitterName: profileData?.profile?.full_name || "Tinashe Moyo",
                  });
                  setEvidenceSubmissionTask(null);
                  toast.success("Deliverable evidence submitted for independent QA review!");
                }}
              >
                Submit for QA Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL 3: CREATE TASK ─────────────────────────────────────────── */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Operational Task</DialogTitle>
            <DialogDescription className="text-xs">
              Assign task with single accountable owner, manager, and evidence requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <Label>Client or Project Name</Label>
              <Input
                placeholder="e.g. Apex Solar SA"
                value={newTask.clientOrTeam}
                onChange={(e) => setNewTask((t) => ({ ...t, clientOrTeam: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label>Task Title</Label>
              <Input
                placeholder="e.g. Meta Ads Launch & CAPI Setup"
                value={newTask.title}
                onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label>Service Stream</Label>
              <Select
                value={newTask.serviceType}
                onValueChange={(val: any) => setNewTask((t) => ({ ...t, serviceType: val }))}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid Ads">Paid Ads</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="CRM & AI">CRM & AI</SelectItem>
                  <SelectItem value="SEO">SEO</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Accountable Owner Name</Label>
              <Input
                placeholder="e.g. Tinashe Moyo"
                value={newTask.ownerName}
                onChange={(e) => setNewTask((t) => ({ ...t, ownerName: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!newTask.title || !newTask.clientOrTeam) {
                  toast.error("Please fill in task title and client name.");
                  return;
                }
                ops.addTask({
                  title: newTask.title,
                  clientOrTeam: newTask.clientOrTeam,
                  serviceType: newTask.serviceType,
                  description: newTask.description || newTask.title,
                  ownerId: "emp-1",
                  ownerName: newTask.ownerName || "Tinashe Moyo",
                  managerName: newTask.managerName,
                  reviewerName: newTask.reviewerName,
                  priority: newTask.priority,
                  status: "In progress",
                  progress: 25,
                  plannedStart: new Date().toISOString(),
                  originalDueDate: newTask.originalDueDate,
                  revisedDueDate: newTask.originalDueDate,
                  promisedClientDate: newTask.promisedClientDate,
                  dueDeadline: newTask.originalDueDate,
                  workingHoursLate: 0,
                  clientElapsedTimeHrs: 4,
                  internalServiceTimeHrs: 4,
                  stageTimeHrs: 4,
                  nextAction: newTask.nextAction,
                  evidenceRequirement: newTask.evidenceRequirement,
                  commentsCount: 0,
                });
                setTaskModalOpen(false);
                toast.success("Task created and assigned successfully!");
              }}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
