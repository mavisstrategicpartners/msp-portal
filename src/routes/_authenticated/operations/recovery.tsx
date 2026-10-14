import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldAlert, Search, RefreshCw, PlusCircle, Building2, AlertTriangle,
  CheckCircle2, Clock, Calendar, UserCheck, ArrowRight, Edit, XCircle,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateRecoveryPlan,
  ClientRecoveryPlan,
  RealClient,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/recovery")({
  head: () => ({ meta: [{ title: "Client Recovery Plans — MSP Operations" }] }),
  component: ClientRecoveryPlansPage,
});

export function ClientRecoveryPlansPage() {
  const [loading, setLoading] = useState(true);
  const [recoveryPlans, setRecoveryPlans] = useState<ClientRecoveryPlan[]>([]);
  const [clients, setClients] = useState<RealClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create / Edit modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ClientRecoveryPlan | null>(null);
  const [clientId, setClientId] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [objective, setObjective] = useState("");
  const [correctiveActionsText, setCorrectiveActionsText] = useState("");
  const [responsibleOwnersText, setResponsibleOwnersText] = useState("Operations & Relationship Manager");
  const [expectations, setExpectations] = useState("");
  const [escalationPath, setEscalationPath] = useState<ClientRecoveryPlan["escalationPath"]>("General Manager");
  const [planStatus, setPlanStatus] = useState<ClientRecoveryPlan["status"]>("Active");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setRecoveryPlans(data.recoveryPlans);
      setClients(data.realClients);
      if (data.realClients.length > 0 && !clientId) {
        setClientId(data.realClients[0].id);
      }
    } catch (e: any) {
      toast.error("Failed to load recovery plans", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setReason("");
    setEvidence("");
    setObjective("");
    setCorrectiveActionsText("");
    setResponsibleOwnersText("Operations & Relationship Manager");
    setExpectations("");
    setEscalationPath("General Manager");
    setPlanStatus("Active");
    setOutcomeNotes("");
    setPlanModalOpen(true);
  };

  const handleOpenEdit = (plan: ClientRecoveryPlan) => {
    setEditingPlan(plan);
    setClientId(plan.clientId);
    setReason(plan.reasonForConcern);
    setEvidence(plan.supportingEvidence);
    setObjective(plan.recoveryObjective);
    setCorrectiveActionsText(plan.agreedCorrectiveActions.join("\n"));
    setResponsibleOwnersText(plan.responsibleOwners.join(", "));
    setExpectations(plan.clientExpectations);
    setEscalationPath(plan.escalationPath);
    setPlanStatus(plan.status);
    setOutcomeNotes(plan.outcomeNotes || "");
    setPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!reason.trim() || !objective.trim()) {
      toast.error("Please provide the reason for concern and recovery objective.");
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      toast.error("Please select a client record.");
      return;
    }

    setIsSaving(true);
    try {
      const correctiveActions = correctiveActionsText
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean);
      const responsibleOwners = responsibleOwnersText
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const planData: ClientRecoveryPlan = {
        id: editingPlan ? editingPlan.id : `rec-${client.id}-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        accountOwner: "Operations & Relationship Manager",
        reasonForConcern: reason.trim(),
        supportingEvidence: evidence.trim(),
        recoveryObjective: objective.trim(),
        agreedCorrectiveActions: correctiveActions.length > 0 ? correctiveActions : ["Conduct alignment call with client sponsor."],
        responsibleOwners: responsibleOwners.length > 0 ? responsibleOwners : ["Operations & Relationship Manager"],
        milestones: editingPlan ? editingPlan.milestones : [
          { title: "Immediate client alignment touchpoint", deadline: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], status: "Pending" },
          { title: "Execute agreed corrective deliverables", deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], status: "Pending" },
        ],
        clientExpectations: expectations.trim(),
        reviewDates: editingPlan ? editingPlan.reviewDates : [
          new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        ],
        escalationPath,
        status: planStatus,
        outcomeNotes: outcomeNotes.trim() || undefined,
        createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = await mutateRecoveryPlan(planData);
      setRecoveryPlans(updated);
      toast.success(editingPlan ? "Recovery plan updated" : "Recovery plan created", {
        description: `Plan for ${client.name} saved successfully.`,
      });
      setPlanModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to save recovery plan", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = recoveryPlans.filter((p) => {
    const matchSearch =
      search === "" ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.reasonForConcern.toLowerCase().includes(search.toLowerCase()) ||
      p.recoveryObjective.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            Client Retention & Recovery Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Formal corrective intervention workspace for client accounts with recorded concerns, delivery delays, or commitment risks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="bg-primary text-white" onClick={handleOpenCreate}>
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Create Recovery Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recovery plan or client..."
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
          <option value="all">All Plan Statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Awaiting Client">Awaiting Client</option>
          <option value="Escalated">Escalated</option>
          <option value="Successful">Successful</option>
          <option value="Unsuccessful">Unsuccessful</option>
        </select>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No active recovery plans found. Clients are only added when an actual recorded concern exists.
          </Card>
        ) : (
          filtered.map((plan) => (
            <Card key={plan.id} className="border-border bg-card shadow-sm hover:border-amber-500/40 transition">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-bold text-foreground">
                        {plan.clientName}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-none ${
                          plan.status === "Active"
                            ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                            : plan.status === "At Risk"
                            ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : plan.status === "Successful"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          plan.status === "Active" ? "bg-amber-500" : plan.status === "At Risk" ? "bg-rose-500" : plan.status === "Successful" ? "bg-emerald-500" : "bg-purple-500"
                        }`} />
                        {plan.status}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 border-border bg-muted/60 text-foreground font-medium shadow-none">
                        Escalation: {plan.escalationPath}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                      Account Owner: {plan.accountOwner} • Updated: {new Date(plan.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer shrink-0"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    Review & Update
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 text-xs">
                {/* Reason & Objective */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 p-3">
                    <strong className="text-rose-950 dark:text-rose-300 block mb-1 font-bold">Reason for Concern & Supporting Evidence:</strong>
                    <p className="text-foreground leading-relaxed">{plan.reasonForConcern}</p>
                    {plan.supportingEvidence && (
                      <p className="text-muted-foreground mt-1.5 text-[11px] font-medium">
                        <strong className="text-foreground">Evidence:</strong> {plan.supportingEvidence}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-3">
                    <strong className="text-emerald-950 dark:text-emerald-300 block mb-1 font-bold">Recovery Objective & Agreed Expectations:</strong>
                    <p className="text-foreground leading-relaxed">{plan.recoveryObjective}</p>
                    {plan.clientExpectations && (
                      <p className="text-muted-foreground mt-1.5 text-[11px] font-medium">
                        <strong className="text-foreground">Client Expectations:</strong> {plan.clientExpectations}
                      </p>
                    )}
                  </div>
                </div>

                {/* Corrective Actions */}
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <strong className="text-foreground block mb-2 font-semibold">Agreed Corrective Actions:</strong>
                  <ul className="list-disc list-inside space-y-1 text-foreground/80">
                    {plan.agreedCorrectiveActions.map((action, idx) => (
                      <li key={idx} className="text-foreground">{action}</li>
                    ))}
                  </ul>
                </div>

                {/* Milestones */}
                <div>
                  <strong className="text-foreground block mb-2 font-semibold">Recovery Milestones:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {plan.milestones.map((m, idx) => (
                      <div key={idx} className="rounded border border-border bg-card p-2.5 text-xs shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium">Milestone {idx + 1}</span>
                          <Badge variant="outline" className="text-[9px] border-border bg-muted/60 text-foreground font-medium">
                            {m.status}
                          </Badge>
                        </div>
                        <div className="font-semibold text-foreground mt-1">{m.title}</div>
                        <div className="text-purple-900 dark:text-purple-300 text-[10px] mt-1 font-semibold">Due: {m.deadline}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.outcomeNotes && (
                  <div className="rounded border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 p-2.5">
                    <strong className="text-purple-950 dark:text-purple-200 font-bold">Closure / Outcome Notes:</strong>{" "}
                    <span className="font-semibold text-foreground">{plan.outcomeNotes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Plan Dialog */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Update Recovery Plan" : "Create Client Recovery Plan"}</DialogTitle>
            <DialogDescription>
              Document formal intervention for an account requiring proactive operational retention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Client</Label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!!editingPlan}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Recorded Reason for Concern</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specific root cause for intervention..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Supporting Evidence</Label>
              <Input
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Audit logs, report remarks, or delivery blockers..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Recovery Objective</Label>
              <Input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Specific measurable goal to restore client satisfaction..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Agreed Corrective Actions (One per line)</Label>
              <Textarea
                rows={3}
                value={correctiveActionsText}
                onChange={(e) => setCorrectiveActionsText(e.target.value)}
                placeholder="Action 1&#10;Action 2&#10;Action 3"
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Awaiting Client">Awaiting Client</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Successful">Successful</option>
                  <option value="Unsuccessful">Unsuccessful</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Escalation Path</Label>
                <select
                  value={escalationPath}
                  onChange={(e) => setEscalationPath(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Executive / CEO">Executive / CEO</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Outcome / Progress Notes</Label>
              <Textarea
                rows={2}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Document latest progress or resolution summary..."
                className="mt-1.5 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSavePlan} disabled={isSaving} className="bg-primary text-white">
              {isSaving ? "Saving..." : "Save Recovery Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
