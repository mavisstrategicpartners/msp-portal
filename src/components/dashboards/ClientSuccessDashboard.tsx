import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HeartHandshake,
  Building2,
  CalendarCheck,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ClientSuccessAccount {
  id: string;
  name: string;
  accountManager: string;
  health: "Green" | "Amber" | "Red";
  satisfactionScore: number; // 1 - 10
  npsStatus: "Promoter" | "Passive" | "Detractor";
  monthlyCheckInStatus: "Completed" | "Scheduled" | "Overdue";
  checkInDate: string;
  lastFeedback: string;
  package: string;
  renewalRisk: boolean;
  recoveryPlan?: string;
}

const INITIAL_CLIENT_SUCCESS_ACCOUNTS: ClientSuccessAccount[] = [];

export function ClientSuccessDashboard() {
  const [accounts, setAccounts] = useState<ClientSuccessAccount[]>(INITIAL_CLIENT_SUCCESS_ACCOUNTS);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ClientSuccessAccount | null>(null);
  const [feedbackScore, setFeedbackScore] = useState("8");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  const handleOpenCheckIn = (account: ClientSuccessAccount) => {
    setSelectedAccount(account);
    setFeedbackScore(String(account.satisfactionScore));
    setFeedbackNotes("");
    setCheckInModalOpen(true);
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const scoreNum = Number(feedbackScore);
    const nps: "Promoter" | "Passive" | "Detractor" =
      scoreNum >= 9 ? "Promoter" : scoreNum >= 7 ? "Passive" : "Detractor";
    const newHealth: "Green" | "Amber" | "Red" =
      scoreNum >= 8 ? "Green" : scoreNum >= 6 ? "Amber" : "Red";

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount.id
          ? {
              ...acc,
              satisfactionScore: scoreNum,
              npsStatus: nps,
              health: newHealth,
              monthlyCheckInStatus: "Completed",
              lastFeedback: feedbackNotes.trim() || acc.lastFeedback,
            }
          : acc
      )
    );

    toast.success(`Check-in recorded for ${selectedAccount.name}!`, {
      description: `Health updated to ${newHealth} (Score: ${scoreNum}/10).`,
    });
    setCheckInModalOpen(false);
  };

  const healthyCount = accounts.filter((a) => a.health === "Green").length;
  const atRiskCount = accounts.filter((a) => a.health === "Red" || a.health === "Amber").length;
  const avgSatisfaction =
    accounts.length > 0
      ? (accounts.reduce((acc, a) => acc + a.satisfactionScore, 0) / accounts.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* ─── Client Success Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Client Success & Retention</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor client satisfaction scores, monthly touchpoints, and retention risk recovery.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 bg-secondary/40 border-border">
          Relationship &bull; Client Success
        </Badge>
      </div>

      {/* ─── Health & CSAT Overview ───────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Total Client Portfolio</span>
          <p className="text-2xl font-bold text-foreground mt-1">{accounts.length} Accounts</p>
          <p className="text-[11px] text-muted-foreground mt-1">100% Retainer contracts</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Average CSAT Score</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{avgSatisfaction} / 10</p>
          <p className="text-[11px] text-muted-foreground mt-1">Customer satisfaction index</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">At-Risk Clients</span>
          <p className="text-2xl font-bold text-rose-500 mt-1">{atRiskCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">1 Red &bull; 1 Amber account</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Check-ins Due This Week</span>
          <p className="text-2xl font-bold text-primary mt-1">
            {accounts.filter((a) => a.monthlyCheckInStatus === "Scheduled").length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Scheduled client review calls</p>
        </Card>
      </div>

      {/* ─── Client Accounts Health Table ─────────────────────────────────── */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Client Account Portfolio</h3>
            <p className="text-xs text-muted-foreground">
              Review monthly check-in status, record client feedback, and initiate recovery workflows.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {healthyCount} Healthy &bull; {atRiskCount} At Risk
          </Badge>
        </div>

        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No client accounts currently registered in Client Success portfolio.
            </div>
          ) : (
            accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-border bg-card space-y-3 transition hover:border-primary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{acc.name}</span>
                    <Badge
                      variant={
                        acc.health === "Red"
                          ? "destructive"
                          : acc.health === "Amber"
                          ? "default"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {acc.health} Health
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {acc.package}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Account Manager: <span className="font-semibold text-foreground">{acc.accountManager}</span> &bull; Next Call:{" "}
                    <span className="font-medium">{acc.checkInDate}</span> ({acc.monthlyCheckInStatus})
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">Satisfaction</span>
                    <p className="text-base font-bold text-foreground flex items-center justify-end gap-1">
                      {acc.satisfactionScore >= 8 ? (
                        <Smile className="h-4 w-4 text-emerald-500" />
                      ) : acc.satisfactionScore >= 6 ? (
                        <Meh className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Frown className="h-4 w-4 text-rose-500" />
                      )}
                      {acc.satisfactionScore}/10
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCheckIn(acc)}
                    className="h-8 text-xs font-semibold"
                  >
                    Log Check-In
                  </Button>
                </div>
              </div>

              {/* Feedback quote */}
              <div className="rounded-lg bg-secondary/30 border border-border/70 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Recent Feedback:</strong> &quot;{acc.lastFeedback}&quot;
                </span>
              </div>

              {/* Recovery plan if in red */}
              {acc.recoveryPlan && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <strong>Retention Recovery Action:</strong> {acc.recoveryPlan}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Log Check-in Modal ─────────────────────────────────────────────── */}
      <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Record Monthly Check-In</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Log conversation outcomes and satisfaction feedback for {selectedAccount?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCheckIn} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="csat-score" className="text-xs font-medium">
                Satisfaction Score (1 - 10) *
              </Label>
              <Input
                id="csat-score"
                type="number"
                min="1"
                max="10"
                value={feedbackScore}
                onChange={(e) => setFeedbackScore(e.target.value)}
                required
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                9-10: Promoter &bull; 7-8: Passive &bull; 1-6: Detractor (Triggers recovery plan)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkin-notes" className="text-xs font-medium">
                Client Feedback & Next Actions *
              </Label>
              <Textarea
                id="checkin-notes"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Client expressed appreciation for weekly updates; requested extra report for board..."
                required
                className="text-xs min-h-[90px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCheckInModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Save Check-In
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
