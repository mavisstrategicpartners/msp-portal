import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import {
  Target, Banknote, Users, CheckSquare, GitBranch, AlertTriangle,
  TrendingUp, ArrowRight, Clock, ShieldCheck, Layers, BarChart3, Briefcase,
} from "lucide-react";
import { useProfile } from "@/lib/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/gm/")({
  head: () => ({ meta: [{ title: "GM Command Centre — Company Execution Dashboard" }] }),
  component: GmDashboardPage,
});

/* ── data hooks: real data from existing tables ─────────────────────────── */

function useProfiles() {
  return useQuery({
    queryKey: ["gm-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("is_active", true);
      if (error) { console.warn("profiles:", error.message); return []; }
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

function useTasks() {
  return useQuery({
    queryKey: ["gm-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ops_tasks" as any).select("*");
      if (!error && data) return data;
      const { data: d2 } = await supabase.from("tasks" as any).select("*");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

function useClients() {
  return useQuery({
    queryKey: ["gm-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) { console.warn("clients:", error.message); return []; }
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

function useApprovals() {
  return useQuery({
    queryKey: ["gm-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ops_approvals" as any).select("*").eq("status", "Pending");
      if (!error && data) return data;
      const { data: d2 } = await supabase.from("approval_requests" as any).select("*").eq("status", "pending");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

function useEscalations() {
  return useQuery({
    queryKey: ["gm-escalations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ops_escalations" as any).select("*").neq("status", "Resolved").neq("status", "Closed");
      if (!error && data) return data;
      const { data: d2 } = await supabase.from("escalations" as any).select("*").eq("status", "open");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

/* ── Greeting helper ───────────────────────────────────────────────────── */
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", hour: "numeric", hour12: false }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Page Component ────────────────────────────────────────────────────── */

function GmDashboardPage() {
  const { data: profileData } = useProfile();
  const { data: profiles = [] } = useProfiles();
  const { data: tasks = [] } = useTasks();
  const { data: clients = [] } = useClients();
  const { data: approvals = [] } = useApprovals();
  const { data: escalations = [] } = useEscalations();

  const name = profileData?.profile?.full_name?.trim() || "General Manager";

  // Compute real metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "completed" || t.status === "done").length;
  const overdueTasks = tasks.filter((t: any) => t.status === "overdue" || (t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "done")).length;
  const blockedTasks = tasks.filter((t: any) => t.status === "blocked").length;
  const executionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEmployees = profiles.length;
  const departments = [...new Set(profiles.map((p: any) => p.department).filter(Boolean))];

  const pendingApprovals = approvals.length;
  const openEscalations = escalations.length;
  const activeClients = clients.filter((c: any) => c.status === "active" || c.is_active).length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-foreground">Managing Director / General Manager:</span>
          <span>Company execution, revenue targets, capacity, manager approvals, cross-department dependencies and unresolved escalations.</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock className="h-3 w-3" /> Africa/Johannesburg (08:00–17:00 SAST)
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()}, <span className="brand-text">{name}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Company execution overview — real-time visibility into plans, revenue, capacity, pending approvals, cross-department blockers and escalations.
        </p>
      </div>

      {/* ── Top KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Company Execution Rate"
          value={totalTasks > 0 ? `${executionRate}%` : "No Data"}
          sub={totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks completed` : "No tasks configured yet"}
          icon={Target}
          iconColor="text-emerald-500"
          progress={executionRate}
        />
        <KpiCard
          label="Active Workforce"
          value={`${totalEmployees}`}
          sub={`${departments.length} departments`}
          icon={Users}
          iconColor="text-primary"
        />
        <KpiCard
          label="Pending Approvals"
          value={`${pendingApprovals}`}
          sub={pendingApprovals > 0 ? "Awaiting your decision" : "All clear"}
          icon={CheckSquare}
          iconColor={pendingApprovals > 0 ? "text-amber-500" : "text-emerald-500"}
        />
        <KpiCard
          label="Open Escalations"
          value={`${openEscalations}`}
          sub={openEscalations > 0 ? "Require GM intervention" : "No active escalations"}
          icon={AlertTriangle}
          iconColor={openEscalations > 0 ? "text-rose-500" : "text-emerald-500"}
        />
      </div>

      {/* ── Execution Snapshot ──────────────────────────────────────────── */}
      <Card className="p-5 border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Execution Snapshot</h3>
            <p className="text-xs text-muted-foreground">Task and deliverable progress across the company.</p>
          </div>
          <Link to="/gm/execution" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            Full View <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <MetricTile label="Total Tasks" value={totalTasks} />
          <MetricTile label="Completed" value={completedTasks} color="text-emerald-600 dark:text-emerald-400" />
          <MetricTile label="Overdue" value={overdueTasks} color={overdueTasks > 0 ? "text-rose-600 dark:text-rose-400" : undefined} />
          <MetricTile label="Blocked" value={blockedTasks} color={blockedTasks > 0 ? "text-amber-600 dark:text-amber-400" : undefined} />
        </div>
      </Card>

      {/* ── Quick Navigation Grid ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard to="/gm/execution" icon={Target} title="Company Execution" desc="Initiatives, milestones, overdue commitments and operational progress." />
        <NavCard to="/gm/revenue" icon={Banknote} title="Revenue Performance" desc="Targets, actual revenue, department performance and revenue risks." />
        <NavCard to="/gm/capacity" icon={Users} title="Capacity & Workload" desc="Real employee assignments, workload balance and operational capacity." />
        <NavCard to="/gm/approvals" icon={CheckSquare} title="Manager Approvals" desc={pendingApprovals > 0 ? `${pendingApprovals} pending decisions` : "Approval queue and decision history."} badge={pendingApprovals > 0 ? pendingApprovals : undefined} />
        <NavCard to="/gm/dependencies" icon={GitBranch} title="Cross-Dept Dependencies" desc="Blockers, dependencies and coordination actions across teams." />
        <NavCard to="/gm/escalations" icon={AlertTriangle} title="Escalations" desc={openEscalations > 0 ? `${openEscalations} unresolved issues` : "Escalation history and resolved items."} badge={openEscalations > 0 ? openEscalations : undefined} badgeColor="destructive" />
      </div>

      {/* ── Department Overview ─────────────────────────────────────────── */}
      {departments.length > 0 && (
        <Card className="p-5 border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Department Overview</h3>
              <p className="text-xs text-muted-foreground">Workforce distribution and task allocation by department.</p>
            </div>
            <Link to="/gm/capacity" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Capacity Detail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Employees</th>
                  <th className="p-2.5">Active Tasks</th>
                  <th className="p-2.5">Overdue</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departments.map((dept: string) => {
                  const deptEmployees = profiles.filter((p: any) => p.department === dept);
                  const deptTasks = tasks.filter((t: any) => t.department === dept);
                  const deptOverdue = deptTasks.filter((t: any) => t.status === "overdue" || (t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "done"));
                  const status = deptOverdue.length > 2 ? "Critical" : deptOverdue.length > 0 ? "At Risk" : "On Track";
                  return (
                    <tr key={dept} className="hover:bg-muted/30">
                      <td className="p-2.5 font-bold text-foreground">{dept}</td>
                      <td className="p-2.5 font-medium">{deptEmployees.length}</td>
                      <td className="p-2.5">{deptTasks.length}</td>
                      <td className="p-2.5">
                        {deptOverdue.length > 0 ? (
                          <span className="font-bold text-rose-600">{deptOverdue.length}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="outline" className={`text-[10px] ${
                          status === "On Track" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : status === "At Risk" ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        }`}>
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {departments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No departments configured. Employee department assignments will appear here once set up.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

/* ── Reusable Sub-components ───────────────────────────────────────────── */

function KpiCard({ label, value, sub, icon: Icon, iconColor, progress }: {
  label: string; value: string; sub: string; icon: any; iconColor: string; progress?: number;
}) {
  return (
    <Card className="p-4 border-border">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
      {typeof progress === "number" && <Progress value={progress} className="mt-2 h-1.5" />}
      <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>
    </Card>
  );
}

function MetricTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <p className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function NavCard({ to, icon: Icon, title, desc, badge, badgeColor }: {
  to: string; icon: any; title: string; desc: string; badge?: number; badgeColor?: string;
}) {
  return (
    <Link to={to as any} className="group">
      <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40 h-full">
        <div>
          <Icon className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {badge !== undefined && (
            <Badge variant={badgeColor === "destructive" ? "destructive" : "default"} className="text-[10px]">
              {badge}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </Card>
    </Link>
  );
}
