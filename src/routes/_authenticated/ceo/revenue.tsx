import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Empty,
  ExecHeader,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  SectionTitle,
  zar,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/revenue")({
  head: () => ({ meta: [{ title: "Financial Oversight — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <FinancePage data={data} />}</OverviewGate>,
});

function FinancePage({ data }: { data: ExecutiveOverview }) {
  const f = data.finance;
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Financial Oversight"
        subtitle="MSP's own agency revenue, expenses and budgets from the Finance module. Client ad spend is paid directly to the platforms and is not MSP money, so it is excluded."
        data={data}
        source="the Finance module (invoices, expenses, budgets, spend approvals)"
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/finance">Open Finance workspace</Link>
          </Button>
        }
      />
      {!f.recorded ? (
        <Empty>
          No invoices, expenses, budgets or spend approvals have been recorded in the Finance module yet. Figures
          will appear here as soon as the Finance team captures them.
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Agency fees invoiced" value={zar(f.invoicedAgencyFees)} />
            <Kpi label="Collected (verified)" value={zar(f.collected)} tone="good" />
            <Kpi label="Overdue" value={zar(f.overdueAmount)} hint={`${f.overdueInvoices} invoice(s)`} tone={f.overdueInvoices ? "bad" : "good"} />
            <Kpi label="Awaiting payment" value={f.awaitingPayment} hint="invoices not yet paid" />
            <Kpi label="Expenses paid" value={zar(f.expensesPaid)} hint={`${zar(f.expensesPending)} pending`} />
            <Kpi
              label="Collected less expenses"
              value={f.netPosition === null ? "—" : zar(f.netPosition)}
              tone={f.netPosition !== null && f.netPosition < 0 ? "bad" : undefined}
              hint="cash view, not audited profit"
            />
          </div>
          <section className="space-y-3">
            <SectionTitle title="Spend approvals awaiting a decision" hint="Decided by Finance and the GM under the existing financial controls." />
            {f.pendingApprovals.length ? (
              f.pendingApprovals.map((a) => (
                <Card key={a.id} className="p-3 text-xs flex justify-between gap-2">
                  <span>
                    <span className="font-semibold text-foreground">{a.title}</span> · {a.department} · requested by {a.requestedBy} on {a.date}
                  </span>
                  <span className="font-bold">{zar(a.amount)}</span>
                </Card>
              ))
            ) : (
              <Empty>No spend approvals are pending.</Empty>
            )}
          </section>
          <section className="space-y-3">
            <SectionTitle title="Budgets" />
            {f.budgets.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {f.budgets.map((b) => {
                  const used = b.budget ? Math.round((b.actual / b.budget) * 100) : 0;
                  return (
                    <Card key={b.dept} className="p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{b.dept}</span>
                        <span className={used > 100 ? "text-rose-600 font-semibold" : "text-muted-foreground"}>
                          {zar(b.actual)} of {zar(b.budget)} ({used}%)
                        </span>
                      </div>
                      <Progress value={Math.min(used, 100)} className="h-1.5" />
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Empty>No department budgets have been set.</Empty>
            )}
          </section>
        </>
      )}
      <ReadOnlyNote />
    </div>
  );
}
