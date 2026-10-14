import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Layers, Search, Filter, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Building2, Edit, ChevronRight, User, ArrowRight,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateWorkflowStage,
  ClientWorkflowStage,
  RealClient,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/workflows")({
  head: () => ({ meta: [{ title: "Client Workflows — MSP Operations" }] }),
  component: ClientWorkflowsPage,
});

const ALL_LIFECYCLE_STAGES: ClientWorkflowStage["currentStage"][] = [
  "Intake & Qualification",
  "Agreement & Contract",
  "Active Onboarding",
  "Service Setup",
  "Ongoing Account Management",
  "Renewal Preparation",
  "Retention & Recovery",
  "Offboarding & Closure",
];

export function ClientWorkflowsPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<ClientWorkflowStage[]>([]);
  const [clients, setClients] = useState<RealClient[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Edit modal
  const [selectedWorkflow, setSelectedWorkflow] = useState<ClientWorkflowStage | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newStage, setNewStage] = useState<ClientWorkflowStage["currentStage"]>("Service Setup");
  const [newNextAction, setNewNextAction] = useState("");
  const [newNextActionDue, setNewNextActionDue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setWorkflows(data.workflows);
      setClients(data.realClients);
    } catch (e: any) {
      toast.error("Failed to load workflows", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (wf: ClientWorkflowStage) => {
    setSelectedWorkflow(wf);
    setNewStage(wf.currentStage);
    setNewNextAction(wf.nextAction);
    setNewNextActionDue(wf.nextActionDue);
    setEditModalOpen(true);
  };

  const handleSaveStage = async () => {
    if (!selectedWorkflow) return;
    setIsUpdating(true);
    try {
      const updated = await mutateWorkflowStage(
        selectedWorkflow.id,
        newStage,
        newNextAction,
        newNextActionDue
      );
      setWorkflows(updated);
      toast.success("Client workflow updated", {
        description: `Stage for ${selectedWorkflow.clientName} updated to ${newStage}.`,
      });
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to update workflow stage", { description: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const matchSearch =
      search === "" ||
      w.clientName.toLowerCase().includes(search.toLowerCase()) ||
      w.stageOwner.toLowerCase().includes(search.toLowerCase()) ||
      w.nextAction.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || w.currentStage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Client Lifecycle Workflows
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative lifecycle progression across real client accounts, milestone deliverables, and next accountable actions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Workflows
        </Button>
      </div>

      {/* Lifecycle Flow Visualization */}
      <Card className="border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Configured MSP Client Lifecycle Stages
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ALL_LIFECYCLE_STAGES.map((stg, i) => {
            const count = workflows.filter((w) => w.currentStage === stg).length;
            return (
              <div
                key={stg}
                className={`rounded-lg border p-2 text-center text-xs transition ${
                  count > 0
                    ? "border-primary/50 bg-purple-50 dark:bg-primary/20 text-purple-900 dark:text-purple-200 font-medium"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="text-[10px] text-muted-foreground font-semibold">Step {i + 1}</div>
                <div className="truncate font-medium mt-0.5 text-foreground" title={stg}>{stg}</div>
                <div className="mt-1">
                  <Badge variant="outline" className={`text-[10px] ${count > 0 ? "border-primary/40 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                    {count} active
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client, owner, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Stages</option>
            {ALL_LIFECYCLE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No client workflow records match the filter criteria.
          </Card>
        ) : (
          filteredWorkflows.map((wf) => {
            const clientMeta = clients.find((c) => c.id === wf.clientId);
            return (
              <Card key={wf.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold text-foreground">
                          {wf.clientName}
                        </CardTitle>
                        <Badge className="bg-purple-100 dark:bg-primary/20 text-purple-900 dark:text-purple-300 border-primary/30 text-[10px]">
                          {clientMeta?.active_package || "Retainer Package"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 text-muted-foreground">
                        Industry: {clientMeta?.industry || "Enterprise"} • Contact: {clientMeta?.contact_email || "Not configured"}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                          wf.status === "Pending Review"
                            ? "border-amber-300 text-amber-900 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                            : wf.status === "Blocked"
                            ? "border-rose-300 text-rose-900 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : "border-emerald-300 text-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          wf.status === "Pending Review" ? "bg-amber-500" : wf.status === "Blocked" ? "bg-rose-500" : "bg-emerald-500"
                        }`} />
                        {wf.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => handleOpenEdit(wf)}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        Update Stage
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-muted/40 p-3 rounded-lg border border-border">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current Stage</span>
                      <span className="font-semibold text-foreground text-sm">{wf.currentStage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Accountable Owner</span>
                      <span className="font-medium text-foreground">{wf.stageOwner}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Dependencies</span>
                      <span className="text-foreground/80 truncate block" title={wf.dependencies}>{wf.dependencies}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Required Evidence</span>
                      <span className="text-foreground/80 truncate block" title={wf.requiredEvidence}>{wf.requiredEvidence}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-foreground">
                        Next Action: <span className="text-purple-700 dark:text-purple-300 font-semibold">{wf.nextAction}</span>
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Target Date: <strong className="text-foreground">{wf.nextActionDue}</strong>
                      </span>
                    </div>
                    <Progress value={wf.progressPct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Stage Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-white/15 text-foreground">
          <DialogHeader>
            <DialogTitle>Update Client Workflow Stage</DialogTitle>
            <DialogDescription>
              Record an authoritative lifecycle change for {selectedWorkflow?.clientName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Target Stage</Label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as any)}
                className="w-full mt-1.5 h-9 rounded-md border border-white/10 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ALL_LIFECYCLE_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Next Required Operational Action</Label>
              <Input
                value={newNextAction}
                onChange={(e) => setNewNextAction(e.target.value)}
                placeholder="Specific action required to progress..."
                className="mt-1.5 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Next Action Target Date</Label>
              <Input
                type="date"
                value={newNextActionDue}
                onChange={(e) => setNewNextActionDue(e.target.value)}
                className="mt-1.5 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStage} disabled={isUpdating} className="bg-primary text-white">
              {isUpdating ? "Saving..." : "Save Stage Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
