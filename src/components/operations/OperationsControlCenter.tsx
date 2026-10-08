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
} from "lucide-react";
import { toast } from "sonner";
import { ClientOperation } from "@/lib/operations-data";

export function OperationsControlCenter() {
  const { data: profileData } = useProfile();
  const ops = useOperationsData();

  // Navigation tabs matching the MSP Portal aesthetic
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "people" | "clients" | "onboarding" | "escalations" | "sales"
  >("overview");

  // Filter & Search states
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("All");
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>("All");
  const [taskSearch, setTaskSearch] = useState<string>("");

  const [clientSearch, setClientSearch] = useState<string>("");
  const [clientHealthFilter, setClientHealthFilter] = useState<string>("All");

  const [leadSearch, setLeadSearch] = useState<string>("");
  const [leadStageFilter, setLeadStageFilter] = useState<string>("All");

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    clientOrTeam: "",
    ownerName: "",
    priority: "High" as const,
    deadline: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    reviewer: "Operations Manager",
    status: "Not Started" as const,
    progress: 0,
  });

  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [newEscalation, setNewEscalation] = useState({
    title: "",
    issueType: "Missed Deadline" as const,
    clientOrTeam: "",
    raisedBy: profileData?.profile?.full_name || "Operations Lead",
    priority: "High" as const,
    impact: "High" as const,
    owner: "",
    targetResolutionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    escalationLevel: "Level 1 (Team Lead)" as const,
    status: "Open" as const,
    actionsTaken: "",
  });

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    businessName: "",
    contactPerson: "",
    leadSource: "Google Search" as const,
    need: "",
    assignedSalesperson: profileData?.profile?.full_name || "Managing Director",
    followUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    stage: "New" as const,
    leadQuality: "Hot" as const,
    estimatedValue: 35000,
    proposalStatus: "Draft" as const,
    notes: "",
  });

  const [clientHealthModal, setClientHealthModal] = useState<{
    open: boolean;
    client: ClientOperation | null;
    health: "Green" | "Amber" | "Red";
    reason: string;
    nextAction: string;
  }>({
    open: false,
    client: null,
    health: "Green",
    reason: "",
    nextAction: "",
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

  const filteredClients = useMemo(() => {
    return ops.clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.accountManager.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.package.toLowerCase().includes(clientSearch.toLowerCase());
      const matchHealth = clientHealthFilter === "All" || c.health === clientHealthFilter;
      return matchSearch && matchHealth;
    });
  }, [ops.clients, clientSearch, clientHealthFilter]);

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
      {/* 1. Standard Native MSP Page Title Eyebrow Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Activity className="h-3.5 w-3.5" /> Operations
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Operations Control Centre
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Live operations hub connecting team attendance, client deliverable health, active task execution, and pipeline milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ops.refreshRealData();
              toast.info("Refreshed live company data from Supabase");
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setNewTask((t) => ({ ...t, ownerName: ops.employees[0]?.name || "" }));
              setTaskModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setNewEscalation((e) => ({ ...e, owner: ops.employees[0]?.name || "" }));
              setEscalationModalOpen(true);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Log Issue
          </Button>
        </div>
      </div>

      {/* 2. Standard Native Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
        {[
          { key: "overview", label: "Dashboard Overview", icon: Activity, count: null },
          { key: "tasks", label: "Work & Tasks", icon: CheckSquare, count: ops.tasks.length || null },
          { key: "people", label: "Workforce Presence", icon: Users, count: `${ops.metrics.people.present}/${ops.metrics.people.total}` },
          { key: "clients", label: "Clients & Health", icon: Building2, count: ops.clients.length || null },
          { key: "onboarding", label: "Client Onboarding", icon: Layers, count: ops.onboarding.length || null },
          { key: "escalations", label: "Escalations", icon: AlertTriangle, count: ops.metrics.clients.openEscalations || null, alert: Boolean(ops.metrics.clients.openEscalations) },
          { key: "sales", label: "Sales & Leads", icon: TrendingUp, count: ops.leads.length || null },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
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
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
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
      {/* VIEW: DASHBOARD OVERVIEW                                                  */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Clean Metric Cards matching Portal SOP & Department styling */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card
              className="p-5 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setActiveTab("people")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Workforce Presence</span>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">
                {ops.metrics.people.present}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ {ops.metrics.people.total} Present</span>
              </p>
              <Progress
                value={ops.metrics.people.total ? Math.round((ops.metrics.people.present / ops.metrics.people.total) * 100) : 0}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {ops.metrics.people.late > 0 ? `${ops.metrics.people.late} late arrival` : "All on-time"} &bull; {ops.metrics.people.onLeave} on approved leave
              </p>
            </Card>

            <Card
              className="p-5 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setActiveTab("tasks")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Active Workload</span>
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">
                {ops.tasks.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">Tasks</span>
              </p>
              <Progress
                value={ops.tasks.length ? Math.round((ops.metrics.work.completed / ops.tasks.length) * 100) : 0}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {ops.metrics.work.overdue > 0 ? `${ops.metrics.work.overdue} overdue` : "0 overdue"} &bull; {ops.metrics.work.blocked} blocked
              </p>
            </Card>

            <Card
              className="p-5 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setActiveTab("clients")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Active Clients</span>
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">
                {ops.clients.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">Retainers</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {ops.clients.filter((c) => c.health === "Green").length} Healthy
                </span>
                {ops.metrics.clients.atRisk > 0 && (
                  <Badge variant="destructive" className="text-[10px] ml-auto">
                    {ops.metrics.clients.atRisk} Attention Needed
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Synced from company clients table
              </p>
            </Card>

            <Card
              className="p-5 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setActiveTab("sales")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pipeline Opportunities</span>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">
                R{(ops.metrics.sales.pipelineValue / 1000).toFixed(0)}k
              </p>
              <Progress
                value={ops.leads.length ? Math.round((ops.leads.filter((l) => l.stage === "Won").length / ops.leads.length) * 100) : 0}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {ops.metrics.sales.newLeads} new prospective deals &bull; {ops.metrics.sales.followUpsDue} follow-ups
              </p>
            </Card>
          </div>

          {/* Action Required Items & Active Client List */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Urgent Items */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Urgent Actions & Escalations</h2>
                <Badge variant="outline">{ops.metrics.actionRequired.length}</Badge>
              </div>

              {ops.metrics.actionRequired.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  No open escalations or blocked tasks requiring immediate action.
                </div>
              ) : (
                <div className="space-y-3">
                  {ops.metrics.actionRequired.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-md border border-border bg-secondary/20"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.priority === "Urgent" ? "destructive" : "default"} className="text-[10px]">
                            {item.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.clientOrTarget}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Assigned: {item.responsible} &bull; Due {item.deadline}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (item.category === "Escalation") setActiveTab("escalations");
                          else setActiveTab("tasks");
                        }}
                      >
                        Open <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Accounts At A Glance */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Live Client Accounts</h2>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setActiveTab("clients")}>
                  Manage All
                </Button>
              </div>

              {ops.clients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No clients currently recorded in the system.
                </div>
              ) : (
                <div className="space-y-3">
                  {ops.clients.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-md border border-border bg-secondary/20"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">Account Manager: {c.accountManager}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={c.health === "Green" ? "default" : c.health === "Amber" ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {c.health}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setClientHealthModal({
                              open: true,
                              client: c,
                              health: c.health,
                              reason: c.healthReason,
                              nextAction: c.nextAction,
                            });
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: WORK & TASKS                                                        */}
      {/* ========================================================================= */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, clients or assignees..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={taskFilterStatus} onValueChange={setTaskFilterStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Awaiting Review">Awaiting Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No tasks match your filters. Click "New Task" to create one.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3.5">Task</th>
                    <th className="p-3.5">Client / Context</th>
                    <th className="p-3.5">Owner</th>
                    <th className="p-3.5">Deadline</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="p-3.5">
                        <p className="font-semibold text-foreground">{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                        {t.blockReason && (
                          <span className="inline-block mt-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Blocker: {t.blockReason}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-muted-foreground">{t.clientOrTeam || "Internal"}</td>
                      <td className="p-3.5 font-medium text-foreground">{t.ownerName}</td>
                      <td className="p-3.5">{t.deadline}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            t.status === "Completed"
                              ? "default"
                              : t.status === "Blocked" || t.status === "Overdue"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Select
                          value={t.status}
                          onValueChange={(val) => {
                            ops.updateTask(t.id, {
                              status: val as any,
                              progress: val === "Completed" ? 100 : t.progress,
                            });
                            toast.success(`Task status changed to ${val}`);
                          }}
                        >
                          <SelectTrigger className="w-32 h-8 inline-flex"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Awaiting Review">Awaiting Review</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: WORKFORCE PRESENCE                                                  */}
      {/* ========================================================================= */}
      {activeTab === "people" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Live Team Presence</h2>
            <p className="text-xs text-muted-foreground">Computed directly from active company profiles & attendance logs.</p>
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Role & Department</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Status Today</th>
                  <th className="p-3.5">Clock In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ops.employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30">
                    <td className="p-3.5 font-semibold text-foreground">{emp.name}</td>
                    <td className="p-3.5">
                      <p className="font-medium text-foreground">{emp.role}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{emp.email}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          emp.attendanceStatus === "Present"
                            ? "default"
                            : emp.attendanceStatus === "Approved Leave"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {emp.attendanceStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-muted-foreground">{emp.clockInTime || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CLIENT OPERATIONS & HEALTH                                          */}
      {/* ========================================================================= */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={clientHealthFilter} onValueChange={setClientHealthFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Health</SelectItem>
                <SelectItem value="Green">Green</SelectItem>
                <SelectItem value="Amber">Amber</SelectItem>
                <SelectItem value="Red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
                    <p className="text-xs text-muted-foreground">{client.package}</p>
                  </div>
                  <Badge
                    variant={client.health === "Green" ? "default" : client.health === "Amber" ? "secondary" : "destructive"}
                  >
                    {client.health}
                  </Badge>
                </div>

                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Account Manager:</span> {client.accountManager}</p>
                  <p><span className="font-medium text-foreground">Contract Status:</span> {client.contractStatus}</p>
                </div>

                <div className="p-2.5 rounded-md bg-secondary/30 text-xs space-y-1">
                  <p className="font-medium text-foreground">Health Assessment:</p>
                  <p className="text-muted-foreground">{client.healthReason}</p>
                  <p className="font-medium text-foreground mt-2">Next Step:</p>
                  <p className="text-muted-foreground">{client.nextAction} (Due {client.nextActionDue})</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setClientHealthModal({
                      open: true,
                      client,
                      health: client.health,
                      reason: client.healthReason,
                      nextAction: client.nextAction,
                    });
                  }}
                >
                  Update Health Status
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: ONBOARDING WORKFLOW                                                 */}
      {/* ========================================================================= */}
      {activeTab === "onboarding" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Client Onboarding Pipelines</h2>

          {ops.onboarding.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No clients currently in the onboarding stage. Marking a sales opportunity as "Won" will automatically initiate their onboarding pipeline.
            </Card>
          ) : (
            <div className="space-y-3">
              {ops.onboarding.map((workflow) => (
                <Card key={workflow.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{workflow.clientName}</h3>
                      <p className="text-xs text-muted-foreground">Stage: <strong className="text-primary">{workflow.currentStage}</strong> &bull; Lead: {workflow.accountManager}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground">{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: ESCALATIONS                                                         */}
      {/* ========================================================================= */}
      {activeTab === "escalations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Operational Escalations</h2>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setNewEscalation((e) => ({ ...e, owner: ops.employees[0]?.name || "" }));
                setEscalationModalOpen(true);
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Raise Issue
            </Button>
          </div>

          {ops.escalations.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No open escalations currently logged.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ops.escalations.map((esc) => (
                <Card key={esc.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="destructive" className="text-xs">{esc.priority}</Badge>
                      <h3 className="text-base font-semibold text-foreground mt-2">{esc.title}</h3>
                      <p className="text-xs text-muted-foreground">{esc.clientOrTeam} &bull; Owner: {esc.owner}</p>
                    </div>
                    <Badge variant="outline">{esc.status}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground bg-secondary/30 p-2.5 rounded-md">
                    {esc.actionsTaken || "Investigation in progress."}
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        ops.updateEscalation(esc.id, { status: "Resolved" });
                        toast.success("Escalation resolved");
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: SALES & LEADS                                                       */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Sales Opportunities & Leads</h2>
            <Button size="sm" onClick={() => setLeadModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No active leads found. Click "Add Lead" to register a prospective client.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3.5">Business</th>
                    <th className="p-3.5">Contact Person</th>
                    <th className="p-3.5">Sales Lead</th>
                    <th className="p-3.5">Monthly Value</th>
                    <th className="p-3.5">Pipeline Stage</th>
                    <th className="p-3.5 text-right">Update Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30">
                      <td className="p-3.5 font-semibold text-foreground">{lead.businessName}</td>
                      <td className="p-3.5 text-muted-foreground">{lead.contactPerson}</td>
                      <td className="p-3.5 font-medium">{lead.assignedSalesperson}</td>
                      <td className="p-3.5 font-semibold">R{lead.estimatedValue.toLocaleString()}</td>
                      <td className="p-3.5">
                        <Badge variant={lead.stage === "Won" ? "default" : "secondary"}>
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Select
                          value={lead.stage}
                          onValueChange={(val) => {
                            ops.updateLead(lead.id, { stage: val as any });
                            if (val === "Won") {
                              toast.success(`Deal Won! Converted to onboarding workflow.`);
                            }
                          }}
                        >
                          <SelectTrigger className="w-32 h-8 inline-flex"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                            <SelectItem value="Won">Won (Convert)</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: CREATE TASK                                                       */}
      {/* ========================================================================= */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Assign a deliverable with an owner and target deadline.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div>
              <Label>Task Title *</Label>
              <Input
                placeholder="e.g. Meta Conversions API Setup"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Client or Project</Label>
              <Input
                placeholder="Client name"
                value={newTask.clientOrTeam}
                onChange={(e) => setNewTask({ ...newTask, clientOrTeam: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Owner</Label>
                <Select value={newTask.ownerName} onValueChange={(val) => setNewTask({ ...newTask, ownerName: val })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {ops.employees.map((e) => (
                      <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newTask.priority} onValueChange={(val: any) => setNewTask({ ...newTask, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newTask.title) {
                  toast.error("Please enter a title.");
                  return;
                }
                const emp = ops.employees.find((e) => e.name === newTask.ownerName);
                ops.addTask({
                  ...newTask,
                  ownerId: emp?.id || "emp-1",
                  assignedDate: new Date().toISOString().split("T")[0],
                });
                toast.success("Task assigned successfully");
                setTaskModalOpen(false);
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODALS: LOG ESCALATION                                                    */}
      {/* ========================================================================= */}
      <Dialog open={escalationModalOpen} onOpenChange={setEscalationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Operational Issue</DialogTitle>
            <DialogDescription>Record a blocker or client delivery concern.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div>
              <Label>Issue Summary *</Label>
              <Input
                placeholder="Brief summary of the issue"
                value={newEscalation.title}
                onChange={(e) => setNewEscalation({ ...newEscalation, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Client / Team</Label>
                <Input
                  placeholder="Affected account"
                  value={newEscalation.clientOrTeam}
                  onChange={(e) => setNewEscalation({ ...newEscalation, clientOrTeam: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newEscalation.priority} onValueChange={(val: any) => setNewEscalation({ ...newEscalation, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationModalOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!newEscalation.title) {
                  toast.error("Please enter an issue summary.");
                  return;
                }
                ops.addEscalation({
                  ...newEscalation,
                  dateRaised: new Date().toISOString().split("T")[0],
                });
                toast.success("Issue logged successfully");
                setEscalationModalOpen(false);
              }}
            >
              Log Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODALS: ADD LEAD                                                          */}
      {/* ========================================================================= */}
      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>Register a new sales prospect.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div>
              <Label>Business Name *</Label>
              <Input
                placeholder="Company name"
                value={newLead.businessName}
                onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Contact Person</Label>
                <Input
                  placeholder="Name"
                  value={newLead.contactPerson}
                  onChange={(e) => setNewLead({ ...newLead, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <Label>Monthly Value (ZAR)</Label>
                <Input
                  type="number"
                  placeholder="35000"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLeadModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newLead.businessName) {
                  toast.error("Please enter a business name.");
                  return;
                }
                ops.addLead(newLead);
                toast.success("Lead added to pipeline");
                setLeadModalOpen(false);
              }}
            >
              Save Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODALS: UPDATE CLIENT HEALTH                                              */}
      {/* ========================================================================= */}
      <Dialog
        open={clientHealthModal.open}
        onOpenChange={(open) => setClientHealthModal({ ...clientHealthModal, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Client Health</DialogTitle>
            <DialogDescription>Set account health status and next action.</DialogDescription>
          </DialogHeader>

          {clientHealthModal.client && (
            <div className="space-y-3 py-2 text-sm">
              <div>
                <Label>Health Status</Label>
                <Select
                  value={clientHealthModal.health}
                  onValueChange={(val: any) => setClientHealthModal({ ...clientHealthModal, health: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Green">Green (Healthy)</SelectItem>
                    <SelectItem value="Amber">Amber (Attention Required)</SelectItem>
                    <SelectItem value="Red">Red (Critical Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Health Assessment Reason</Label>
                <Input
                  value={clientHealthModal.reason}
                  onChange={(e) => setClientHealthModal({ ...clientHealthModal, reason: e.target.value })}
                />
              </div>

              <div>
                <Label>Next Action</Label>
                <Input
                  value={clientHealthModal.nextAction}
                  onChange={(e) => setClientHealthModal({ ...clientHealthModal, nextAction: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setClientHealthModal({ ...clientHealthModal, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (clientHealthModal.client) {
                  ops.updateClientHealth(
                    clientHealthModal.client.id,
                    clientHealthModal.health,
                    clientHealthModal.reason,
                    clientHealthModal.nextAction
                  );
                  toast.success("Client health updated");
                  setClientHealthModal({ ...clientHealthModal, open: false });
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
