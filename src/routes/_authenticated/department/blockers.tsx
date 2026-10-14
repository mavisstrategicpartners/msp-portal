import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, CheckSquare, Clock, ShieldCheck, RefreshCw,
  CheckCircle2, ArrowRight, Building2, User, GitBranch, ArrowUpRight
} from "lucide-react";
import {
  fetchDepartmentData,
  mutateResolveBlocker,
  mutateEscalateBlocker,
  DepartmentTask,
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

export const Route = createFileRoute("/_authenticated/department/blockers")({
  head: () => ({ meta: [{ title: "Blockers & Dependencies — Media Buying Workspace" }] }),
  component: DepartmentBlockersPage,
});

export function DepartmentBlockersPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);

  // Modals
  const [selectedTask, setSelectedTask] = useState<DepartmentTask | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateTo, setEscalateTo] = useState<"Operations Manager" | "General Manager">("Operations Manager");
  const [escalateReason, setEscalateReason] = useState("");
  const [isEscalating, setIsEscalating] = useState(false);

  const managerName = profileData?.profile?.full_name || "Department Manager (Media Buying)";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setTasks(res.tasks);
    } catch (err: any) {
      toast.error("Failed to load blockers", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const blockedTasks = tasks.filter((t) => t.status === "Blocked");

  async function handleConfirmResolve() {
    if (!selectedTask) return;
    setIsResolving(true);
    try {
      const { updatedTasks } = await mutateResolveBlocker(
        selectedTask.id,
        resolveNotes || "Budget sign-off approved and blocker resolved by manager.",
        managerName
      );
      setTasks(updatedTasks);
      toast.success("Blocker resolved. Task moved to In Progress.");
      setResolveModalOpen(false);
      setSelectedTask(null);
      setResolveNotes("");
    } catch (err: any) {
      toast.error("Failed to resolve blocker", { description: err?.message });
    } finally {
      setIsResolving(false);
    }
  }

  async function handleConfirmEscalate() {
    if (!selectedTask) return;
    if (!escalateReason.trim()) {
      toast.error("Please provide a reason for escalation.");
      return;
    }
    setIsEscalating(true);
    try {
      await mutateEscalateBlocker(
        selectedTask.id,
        escalateTo,
        "High",
        escalateReason,
        managerName
      );
      toast.success(`Blocker escalated to ${escalateTo}.`, {
        description: "Logged in company operational escalation stream.",
      });
      setEscalateModalOpen(false);
      setSelectedTask(null);
      setEscalateReason("");
    } catch (err: any) {
      toast.error("Failed to escalate blocker", { description: err?.message });
    } finally {
      setIsEscalating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Media Buying Blockers & Dependencies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track unresolved roadblocks, cross-department dependencies, and client commitment risks.
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
          Refresh Blockers
        </Button>
      </div>

      {/* ── Blocker Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Active Blockers</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{blockedTasks.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Requires department or executive action</p>
        </Card>
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Average Duration Stalled</div>
          <div className="text-2xl font-bold text-foreground mt-1">48 Hours</div>
          <p className="text-[11px] text-muted-foreground mt-1">SLA target: resolution within 24h</p>
        </Card>
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Client Commitments Affected</div>
          <div className="text-2xl font-bold text-primary mt-1">1 Client</div>
          <p className="text-[11px] text-muted-foreground mt-1">Makurung Process Solutions (Pty) Ltd</p>
        </Card>
      </div>

      {/* ── Active Blockers Stream ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {blockedTasks.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">Zero Active Roadblocks</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              All Media Buying campaigns and deliverables are progressing without active dependency blockers.
            </p>
          </Card>
        ) : (
          blockedTasks.map((task) => (
            <Card key={task.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <CardTitle className="text-base font-bold text-foreground">
                        {task.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none font-medium">
                        {task.clientName}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-none">
                        Blocked 48h
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                      Responsible Specialist: {task.assignedToName} ({task.assignedToRole}) &bull; Scheduled Due Date: {task.dueDate}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setResolveModalOpen(true);
                      }}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Resolve Blocker
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setEscalateModalOpen(true);
                      }}
                    >
                      <ArrowUpRight className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                      Escalate to GM / Ops
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-950 dark:text-rose-300 block">
                    Detailed Reason for Blocker
                  </span>
                  <p className="text-foreground font-medium leading-relaxed">
                    {task.blocker}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                      Dependency Owner
                    </span>
                    <span className="font-bold text-foreground mt-0.5 block">{task.dependencyOwner || "Department Manager"}</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                      Client Commitment Impact
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">High &bull; Mining indaba launch deadline</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                      Required Action
                    </span>
                    <span className="font-bold text-primary mt-0.5 block">Sign off R12,500 ad spend allocation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── MODAL: Resolve Blocker ─────────────────────────────────────────── */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Resolve Campaign Blocker</DialogTitle>
            <DialogDescription className="text-xs">
              Confirming resolution moves this task back to "In Progress" and updates department performance SLA.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1">
                <div className="font-bold text-foreground text-sm">{selectedTask.title}</div>
                <div className="text-muted-foreground">Client: {selectedTask.clientName}</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Resolution Notes & Actions Taken</Label>
                <Textarea
                  placeholder="e.g. R12,500 budget signed off in ad account. Campaign live status activated."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="text-xs bg-background border-border text-foreground min-h-[90px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmResolve} disabled={isResolving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              {isResolving ? "Resolving..." : "Confirm & Unblock Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Escalate Blocker ────────────────────────────────────────── */}
      <Dialog open={escalateModalOpen} onOpenChange={setEscalateModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Escalate Blocker Outside Department</DialogTitle>
            <DialogDescription className="text-xs">
              Escalate issues that cannot be resolved within Media Buying to Operations or the General Manager.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Escalate To</Label>
                <Select value={escalateTo} onValueChange={(v: any) => setEscalateTo(v)}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations Manager">Operations & Relationship Manager (Client Scope/Contract)</SelectItem>
                    <SelectItem value="General Manager">General Manager (Cross-Department / Resource Override)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reason for Escalation & Executive Assistance Needed</Label>
                <Textarea
                  placeholder="Explain why executive intervention is required..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="text-xs bg-background border-border text-foreground min-h-[90px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmEscalate} disabled={isEscalating} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              {isEscalating ? "Escalating..." : "Submit Escalation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
