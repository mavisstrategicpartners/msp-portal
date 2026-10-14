import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck, CheckSquare, Clock, AlertTriangle, RefreshCw,
  CheckCircle2, XCircle, ArrowRight, Building2, FileText, User
} from "lucide-react";
import {
  fetchDepartmentData,
  mutateQADecision,
  DepartmentTask,
} from "@/lib/department-manager.service";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/department/qa")({
  head: () => ({ meta: [{ title: "Quality Assurance — Media Buying Workspace" }] }),
  component: DepartmentQAPage,
});

export function DepartmentQAPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "rework" | "accepted">("pending");

  // Decision Modal
  const [selectedTask, setSelectedTask] = useState<DepartmentTask | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decision, setDecision] = useState<"Accepted" | "Rework Required">("Accepted");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const managerName = profileData?.profile?.full_name || "Department Manager (Media Buying)";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setTasks(res.tasks);
    } catch (err: any) {
      toast.error("Failed to load QA queue", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingQA = tasks.filter((t) => t.status === "Submitted for Review");
  const reworkTasks = tasks.filter((t) => t.status === "Rework Required");
  const acceptedTasks = tasks.filter((t) => t.status === "Accepted Complete");

  const currentList =
    activeTab === "pending"
      ? pendingQA
      : activeTab === "rework"
      ? reworkTasks
      : acceptedTasks;

  function handleOpenDecision(task: DepartmentTask, type: "Accepted" | "Rework Required") {
    setSelectedTask(task);
    setDecision(type);
    setDecisionNotes(
      type === "Accepted"
        ? "Verified against platform account ID and live tracking debugger test events. Deliverable approved."
        : ""
    );
    setDecisionModalOpen(true);
  }

  async function handleConfirmDecision() {
    if (!selectedTask) return;
    if (decision === "Rework Required" && !decisionNotes.trim()) {
      toast.error("A clear reason for rework is required.");
      return;
    }

    setIsProcessing(true);
    try {
      const { updatedTasks } = await mutateQADecision(
        selectedTask.id,
        decision,
        decisionNotes,
        managerName
      );
      setTasks(updatedTasks);
      toast.success(
        decision === "Accepted" ? "Deliverable accepted and signed off." : "Rework requested from specialist."
      );
      setDecisionModalOpen(false);
      setSelectedTask(null);
      setDecisionNotes("");
    } catch (err: any) {
      toast.error("Failed to record QA decision", { description: err?.message });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Media Buying Quality Assurance (QA)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify deliverable evidence against client acceptance criteria. Submissions must be formally accepted or returned for rework.
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
          Refresh QA Queue
        </Button>
      </div>

      {/* ── Tab Switcher ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === "pending" ? "default" : "outline"}
          className={`text-xs font-semibold h-8 cursor-pointer ${
            activeTab === "pending" ? "bg-primary text-white" : "border-border bg-card text-foreground"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Awaiting Review ({pendingQA.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "rework" ? "default" : "outline"}
          className={`text-xs font-semibold h-8 cursor-pointer ${
            activeTab === "rework" ? "bg-primary text-white" : "border-border bg-card text-foreground"
          }`}
          onClick={() => setActiveTab("rework")}
        >
          Rework Required ({reworkTasks.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "accepted" ? "default" : "outline"}
          className={`text-xs font-semibold h-8 cursor-pointer ${
            activeTab === "accepted" ? "bg-primary text-white" : "border-border bg-card text-foreground"
          }`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Deliverables ({acceptedTasks.length})
        </Button>
      </div>

      {/* ── Deliverables List ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No Items in this QA Queue</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === "pending"
                ? "All submitted deliverables have been reviewed. New submissions from specialists will appear here."
                : activeTab === "rework"
                ? "No deliverables currently require rework from specialists."
                : "Accepted deliverables will be archived here once approved."}
            </p>
          </Card>
        ) : (
          currentList.map((task) => (
            <Card key={task.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <CardTitle className="text-base font-bold text-foreground">
                        {task.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none font-medium">
                        {task.clientName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                          task.status === "Accepted Complete"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : task.status === "Rework Required"
                            ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          task.status === "Accepted Complete" ? "bg-emerald-500" : task.status === "Rework Required" ? "bg-rose-500" : "bg-blue-500"
                        }`} />
                        {task.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                      Submitted by: {task.assignedToName} ({task.assignedToRole}) &bull; Due: {task.dueDate} &bull; Est. Hours: {task.estimatedHours}h
                    </CardDescription>
                  </div>

                  {task.status === "Submitted for Review" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                        onClick={() => handleOpenDecision(task, "Accepted")}
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Accept Deliverable
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300 font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => handleOpenDecision(task, "Rework Required")}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Request Rework
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Required Quality Criteria
                    </span>
                    <p className="text-foreground font-medium leading-relaxed">{task.evidenceRequired}</p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Specialist Submitted Evidence
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold leading-relaxed">
                      {task.evidenceSubmitted || "Evidence logs attached directly to platform record."}
                    </p>
                  </div>
                </div>

                {task.qaDecisionNotes && (
                  <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      QA Decision Audit & Comments
                    </span>
                    <p className="text-foreground leading-relaxed">
                      <strong>Reviewed by {task.qaReviewer || managerName}:</strong> {task.qaDecisionNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── MODAL: QA Decision ─────────────────────────────────────────────── */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {decision === "Accepted" ? "Accept & Sign Off Deliverable" : "Return Deliverable for Rework"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {decision === "Accepted"
                ? "Confirming acceptance marks this deliverable complete in the department and executive dashboards."
                : "Specify what criteria were missing so the specialist can rectify and resubmit."}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1">
                <div className="font-bold text-foreground text-sm">{selectedTask.title}</div>
                <div className="text-muted-foreground">Client: {selectedTask.clientName} &bull; Specialist: {selectedTask.assignedToName}</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {decision === "Accepted" ? "Approval Notes & Acceptance Confirmation" : "Mandatory Rework Reason & Instructions"}
                </Label>
                <Textarea
                  placeholder={
                    decision === "Accepted"
                      ? "e.g. Campaign verified in Ads Manager ID act_984128120. Conversion tracking firing accurately."
                      : "e.g. Server events dropped on thank-you page. Re-test CAPI payload with correct client pixel."
                  }
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="text-xs bg-background border-border text-foreground min-h-[90px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDecision}
              disabled={isProcessing}
              className={decision === "Accepted" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" : "bg-rose-600 hover:bg-rose-700 text-white font-semibold"}
            >
              {isProcessing ? "Recording..." : decision === "Accepted" ? "Accept & Complete" : "Return for Rework"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
