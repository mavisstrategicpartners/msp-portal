import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, GitBranch, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/lib/use-profile";
import { useStaffDependencies, useStaffTasks } from "@/lib/staff-tasks.service";
import { taskDepartmentKey, useDepartmentOptions } from "@/lib/department-scope";
import { departmentFromText } from "@/lib/departments";

export const Route = createFileRoute("/_authenticated/department/blockers")({
  head: () => ({ meta: [{ title: "Department Blockers — MSP Portal" }] }),
  component: DepartmentBlockersPage,
});

const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());

function DepartmentBlockersPage() {
  const { data: profile } = useProfile();
  const companyWide = Boolean(profile?.canViewCompany || profile?.isGM || profile?.isOperations);
  const { options, isLoading: deptLoading } = useDepartmentOptions(companyWide);
  const [chosen, setChosen] = useState<string | null>(null);
  const dept = options.find((o) => o.key === chosen) ?? options[0];
  const tasksQ = useStaffTasks({ all: true });
  const depsQ = useStaffDependencies({ all: true });

  const data = useMemo(() => {
    const d = today();
    const t = (tasksQ.data ?? []).filter((x) => dept && taskDepartmentKey(x.department) === dept.key);
    const taskIds = new Set(t.map((x) => x.id));
    return {
      blocked: t.filter((x) => x.status === "Blocked"),
      overdue: t.filter((x) => x.status !== "Completed" && x.status !== "Blocked" && x.dueDate && x.dueDate.slice(0, 10) < d),
      rework: t.filter((x) => x.status === "Changes Requested"),
      dependencies: (depsQ.data ?? []).filter(
        (dep) =>
          !["Fulfilled", "Resolved", "Closed", "Declined"].includes(String(dep.status)) &&
          (taskIds.has(dep.taskId) || departmentFromText(dep.recipientDepartment)?.key === dept?.key),
      ),
    };
  }, [tasksQ.data, depsQ.data, dept]);

  const loading = deptLoading || tasksQ.isLoading || depsQ.isLoading;
  const nothing = !data.blocked.length && !data.overdue.length && !data.rework.length && !data.dependencies.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" /> Blockers & Outstanding Issues
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Blocked, overdue and returned tasks, and open requests for help from other teams, taken from the task ledger.
          </p>
        </div>
        {options.length > 1 && (
          <Select value={dept?.key} onValueChange={setChosen}>
            <SelectTrigger className="h-9 w-64">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.key} value={o.key}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading department records…
        </div>
      ) : !dept ? (
        <Card className="p-6 text-sm text-muted-foreground">
          You are not set up as the manager of a department yet. An administrator can confirm department managers in
          Department Review → Department managers.
        </Card>
      ) : nothing ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No blocked, overdue or returned tasks and no open help requests are recorded for {dept.name}.
        </Card>
      ) : (
        <div className="space-y-6">
          <Section icon={<AlertTriangle className="h-4 w-4 text-rose-500" />} title="Blocked" items={data.blocked} render={(x) => x.blockReason || "No reason recorded"} />
          <Section icon={<Clock className="h-4 w-4 text-amber-500" />} title="Overdue" items={data.overdue} render={(x) => `Due ${x.dueDate?.slice(0, 10)} · ${x.status}`} />
          <Section icon={<RotateCcw className="h-4 w-4 text-amber-500" />} title="Changes requested" items={data.rework} render={(x) => x.qaDecisionNotes || "Returned by the reviewer"} />
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <GitBranch className="h-4 w-4 text-sky-500" /> Open help requests ({data.dependencies.length})
            </p>
            {data.dependencies.length ? (
              data.dependencies.map((dep) => (
                <Card key={dep.id} className="p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground">{dep.blockerDescription}</span>
                    <Badge variant="outline" className="text-[10px]">{dep.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    From {dep.requesterName} to {dep.recipientName || dep.recipientDepartment} · {dep.urgency} urgency ·{" "}
                    {dep.createdAt?.slice(0, 10)}
                  </p>
                </Card>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">None open.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Update or reassign these tasks in{" "}
            <Link to="/department/tasks" className="text-primary hover:underline">
              Department Tasks
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  render,
}: {
  icon: ReactNode;
  title: string;
  items: any[];
  render: (x: any) => string;
}) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title} ({items.length})
      </p>
      {items.length ? (
        items.map((x) => (
          <Card key={x.id} className="p-3 text-xs">
            <p className="font-semibold text-foreground">{x.title}</p>
            <p className="text-muted-foreground mt-0.5">
              {x.assignedToName}
              {x.clientName && x.clientName !== "Internal Task" ? ` · ${x.clientName}` : ""} · {render(x)}
            </p>
          </Card>
        ))
      ) : (
        <p className="text-xs text-muted-foreground">None.</p>
      )}
    </div>
  );
}
