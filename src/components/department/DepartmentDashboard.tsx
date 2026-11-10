/**
 * Department dashboard — one page that adapts to the department being managed.
 *
 * Shows only that department's work (the server returns tasks the caller may oversee; this page
 * narrows them to the selected department), its own employees, and a focus section suited to the
 * department's responsibilities. Departments with their own dedicated workspace (HR, Finance,
 * Sales, Operations) link to it. Every figure is counted from task records; nothing is estimated.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, ClipboardList, Loader2, Plus, RefreshCw, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskDepartmentKey, useDepartments } from "@/lib/department-scope";
import { useStaffTasks } from "@/lib/staff-tasks.service";
import type { StaffTask } from "@/lib/staff-tasks.types";
import { useProfile } from "@/lib/use-profile";

type Focus = "client" | "type";
/** What each department is responsible for, how its work is best grouped, and its dedicated workspace. */
const PROFILE: Record<string, { about: string; focus: Focus; workspace?: { to: string; label: string } }> = {
  it: { about: "IT support requests, infrastructure, software systems and technical tasks.", focus: "type" },
  marketing: { about: "Marketing campaigns and activities for MSP and its clients.", focus: "client" },
  sales: { about: "Sales tasks. Leads, prospects and the pipeline are managed in the Sales workspace.", focus: "type", workspace: { to: "/sales", label: "Sales workspace" } },
  finance: { about: "Finance and administration tasks. Invoices, expenses and budgets are in the Finance workspace.", focus: "type", workspace: { to: "/finance", label: "Finance workspace" } },
  hr: { about: "HR tasks. Employee records, attendance, leave and recruitment are in the HR workspace.", focus: "type", workspace: { to: "/hr", label: "HR workspace" } },
  operations: { about: "Operational coordination and client delivery across departments.", focus: "client", workspace: { to: "/operations", label: "Operations workspace" } },
  "client-success": { about: "Client satisfaction, communication, retention and escalations.", focus: "client" },
  strategy: { about: "Strategic initiatives, business objectives and their progress.", focus: "type" },
  creative: { about: "Design requests, creative projects, content production and approvals.", focus: "client" },
  "media-buying": { about: "Advertising campaigns, platform work and campaign optimisation for clients.", focus: "client" },
  seo: { about: "SEO projects, keyword research, website optimisation and SEO deliverables.", focus: "client" },
  "websites-software": { about: "Development projects, website maintenance, bugs, releases and technical deliverables.", focus: "client" },
  "crm-ai": { about: "CRM systems, automation workflows and integrations.", focus: "client" },
  reporting: { about: "Reporting schedules, performance reports and analytics deliverables.", focus: "client" },
  onboarding: { about: "New client onboarding, documentation, checklists and readiness.", focus: "client", workspace: { to: "/operations", label: "Client onboarding (Operations)" } },
  academy: { about: "Training programmes, learning materials, learner progress and certifications.", focus: "type" },
};

const DAY = 86_400_000;
const isOpen = (t: StaffTask) => t.status !== "Completed";
const isOverdue = (t: StaffTask) => isOpen(t) && Boolean(t.dueDate) && String(t.dueDate).slice(0, 10) < new Date().toISOString().slice(0, 10);

function Kpi({ label, value, hint, tone, to }: { label: string; value: ReactNode; hint: string; tone?: "bad" | "warn"; to: string }) {
  const color = tone === "bad" ? "text-rose-600 dark:text-rose-400" : tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-foreground";
  return (
    <Link to={to as any} className="block rounded-xl border border-border bg-card px-3.5 py-3 transition hover:border-primary/40">
      <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-xl font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  );
}

function Card({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-border bg-card ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DepartmentDashboard() {
  const profile = useProfile();
  const depts = useDepartments();
  const tasksQ = useStaffTasks({ all: true });
  const data = depts.data;

  // Departments this person may run here: the ones they manage; company-wide roles see all.
  const options = useMemo(() => {
    const all = (data?.departments ?? []).filter((d) => d.key !== "unassigned");
    if (data?.canCorrectAny || profile.data?.isCEO || profile.data?.isAdmin) return all;
    const mine = new Set(data?.me?.leads ?? []);
    return all.filter((d) => mine.has(d.key));
  }, [data, profile.data]);
  const [key, setKey] = useState<string>("");
  useEffect(() => {
    if (!key && options.length) setKey((data?.me?.leads ?? []).find((k) => options.some((o) => o.key === k)) ?? options[0].key);
  }, [options, key, data]);

  if (depts.isLoading || tasksQ.isLoading || profile.isLoading)
    return (
      <p className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your department…
      </p>
    );
  if (!options.length)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-amber-500/40 bg-amber-500/5 p-6 text-center">
        <UserCog className="mx-auto h-6 w-6 text-amber-500" />
        <p className="mt-2 text-sm font-semibold text-foreground">You are not appointed as a department manager</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Department dashboards are for appointed managers. The CEO or an administrator appoints managers on the
          Department Structure page. Your own tasks are on your home page.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/home">Go to my tasks</Link>
        </Button>
      </div>
    );

  const dept = options.find((d) => d.key === key) ?? options[0];
  const info = PROFILE[dept.key] ?? { about: "", focus: "type" as Focus };
  const tasks = (tasksQ.data ?? []).filter((t) => taskDepartmentKey(t.department) === dept.key);
  const members = (dept as any).members ?? [];
  return (
    <DepartmentView
      dept={dept}
      info={info}
      tasks={tasks}
      members={members}
      options={options}
      onSelect={setKey}
      refreshing={tasksQ.isFetching}
      onRefresh={() => {
        tasksQ.refetch();
        depts.refetch();
      }}
    />
  );
}

function DepartmentView({
  dept,
  info,
  tasks,
  members,
  options,
  onSelect,
  refreshing,
  onRefresh,
}: {
  dept: { key: string; name: string; lead: { id: string; name: string } | null };
  info: { about: string; focus: Focus; workspace?: { to: string; label: string } };
  tasks: StaffTask[];
  members: { id: string; name: string; title: string; primary: boolean }[];
  options: { key: string; name: string }[];
  onSelect: (k: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const open = tasks.filter(isOpen);
  const overdue = tasks.filter(isOverdue);
  const review = tasks.filter((t) => t.status === "Submitted for Review");
  const rework = tasks.filter((t) => t.status === "Changes Requested");
  const blocked = tasks.filter((t) => t.status === "Blocked");
  const done30 = tasks.filter((t) => t.status === "Completed" && t.completionDate && Date.now() - new Date(t.completionDate).getTime() < 30 * DAY);
  const withDue = tasks.filter((t) => t.status === "Completed" && t.dueDate && t.completionDate);
  const onTime = withDue.length
    ? Math.round((withDue.filter((t) => t.completionDate!.slice(0, 10) <= String(t.dueDate).slice(0, 10)).length / withDue.length) * 100)
    : null;

  const needsAction = [
    ...overdue.map((t) => ({ t, why: "Overdue", tone: "bad" as const })),
    ...review.filter((t) => !isOverdue(t)).map((t) => ({ t, why: "Awaiting your review", tone: "warn" as const })),
    ...blocked.filter((t) => !isOverdue(t)).map((t) => ({ t, why: "Blocked", tone: "bad" as const })),
    ...rework.filter((t) => !isOverdue(t)).map((t) => ({ t, why: "Rework in progress", tone: "warn" as const })),
  ];

  const team = members
    .map((m) => {
      const mine = tasks.filter((t) => t.assignedToId === m.id);
      return { ...m, active: mine.filter(isOpen).length, overdue: mine.filter(isOverdue).length, done: mine.filter((t) => t.status === "Completed").length };
    })
    .sort((a, b) => b.active - a.active || a.name.localeCompare(b.name));
  const maxActive = Math.max(1, ...team.map((m) => m.active));

  const groups = useMemo(() => {
    const m = new Map<string, { open: number; overdue: number; done: number }>();
    for (const t of tasks) {
      const g = info.focus === "client" ? t.clientName || "Internal work" : t.taskType || "Other";
      const e = m.get(g) ?? { open: 0, overdue: 0, done: 0 };
      if (isOpen(t)) e.open++;
      else e.done++;
      if (isOverdue(t)) e.overdue++;
      m.set(g, e);
    }
    return [...m.entries()].sort((a, b) => b[1].open - a[1].open || b[1].done - a[1].done);
  }, [tasks, info.focus]);

  const recent = tasks
    .filter((t) => t.status === "Completed" && t.completionDate)
    .sort((a, b) => String(b.completionDate).localeCompare(String(a.completionDate)))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Department dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{dept.name}</h1>
          <p className="mt-0.5 max-w-3xl text-sm text-muted-foreground">{info.about}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Manager:{" "}
            {dept.lead ? (
              <span className="text-foreground">{dept.lead.name}</span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">not appointed — the General Manager covers this department</span>
            )}{" "}
            · {members.length} employee{members.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {options.length > 1 && (
            <Select value={dept.key} onValueChange={onSelect}>
              <SelectTrigger className="h-8 w-56 text-xs" aria-label="Department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {options.map((o) => (
                  <SelectItem key={o.key} value={o.key} className="text-xs">
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={refreshing} aria-label="Refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          {info.workspace && (
            <Button asChild size="sm" variant="outline">
              <Link to={info.workspace.to as any}>{info.workspace.label}</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to="/department/tasks">
              <Plus className="mr-1 h-3.5 w-3.5" /> Assign task
            </Link>
          </Button>
        </div>
      </header>

      <section aria-label="Department indicators" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Active tasks" value={open.length} hint={`${tasks.length} recorded in total`} to="/department/tasks" />
        <Kpi label="Overdue" value={overdue.length} hint={overdue.length ? "past due and not complete" : "nothing past due"} tone={overdue.length ? "bad" : undefined} to="/department/tasks" />
        <Kpi label="Awaiting review" value={review.length} hint="submitted by your team" tone={review.length ? "warn" : undefined} to="/department/qa" />
        <Kpi label="Rework requested" value={rework.length} hint="returned for changes" to="/department/qa" />
        <Kpi label="Completed (30 days)" value={done30.length} hint="signed off in the last 30 days" to="/department/performance" />
        <Kpi
          label="On-time delivery"
          value={onTime === null ? "—" : `${onTime}%`}
          hint={onTime === null ? "no completed tasks with due dates" : `of ${withDue.length} completed with a due date`}
          to="/department/performance"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card
          title="Needs action"
          className="lg:col-span-7"
          action={
            <Link to="/department/tasks" className="text-xs font-medium text-primary hover:underline">
              All tasks <ArrowRight className="inline h-3 w-3" />
            </Link>
          }
        >
          {needsAction.length ? (
            <ul className="divide-y divide-border">
              {needsAction.slice(0, 7).map(({ t, why, tone }) => (
                <li key={t.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "bad" ? "text-rose-500" : "text-amber-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {why} · {t.assignedToName}
                      {t.dueDate ? ` · due ${String(t.dueDate).slice(0, 10)}` : ""}
                      {t.clientName ? ` · ${t.clientName}` : ""}
                    </p>
                  </div>
                  <Link
                    to={(t.status === "Submitted for Review" ? "/department/qa" : "/department/tasks") as any}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">Nothing is overdue, blocked or waiting for review.</p>
          )}
          {needsAction.length > 7 && (
            <p className="mt-2 text-[11px] text-muted-foreground">+{needsAction.length - 7} more on the task list.</p>
          )}
        </Card>

        <Card
          title={`Team (${team.length})`}
          className="lg:col-span-5"
          action={
            <Link to="/department/workload" className="text-xs font-medium text-primary hover:underline">
              Workload <ArrowRight className="inline h-3 w-3" />
            </Link>
          }
        >
          {team.length ? (
            <ul className="space-y-2">
              {team.slice(0, 8).map((m) => (
                <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_6rem_4.5rem] items-center gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {m.name}
                      {!m.primary && <span className="font-normal text-muted-foreground"> (also)</span>}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{m.title || "—"}</p>
                  </div>
                  <Progress value={(m.active / maxActive) * 100} className="h-1.5" />
                  <p className="text-right tabular-nums text-muted-foreground">
                    {m.active} active
                    {m.overdue ? <span className="block text-rose-600 dark:text-rose-400">{m.overdue} overdue</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No employees are recorded in {dept.name}. The CEO or an administrator places people on Department Structure.
            </p>
          )}
          {team.length > 8 && <p className="mt-2 text-[11px] text-muted-foreground">+{team.length - 8} more on Workload.</p>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card title={info.focus === "client" ? "Work by client" : "Work by type"} className="lg:col-span-7">
          {groups.length ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] text-muted-foreground">
                  <th className="pb-2 font-medium">{info.focus === "client" ? "Client" : "Type of work"}</th>
                  <th className="pb-2 text-right font-medium">Open</th>
                  <th className="pb-2 text-right font-medium">Overdue</th>
                  <th className="pb-2 text-right font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {groups.slice(0, 8).map(([g, v]) => (
                  <tr key={g} className="border-t border-border">
                    <td className="max-w-0 truncate py-2 text-foreground">{g}</td>
                    <td className="py-2 text-right tabular-nums">{v.open}</td>
                    <td className={`py-2 text-right tabular-nums ${v.overdue ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}>{v.overdue}</td>
                    <td className="py-2 text-right tabular-nums">{v.done}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">No work is recorded for {dept.name} yet.</p>
          )}
        </Card>

        <Card title="Recently completed" className="lg:col-span-5">
          {recent.length ? (
            <ul className="space-y-2.5">
              {recent.map((t) => (
                <li key={t.id} className="min-w-0 text-xs">
                  <p className="truncate font-medium text-foreground">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.assignedToName} · {new Date(t.completionDate!).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">Nothing completed yet.</p>
          )}
        </Card>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ClipboardList className="h-3.5 w-3.5" />
        Only {dept.name} work and employees are shown. Tasks belong to the department doing the work.
        <Users className="ml-2 h-3.5 w-3.5" /> Team = employees placed in this department on Department Structure.
      </p>
    </div>
  );
}

