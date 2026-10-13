import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, Clock, ShieldAlert,
  Search, MessageSquare, ArrowUpRight, UserCheck, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/gm/escalations")({
  head: () => ({ meta: [{ title: "Unresolved Escalations — GM Command Centre" }] }),
  component: EscalationsPage,
});

function useEscalations() {
  return useQuery({
    queryKey: ["gm-escalations-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ops_escalations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("ops_escalations error:", error.message);
        return [];
      }
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

function EscalationsPage() {
  const { data: escalations = [], isLoading, refetch } = useEscalations();
  const { data: profileData } = useProfile();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");

  // Intervention modal state
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("In Progress");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openList = escalations.filter(
    (e: any) => e.status !== "Resolved" && e.status !== "Closed"
  );
  const resolvedList = escalations.filter(
    (e: any) => e.status === "Resolved" || e.status === "Closed"
  );

  const displayedList = (statusFilter === "open" ? openList : statusFilter === "resolved" ? resolvedList : escalations).filter(
    (e: any) => {
      const matchesSearch =
        !search ||
        (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.client_or_team || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.owner || "").toLowerCase().includes(search.toLowerCase());
      const matchesLevel =
        levelFilter === "all" || e.escalation_level === levelFilter;
      return matchesSearch && matchesLevel;
    }
  );

  async function handleUpdateEscalation() {
    if (!selectedEscalation) return;
    setIsSubmitting(true);
    try {
      const updatedActions = actionNotes
        ? selectedEscalation.actions_taken
          ? `${selectedEscalation.actions_taken}\n[GM Intervention (${new Date().toLocaleDateString("en-ZA")})]: ${actionNotes}`
          : `[GM Intervention (${new Date().toLocaleDateString("en-ZA")})]: ${actionNotes}`
        : selectedEscalation.actions_taken;

      const { error } = await supabase
        .from("ops_escalations")
        .update({
          status: newStatus,
          actions_taken: updatedActions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedEscalation.id);

      if (error) {
        toast.error("Failed to update escalation: " + error.message);
        return;
      }

      // Log GM Intervention in audit_logs
      await supabase.from("audit_logs").insert({
        action: `gm_escalation_intervention`,
        actor_id: profileData?.user?.id,
        target_id: selectedEscalation.id,
        details: {
          escalation_title: selectedEscalation.title,
          new_status: newStatus,
          notes: actionNotes,
          updated_by: profileData?.profile?.full_name || "General Manager",
        },
      });

      toast.success(`Escalation updated to "${newStatus}".`);
      setSelectedEscalation(null);
      setActionNotes("");
      queryClient.invalidateQueries({ queryKey: ["gm-escalations-all"] });
      queryClient.invalidateQueries({ queryKey: ["gm-escalations"] });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const level3Count = escalations.filter(
    (e: any) =>
      e.escalation_level?.includes("Level 3") &&
      e.status !== "Resolved" &&
      e.status !== "Closed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/gm"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Unresolved Escalations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Company-wide operational, client, and cross-department escalations requiring General Manager visibility and intervention.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Open Escalations</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              openList.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            }`}
          >
            {openList.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Pending resolution</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Level 3 (Executive)</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              level3Count > 0 ? "text-red-600 font-extrabold" : "text-foreground"
            }`}
          >
            {level3Count}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Requires GM / Executive action</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Resolved Issues</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedList.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Closed out successfully</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Total Logged</p>
          <p className="text-2xl font-bold text-foreground mt-1">{escalations.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">All recorded incidents</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search escalations, clients, owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[260px] text-xs h-9"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="all">All Escalation Levels</option>
              <option value="Level 1 (Team Lead)">Level 1 (Team Lead)</option>
              <option value="Level 2 (Operations Head)">Level 2 (Operations Head)</option>
              <option value="Level 3 (MD / Executive)">Level 3 (MD / Executive)</option>
            </select>
          </div>
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
            <button
              onClick={() => setStatusFilter("open")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                statusFilter === "open"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Open ({openList.length})
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                statusFilter === "resolved"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resolved ({resolvedList.length})
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({escalations.length})
            </button>
          </div>
        </div>
      </Card>

      {/* Escalations List */}
      {displayedList.length === 0 && !isLoading ? (
        <Card className="p-12 text-center border-border">
          <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            {statusFilter === "open" ? "No Active Escalations" : "No Escalations Found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {statusFilter === "open"
              ? "All escalations have been resolved or closed out. Any new operational blockers flagged by managers will appear here."
              : "No records match your selected search and filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedList.map((item: any) => {
            const isLevel3 = item.escalation_level?.includes("Level 3");
            const isOpen = item.status !== "Resolved" && item.status !== "Closed";

            return (
              <Card
                key={item.id}
                className={`p-5 border-border transition-colors ${
                  isLevel3 && isOpen
                    ? "border-rose-500/40 bg-rose-500/[0.02]"
                    : "hover:border-primary/30"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          isLevel3
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-semibold"
                            : item.escalation_level?.includes("Level 2")
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {item.escalation_level || "Standard Escalation"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          item.priority === "Critical" || item.priority === "High"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Priority: {item.priority || "Normal"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          item.status === "Resolved" || item.status === "Closed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : item.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        Status: {item.status || "Open"}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-foreground mb-1">
                      {item.title}
                    </h4>

                    {item.impact && (
                      <p className="text-xs text-muted-foreground mb-3 font-medium">
                        <strong className="text-foreground">Impact:</strong> {item.impact}
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
                          Client / Team
                        </span>
                        <span className="font-medium text-foreground">
                          {item.client_or_team || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
                          Raised By
                        </span>
                        <span className="font-medium text-foreground">
                          {item.raised_by || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
                          Owner
                        </span>
                        <span className="font-medium text-foreground">
                          {item.owner || "Unassigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
                          Target Date
                        </span>
                        <span className="font-medium text-foreground">
                          {item.target_resolution_date
                            ? new Date(item.target_resolution_date).toLocaleDateString("en-ZA")
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {item.actions_taken && (
                      <div className="mt-3 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground border border-border/50">
                        <p className="font-semibold text-foreground text-[11px] mb-1 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Actions Taken & Logs:
                        </p>
                        <p className="whitespace-pre-line text-[11px]">{item.actions_taken}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => {
                        setSelectedEscalation(item);
                        setNewStatus(item.status);
                        setActionNotes("");
                      }}
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      GM Intervention
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* GM Intervention Dialog */}
      <Dialog
        open={!!selectedEscalation}
        onOpenChange={() => setSelectedEscalation(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>GM Intervention & Resolution</DialogTitle>
            <DialogDescription>
              {selectedEscalation?.title} ({selectedEscalation?.client_or_team})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Resolution Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress (Under GM Review)</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                GM Directives / Actions Taken
              </label>
              <Textarea
                placeholder="Detail directives given, escalation resolution steps or actions taken..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={4}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedEscalation(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEscalation} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Intervention"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
