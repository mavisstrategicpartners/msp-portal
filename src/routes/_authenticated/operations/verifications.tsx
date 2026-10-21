import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardCheck, Search, Filter, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, Building2, Calendar, FileText, UserCheck, ShieldCheck,
  HelpCircle, Edit3
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateVerificationDecision,
  VerificationItem,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/verifications")({
  head: () => ({ meta: [{ title: "Verification Queue — MSP Operations" }] }),
  component: VerificationQueuePage,
});

export function VerificationQueuePage() {
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Action decision dialog
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"Verified and Accepted" | "Rejected - Rework Required" | "Additional Evidence Requested" | "Escalated">("Verified and Accepted");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setVerifications(data.verifications);
    } catch (e: any) {
      toast.error("Failed to load verification queue", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDecision = (item: VerificationItem, decision: typeof decisionType) => {
    setSelectedItem(item);
    setDecisionType(decision);
    setDecisionNotes("");
    setDecisionModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      const updated = await mutateVerificationDecision(
        selectedItem.id,
        decisionType,
        "Operations & Relationship Manager",
        decisionNotes.trim()
      );
      setVerifications(updated);
      toast.success(`Item decision: ${decisionType}`, {
        description: `${selectedItem.recordTitle} decision persisted. Audit history updated.`,
      });
      setDecisionModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to persist verification decision", { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = verifications.filter((v) => {
    const matchSearch =
      search === "" ||
      v.recordTitle.toLowerCase().includes(search.toLowerCase()) ||
      v.clientName.toLowerCase().includes(search.toLowerCase()) ||
      v.whatMustBeVerified.toLowerCase().includes(search.toLowerCase()) ||
      v.submittedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Operational Verification Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central QA validation workspace for deliverables, specifications, onboarding steps, and submissions requiring authoritative sign-off.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search record title, client, or evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background border-input text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Verified and Accepted">Verified and Accepted</option>
          <option value="Rejected - Rework Required">Rejected - Rework Required</option>
          <option value="Additional Evidence Requested">Additional Evidence Requested</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* Verification Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No items in verification queue matching filter.
          </Card>
        ) : (
          filtered.map((item) => {
            const isPending = item.currentStatus === "Pending Verification";
            const isAccepted = item.currentStatus === "Verified and Accepted";
            const isRejected = item.currentStatus === "Rejected - Rework Required";

            return (
              <Card key={item.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <CardTitle className="text-base font-bold text-foreground">
                          {item.recordTitle}
                        </CardTitle>
                        <Badge variant="outline" className="text-[11px] bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 font-medium px-2.5 py-0.5 shadow-none rounded-full">
                          {item.clientName}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-none ${
                            isAccepted
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : isPending
                              ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                              : isRejected
                              ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                              : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            isAccepted ? "bg-emerald-500" : isPending ? "bg-amber-500" : isRejected ? "bg-rose-500" : "bg-blue-500"
                          }`} />
                          {item.currentStatus}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                        Submitted by: {item.submittedBy} on {item.submittedDate} • Due: {item.dueDate} • Assigned Reviewer: {item.assignedReviewer}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                            onClick={() => handleOpenDecision(item, "Verified and Accepted")}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Verify & Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/50 font-semibold shadow-xs px-3 cursor-pointer"
                            onClick={() => handleOpenDecision(item, "Rejected - Rework Required")}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Reject & Request Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                            onClick={() => handleOpenDecision(item, "Additional Evidence Requested")}
                          >
                            <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            Request Evidence
                          </Button>
                        </>
                      )}
                      {!isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                          onClick={() => handleOpenDecision(item, "Verified and Accepted")}
                        >
                          <Edit3 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                          Update Decision
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <strong className="text-foreground block mb-1 font-semibold">What Must Be Verified:</strong>
                      <p className="text-foreground/80 leading-relaxed font-normal">{item.whatMustBeVerified}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <strong className="text-foreground block mb-1 font-semibold">Configured Verification Requirements:</strong>
                      <p className="text-foreground/80 leading-relaxed font-normal">{item.verificationRequirements}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 p-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-purple-950 dark:text-purple-200 font-bold">Evidence / Submission Link:</strong>{" "}
                      <span className="font-semibold text-foreground">{item.submissionEvidence}</span>
                    </div>
                    {item.verifiedAt && (
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Verified by {item.verifiedBy} at {new Date(item.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {item.rejectionReason && (
                    <div className="rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-3 text-rose-900 dark:text-rose-200">
                      <strong className="text-rose-900 dark:text-rose-300 font-bold">Rejection / Rework Notes:</strong> {item.rejectionReason}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Decision Dialog */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Verification Decision</DialogTitle>
            <DialogDescription>
              Record an authoritative review decision for: {selectedItem?.recordTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Decision</Label>
              <select
                value={decisionType}
                onChange={(e) => setDecisionType(e.target.value as any)}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Verified and Accepted">Verify and Accept</option>
                <option value="Rejected - Rework Required">Reject and Request Changes</option>
                <option value="Additional Evidence Requested">Request Additional Evidence</option>
                <option value="Escalated">Escalate to General Manager</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Review Findings & Detailed Notes</Label>
              <Textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Specific evidence validated or exact rework requirements..."
                className="mt-1.5 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmDecision} disabled={isProcessing} className="bg-primary text-white">
              {isProcessing ? "Recording..." : "Persist Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
