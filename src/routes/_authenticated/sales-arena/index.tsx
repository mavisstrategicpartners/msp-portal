import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, ChartTooltip, Loading, MonthSelect, StatusBadge, axisProps, compactZar } from "@/components/sales-arena/ArenaUI";
import { fmtDate, monthLabel, pctText, useArenaMe, useArenaQuery, zar } from "@/lib/sales-arena-api";
import { todayZA } from "@/lib/sales-arena-shared";

/** A salesperson's own Sales Arena: their target, cash, pipeline and follow-ups. No rankings. */
export const Route = createFileRoute("/_authenticated/sales-arena/")({
  head: () => ({ meta: [{ title: "My Sales Arena — MSP Portal" }] }),
  component: MySalesArena,
});

function MySalesArena() {
  const { data: me, isLoading: meLoading, error: meError } = useArenaMe();
  const [month, setMonth] = useState(todayZA().slice(0, 7));
  const enabled = Boolean(me?.salesperson);
  const { data, isLoading, error } = useArenaQuery<any>(["my", month], enabled ? `/my?month=${month}` : null);
  if (me?.isCEO) return <Navigate to={"/ceo/sales-arena" as any} replace />;

  const p = data?.performance;
  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title="My performance"
        description={`Your own cash target, receipts and pipeline for ${monthLabel(month)}. Only you and the CEO can see these figures.`}
        actions={<MonthSelect value={month} onChange={setMonth} />}
      />
      {meLoading ? (
        <Loading />
      ) : meError || (!me?.salesperson && !me?.isPreparer) ? (
        <EmptyState
          title="You are not set up in the Sales Arena"
          description="The CEO adds salespeople and links them to their portal accounts. Once you are added, your targets, pipeline and receipts appear here."
        />
      ) : !me?.salesperson ? (
        <EmptyState
          title="Reports you are preparing"
          description="You are preparing competitor analyses or growth audits."
          action={
            <Button asChild size="sm">
              <Link to="/sales-arena/lead-magnets">Open lead magnets</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ArenaNav />
          <ArenaGate error={error}>
            {isLoading || !data ? (
              <Loading />
            ) : (
              <>
                {p.datesPending && (
                  <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                    {zar(p.pendingAmount)} of your receipts this month have no exact receipt date yet. Add the dates on the Payments page so your week and
                    day figures are complete.
                  </p>
                )}
                <StatGrid cols={4}>
                  <StatCard label="My cash collected this month" value={zar(p.actual.month)} />
                  <StatCard label="My monthly target" value={p.target.month ? zar(p.target.month) : "Not set"} hint={p.target.month ? `${pctText(p.pct.month)} achieved` : "Your target has not been set yet"} />
                  <StatCard label="This week: actual / target" value={`${zar(p.actual.week)} / ${zar(p.target.week)}`} hint={pctText(p.pct.week)} />
                  <StatCard label="Today: actual / target" value={`${zar(p.actual.day)} / ${zar(p.target.day)}`} hint={pctText(p.pct.day)} />
                </StatGrid>
                {data.setter && (
                  <StatGrid cols={4}>
                    <StatCard label="My calls this month" value={data.setter.calls} hint={`${data.setter.attempts} contact attempts in total`} />
                    <StatCard label="Connected calls" value={data.setter.connected} />
                    <StatCard label="Qualified leads" value={data.setter.qualifiedLeads} />
                    <StatCard label="Meetings booked" value={data.setter.bookedLeads} />
                  </StatGrid>
                )}
                <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
                  <Section title="My follow-ups" description="Overdue, due today, or with no follow-up date set.">
                    {data.followUps.length === 0 ? (
                      <EmptyState title="Nothing outstanding" description="All your deals have a scheduled follow-up." />
                    ) : (
                      <div className={table.wrap}>
                        <table className={table.table}>
                          <thead className={table.thead}>
                            <tr>
                              <th className={table.th}>Company</th>
                              <th className={table.th}>Next action</th>
                              <th className={table.th}>Follow-up</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.followUps.map((d: any) => (
                              <tr key={d.id} className={table.tr}>
                                <td className={table.td}>
                                  <Link to="/sales-arena/deal/$dealId" params={{ dealId: d.id }} className="font-medium text-foreground hover:underline">
                                    {d.company}
                                  </Link>
                                  <div className="text-xs text-muted-foreground">{d.deal_ref}</div>
                                </td>
                                <td className={`${table.td} text-muted-foreground`}>{d.next_action || "—"}</td>
                                <td className={table.td}>
                                  <StatusBadge value={d.follow_up_status} />
                                  <div className="mt-1 text-xs text-muted-foreground">{d.next_follow_up ? fmtDate(d.next_follow_up) : ""}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Section>
                  <Section title="My cash collected (6 months)">
                    {data.trend.some((t: any) => t.actual) ? (
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.trend.map((t: any) => ({ ...t, label: monthLabel(t.month).slice(0, 3) }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                            <XAxis dataKey="label" {...axisProps} />
                            <YAxis tickFormatter={compactZar} width={48} {...axisProps} />
                            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip format={zar} />} />
                            <Bar isAnimationActive={false} dataKey="actual" name="Cash collected" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="py-16 text-center text-xs text-muted-foreground">No receipts recorded in the last six months.</p>
                    )}
                  </Section>
                </div>
                <Section title="My pipeline">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {data.pipeline.map((s: any) => (
                      <Link
                        key={s.stage}
                        to="/sales-arena/pipeline"
                        search={{ stage: s.stage } as any}
                        className="rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/40"
                      >
                        <div className="text-xs text-muted-foreground">{s.stage}</div>
                        <div className="text-lg font-semibold tabular-nums text-foreground">{s.count}</div>
                      </Link>
                    ))}
                  </div>
                </Section>
              </>
            )}
          </ArenaGate>
        </>
      )}
    </Page>
  );
}
