import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  ExecHeader,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  zar,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/sales")({
  head: () => ({ meta: [{ title: "Sales Pipeline — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <SalesPage data={data} />}</OverviewGate>,
});

function SalesPage({ data }: { data: ExecutiveOverview }) {
  const s = data.sales;
  const sales = data.departments.find((d) => d.key === "sales");
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Sales Pipeline"
        subtitle="Leads, pipeline value and conversions captured by the Sales team in the portal."
        data={data}
        source="the Sales team's lead ledger"
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/sales">Open Sales workspace</Link>
          </Button>
        }
      />
      {!s.recorded ? (
        <Empty>
          No leads have been captured in the portal's Sales module yet. Once the Sales team logs leads (or the
          GoHighLevel sync is connected), the pipeline will appear here.
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Kpi label="Leads" value={s.leads} />
            <Kpi label="Open pipeline (monthly value)" value={zar(s.openPipelineValue)} />
            <Kpi label="Won this month" value={s.wonThisMonth} hint={zar(s.wonValueThisMonth)} tone="good" />
            <Kpi label="Lost" value={s.lost} />
          </div>
          <Card className="p-4">
            <p className="text-sm font-semibold mb-2">By stage</p>
            <div className="space-y-1.5">
              {s.byStage.map((st) => (
                <div key={st.stage} className="flex justify-between text-xs border-b border-border/60 pb-1">
                  <span>{st.stage}</span>
                  <span className="text-muted-foreground">
                    {st.count} lead(s) · {zar(st.value)} / month
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
      {sales && (
        <p className="text-xs text-muted-foreground">
          Sales team task delivery: {sales.tasksOpen} open, {sales.tasksOverdue} overdue.{" "}
          <Link to="/ceo/departments" search={{ dept: "sales" }} className="text-primary hover:underline">
            View the Sales department
          </Link>
        </p>
      )}
      <ReadOnlyNote />
    </div>
  );
}
