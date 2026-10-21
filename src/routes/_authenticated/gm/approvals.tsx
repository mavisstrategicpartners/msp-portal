import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  CheckSquare, ArrowLeft, Check, X, MessageSquare, ArrowUpRight, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/gm/approvals")({
  head: () => ({ meta: [{ title: "Manager Approvals — GM Command Centre" }] }),
  component: ManagerApprovalsPage,
});

function useApprovals() {
  return useQuery({
    queryKey: ["gm-approvals-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ops_approvals" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((a: any) => ({
          ...a,
          id: a.id,
          title: a.title,
          type: a.type || "General",
          priority: a.priority || "normal",
          description: a.comments || a.description || "",
          requested_by_name: a.requester || "",
          department: a.client_or_project || a.department || "",
          status: a.status?.toLowerCase() || "pending",
          _source: "ops_approvals",
        }));
      }
      const { data: d2 } = await supabase
        .from("approval_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      return (d2 ?? []).map((a: any) => ({
        ...a,
        _source: "approval_requests",
      }));
    },
    staleTime: 15_000,
  });
}

function ManagerApprovalsPage() {
  const { data: approvals = [], isLoading } = useApprovals();
  const { data: profileData } = useProfile();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "decided">("pending");
  const [actionDialog, setActionDialog] = useState<{ item: any; action: string } | null>(null);
  const [reason, setReason] = useState("");

  const pending = approvals.filter((a: any) => a.status === "pending");
  const decided = approvals.filter((a: any) => a.status !== "pending");

  const current = tab === "pending" ? pending : decided;

  async function handleDecision(id: string, decision: string) {
    const item = approvals.find((a: any) => a.id === id);
    const table = item?._source === "ops_approvals" ? "ops_approvals" : "approval_requests";

    const updatePayload = table === "ops_approvals" ? {
      status: decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Changes Requested",
      approver: profileData?.profile?.full_name || "General Manager",
      comments: reason || undefined,
      updated_at: new Date().toISOString(),
    } : {
      status: decision,
      decided_by: profileData?.user?.id,
      decided_at: new Date().toISOString(),
      decision_reason: reason || undefined,
    };

    const { error } = await supabase.from(table as any).update(updatePayload).eq("id", id);

    if (error) {
      toast.error("Failed to record decision: " + error.message);
      return;
    }

    // Audit trail
    await supabase.from("audit_logs").insert({
      action: `approval_${decision}`,
      actor_id: profileData?.user?.id,
      target_id: id,
      details: {
        approval_id: id,
        decision,
        reason: reason || null,
        decided_by: profileData?.profile?.full_name || "General Manager",
        timestamp: new Date().toISOString(),
      },
    }).then(({ error: auditErr }) => {
      if (auditErr) console.warn("Audit log:", auditErr.message);
    });

    toast.success(`Request ${decision} successfully.`);
    setActionDialog(null);
    setReason("");
    queryClient.invalidateQueries({ queryKey: ["gm-approvals-full"] });
    queryClient.invalidateQueries({ queryKey: ["gm-approvals"] });
  }

  const noData = approvals.length === 0 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/gm" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Manager Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Decisions that fall within the General Manager's configured authority.
        </p>
      </div>

      {noData ? (
        <Card className="p-12 text-center border-border">
          <CheckSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No Approval Requests</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            There are no approval requests in the system. When team members or managers submit requests
            that require General Manager approval, they will appear here.
          </p>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className={`text-2xl font-bold mt-1 ${pending.length > 0 ? "text-amber-600" : "text-foreground"}`}>{pending.length}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {approvals.filter((a: any) => a.status === "approved").length}
              </p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {approvals.filter((a: any) => a.status === "rejected").length}
              </p>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            <button onClick={() => setTab("pending")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === "pending" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Pending ({pending.length})
            </button>
            <button onClick={() => setTab("decided")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === "decided" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Decision History ({decided.length})
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {current.map((item: any) => (
              <Card key={item.id} className="p-4 border-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{item.type || "General"}</Badge>
                      {item.priority && (
                        <Badge variant="outline" className={`text-[10px] ${
                          item.priority === "high" || item.priority === "urgent"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{item.title || item.summary || "Approval Request"}</h4>
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-muted-foreground">
                      {item.requested_by_name && <span>From: <strong>{item.requested_by_name}</strong></span>}
                      {item.department && <span>Dept: <strong>{item.department}</strong></span>}
                      {item.created_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString("en-ZA")}
                        </span>
                      )}
                    </div>
                    {item.decision_reason && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        Decision note: {item.decision_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => { setActionDialog({ item, action: "approved" }); setReason(""); }}>
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                          onClick={() => { setActionDialog({ item, action: "rejected" }); setReason(""); }}>
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]"
                          onClick={() => { setActionDialog({ item, action: "changes_requested" }); setReason(""); }}>
                          <MessageSquare className="h-3 w-3 mr-1" /> Changes
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className={`text-[10px] ${
                        item.status === "approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : item.status === "rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}>
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {current.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {tab === "pending" ? "No pending approvals — all clear." : "No decision history available."}
              </p>
            )}
          </div>
        </>
      )}

      {/* Decision Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "approved" ? "Approve Request" : actionDialog?.action === "rejected" ? "Reject Request" : "Request Changes"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.item?.title || "Approval request"}
            </DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason or comments (optional for approvals)..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={() => actionDialog && handleDecision(actionDialog.item.id, actionDialog.action)}>
              Confirm {actionDialog?.action === "approved" ? "Approval" : actionDialog?.action === "rejected" ? "Rejection" : "Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
