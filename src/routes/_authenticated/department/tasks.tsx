import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Search, Filter, RefreshCw, Building2, Calendar,
  Clock, AlertTriangle, AlertCircle, Users, ArrowRight, UserCheck, ShieldCheck,
  Edit, List, LayoutGrid, CalendarDays, ExternalLink, Plus
} from "lucide-react";
import {
  fetchDepartmentData,
  mutateAssignTask,
  mutateCreateDepartmentTask,
  mutateTaskPriority,
  mutateTaskDeadline,
  DepartmentTask,
  DepartmentTeamMember,
} from "@/lib/department-manager.service";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/department/tasks")({
  head: () => ({ meta: [{ title: "My Department Tasks — Media Buying Workspace" }] }),
  component: DepartmentTasksPage,
});

export function DepartmentTasksPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<DepartmentTeamMember[]>([]);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([]);

  // Filtering & view mode
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "team">("table");

  // Reassignment Modal
  const [selectedTask, setSelectedTask] = useState<DepartmentTask | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  // Create & Assign Task Modal
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createClientId, setCreateClientId] = useState("");
  const [createAssigneeId, setCreateAssigneeId] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createPriority, setCreatePriority] = useState<DepartmentTask["priority"]>("High");
  const [createEvidenceReq, setCreateEvidenceReq] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Deadline Change Modal
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineReason, setDeadlineReason] = useState("");
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  // Priority Change Modal
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState<DepartmentTask["priority"]>("High");
  const [isSavingPriority, setIsSavingPriority] = useState(false);

  const managerName = profileData?.profile?.full_name || "Department Manager (Media Buying)";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setTasks(res.tasks);
      setTeamMembers(res.teamMembers);
      const clientsList = (res.dbClients && res.dbClients.length > 0)
        ? res.dbClients.map((c: any) => ({ id: c.id, name: c.name }))
        : (res.clients || []).map((c: any) => ({ id: c.id, name: c.name }));
      setAvailableClients(clientsList);
    } catch (err: any) {
      toast.error("Failed to load department tasks", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesClient = clientFilter === "all" || t.clientName === clientFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  const uniqueClients = Array.from(new Set(tasks.map((t) => t.clientName)));

  // Handlers
  async function handleConfirmReassign() {
    if (!selectedTask || !targetMemberId) {
      toast.error("Please select a team member.");
      return;
    }
    setIsSavingAssign(true);
    try {
      const updated = await mutateAssignTask(selectedTask.id, targetMemberId, managerName);
      setTasks(updated);
      toast.success("Task assigned successfully.", {
        description: `Assigned to ${teamMembers.find((m) => m.id === targetMemberId)?.name}`,
      });
      setReassignModalOpen(false);
      setSelectedTask(null);
    } catch (err: any) {
      toast.error("Failed to reassign task", { description: err?.message });
    } finally {
      setIsSavingAssign(false);
    }
  }

  async function handleCreateTask() {
    if (!createTitle.trim()) {
      toast.error("Please enter a deliverable title.");
      return;
    }
    const clientObj = availableClients.find((c) => c.id === createClientId) || availableClients[0];
    setIsCreatingTask(true);
    try {
      const updated = await mutateCreateDepartmentTask(
        {
          title: createTitle.trim(),
          clientId: clientObj?.id,
          clientName: clientObj?.name || "Client Deliverable",
          assignedToId: createAssigneeId || undefined,
          dueDate: createDueDate || new Date().toISOString().split("T")[0],
          priority: createPriority,
          evidenceRequired: createEvidenceReq || "Verified deliverables & completion report",
        },
        managerName
      );
      setTasks(updated);
      toast.success("Task created and assigned successfully.", {
        description: createAssigneeId
          ? `Assigned to ${teamMembers.find((m) => m.id === createAssigneeId)?.name}`
          : "Created as Unassigned deliverable",
      });
      setCreateTaskModalOpen(false);
      setCreateTitle("");
      setCreateAssigneeId("");
      setCreateDueDate("");
      setCreateEvidenceReq("");
    } catch (err: any) {
      toast.error("Failed to create task", { description: err?.message });
    } finally {
      setIsCreatingTask(false);
    }
  }

  async function handleConfirmDeadline() {
    if (!selectedTask || !newDeadline) {
      toast.error("Please specify the new deadline.");
      return;
    }
    if (!deadlineReason) {
      toast.error("Please provide a legitimate reason for deadline adjustment.");
      return;
    }
    setIsSavingDeadline(true);
    try {
      const updated = await mutateTaskDeadline(selectedTask.id, newDeadline, deadlineReason, managerName);
      setTasks(updated);
      toast.success("Deadline updated successfully.");
      setDeadlineModalOpen(false);
      setSelectedTask(null);
      setDeadlineReason("");
    } catch (err: any) {
      toast.error("Failed to update deadline", { description: err?.message });
    } finally {
      setIsSavingDeadline(false);
    }
  }

  async function handleConfirmPriority() {
    if (!selectedTask) return;
    setIsSavingPriority(true);
    try {
      const updated = await mutateTaskPriority(selectedTask.id, newPriority, managerName);
      setTasks(updated);
      toast.success("Priority updated successfully.");
      setPriorityModalOpen(false);
      setSelectedTask(null);
    } catch (err: any) {
      toast.error("Failed to update priority", { description: err?.message });
    } finally {
      setIsSavingPriority(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            My Department Tasks & Deliverables
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authoritative Media Buying task assignments, client commitments, delivery deadlines, and QA statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-xs">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              className={`h-7 px-2.5 text-xs font-semibold ${viewMode === "table" ? "bg-primary text-white" : "text-muted-foreground"}`}
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5 mr-1" /> Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              className={`h-7 px-2.5 text-xs font-semibold ${viewMode === "kanban" ? "bg-primary text-white" : "text-muted-foreground"}`}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Kanban
            </Button>
            <Button
              size="sm"
              variant={viewMode === "team" ? "default" : "ghost"}
              className={`h-7 px-2.5 text-xs font-semibold ${viewMode === "team" ? "bg-primary text-white" : "text-muted-foreground"}`}
              onClick={() => setViewMode("team")}
            >
              <Users className="h-3.5 w-3.5 mr-1" /> By Member
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (availableClients.length > 0) setCreateClientId(availableClients[0].id);
              setCreateTaskModalOpen(true);
            }}
            className="h-9 px-3 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create & Assign Task
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs cursor-pointer h-9 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────────────── */}
      <Card className="border-border p-4 bg-card shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, clients, assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background border-border text-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Submitted for Review">Submitted for Review</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Rework Required">Rework Required</SelectItem>
              <SelectItem value="Accepted Complete">Accepted Complete</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
              <SelectValue placeholder="Priority: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
              <SelectValue placeholder="Client: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ── TABLE VIEW ─────────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <Card className="border-border shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Task & Deliverable</th>
                    <th className="py-3 px-3">Client Commitment</th>
                    <th className="py-3 px-3">Assignee</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">QA / Evidence</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium">
                        No tasks match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground text-sm">{task.title}</div>
                          {task.blocker && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                              <AlertTriangle className="h-3 w-3" /> Blocker: {task.blocker}
                            </span>
                          )}
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            Est: {task.estimatedHours} hrs &bull; {task.dependencies ? `Dep: ${task.dependencies}` : "No dependencies"}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none font-medium">
                            {task.clientName}
                          </Badge>
                        </td>

                        <td className="py-3 px-3">
                          {task.status === "Unassigned" ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 text-xs">
                              <AlertCircle className="h-3.5 w-3.5" /> Unassigned
                            </span>
                          ) : (
                            <div>
                              <div className="font-semibold text-foreground">{task.assignedToName}</div>
                              <div className="text-[10px] text-muted-foreground font-medium">{task.assignedToRole}</div>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                              task.priority === "Urgent"
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                                : task.priority === "High"
                                ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              task.priority === "Urgent" ? "bg-rose-500" : task.priority === "High" ? "bg-amber-500" : "bg-blue-500"
                            }`} />
                            {task.priority}
                          </Badge>
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                              task.status === "Accepted Complete"
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                                : task.status === "Blocked"
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                                : task.status === "Submitted for Review"
                                ? "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                                : task.status === "Rework Required"
                                ? "bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800"
                                : "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              task.status === "Accepted Complete" ? "bg-emerald-500" : task.status === "Blocked" ? "bg-rose-500" : task.status === "Submitted for Review" ? "bg-blue-500" : "bg-purple-500"
                            }`} />
                            {task.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={task.workingHoursLate > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground font-medium"}>
                            {task.dueDate}
                          </span>
                          {task.approvedDeadlineChangesCount > 0 && (
                            <div className="text-[10px] text-muted-foreground font-medium">
                              Ext: +{task.approvedDeadlineChangesCount}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="text-[11px] text-muted-foreground font-medium truncate" title={task.evidenceRequired}>
                            Req: {task.evidenceRequired}
                          </div>
                          {task.evidenceSubmitted && (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold truncate" title={task.evidenceSubmitted}>
                              Ev: {task.evidenceSubmitted}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2.5 cursor-pointer"
                              onClick={() => {
                                setSelectedTask(task);
                                setTargetMemberId(task.assignedToId || "");
                                setReassignModalOpen(true);
                              }}
                            >
                              <UserCheck className="mr-1 h-3 w-3 text-muted-foreground" />
                              Reassign
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2 cursor-pointer"
                              title="Adjust Deadline"
                              onClick={() => {
                                setSelectedTask(task);
                                setNewDeadline(task.dueDate);
                                setDeadlineModalOpen(true);
                              }}
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2 cursor-pointer"
                              title="Update Priority"
                              onClick={() => {
                                setSelectedTask(task);
                                setNewPriority(task.priority);
                                setPriorityModalOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── KANBAN BOARD VIEW ──────────────────────────────────────────────── */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { key: "In Progress", label: "In Progress", color: "border-purple-300 dark:border-purple-800" },
            { key: "Submitted for Review", label: "Awaiting QA", color: "border-blue-300 dark:border-blue-800" },
            { key: "Blocked", label: "Blocked", color: "border-rose-300 dark:border-rose-800" },
            { key: "Rework Required", label: "Rework", color: "border-amber-300 dark:border-amber-800" },
            { key: "Accepted Complete", label: "Accepted", color: "border-emerald-300 dark:border-emerald-800" },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{col.label}</h3>
                  <Badge variant="outline" className="rounded-full px-2 py-0.2 text-[10px] font-semibold">
                    {colTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {colTasks.map((t) => (
                    <Card key={t.id} className="p-3 border-border bg-card shadow-xs hover:border-primary/40 transition space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.2 bg-purple-50 text-purple-900 border-purple-200 shadow-none font-medium truncate max-w-[130px]">
                          {t.clientName}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] rounded-full px-1.5 py-0.2 font-semibold shadow-none ${
                            t.priority === "Urgent" ? "bg-rose-50 text-rose-900 border-rose-300" : "bg-muted text-foreground"
                          }`}
                        >
                          {t.priority}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-foreground leading-snug">{t.title}</h4>

                      {t.blocker && (
                        <p className="text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-1.5 rounded border border-rose-200 font-medium">
                          {t.blocker}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                        <span className="font-semibold text-foreground truncate max-w-[90px]">{t.assignedToName}</span>
                        <span className={t.workingHoursLate > 0 ? "text-rose-600 font-bold" : ""}>{t.dueDate}</span>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] border-border bg-background hover:bg-muted px-2 font-semibold shadow-xs cursor-pointer"
                          onClick={() => {
                            setSelectedTask(t);
                            setTargetMemberId(t.assignedToId || "");
                            setReassignModalOpen(true);
                          }}
                        >
                          Reassign
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── WORKLOAD BY TEAM MEMBER VIEW ────────────────────────────────────── */}
      {viewMode === "team" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignedToId === member.id);
            return (
              <Card key={member.id} className="border-border shadow-xs">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">{member.name}</CardTitle>
                      <CardDescription className="text-xs font-medium">{member.role}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold rounded-full px-2 py-0.5 shadow-none ${
                        member.status === "Near Capacity"
                          ? "bg-rose-50 text-rose-900 border-rose-300"
                          : "bg-emerald-50 text-emerald-900 border-emerald-300"
                      }`}
                    >
                      {member.capacityUtilizationPct}% Capacity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase text-[10px]">
                    Assigned Deliverables ({memberTasks.length})
                  </div>
                  {memberTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-primary">{t.clientName}</span>
                        <span className="text-muted-foreground">{t.dueDate}</span>
                      </div>
                      <div className="text-xs font-bold text-foreground">{t.title}</div>
                      <div className="flex items-center justify-between pt-1">
                        <Badge variant="outline" className="text-[9px] rounded-full px-1.5 py-0.2">
                          {t.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 text-[10px] text-foreground hover:bg-muted px-1.5 font-semibold"
                          onClick={() => {
                            setSelectedTask(t);
                            setTargetMemberId(t.assignedToId || "");
                            setReassignModalOpen(true);
                          }}
                        >
                          Reassign
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── MODAL: Reassign / Assign Task ─────────────────────────────────── */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {selectedTask?.status === "Unassigned" ? "Assign Deliverable" : "Reassign Deliverable"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign this deliverable to any authorised employee across the organisation.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                <div className="font-bold text-foreground text-sm">{selectedTask.title}</div>
                <div className="text-muted-foreground">Client: {selectedTask.clientName} &bull; Due: {selectedTask.dueDate}</div>
                <div className="text-muted-foreground">Current Owner: {selectedTask.assignedToName}</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Assignee (All System Employees & Specialists)</Label>
                <Select value={targetMemberId} onValueChange={setTargetMemberId}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                    <SelectValue placeholder="Choose employee from system..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {m.role} ({m.department || "Operations"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmReassign} disabled={isSavingAssign} className="bg-primary text-white font-semibold">
              {isSavingAssign ? "Saving..." : selectedTask?.status === "Unassigned" ? "Confirm Assignment" : "Confirm Reassignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Create & Assign Task ─────────────────────────────────────── */}
      <Dialog open={createTaskModalOpen} onOpenChange={setCreateTaskModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Create & Assign Deliverable</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new operational task and assign it to any employee in the organisation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deliverable Title</Label>
              <Input
                placeholder="e.g. Meta Performance Ads Campaign Launch"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="h-9 text-xs bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client</Label>
              <Select value={createClientId} onValueChange={setCreateClientId}>
                <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assignee (All System Employees & Specialists)</Label>
              <Select value={createAssigneeId} onValueChange={setCreateAssigneeId}>
                <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                  <SelectValue placeholder="Choose employee from system (or leave unassigned)..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="">Unassigned (Open Deliverable)</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} — {m.role} ({m.department || "Operations"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Deadline</Label>
                <Input
                  type="date"
                  value={createDueDate}
                  onChange={(e) => setCreateDueDate(e.target.value)}
                  className="h-9 text-xs bg-background border-border text-foreground font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={createPriority} onValueChange={(v: any) => setCreatePriority(v)}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Required Evidence / Instructions</Label>
              <Textarea
                placeholder="Specify deliverable requirements, links, or verification checklists..."
                value={createEvidenceReq}
                onChange={(e) => setCreateEvidenceReq(e.target.value)}
                className="text-xs bg-background border-border text-foreground min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTask} disabled={isCreatingTask} className="bg-primary text-white font-semibold">
              {isCreatingTask ? "Creating..." : "Create & Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Deadline Change ─────────────────────────────────────────── */}
      <Dialog open={deadlineModalOpen} onOpenChange={setDeadlineModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Update Deliverable Deadline</DialogTitle>
            <DialogDescription className="text-xs">
              Authorise an approved deadline adjustment. All adjustments are tracked and logged in the audit trail.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Scheduled Deadline</Label>
                <Input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="h-9 text-xs bg-background border-border text-foreground font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Legitimate Operational Reason</Label>
                <Textarea
                  placeholder="e.g. Client DNS verification delay, approved scope extension..."
                  value={deadlineReason}
                  onChange={(e) => setDeadlineReason(e.target.value)}
                  className="text-xs bg-background border-border text-foreground min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeadlineModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmDeadline} disabled={isSavingDeadline} className="bg-primary text-white">
              {isSavingDeadline ? "Saving..." : "Save Deadline Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Priority Change ─────────────────────────────────────────── */}
      <Dialog open={priorityModalOpen} onOpenChange={setPriorityModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Set Task Priority</DialogTitle>
            <DialogDescription className="text-xs">
              Update task priority within department authority.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <Label className="text-xs font-semibold">Select Priority Level</Label>
            <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
              <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">Urgent (Immediate delivery impact)</SelectItem>
                <SelectItem value="High">High (Current sprint SLA)</SelectItem>
                <SelectItem value="Medium">Medium (Standard deliverable)</SelectItem>
                <SelectItem value="Low">Low (Backlog item)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPriorityModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmPriority} disabled={isSavingPriority} className="bg-primary text-white">
              {isSavingPriority ? "Updating..." : "Save Priority"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
