import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, AlertTriangle, RefreshCw, CheckCircle2,
  XCircle, ArrowRight, Building2, User, FileText, ArrowUpRight,
  ShieldCheck, Banknote
} from "lucide-react";
import {
  fetchDepartmentData,
  mutateApprovalDecision,
  DepartmentApprovalItem,
} from "@/lib/department-manager.service";
import { formatZAR } from "@/lib/currency";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/department/approvals")({
  head: () => ({ meta: [{ title: "Department Approvals — Media Buying Workspace" }] }),
  component: DepartmentApprovalsPage,
});

export function DepartmentApprovalsPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<DepartmentApprovalItem[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "decided">("pending");

  // Decision Modal
  const [selectedApproval, setSelectedApproval] = useState<DepartmentApprovalItem | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"Approved" | "Rejected" | "Changes Requested" | "Escalated">("Approved");
  const [decisionComments, setDecisionComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const managerName = profileData?.profile?.full_name || "Department Manager (Media Buying)";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setApprovals(res.approvals);
    } catch (err: any) {
      toast.error("Failed to load approvals", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingList = approvals.filter((a) => a.status === "Pending");
  const decidedList = approvals.filter((a) => a.status !== "Pending");
  const currentList = activeTab === "pending" ? pendingList : decidedList;

  function handleOpenDecision(
    item: DepartmentApprovalItem,
    type: "Approved" | "Rejected" | "Changes Requested" | "Escalated"
  ) {
    setSelectedApproval(item);
    setDecisionType(type);
    setDecisionComments(
      type === "Approved"
        ? "Approved. Budget and supporting evidence verified in platform."
        : ""
    );
    setDecisionModalOpen(true);
  }

  async function handleConfirmDecision() {
    if (!selectedApproval) return;
    if (decisionType !== "Approved" && !decisionComments.trim()) {
      toast.error("Please provide comments or a reason for this decision.");
      return;
    }

    setIsProcessing(true);
    try {
      const { updatedApprovals } = await mutateApprovalDecision(
        selectedApproval.id,
        decisionType,
        decisionComments,
        managerName
      );
      setApprovals(updatedApprovals);
      toast.success(`Request marked ${decisionType} successfully.`, {
        description: "Recorded in audit trail and updated linked task.",
      });
      setDecisionModalOpen(false);
      setSelectedApproval(null);
      setDecisionComments("");
    } catch (err: any) {
      toast.error("Failed to record decision", { description: err?.message });
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
            <CheckSquare className="h-6 w-6 text-primary" />
            Media Buying Authorised Approvals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorised queue for campaign budget sign-offs, QA deliverable acceptances, and schedule adjustments.
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
          Refresh Approvals
        </Button>
      </div>

      {/* ── Role Boundaries Alert ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Authority Enforcement:</strong> As Department Manager, you can approve department budgets under R50,000, QA sign-offs, and deadline extensions. Strategic budgets &gt; R50,000, company payroll, or cross-department staffing require GM or CEO approval.
        </span>
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
          Pending Decisions ({pendingList.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "decided" ? "default" : "outline"}
          className={`text-xs font-semibold h-8 cursor-pointer ${
            activeTab === "decided" ? "bg-primary text-white" : "border-border bg-card text-foreground"
          }`}
          onClick={() => setActiveTab("decided")}
        >
          Approval History ({decidedList.length})
        </Button>
      </div>

      {/* ── Approvals List ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <CheckSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No Requests in this Queue</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === "pending"
                ? "There are no pending requests awaiting your decision."
                : "Decisions made on budget sign-offs and deliverables will be archived here."}
            </p>
          </Card>
        ) : (
          currentList.map((item) => (
            <Card key={item.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-bold text-foreground">
                        {item.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none font-medium">
                        {item.relatedClientName}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-border bg-muted/60 text-foreground shadow-none">
                        {item.requestType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                          item.status === "Approved"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : item.status === "Rejected"
                            ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : item.status === "Pending"
                            ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                            : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          item.status === "Approved" ? "bg-emerald-500" : item.status === "Pending" ? "bg-amber-500" : item.status === "Rejected" ? "bg-rose-500" : "bg-blue-500"
                        }`} />
                        {item.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                      Requested by: {item.requesterName} ({item.requesterRole}) &bull; Date: {item.requestedDate} &bull; Decision Deadline: {item.decisionDeadline}
                    </CardDescription>
                  </div>

                  {item.status === "Pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                        onClick={() => handleOpenDecision(item, "Approved")}
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300 font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => handleOpenDecision(item, "Rejected")}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => handleOpenDecision(item, "Changes Requested")}
                      >
                        Request Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Request Details & Justification
                  </span>
                  <p className="text-foreground font-medium leading-relaxed">{item.description}</p>
                  {item.amountZAR && (
                    <div className="mt-2 text-sm font-bold text-primary flex items-center gap-1.5">
                      <Banknote className="h-4 w-4" />
                      Amount: {formatZAR(item.amountZAR)}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Attached Supporting Evidence
                  </span>
                  <p className="text-muted-foreground font-medium leading-relaxed">{item.supportingEvidence}</p>
                </div>

                {item.decisionComments && (
                  <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Decision Audit & Manager Comments
                    </span>
                    <p className="text-foreground leading-relaxed">
                      <strong>Decision by {item.decisionBy || managerName} on {item.decisionDate}:</strong> {item.decisionComments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── MODAL: Confirm Decision ────────────────────────────────────────── */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {decisionType === "Approved" ? "Approve Request" : decisionType === "Rejected" ? "Reject Request" : "Request Changes"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              This decision will be recorded in the audit trail and update the associated task and budget status.
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1">
                <div className="font-bold text-foreground text-sm">{selectedApproval.title}</div>
                <div className="text-muted-foreground">Client: {selectedApproval.relatedClientName} &bull; Type: {selectedApproval.requestType}</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Manager Comments & Rationale</Label>
                <Textarea
                  placeholder="Provide comments or conditions for this decision..."
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
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
              className={
                decisionType === "Approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  : decisionType === "Rejected"
                  ? "bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  : "bg-primary text-white font-semibold"
              }
            >
              {isProcessing ? "Recording..." : `Confirm ${decisionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
