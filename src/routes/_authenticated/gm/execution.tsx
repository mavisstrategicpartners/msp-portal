import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Target, CheckSquare, Clock, AlertTriangle, ArrowLeft, Search, Filter,
  Calendar, User, ExternalLink, RefreshCw,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/gm/execution")({
  head: () => ({ meta: [{ title: "Company Execution — GM Command Centre" }] }),
  component: CompanyExecutionPage,
});

function useTasks() {
  return useQuery({
    queryKey: ["gm-tasks-execution"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ops_tasks" as any).select("*");
      if (!error && data) return data;
      const { data: d2 } = await supabase.from("tasks" as any).select("*");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

function useProfiles() {
  return useQuery({
    queryKey: ["gm-profiles-exec"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, department, job_title").eq("is_active", true);
      if (error) return [];
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

function CompanyExecutionPage() {
  const { data: rawTasks = [], isLoading: loadingTasks } = useTasks();
  const { data: profiles = [] } = useProfiles();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const tasks = rawTasks.map((t: any) => ({
    ...t,
    title: t.title || t.name || "Untitled Task",
    department: t.department || t.client_or_team || "General",
    assigned_name: t.owner_name || (t.assigned_to ? profiles.find((p: any) => p.id === t.assigned_to)?.full_name : null) || "Unassigned",
    due_date: t.due_date || t.deadline || null,
  }));

  const totalTasks = tasks.length;
  const completed = tasks.filter((t: any) => t.status === "completed" || t.status === "done" || t.status === "Completed");
  const overdue = tasks.filter((t: any) =>
    t.status === "overdue" ||
    (t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "done" && t.status !== "Completed")
  );
  const blocked = tasks.filter((t: any) => t.status === "blocked" || t.status === "Blocked");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress" || t.status === "active" || t.status === "In Progress");
  const executionRate = totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0;

  const filtered = tasks.filter((t: any) => {
    const matchSearch = !search || (t.title || t.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getName = (id: string) => profiles.find((p: any) => p.id === id)?.full_name || "Unassigned";

  if (totalTasks === 0 && !loadingTasks) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="p-12 text-center border-border">
          <Target className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No Execution Data Available</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Company initiatives, milestones and tasks have not been configured yet.
            Once tasks are created and assigned in the system, execution tracking will appear here automatically.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Execution Rate" value={`${executionRate}%`} sub={`${completed.length}/${totalTasks}`} />
        <StatCard label="In Progress" value={inProgress.length} />
        <StatCard label="Completed" value={completed.length} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Overdue" value={overdue.length} color={overdue.length > 0 ? "text-rose-600" : undefined} />
        <StatCard label="Blocked" value={blocked.length} color={blocked.length > 0 ? "text-amber-600" : undefined} />
      </div>

      {/* Filters */}
      <Card className="p-4 border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="in_progress">In Progress</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="done">Done</option>
          <option value="overdue">Overdue</option>
          <option value="blocked">Blocked</option>
          <option value="pending">Pending</option>
        </select>
      </Card>

      {/* Task Table */}
      <Card className="p-5 border-border">
        <h3 className="text-base font-bold text-foreground mb-4">
          All Tasks & Deliverables ({filtered.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5">Task</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Assigned To</th>
                <th className="p-2.5">Due Date</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 50).map((t: any) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="p-2.5 font-bold text-foreground max-w-[300px] truncate">{t.title || t.name || "Untitled"}</td>
                  <td className="p-2.5">{t.department || "—"}</td>
                  <td className="p-2.5">{t.assigned_name}</td>
                  <td className="p-2.5">{t.due_date ? new Date(t.due_date).toLocaleDateString("en-ZA") : "—"}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className={`text-[10px] ${
                      t.priority === "high" || t.priority === "urgent"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : t.priority === "medium"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {t.priority || "Normal"}
                    </Badge>
                  </td>
                  <td className="p-2.5">
                    <Badge variant="outline" className={`text-[10px] ${
                      t.status === "completed" || t.status === "done"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : t.status === "overdue"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : t.status === "blocked"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-primary/10 text-primary border-primary/30"
                    }`}>
                      {t.status || "Unknown"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No tasks match your filters.</p>
        )}
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Link to="/gm" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Company Execution</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active initiatives, milestones, overdue commitments and operational progress.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <Card className="p-4 border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}
