import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Empty,
  ExecHeader,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  SectionTitle,
  StatusPill,
  pct,
  zar,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/performance")({
  head: () => ({ meta: [{ title: "Company Performance — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <PerformancePage data={data} />}</OverviewGate>,
});

function PerformancePage({ data }: { data: ExecutiveOverview }) {
  const b = data.business;
  const active = data.departments.filter((d) => d.status !== "no-activity");
  const totals = data.tasks.length;
  const completed = data.tasks.filter((t) => t.status === "Completed").length;
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Company Performance"
        subtitle="How the business and each department are performing, side by side."
        source="the task ledger, evidence reviews, clients and onboarding, the Sales ledger and the Finance module"
        data={data}
      />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Work completed" value={totals ? pct(Math.round((completed / totals) * 100)) : "—"} hint={`${completed} of ${totals} tasks`} />
        <Kpi label="Overdue work" value={b.overdueTasks} tone={b.overdueTasks ? "bad" : "good"} to="/ceo/delivery" search={{ filter: "overdue" }} />
        <Kpi label="Clients" value={b.activeClients} hint={`${b.clientsAddedLast30} new in 30 days`} to="/ceo/clients" />
        <Kpi label="Onboarding past target" value={b.onboardingDelayed} tone={b.onboardingDelayed ? "bad" : "good"} to="/ceo/clients" />
        <Kpi label="Sales leads" value={data.sales.recorded ? data.sales.leads : "None recorded"} to="/ceo/sales" />
        <Kpi
          label="Agency fees collected"
          value={data.finance.recorded ? zar(data.finance.collected) : "None recorded"}
          to="/ceo/revenue"
        />
      </div>

      <section className="space-y-3">
        <SectionTitle
          title="Department comparison"
          hint="Only departments with recorded work or people are listed. No department targets are configured, so results are against assigned work and due dates."
        />
        {active.length ? (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Manager</th>
                  <th className="px-3 py-2 text-center">Open</th>
                  <th className="px-3 py-2 text-center">Overdue</th>
                  <th className="px-3 py-2 text-center">In review</th>
                  <th className="px-3 py-2 text-center">Completed</th>
                  <th className="px-3 py-2 text-center">On time</th>
                  <th className="px-3 py-2 text-center">Approved first time</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.map((d) => (
                  <tr key={d.key} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-medium">
                      <Link to="/ceo/departments" search={{ dept: d.key }} className="hover:text-primary">
                        {d.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{d.leads[0]?.name ?? "Manager not assigned"}</td>
                    <td className="px-3 py-2.5 text-center">{d.tasksOpen}</td>
                    <td className={`px-3 py-2.5 text-center ${d.tasksOverdue ? "text-rose-600 font-semibold" : ""}`}>{d.tasksOverdue}</td>
                    <td className="px-3 py-2.5 text-center">{d.awaitingReview}</td>
                    <td className="px-3 py-2.5 text-center">{pct(d.completionRate)}</td>
                    <td className="px-3 py-2.5 text-center">{pct(d.onTimeRate)}</td>
                    <td className="px-3 py-2.5 text-center">{pct(d.evidenceApprovalRate)}</td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Empty>No department has recorded work yet.</Empty>
        )}
      </section>
      <ReadOnlyNote />
    </div>
  );
}
