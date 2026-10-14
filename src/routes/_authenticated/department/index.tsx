import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers, CheckSquare, Users, AlertTriangle, Clock, ShieldCheck,
  TrendingUp, ArrowRight, Building2, CheckCircle2, XCircle, RefreshCw,
  Plus, Calendar, AlertCircle, Target, FileText, ChevronRight
} from "lucide-react";
import {
  fetchDepartmentData,
  DepartmentTask,
  DepartmentApprovalItem,
  DepartmentTarget,
  DepartmentTeamMember,
} from "@/lib/department-manager.service";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/department/")({
  head: () => ({ meta: [{ title: "Department Dashboard — Media Buying Workspace" }] }),
  component: DepartmentDashboardPage,
});

export function DepartmentDashboardPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [approvals, setApprovals] = useState<DepartmentApprovalItem[]>([]);
  const [targets, setTargets] = useState<DepartmentTarget[]>([]);
  const [teamMembers, setTeamMembers] = useState<DepartmentTeamMember[]>([]);

  const deptName = profileData?.departmentName || "Media Buying";

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchDepartmentData(deptName);
      setTasks(res.tasks);
      setApprovals(res.approvals);
      setTargets(res.targets);
      setTeamMembers(res.teamMembers);
    } catch (err: any) {
      toast.error("Failed to load department telemetry", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered metrics
  const activeTasks = tasks.filter((t) => t.status !== "Accepted Complete");
  const dueTodayTasks = tasks.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.dueDate === today && t.status !== "Accepted Complete";
  });
  const overdueTasks = tasks.filter((t) => t.workingHoursLate > 0 && t.status !== "Accepted Complete");
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const awaitingQATasks = tasks.filter((t) => t.status === "Submitted for Review");
  const pendingApprovals = approvals.filter((a) => a.status === "Pending");
  const reworkTasks = tasks.filter((t) => t.status === "Rework Required");
  const unassignedTasks = tasks.filter((t) => t.status === "Unassigned");
  const commitmentRiskTasks = tasks.filter((t) => t.priority === "Urgent" || t.status === "Blocked");

  const deliverableTarget = targets.find((t) => t.id === "tgt-1");
  const targetPct = deliverableTarget?.achievementPct ?? 93.3;

  return (
    <div className="space-y-6">
      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-[#3b1d4d] via-[#4d2563] to-[#21172f] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-200">
                Department Manager Workspace
              </span>
              <Badge variant="outline" className="border-purple-300/40 text-purple-100 text-xs rounded-full px-2.5 py-0.5">
                {deptName} (Paid Ads & Acquisition)
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {deptName} Operations Command
            </h1>
            <p className="mt-1 text-sm text-purple-200/90 max-w-3xl">
              Live operational telemetry covering campaign deliverables, team capacity load, QA sign-off queues, blocker resolutions, and client media budgets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer font-semibold"
              onClick={() => navigate({ to: "/department/approvals" as any })}
            >
              <CheckSquare className="mr-2 h-3.5 w-3.5" />
              Pending Approvals ({pendingApprovals.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ── Executive Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Active Tasks */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/tasks" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Active Tasks</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{activeTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Across 3 active clients <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 2. Due Today */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/tasks" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Due Today</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{dueTodayTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              On scheduled SLA <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 3. Overdue Tasks */}
        <Card
          className="border-border hover:border-rose-500/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/tasks" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <span>Overdue Tasks</span>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Delayed by approval <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 4. Blocked Tasks */}
        <Card
          className="border-border hover:border-amber-500/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/blockers" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <span>Blocked Tasks</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{blockedTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Requires manager action <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 5. Awaiting QA */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/qa" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Awaiting QA</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">{awaitingQATasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Deliverables submitted <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 6. Approvals Awaiting Manager */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/approvals" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Pending Approvals</span>
              <CheckSquare className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{pendingApprovals.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Budget & QA decisions <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 7. Work Returned for Rework */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/qa" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Rework Required</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{reworkTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Items under revision <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 8. Department Target Achievement */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/performance" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Target Achievement</span>
              <Target className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{targetPct}%</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              14 / 15 Deliverables <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 9. Unassigned Work */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/tasks" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Unassigned Tasks</span>
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{unassignedTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Requires allocation <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* 10. Commitments at Risk */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-xs"
          onClick={() => navigate({ to: "/department/blockers" as any })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Commitments at Risk</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{commitmentRiskTasks.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Makurung & Client Alpha <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Two-Column Layout: Priority Queue & Team Capacity ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Manager Action & Priority Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    Priority Action Queue — Requires Manager Intervention
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Immediate decisions, deliverable QA reviews, and task assignments waiting on the Department Manager.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700">
                  {blockedTasks.length + awaitingQATasks.length + unassignedTasks.length} Active Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {/* 1. Critical Blocker Sign-off */}
                {blockedTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-muted/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 inline-flex items-center gap-1.5 shadow-none">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Critical Blocker
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-purple-200 bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none">
                          {task.clientName}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">Due: {task.dueDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
                      <p className="text-xs text-rose-900 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-2 rounded border border-rose-200 dark:border-rose-800 font-medium">
                        <strong>Reason:</strong> {task.blocker}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Assignee: <strong>{task.assignedToName}</strong> ({task.assignedToRole}) &bull; Late by <strong>{task.workingHoursLate}h</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                        onClick={() => navigate({ to: "/department/approvals" as any })}
                      >
                        <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                        Sign Off Budget
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => navigate({ to: "/department/blockers" as any })}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}

                {/* 2. QA Deliverables awaiting review */}
                {awaitingQATasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-muted/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-blue-300 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 inline-flex items-center gap-1.5 shadow-none">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Awaiting QA Review
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-purple-200 bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none">
                          {task.clientName}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Evidence Submitted: {task.evidenceSubmitted || "Test logs attached in platform"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Submitted by: <strong>{task.assignedToName}</strong> &bull; Target QA Due: <strong>{task.dueDate}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs font-semibold px-3 cursor-pointer"
                        onClick={() => navigate({ to: "/department/qa" as any })}
                      >
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        Review Deliverable
                      </Button>
                    </div>
                  </div>
                ))}

                {/* 3. Unassigned Work */}
                {unassignedTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-muted/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5 shadow-none">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Unallocated Task
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-medium rounded-full px-2.5 py-0.5 border-purple-200 bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 shadow-none">
                          {task.clientName}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Required deliverable for client campaign expansion. Due date: {task.dueDate}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => navigate({ to: "/department/tasks" as any })}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        Assign Team Member
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Targets Overview Strip */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    October 2026 Department Performance Reconciliation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reconciled with General Manager Command Centre and CEO Executive Health telemetry.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-border bg-background hover:bg-muted font-semibold shadow-xs px-2.5 cursor-pointer"
                  onClick={() => navigate({ to: "/department/performance" as any })}
                >
                  Full Performance Report
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {targets.slice(0, 3).map((tgt) => (
                  <div key={tgt.id} className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium truncate">{tgt.metricName}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold rounded-full px-2 py-0.2 shadow-none ${
                          tgt.status === "On Target"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {tgt.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {tgt.currentValue} {tgt.unit}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / target: {tgt.targetValue} {tgt.unit}
                      </span>
                    </div>
                    {tgt.correctiveAction && (
                      <p className="mt-2 text-[11px] text-amber-900 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200 dark:border-amber-800 font-medium leading-tight">
                        <strong>Action:</strong> {tgt.correctiveAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Team Capacity & Workload (1 col) */}
        <div className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Team Workload & Capacity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Media Buying specialists active assignments
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-border bg-background hover:bg-muted font-semibold shadow-xs px-2.5 cursor-pointer"
                  onClick={() => navigate({ to: "/department/workload" as any })}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{member.role}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold rounded-full px-2 py-0.5 shadow-none ${
                        member.status === "Near Capacity"
                          ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium mb-1">
                      <span>Capacity Utilization</span>
                      <strong className="text-foreground">{member.capacityUtilizationPct}%</strong>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          member.capacityUtilizationPct >= 90 ? "bg-rose-500" : "bg-primary"
                        }`}
                        style={{ width: `${member.capacityUtilizationPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                    <span>Active Tasks: <strong className="text-foreground">{member.activeTasksCount}</strong></span>
                    <span>On-time Delivery: <strong className="text-foreground">{member.onTimeDeliveryRate}%</strong></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Linked Client Scope Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Active Client Commitments
              </CardTitle>
              <CardDescription className="text-xs">
                Authorized scope & media campaigns under delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-foreground">Makurung Process Solutions</h5>
                  <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.2 bg-purple-50 text-purple-900 border-purple-200 shadow-none font-medium">
                    2 Active Items
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Mining plant optimisation, EPC lead generation & ROAS reporting.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-foreground">Imigidi Authentic African Events</h5>
                  <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.2 bg-purple-50 text-purple-900 border-purple-200 shadow-none font-medium">
                    2 Active Items
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Equipment hire Google Search campaigns & CAPI server tracking setup.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-foreground">Kasi Green Energy</h5>
                  <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.2 bg-purple-50 text-purple-900 border-purple-200 shadow-none font-medium">
                    1 Active Item
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  TikTok retargeting ads & solar calculator qualification.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold border-border bg-background hover:bg-muted text-foreground shadow-xs cursor-pointer mt-1"
                onClick={() => navigate({ to: "/department/clients" as any })}
              >
                View Full Authorized Client Scope
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
