import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { useProfile } from "@/lib/use-profile";
import { useStaffTasks } from "@/lib/staff-tasks.service";
import { taskDepartmentKey, useDepartments } from "@/lib/department-scope";
import { UNASSIGNED_DEPARTMENT, UNASSIGNED_KEY } from "@/lib/departments";

export const Route = createFileRoute("/_authenticated/department/review")({
  head: () => ({ meta: [{ title: "Department Review — MSP Portal" }] }),
  component: DepartmentReviewPage,
});

function DepartmentReviewPage() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const deptQ = useDepartments();
  const tasksQ = useStaffTasks({ all: true });
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const departments = deptQ.data?.departments ?? [];
  const assignable = new Set(deptQ.data?.assignable ?? []);
  const canCorrectAny = Boolean(deptQ.data?.canCorrectAny);
  const readOnly = Boolean(profile?.isCEO) && !canCorrectAny;

  const tasks = useMemo(() => {
    const all = tasksQ.data ?? [];
    return showAll ? all : all.filter((t) => taskDepartmentKey(t.department) === UNASSIGNED_KEY);
  }, [tasksQ.data, showAll]);

  const unassignedCount = (tasksQ.data ?? []).filter((t) => taskDepartmentKey(t.department) === UNASSIGNED_KEY).length;
  const targets = departments.filter((d) => canCorrectAny || assignable.has(d.key));

  const saveDepartment = async (taskId: string) => {
    const department = picked[taskId];
    if (!department) return;
    setSaving(taskId);
    try {
      const res = await fetch(`/api/staff/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ department }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Could not change the department");
      toast.success(`Moved to ${department}`);
      qc.invalidateQueries({ queryKey: ["staff", "tasks"] });
      qc.invalidateQueries({ queryKey: ["executive-overview"] });
    } catch (e: any) {
      toast.error(e?.message || "Could not change the department");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Department Review
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Tasks whose responsible department could not be established from the records, and the confirmed manager of
          each department. Every change is recorded in the task's history.
        </p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks needing a department ({unassignedCount})</TabsTrigger>
          <TabsTrigger value="managers">Department managers</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {readOnly
                ? "Executive view: corrections are made by Operations, the GM, an administrator or the assigning manager."
                : "Choose the department doing the work, then save."}
            </p>
            <Button size="sm" variant="outline" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show only tasks needing review" : "Show all tasks"}
            </Button>
          </div>
          {tasksQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
            </div>
          ) : tasks.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              {showAll ? "No tasks are visible to you." : "Every task you can see has a department."}
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Task</th>
                    <th className="px-3 py-2">Assigned to</th>
                    <th className="px-3 py-2">Current department</th>
                    {!readOnly && <th className="px-3 py-2">Correct to</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((t) => {
                    const unassigned = taskDepartmentKey(t.department) === UNASSIGNED_KEY;
                    return (
                      <tr key={t.id}>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-foreground">{t.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {t.taskType}
                            {t.clientName && t.clientName !== "Internal Task" ? ` · ${t.clientName}` : ""} · {t.status}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          {t.assignedToName}
                          <span className="block text-[11px] text-muted-foreground">{t.assignedToRole}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {unassigned ? (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">
                              {UNASSIGNED_DEPARTMENT}
                            </Badge>
                          ) : (
                            t.department
                          )}
                        </td>
                        {!readOnly && (
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <Select value={picked[t.id] ?? ""} onValueChange={(v) => setPicked((p) => ({ ...p, [t.id]: v }))}>
                                <SelectTrigger className="h-8 w-52 text-xs">
                                  <SelectValue placeholder="Choose department" />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                  {targets.map((d) => (
                                    <SelectItem key={d.key} value={d.name} className="text-xs">
                                      {d.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                disabled={!picked[t.id] || picked[t.id] === t.department || saving === t.id}
                                onClick={() => saveDepartment(t.id)}
                              >
                                {saving === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="managers">
          {/* Managers are appointed in one place: Department Structure (CEO / administrators). */}
          <ManagersPanel canEdit={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManagersPanel({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const deptQ = useDepartments();
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const people = useQuery({
    queryKey: ["profiles", "active-for-leads"],
    enabled: canEdit,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, job_title, department, is_active")
        .order("full_name");
      return (data ?? []).filter((p: any) => p.is_active !== false);
    },
  });

  const save = async (key: string) => {
    const userId = choice[key] === "none" ? null : choice[key];
    setSaving(key);
    try {
      const res = await fetch(`/api/staff/departments/${encodeURIComponent(key)}/lead`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Could not save");
      toast.success(userId ? "Department manager confirmed" : "Department manager removed");
      qc.invalidateQueries({ queryKey: ["staff", "departments"] });
      qc.invalidateQueries({ queryKey: ["executive-overview"] });
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        A confirmed manager oversees their department's tasks, evidence and performance.{" "}
        Managers are appointed by the CEO or an administrator on the Department Structure page.
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {(deptQ.data?.departments ?? []).map((d) => (
          <Card key={d.key} className="p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">
                {d.lead ? (
                  <>
                    <UserCog className="inline h-3 w-3 mr-1" />
                    {d.lead.name}
                    {d.lead.title ? ` — ${d.lead.title}` : ""}
                  </>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400">Manager not assigned</span>
                )}
              </p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-1.5">
                <Select value={choice[d.key] ?? ""} onValueChange={(v) => setChoice((c) => ({ ...c, [d.key]: v }))}>
                  <SelectTrigger className="h-8 w-48 text-xs">
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="none" className="text-xs">No manager</SelectItem>
                    {(people.data ?? []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.full_name || p.email}
                        {p.job_title ? ` — ${p.job_title}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8 text-xs" disabled={!choice[d.key] || saving === d.key} onClick={() => save(d.key)}>
                  {saving === d.key ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
