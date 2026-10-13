import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Users, ArrowLeft, Search, Briefcase, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/gm/capacity")({
  head: () => ({ meta: [{ title: "Capacity & Workload — GM Command Centre" }] }),
  component: CapacityWorkloadPage,
});

function useProfiles() {
  return useQuery({
    queryKey: ["gm-capacity-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("is_active", true);
      if (error) return [];
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

function useTasks() {
  return useQuery({
    queryKey: ["gm-capacity-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ops_tasks" as any).select("*");
      if (!error && data) {
        return data.map((t: any) => ({
          ...t,
          department: t.department || t.client_or_team || "General",
          assigned_to: t.owner_id || t.assigned_to,
          due_date: t.due_date || t.deadline,
          status: t.status?.toLowerCase(),
        }));
      }
      const { data: d2 } = await supabase.from("tasks" as any).select("*");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

function CapacityWorkloadPage() {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: tasks = [] } = useTasks();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const departments = [...new Set(profiles.map((p: any) => p.department).filter(Boolean))];

  const filtered = profiles.filter((p: any) => {
    const matchSearch = !search || (p.full_name || "").toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || p.department === deptFilter;
    return matchSearch && matchDept;
  });

  // Build dept capacity summary
  const deptSummary = departments.map((dept) => {
    const deptEmployees = profiles.filter((p: any) => p.department === dept);
    const deptTasks = tasks.filter((t: any) => t.department === dept && t.status !== "completed" && t.status !== "done");
    const overdueCount = deptTasks.filter((t: any) =>
      t.status === "overdue" || (t.due_date && new Date(t.due_date) < new Date())
    ).length;
    return { dept, employees: deptEmployees.length, activeTasks: deptTasks.length, overdue: overdueCount };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/gm" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Capacity & Workload</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real employee assignments, department distribution and operational capacity from the live system.
        </p>
      </div>

      {/* Department Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Total Employees</p>
          <p className="text-2xl font-bold text-foreground mt-1">{profiles.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Active workforce</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Departments</p>
          <p className="text-2xl font-bold text-foreground mt-1">{departments.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Active departments</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Active Tasks</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {tasks.filter((t: any) => t.status !== "completed" && t.status !== "done").length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Across all departments</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground">Unassigned Tasks</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {tasks.filter((t: any) => !t.assigned_to && t.status !== "completed" && t.status !== "done").length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Need allocation</p>
        </Card>
      </div>

      {/* Department Capacity Table */}
      {departments.length > 0 && (
        <Card className="p-5 border-border">
          <h3 className="text-base font-bold text-foreground mb-4">Department Capacity Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Employees</th>
                  <th className="p-2.5">Active Tasks</th>
                  <th className="p-2.5">Tasks / Employee</th>
                  <th className="p-2.5">Overdue</th>
                  <th className="p-2.5">Load Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deptSummary.map((d) => {
                  const ratio = d.employees > 0 ? (d.activeTasks / d.employees).toFixed(1) : "N/A";
                  const load = d.employees === 0 ? "No Staff" : Number(ratio) > 8 ? "Overloaded" : Number(ratio) > 5 ? "High" : "Healthy";
                  return (
                    <tr key={d.dept} className="hover:bg-muted/30">
                      <td className="p-2.5 font-bold text-foreground">{d.dept}</td>
                      <td className="p-2.5 font-medium">{d.employees}</td>
                      <td className="p-2.5">{d.activeTasks}</td>
                      <td className="p-2.5">{ratio}</td>
                      <td className="p-2.5">
                        {d.overdue > 0 ? (
                          <span className="font-bold text-rose-600">{d.overdue}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="outline" className={`text-[10px] ${
                          load === "Healthy" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : load === "High" ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : load === "Overloaded" ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {load}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Employee Directory */}
      <Card className="p-5 border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-foreground">Employee Directory ({filtered.length})</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[200px]" />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All Depts</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Job Title</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Email</th>
                <th className="p-2.5">Active Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 50).map((p: any) => {
                const empTasks = tasks.filter((t: any) => t.assigned_to === p.id && t.status !== "completed" && t.status !== "done");
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-2.5 font-bold text-foreground">{p.full_name || "—"}</td>
                    <td className="p-2.5">{p.job_title || "—"}</td>
                    <td className="p-2.5">{p.department || "Unassigned"}</td>
                    <td className="p-2.5 text-muted-foreground">{p.email || "—"}</td>
                    <td className="p-2.5">
                      {empTasks.length > 0 ? (
                        <Badge variant="outline" className="text-[10px]">{empTasks.length}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">No employees match your filters.</p>
        )}

        {/* Capacity disclaimer */}
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground">
            <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-500" />
            Capacity estimates require configured working schedules and leave records. Currently showing employee count and task distribution only.
            Contact your system administrator to enable detailed capacity calculations.
          </p>
        </div>
      </Card>
    </div>
  );
}
