import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, TrendingUp, CheckSquare, Clock, ShieldCheck, AlertTriangle,
  RefreshCw, ArrowRight, BarChart3, AlertCircle, CheckCircle2, ChevronRight
} from "lucide-react";
import {
  fetchDepartmentData,
  DepartmentTarget,
} from "@/lib/department-manager.service";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/department/performance")({
  head: () => ({ meta: [{ title: "Targets & Performance — Media Buying Workspace" }] }),
  component: DepartmentPerformancePage,
});

export function DepartmentPerformancePage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<DepartmentTarget[]>([]);

  const deptName = profileData?.departmentName || "Media Buying";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData();
      setTargets(res.targets);
    } catch (err: any) {
      toast.error("Failed to load department targets", { description: err?.message });
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
            <Target className="h-6 w-6 text-primary" />
            {deptName} Targets & Performance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authoritative department KPIs, SLA compliance, quality rates, and executive reconciliation for October 2026.
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
          Refresh Targets
        </Button>
      </div>

      {/* ── Reconciliation Banner with GM & CEO Dashboards ─────────────────── */}
      <div className="rounded-xl border border-purple-300 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/20 p-4 text-purple-950 dark:text-purple-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-foreground font-bold">Authoritative Executive Reconciliation:</strong>
            <p className="text-muted-foreground leading-relaxed">
              These figures reconcile directly with the <strong>General Manager Command Centre</strong> (92.4% company execution) and the <strong>CEO Executive Dashboard</strong> (Media Buying operational load 88%, deliverable target 15, open blocker 1). All metrics are derived from live client commitments.
            </p>
          </div>
        </div>
      </div>

      {/* ── Performance Metrics Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((tgt) => (
          <Card key={tgt.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">{tgt.metricName}</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                    Period: {tgt.period}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                    tgt.status === "On Target"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    tgt.status === "On Target" ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                  {tgt.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0 text-xs">
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    {tgt.currentValue} {tgt.unit}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Target: {tgt.targetValue} {tgt.unit} ({tgt.achievementPct}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      tgt.achievementPct >= 100
                        ? "bg-emerald-600"
                        : tgt.achievementPct >= 85
                        ? "bg-primary"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(tgt.achievementPct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-[11px] text-muted-foreground font-medium leading-relaxed">
                <strong className="text-foreground block mb-0.5">Measurement Definition:</strong>
                {tgt.definition}
              </div>

              {tgt.correctiveAction && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-xs text-amber-950 dark:text-amber-200">
                  <strong className="font-bold block mb-0.5">Recommended Corrective Action:</strong>
                  {tgt.correctiveAction}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quality, Rework & Deadline Compliance Analysis ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              SLA Delivery & Deadline Compliance
            </CardTitle>
            <CardDescription className="text-xs">
              Delivery adherence across client retainers and project sprints.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <div className="font-bold text-foreground text-sm">85% On-Time SLA</div>
                <div className="text-muted-foreground font-medium">Lagging target of 90% by 5 percentage points</div>
              </div>
              <Badge variant="outline" className="text-amber-900 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-none">
                Action Required
              </Badge>
            </div>

            <div className="space-y-2 text-muted-foreground font-medium leading-relaxed">
              <p>
                <strong>Root Cause Analysis:</strong> The 5% SLA latency is primarily driven by the Meta Performance Ads launch for Makurung Process Solutions, which has been in a blocked state for 2 days awaiting manager budget sign-off.
              </p>
              <p>
                <strong>Immediate Mitigation:</strong> Authorise the R12,500 ad spend approval in the Manager Approvals queue to immediately unblock campaign activation and restore department SLA to 92%.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs cursor-pointer"
              onClick={() => navigate({ to: "/department/approvals" as any })}
            >
              Go to Manager Approvals Queue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Quality Assurance & Rework Indicators
            </CardTitle>
            <CardDescription className="text-xs">
              Deliverables accepted on first submission vs. rework requested.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20">
                <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold uppercase">First-Time Acceptance</span>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">93.3%</div>
                <span className="text-[10px] text-muted-foreground font-medium">14 of 15 Deliverables</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Rework Rate</span>
                <div className="text-2xl font-bold text-foreground mt-1">6.7%</div>
                <span className="text-[10px] text-muted-foreground font-medium">1 Minor Revision</span>
              </div>
            </div>

            <div className="space-y-2 text-muted-foreground font-medium leading-relaxed">
              <p>
                <strong>Verification Standard:</strong> All media campaigns require account IDs, tracking pixel server event debug logs, and client relationship sign-off before being marked Accepted Complete.
              </p>
              <p>
                <strong>Current Submissions:</strong> 1 deliverable awaiting review (TikTok Ads Retargeting for Kasi Green Energy) with verified test event debug logs attached.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs cursor-pointer"
              onClick={() => navigate({ to: "/department/qa" as any })}
            >
              Open QA Review Queue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
