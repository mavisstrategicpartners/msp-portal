import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, CheckSquare, Clock, ShieldCheck, RefreshCw,
  ArrowRight, FileText, AlertTriangle, Users, MessageSquare, Lock
} from "lucide-react";
import {
  fetchDepartmentData,
  DepartmentClientDetail,
} from "@/lib/department-manager.service";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/department/clients")({
  head: () => ({ meta: [{ title: "Client Delivery Scope — Media Buying Workspace" }] }),
  component: DepartmentClientsPage,
});

export function DepartmentClientsPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<DepartmentClientDetail[]>([]);
  const [activeClient, setActiveClient] = useState<DepartmentClientDetail | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setClients(res.clients);
    } catch (err: any) {
      toast.error("Failed to load client delivery scopes", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Media Buying Linked Client Delivery Details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorised delivery requirements, campaign scopes, client acceptance criteria, and verification checklists.
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
          Refresh Clients
        </Button>
      </div>

      {/* ── Privacy & Permission Policy Banner ──────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Delivery Access Policy:</strong> Client delivery scopes, acceptance criteria, and deadlines are visible to support campaign execution. Confidential executive contracts, corporate billing bank accounts, and personal HR records are restricted per role policy.
        </span>
      </div>

      {/* ── Client Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">{client.name}</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                    {client.industry}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 bg-purple-50 text-purple-900 border-purple-200 shadow-none"
                >
                  {client.accountStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                  Package & Retainer Scope
                </span>
                <div className="font-bold text-foreground text-xs">{client.package}</div>
                <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">{client.scopeSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Active Deliverables</span>
                  <div className="text-base font-bold text-foreground mt-0.5">{client.activeDeliverablesCount} Items</div>
                </div>
                <div className="p-2 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Open Delivery Issues</span>
                  <div className={`text-base font-bold mt-0.5 ${client.openIssuesCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {client.openIssuesCount} {client.openIssuesCount === 1 ? "Blocker" : "Blockers"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  Key Acceptance Criteria
                </span>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  {client.acceptanceCriteria.slice(0, 2).map((ac, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">&bull;</span>
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span>Account Manager: <strong className="text-foreground">{client.accountManager}</strong></span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold border-border bg-background hover:bg-muted text-foreground shadow-xs cursor-pointer mt-1"
                onClick={() => setActiveClient(client)}
              >
                View Full Authorized Scope & Criteria
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── MODAL: Client Detail Scope & Checklist ─────────────────────────── */}
      {activeClient && (
        <Dialog open={!!activeClient} onOpenChange={(open) => !open && setActiveClient(null)}>
          <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <DialogTitle>{activeClient.name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                {activeClient.industry} &bull; Package: {activeClient.package} &bull; Relationship Owner: {activeClient.accountManager}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Authorised Service Scope
                </span>
                <p className="text-foreground font-medium leading-relaxed">{activeClient.scopeSummary}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Client-Approved Requirements & Acceptance Criteria
                </span>
                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  {activeClient.acceptanceCriteria.map((crit, idx) => (
                    <div key={idx} className="p-2.5 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{crit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Required Verification Checklist
                </span>
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                  {activeClient.requiredEvidenceChecklist.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground font-medium">
                      <span className="text-primary font-bold">&check;</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Relevant Communication Notes
                </span>
                <div className="rounded-lg border border-border bg-card divide-y divide-border text-[11px] text-muted-foreground font-medium">
                  {activeClient.communicationNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setActiveClient(null)}>
                Close Scope
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
