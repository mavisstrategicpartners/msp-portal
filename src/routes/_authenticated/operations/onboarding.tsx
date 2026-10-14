import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, Search, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Building2, CheckSquare, XCircle, AlertCircle, ArrowUpRight, MessageSquare,
  ShieldAlert, User, ExternalLink, ListChecks,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateOnboardingStep,
  ClientOnboardingRecord,
  OnboardingStep,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/onboarding")({
  head: () => ({ meta: [{ title: "Client Onboarding — MSP Operations" }] }),
  component: ClientOnboardingPage,
});

export function ClientOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [onboardingList, setOnboardingList] = useState<ClientOnboardingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Selected client for detail view modal
  const [activeClientOnb, setActiveClientOnb] = useState<ClientOnboardingRecord | null>(null);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<OnboardingStep | null>(null);
  const [stepBlockerText, setStepBlockerText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setOnboardingList(data.onboarding);
      if (activeClientOnb) {
        const refreshed = data.onboarding.find((o) => o.id === activeClientOnb.id);
        if (refreshed) setActiveClientOnb(refreshed);
      }
    } catch (e: any) {
      toast.error("Failed to load onboarding queue", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStep = async (onbId: string, step: OnboardingStep) => {
    try {
      const willComplete = !step.completed;
      const updated = await mutateOnboardingStep(onbId, step.stepKey, willComplete, null);
      setOnboardingList(updated);
      const curr = updated.find((o) => o.id === onbId);
      if (curr) setActiveClientOnb(curr);
      toast.success(willComplete ? "Step marked complete" : "Step marked incomplete", {
        description: `${step.title} has been updated.`,
      });
    } catch (err: any) {
      toast.error("Failed to update step", { description: err.message });
    }
  };

  const handleSaveStepBlocker = async () => {
    if (!activeClientOnb || !selectedStep) return;
    try {
      const updated = await mutateOnboardingStep(
        activeClientOnb.id,
        selectedStep.stepKey,
        false,
        stepBlockerText.trim() || null
      );
      setOnboardingList(updated);
      const curr = updated.find((o) => o.id === activeClientOnb.id);
      if (curr) setActiveClientOnb(curr);
      toast.success("Blocker recorded for onboarding step", {
        description: `Flagged: ${selectedStep.title}`,
      });
      setStepModalOpen(false);
    } catch (err: any) {
      toast.error("Error saving blocker", { description: err.message });
    }
  };

  const filteredOnboarding = onboardingList.filter((item) => {
    const matchSearch =
      search === "" ||
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedOwner.toLowerCase().includes(search.toLowerCase()) ||
      (item.blocker && item.blocker.toLowerCase().includes(search.toLowerCase()));
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "blockers" && !!item.blocker) ||
      (filterStatus === "overdue" && item.escalationStatus === "Overdue Blocker") ||
      (filterStatus === "completed" && item.stage === "Completed Onboarding");
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Client Onboarding Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track onboarding progression, required documents, technical integrations, and business-day age for active client accounts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Pipeline
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search onboarding clients or blockers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background border-input text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Onboarding</option>
            <option value="blockers">Has Active Blockers</option>
            <option value="overdue">Overdue Blockers</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Onboarding Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredOnboarding.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No onboarding records matching the current filter criteria.
          </Card>
        ) : (
          filteredOnboarding.map((item) => {
            const completedCount = item.steps.filter((s) => s.completed).length;
            const totalSteps = item.steps.length;
            const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
            const hasBlocker = !!item.blocker;

            return (
              <Card key={item.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold text-foreground">
                          {item.clientName}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] border-border bg-muted/60 text-foreground font-medium">
                          {item.stage}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                        Owner: {item.assignedOwner} • Started: {item.startDate} ({item.businessDaysAge} business days) • Target: {item.targetCompletionDate}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-none ${
                          item.escalationStatus === "Overdue Blocker"
                            ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          item.escalationStatus === "Overdue Blocker" ? "bg-rose-500" : "bg-emerald-500"
                        }`} />
                        {item.escalationStatus}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => setActiveClientOnb(item)}
                      >
                        <ListChecks className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        View Checklist ({completedCount}/{totalSteps})
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {hasBlocker && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-xs text-amber-950 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <strong className="text-amber-950 dark:text-amber-300 font-bold">Active Roadblock:</strong> {item.blocker}
                      </div>
                    </div>
                  )}

                  {/* Step Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {item.steps.map((st, idx) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleStep(item.id, st)}
                        className={`cursor-pointer rounded border p-2 text-[11px] transition ${
                          st.completed
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-300 font-medium"
                            : st.blocker
                            ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/20 dark:text-rose-300 font-medium"
                            : "border-border bg-muted/40 text-foreground/80 hover:border-primary/50"
                        }`}
                        title={st.blocker ? `Blocked: ${st.blocker}` : st.completed ? "Click to toggle" : "Click to mark done"}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-semibold">Step {idx + 1}</span>
                          {st.completed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : st.blocker ? (
                            <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="font-semibold truncate mt-1">{st.title}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Client Detail Checklist Dialog */}
      {activeClientOnb && (
        <Dialog open={!!activeClientOnb} onOpenChange={(open) => !open && setActiveClientOnb(null)}>
          <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <DialogTitle>{activeClientOnb.clientName} — Onboarding Requirements</DialogTitle>
              </div>
              <DialogDescription>
                Stage: {activeClientOnb.stage} • Target completion: {activeClientOnb.targetCompletionDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <p className="text-muted-foreground font-medium">
                Click any step checkmark to toggle completion once verified against physical evidence or access tokens.
              </p>

              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {activeClientOnb.steps.map((step, idx) => (
                  <div key={step.id} className="p-3 flex items-start justify-between gap-3 hover:bg-muted/40">
                    <div className="flex items-start gap-3 flex-1">
                      <Button
                        size="sm"
                        variant={step.completed ? "default" : "outline"}
                        className={`h-7 w-7 p-0 shrink-0 ${step.completed ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-border"}`}
                        onClick={() => handleToggleStep(activeClientOnb.id, step)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <div>
                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <span>{idx + 1}. {step.title}</span>
                          {step.completed && (
                            <Badge className="text-[10px] bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold">
                              Verified {step.completedDate}
                            </Badge>
                          )}
                          {step.blocker && (
                            <Badge className="text-[10px] bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 font-semibold">
                              Blocker Flagged
                            </Badge>
                          )}
                        </div>
                        {step.blocker && (
                          <p className="text-rose-900 dark:text-rose-300 text-xs mt-1 font-medium">
                            <strong className="font-bold">Reason:</strong> {step.blocker}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2.5 cursor-pointer shrink-0"
                      onClick={() => {
                        setSelectedStep(step);
                        setStepBlockerText(step.blocker || "");
                        setStepModalOpen(true);
                      }}
                    >
                      <AlertCircle className="mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />
                      Flag Blocker
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setActiveClientOnb(null)}>
                Close Checklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Flag Blocker Modal */}
      <Dialog open={stepModalOpen} onOpenChange={setStepModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Flag Step Roadblock</DialogTitle>
            <DialogDescription>
              Document outstanding blocker for: {selectedStep?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-2">
            <Label className="text-xs font-semibold">Roadblock Details / Missing Requirement</Label>
            <Input
              value={stepBlockerText}
              onChange={(e) => setStepBlockerText(e.target.value)}
              placeholder="e.g. Awaiting client delegation token for Search Console..."
              className="text-xs bg-background border-input text-foreground"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStepModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStepBlocker} className="bg-primary text-white">
              Save Blocker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
