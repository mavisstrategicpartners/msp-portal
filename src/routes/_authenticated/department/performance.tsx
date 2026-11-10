import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/lib/use-profile";
import { useStaffEvidence, useStaffTasks } from "@/lib/staff-tasks.service";
import { taskDepartmentKey, useDepartmentOptions } from "@/lib/department-scope";

export const Route = createFileRoute("/_authenticated/department/performance")({
  head: () => ({ meta: [{ title: "Department Performance — MSP Portal" }] }),
  component: DepartmentPerformancePage,
});

const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

function DepartmentPerformancePage() {
  const { data: profile } = useProfile();
  const companyWide = Boolean(profile?.canViewCompany || profile?.isGM || profile?.isOperations);
  const { options, isLoading: deptLoading } = useDepartmentOptions(companyWide);
  const [chosen, setChosen] = useState<string | null>(null);
  const dept = options.find((o) => o.key === chosen) ?? options[0];
  const tasksQ = useStaffTasks({ all: true });
  const evidenceQ = useStaffEvidence();

  const stats = useMemo(() => {
    const t = (tasksQ.data ?? []).filter((x) => dept && taskDepartmentKey(x.department) === dept.key);
    const ids = new Set(t.map((x) => x.id));
    const ev = (evidenceQ.data ?? []).filter((e) => ids.has(e.taskId) && e.status !== "Draft");
    const d = today();
    const completed = t.filter((x) => x.status === "Completed");
    const withDue = completed.filter((x) => x.dueDate && x.completionDate);
    const onTime = withDue.filter((x) => x.completionDate!.slice(0, 10) <= x.dueDate!.slice(0, 10));
    const reviewed = ev.filter((e) => ["Approved", "Changes Requested", "Rejected"].includes(e.status));
    const people = new Map<string, { name: string; open: number; done: number; overdue: number; rework: number }>();
    for (const x of t) {
      const p = people.get(x.assignedToId) ?? { name: x.assignedToName || "Unassigned", open: 0, done: 0, overdue: 0, rework: 0 };
      if (x.status === "Completed") p.done++;
      else p.open++;
      if (x.status !== "Completed" && x.dueDate && x.dueDate.slice(0, 10) < d) p.overdue++;
      if (x.status === "Changes Requested") p.rework++;
      people.set(x.assignedToId, p);
    }
    return {
      total: t.length,
      open: t.length - completed.length,
      completed: completed.length,
      overdue: t.filter((x) => x.status !== "Completed" && x.dueDate && x.dueDate.slice(0, 10) < d).length,
      blocked: t.filter((x) => x.status === "Blocked").length,
      onTime: pct(onTime.length, withDue.length),
      onTimeBasis: withDue.length,
      approval: pct(reviewed.filter((e) => e.status === "Approved").length, reviewed.length),
      approvalBasis: reviewed.length,
      people: [...people.values()].sort((a, b) => b.overdue - a.overdue || b.open - a.open),
    };
  }, [tasksQ.data, evidenceQ.data, dept]);

  const loading = deptLoading || tasksQ.isLoading || evidenceQ.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" /> Department Performance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculated from the tasks recorded under this department and their reviewed deliverables. Nothing is estimated.
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
      ) : (
        <>
          <Card className="p-4 text-sm">
            <span className="font-semibold text-foreground">{dept.name}</span>
            <span className="text-muted-foreground">
              {" "}
              · Manager: {dept.lead ? `${dept.lead.name}${dept.lead.title ? ` (${dept.lead.title})` : ""}` : "Manager not assigned"}
            </span>
          </Card>

          {stats.total === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No tasks have been recorded for {dept.name} yet, so there is no performance to report. Figures appear here
              as soon as work is assigned to this department.
            </Card>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                <Metric label="Assigned tasks" value={String(stats.total)} />
                <Metric label="Open" value={String(stats.open)} />
                <Metric label="Overdue" value={String(stats.overdue)} bad={stats.overdue > 0} />
                <Metric label="Blocked" value={String(stats.blocked)} bad={stats.blocked > 0} />
                <Metric label="Completed on time" value={stats.onTime} hint={`of ${stats.onTimeBasis} completed with a due date`} />
                <Metric label="Approved first time" value={stats.approval} hint={`of ${stats.approvalBasis} reviewed deliverables`} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                No department targets are configured in the portal, so results are shown against assigned work and due
                dates rather than a target.
              </p>
              <Card className="overflow-x-auto p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Team member</th>
                      <th className="px-3 py-2 text-center">Open</th>
                      <th className="px-3 py-2 text-center">Overdue</th>
                      <th className="px-3 py-2 text-center">Changes requested</th>
                      <th className="px-3 py-2 text-center">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.people.map((p) => (
                      <tr key={p.name}>
                        <td className="px-3 py-2.5 font-medium text-foreground">{p.name}</td>
                        <td className="px-3 py-2.5 text-center">{p.open}</td>
                        <td className={`px-3 py-2.5 text-center ${p.overdue ? "text-rose-600 font-semibold" : ""}`}>{p.overdue}</td>
                        <td className="px-3 py-2.5 text-center">{p.rework}</td>
                        <td className="px-3 py-2.5 text-center">{p.done}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <p className="text-xs text-muted-foreground">
                Act on individual tasks in{" "}
                <Link to="/department/tasks" className="text-primary hover:underline">
                  Department Tasks
                </Link>{" "}
                and on outstanding issues in{" "}
                <Link to="/department/blockers" className="text-primary hover:underline">
                  Blockers
                </Link>
                .
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, hint, bad }: { label: string; value: string; hint?: string; bad?: boolean }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${bad ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </Card>
  );
}
