import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, ArrowLeft, Clock, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/gm/dependencies")({
  head: () => ({ meta: [{ title: "Cross-Department Dependencies — GM Command Centre" }] }),
  component: DependenciesPage,
});

function useDependencies() {
  return useQuery({
    queryKey: ["gm-dependencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dependencies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) { console.warn("dependencies:", error.message); return []; }
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

function useTasks() {
  return useQuery({
    queryKey: ["gm-deps-tasks"],
    queryFn: async () => {
      // Look for tasks with blocked status or block_reason
      const { data, error } = await supabase.from("ops_tasks" as any).select("*");
      if (!error && data) {
        return data
          .filter((t: any) => t.status?.toLowerCase() === "blocked" || !!t.block_reason)
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            department: t.client_or_team || "General",
            due_date: t.deadline,
            block_reason: t.block_reason,
          }));
      }
      const { data: d2 } = await supabase.from("tasks" as any).select("*").eq("status", "blocked");
      return d2 ?? [];
    },
    staleTime: 30_000,
  });
}

function DependenciesPage() {
  const { data: dependencies = [], isLoading: loadingDeps } = useDependencies();
  const { data: blockedTasks = [] } = useTasks();

  const openDeps = dependencies.filter((d: any) => d.status === "open" || d.status === "pending" || d.status === "blocked");
  const resolvedDeps = dependencies.filter((d: any) => d.status === "resolved" || d.status === "completed");

  const noDeps = dependencies.length === 0 && !loadingDeps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/gm" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Cross-Department Dependencies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Work requiring cooperation between departments — blockers, handoffs and coordination actions.
        </p>
      </div>

      {noDeps && blockedTasks.length === 0 ? (
        <Card className="p-12 text-center border-border">
          <GitBranch className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No Dependencies Recorded</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No cross-department dependencies have been recorded in the system.
            Dependencies are created when work in one department requires input or completion from another.
            They will appear here once explicitly created through the task management workflow.
          </p>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Open Dependencies</p>
              <p className={`text-2xl font-bold mt-1 ${openDeps.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                {openDeps.length}
              </p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedDeps.length}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-xs text-muted-foreground">Blocked Tasks</p>
              <p className={`text-2xl font-bold mt-1 ${blockedTasks.length > 0 ? "text-rose-600" : "text-foreground"}`}>
                {blockedTasks.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Tasks with 'blocked' status</p>
            </Card>
          </div>

          {/* Dependencies List */}
          {dependencies.length > 0 && (
            <Card className="p-5 border-border">
              <h3 className="text-base font-bold text-foreground mb-4">Dependency Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Waiting Dept</th>
                      <th className="p-2.5">Responsible Dept</th>
                      <th className="p-2.5">Required By</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Age</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dependencies.map((dep: any) => {
                      const age = dep.created_at ? Math.floor((Date.now() - new Date(dep.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <tr key={dep.id} className="hover:bg-muted/30">
                          <td className="p-2.5 font-bold text-foreground max-w-[300px] truncate">
                            {dep.title || dep.description || "Dependency"}
                          </td>
                          <td className="p-2.5">{dep.waiting_department || dep.from_department || "—"}</td>
                          <td className="p-2.5">{dep.responsible_department || dep.to_department || "—"}</td>
                          <td className="p-2.5">{dep.required_by ? new Date(dep.required_by).toLocaleDateString("en-ZA") : "—"}</td>
                          <td className="p-2.5">
                            <Badge variant="outline" className={`text-[10px] ${
                              dep.status === "resolved" || dep.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : dep.status === "blocked"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            }`}>
                              {dep.status || "Open"}
                            </Badge>
                          </td>
                          <td className="p-2.5 text-muted-foreground">{age}d</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Blocked Tasks */}
          {blockedTasks.length > 0 && (
            <Card className="p-5 border-border">
              <h3 className="text-base font-bold text-foreground mb-4">
                <AlertTriangle className="inline h-4 w-4 text-amber-500 mr-2" />
                Blocked Tasks ({blockedTasks.length})
              </h3>
              <div className="space-y-2">
                {blockedTasks.slice(0, 20).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.title || t.name || "Untitled"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.department || "Unknown Dept"} • {t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString("en-ZA")}` : "No due date"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/30">Blocked</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
