import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Search, Filter, RefreshCw, PlusCircle, Building2,
  Calendar, CheckCircle2, User, Clock, ArrowUpRight, ShieldAlert,
  ShieldCheck, Edit,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateEscalation,
  OperationalEscalation,
  RealClient,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/escalations")({
  head: () => ({ meta: [{ title: "Operational Escalations — MSP Operations" }] }),
  component: OperationalEscalationsPage,
});

export function OperationalEscalationsPage() {
  const [loading, setLoading] = useState(true);
  const [escalations, setEscalations] = useState<OperationalEscalation[]>([]);
  const [clients, setClients] = useState<RealClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manage escalation modal
  const [selectedEsc, setSelectedEsc] = useState<OperationalEscalation | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newStatus, setNewStatus] = useState<OperationalEscalation["status"]>("Action Pending");
  const [newLevel, setNewLevel] = useState<OperationalEscalation["escalationLevel"]>("Level 1 (Operations Manager)");
  const [newNextAction, setNewNextAction] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New escalation modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIssueType, setNewIssueType] = useState<OperationalEscalation["issueType"]>("Cross-Department Blocker");
  const [newClientId, setNewClientId] = useState("");
  const [newPriority, setNewPriority] = useState<OperationalEscalation["priority"]>("High");
  const [newImpact, setNewImpact] = useState<OperationalEscalation["businessImpact"]>("Critical (Revenue/SLA)");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setEscalations(data.escalations);
      setClients(data.realClients);
      if (data.realClients.length > 0 && !newClientId) {
        setNewClientId(data.realClients[0].id);
      }
    } catch (e: any) {
      toast.error("Failed to load escalations", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenManage = (esc: OperationalEscalation) => {
    setSelectedEsc(esc);
    setNewOwner(esc.currentOwner);
    setNewStatus(esc.status);
    setNewLevel(esc.escalationLevel);
    setNewNextAction(esc.nextAction);
    setProgressNote("");
    setManageModalOpen(true);
  };

  const handleSaveManage = async () => {
    if (!selectedEsc) return;
    setIsSaving(true);
    try {
      const updatedNotes = progressNote.trim()
        ? [...selectedEsc.progressNotes, `${new Date().toISOString().split("T")[0]}: ${progressNote.trim()}`]
        : selectedEsc.progressNotes;

      const updatedEsc: OperationalEscalation = {
        ...selectedEsc,
        currentOwner: newOwner,
        status: newStatus,
        escalationLevel: newLevel,
        nextAction: newNextAction.trim() || selectedEsc.nextAction,
        progressNotes: updatedNotes,
      };

      const updatedList = await mutateEscalation(updatedEsc);
      setEscalations(updatedList);
      toast.success("Escalation updated", {
        description: `Escalation '${selectedEsc.title}' updated. Status: ${newStatus}`,
      });
      setManageModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to update escalation", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateEscalation = async () => {
    if (!newTitle.trim()) {
      toast.error("Please provide an escalation title.");
      return;
    }
    const client = clients.find((c) => c.id === newClientId);

    setIsSaving(true);
    try {
      const newEsc: OperationalEscalation = {
        id: `esc-${Date.now()}`,
        title: newTitle.trim(),
        issueType: newIssueType,
        relatedClientId: client?.id,
        clientOrRecord: client?.name || "Company Operations",
        raisedBy: "Operations & Relationship Manager",
        dateRaised: new Date().toISOString().split("T")[0],
        priority: newPriority,
        businessImpact: newImpact,
        currentOwner: "Operations & Relationship Manager",
        targetResolutionDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        escalationLevel: "Level 1 (Operations Manager)",
        status: "Open",
        progressNotes: [`${new Date().toISOString().split("T")[0]}: Escalation logged by Operations Manager.`],
        nextAction: "Initial investigation and stakeholder coordination.",
        createdAt: new Date().toISOString(),
      };

      const updated = await mutateEscalation(newEsc);
      setEscalations(updated);
      toast.success("Escalation created", { description: newEsc.title });
      setNewTitle("");
      setCreateModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to create escalation", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = escalations.filter((e) => {
    const matchSearch =
      search === "" ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.clientOrRecord.toLowerCase().includes(search.toLowerCase()) ||
      e.currentOwner.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.status !== "Resolved") ||
      (statusFilter === "resolved" && e.status === "Resolved") ||
      e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
            Operational Escalations & Roadblocks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track unresolved operational issues, cross-department dependencies, and multi-tier escalation paths to General Manager and CEO.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Raise Escalation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search escalations, clients, or owners..."
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
          <option value="all">All Escalations (Active & Resolved)</option>
          <option value="active">Active Unresolved Only</option>
          <option value="Action Pending">Action Pending</option>
          <option value="Investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Escalations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No escalations matching filter criteria.
          </Card>
        ) : (
          filtered.map((item) => {
            const isResolved = item.status === "Resolved";
            const isUrgent = item.priority === "Urgent";
            const isHigh = item.priority === "High";

            return (
              <Card key={item.id} className="border-border bg-card shadow-sm hover:border-rose-500/40 transition">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold text-foreground">
                          {item.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-[11px] bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 font-medium px-2.5 py-0.5 rounded-full shadow-none">
                          {item.clientOrRecord}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-none ${
                            isResolved
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : isUrgent
                              ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                              : isHigh
                              ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                              : "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            isResolved ? "bg-emerald-500" : isUrgent ? "bg-rose-500" : isHigh ? "bg-amber-500" : "bg-purple-500"
                          }`} />
                          {item.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                        Type: {item.issueType} • Priority: {item.priority} • Impact: {item.businessImpact} • Raised by {item.raisedBy} on {item.dateRaised}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 border-border bg-muted/60 text-foreground font-medium shadow-none">
                        {item.escalationLevel}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer shrink-0"
                        onClick={() => handleOpenManage(item)}
                      >
                        <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        Manage & Escalate
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Accountable Owner</span>
                      <span className="font-semibold text-foreground text-sm">{item.currentOwner}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Target Resolution</span>
                      <span className="font-semibold text-foreground text-sm">{item.targetResolutionDate}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Current Recommended Action</span>
                      <span className="text-purple-950 dark:text-purple-200 truncate block font-semibold" title={item.nextAction}>{item.nextAction}</span>
                    </div>
                  </div>

                  {item.progressNotes && item.progressNotes.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                      <strong className="text-foreground block text-[11px] mb-1 font-bold">Audit Progress Trail:</strong>
                      {item.progressNotes.map((note, idx) => (
                        <div key={idx} className="text-xs leading-relaxed text-foreground/90 font-medium">
                          • {note}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Manage / Escalate Dialog */}
      <Dialog open={manageModalOpen} onOpenChange={setManageModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Escalation & Progress</DialogTitle>
            <DialogDescription>
              {selectedEsc?.title} ({selectedEsc?.clientOrRecord})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Open">Open</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Action Pending">Action Pending</option>
                  <option value="Resolved">Resolved (Archive from Active)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Escalation Tier</Label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Level 1 (Operations Manager)">Level 1 (Operations Manager)</option>
                  <option value="Level 2 (General Manager)">Level 2 (General Manager)</option>
                  <option value="Level 3 (CEO Mavis Muchena)">Level 3 (CEO Mavis Muchena)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Assign Accountable Owner</Label>
              <Input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Next Required Action</Label>
              <Input
                value={newNextAction}
                onChange={(e) => setNewNextAction(e.target.value)}
                placeholder="Specific action required to resolve blocker..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Add Progress Note (Appends to Audit Trail)</Label>
              <Textarea
                rows={2}
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="What action was taken, who was contacted, or current resolution status..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setManageModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveManage} disabled={isSaving} className="bg-primary text-white">
              {isSaving ? "Saving..." : "Save Escalation Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Raise New Escalation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Raise Operational Escalation</DialogTitle>
            <DialogDescription>
              Document an operational blocker, delivery delay, or client commitment risk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Escalation Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Clear summary of the operational issue..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Related Client</Label>
              <select
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Issue Type</Label>
                <select
                  value={newIssueType}
                  onChange={(e) => setNewIssueType(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Overdue Onboarding">Overdue Onboarding</option>
                  <option value="Client Commitment Risk">Client Commitment Risk</option>
                  <option value="Delivery Delay">Delivery Delay</option>
                  <option value="Cross-Department Blocker">Cross-Department Blocker</option>
                  <option value="Missing Client Info">Missing Client Info</option>
                  <option value="Unresolved Complaint">Unresolved Complaint</option>
                  <option value="Failed Verification">Failed Verification</option>
                  <option value="Stalled Recovery Plan">Stalled Recovery Plan</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Priority</Label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Business Impact</Label>
              <select
                value={newImpact}
                onChange={(e) => setNewImpact(e.target.value as any)}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Critical (Revenue/SLA)">Critical (Revenue / SLA Breach)</option>
                <option value="High (Client Sentiment)">High (Client Sentiment)</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateEscalation} disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isSaving ? "Saving..." : "Raise Escalation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
