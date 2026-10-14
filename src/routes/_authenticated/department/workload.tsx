import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, CheckSquare, Clock, AlertTriangle, ShieldCheck, RefreshCw,
  ArrowRight, UserCheck, AlertCircle, Calendar
} from "lucide-react";
import {
  fetchDepartmentData,
  mutateAssignTask,
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

export const Route = createFileRoute("/_authenticated/department/workload")({
  head: () => ({ meta: [{ title: "Team Workload & Capacity — Media Buying Workspace" }] }),
  component: DepartmentWorkloadPage,
});

export function DepartmentWorkloadPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<DepartmentTeamMember[]>([]);

  // Reassignment Modal
  const [selectedTask, setSelectedTask] = useState<DepartmentTask | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const managerName = profileData?.profile?.full_name || "Department Manager (Media Buying)";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setTasks(res.tasks);
      setTeamMembers(res.teamMembers);
    } catch (err: any) {
      toast.error("Failed to load team workload", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const unassignedTasks = tasks.filter((t) => t.status === "Unassigned");

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
        description: `Allocated to ${teamMembers.find((m) => m.id === targetMemberId)?.name}`,
      });
      setReassignModalOpen(false);
      setSelectedTask(null);
    } catch (err: any) {
      toast.error("Failed to reassign task", { description: err?.message });
    } finally {
      setIsSavingAssign(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Media Buying Team Workload & Capacity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor specialist capacity utilization, rebalance unallocated tasks, and review delivery metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs cursor-pointer h-9 px-3"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Workload
        </Button>
      </div>

      {/* ── Workload Imbalance Banner ──────────────────────────────────────── */}
      {unassignedTasks.length > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-amber-950 dark:text-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-amber-950 dark:text-amber-300 font-bold">Unassigned Responsibility Detected:</strong>
                <p className="text-foreground leading-relaxed">
                  There is <strong>{unassignedTasks.length} unassigned task</strong> ({unassignedTasks[0].title}) due on {unassignedTasks[0].dueDate} for {unassignedTasks[0].clientName}. Reallocate this task to an optimal team member to prevent deadline slippage.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
              onClick={() => {
                setSelectedTask(unassignedTasks[0]);
                setTargetMemberId("mb-tm-2");
                setReassignModalOpen(true);
              }}
            >
              Allocate Task
            </Button>
          </div>
        </div>
      )}

      {/* ── Team Member Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const memberTasks = tasks.filter((t) => t.assignedToId === member.id);
          const hasBlocked = memberTasks.some((t) => t.status === "Blocked");

          return (
            <Card key={member.id} className="border-border bg-card shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">{member.name}</CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                      {member.role}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 shadow-none ${
                      member.status === "Near Capacity"
                        ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                        : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                  >
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4 text-xs">
                {/* Capacity Gauge */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-1.5">
                    <span>Capacity Load</span>
                    <strong className="text-foreground">{member.capacityUtilizationPct}%</strong>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        member.capacityUtilizationPct >= 90 ? "bg-rose-500" : "bg-primary"
                      }`}
                      style={{ width: `${member.capacityUtilizationPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {member.capacityUtilizationPct >= 90
                      ? "Operating at high peak load. Avoid assigning urgent items."
                      : "Capacity optimal for additional campaign deliverables."}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="p-2 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Active Tasks</span>
                    <div className="text-lg font-bold text-foreground mt-0.5">{memberTasks.length}</div>
                  </div>
                  <div className="p-2 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">On-Time SLA</span>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{member.onTimeDeliveryRate}%</div>
                  </div>
                </div>

                {/* Active Deliverable List */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="font-semibold text-foreground text-xs uppercase text-[10px]">
                    Current Deliverables ({memberTasks.length})
                  </div>
                  {memberTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground truncate max-w-[170px]">{t.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] rounded-full px-1.5 py-0.2 shadow-none font-semibold ${
                            t.status === "Blocked"
                              ? "bg-rose-50 text-rose-900 border-rose-300"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {t.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Client: {t.clientName}</span>
                        <span className="font-medium">Due: {t.dueDate}</span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 text-[10px] font-semibold text-primary hover:bg-muted px-1.5"
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── MODAL: Reassign Task ────────────────────────────────────────────── */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Rebalance Workload Assignment</DialogTitle>
            <DialogDescription className="text-xs">
              Select an available specialist to balance department load and meet delivery SLAs.
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
                <Label className="text-xs font-semibold">Assignee (Specialist)</Label>
                <Select value={targetMemberId} onValueChange={setTargetMemberId}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                    <SelectValue placeholder="Choose specialist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {m.role} ({m.capacityUtilizationPct}% Capacity)
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
              {isSavingAssign ? "Saving..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
