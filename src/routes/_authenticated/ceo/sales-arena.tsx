import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, table } from "@/components/layout/page";
import {
  ArenaGate, ArenaNav, ChartLegend, ChartTooltip, Loading, MonthSelect, StatusBadge, axisProps, compactZar, inputClass,
} from "@/components/sales-arena/ArenaUI";
import { arenaDownload, fmtDate, monthLabel, pctText, useArenaQuery, zar } from "@/lib/sales-arena-api";
import { defaultReportingDate, monthEnd, todayZA } from "@/lib/sales-arena-shared";

/**
 * CEO Sales Arena dashboard: company cash vs target, the monthly leaderboard and rankings, and the
 * charts from the workbook. CEO only — the route guard redirects anyone else and the API answers
 * 403 to every other role, so nothing here is reachable by URL or by calling the API directly.
 */
export const Route = createFileRoute("/_authenticated/ceo/sales-arena")({
  head: () => ({ meta: [{ title: "Sales Arena — Executive View" }] }),
  component: SalesArenaDashboard,
});

const shortDay = (d: string) => String(Number(d.slice(8, 10)));

function SalesArenaDashboard() {
  const [month, setMonth] = useState(todayZA().slice(0, 7));
  const [date, setDate] = useState(defaultReportingDate(todayZA().slice(0, 7)));
  const [focus, setFocus] = useState<string | null>(null);
  const { data, isLoading, error } = useArenaQuery<any>(["dashboard", month, date], `/dashboard?month=${month}&date=${date}`);

  const changeMonth = (m: string) => {
    setMonth(m);
    setDate(defaultReportingDate(m));
  };
  const exportCsv = (kind: string) =>
    arenaDownload(`/export/${kind}?month=${month}&date=${date}`, `sales-arena-${kind}-${month}.csv`).catch((e) => toast.error(e.message));

  const c = data?.company;
  const lb: any[] = data?.leaderboard ?? [];
  const focused = lb.find((r) => r.id === focus);
  return (
    <Page>
      <PageHeader
        eyebrow="CEO workspace · Confidential"
        title="Sales Arena"
        description={`Cash collected (MSP fees excluding VAT and ad spend) against targets for ${monthLabel(month)}, reporting through ${fmtDate(date)}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <MonthSelect value={month} onChange={changeMonth} />
            <input
              type="date"
              aria-label="Reporting date"
              className={`${inputClass} w-auto`}
              min={`${month}-01`}
              max={monthEnd(`${month}-01`)}
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </div>
        }
      />
      <ArenaNav />
      <ArenaGate error={error}>
        {isLoading || !data ? (
          <Loading />
        ) : (
          <>
            {c.datesPending && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                {zar(c.pendingAmount)} received in {monthLabel(month)} has no exact receipt date yet. It is included in the month totals but not in the
                week or day figures, which show “Dates pending” until the dates are added on the Payments page.
              </p>
            )}
            <StatGrid cols={4}>
              <StatCard label="Month cash collected" value={zar(c.actual.month)} hint="Actual receipts, net of refunds" />
              <StatCard
                label="Monthly company target"
                value={c.target.month ? zar(c.target.month) : "Not set"}
                hint={c.targetBreakdown.unassigned ? `${zar(c.targetBreakdown.unassigned)} not allocated to salespeople` : c.targetBreakdown.isExplicit ? "Company target" : "Sum of individual targets"}
              />
              <StatCard label="Target achieved" value={pctText(c.pct.month)} />
              <StatCard label="Still to collect" value={zar(c.remaining)} />
            </StatGrid>
            <StatGrid cols={4}>
              <StatCard label="This week: actual / target" value={`${zar(c.actual.week)} / ${zar(c.target.week)}`} hint={`Week %: ${pctText(c.pct.week)} · ${fmtDate(data.period.weekFrom)} – ${fmtDate(data.period.weekTo)}`} />
              <StatCard label="Reporting day: actual / target" value={`${zar(c.actual.day)} / ${zar(c.target.day)}`} hint={`Day %: ${pctText(c.pct.day)}`} />
              <StatCard label="Open pipeline (quoted fees)" value={zar(data.pipeline.quotedOpen)} hint={`${data.pipeline.open} open deals · ${data.pipeline.overdueFollowUps} overdue follow-ups`} />
              <StatCard label="Calls this month" value={data.setter.calls} hint={`${data.setter.connected} connected · ${data.setter.qualifiedLeads} qualified leads · ${data.setter.bookedLeads} booked`} />
            </StatGrid>

            <Section
              title="Monthly sales leaderboard & performance rankings"
              description="Confidential — visible to the CEO only. Ranked by cash collected this month. Select a salesperson for their detail."
              actions={
                <Button size="sm" variant="outline" onClick={() => exportCsv("leaderboard")}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                </Button>
              }
            >
              {lb.length === 0 ? (
                <EmptyState title="No salespeople yet" description="Add salespeople and their monthly targets on the Team targets page." />
              ) : (
                <div className={table.wrap}>
                  <table className={`${table.table} min-w-[980px]`}>
                    <thead className={table.thead}>
                      <tr>
                        <th className={table.th}>Rank</th>
                        <th className={table.th}>Salesperson</th>
                        <th className={`${table.th} text-right`}>Month target</th>
                        <th className={`${table.th} text-right`}>Cash collected</th>
                        <th className={`${table.th} text-right`}>Month %</th>
                        <th className={`${table.th} text-right`}>Week target / actual</th>
                        <th className={`${table.th} text-right`}>Day target / actual</th>
                        <th className={`${table.th} text-right`}>Remaining</th>
                        <th className={table.th}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lb.map((r) => (
                        <tr
                          key={r.id}
                          className={`${table.tr} cursor-pointer ${focus === r.id ? "bg-muted/50" : ""}`}
                          onClick={() => setFocus(focus === r.id ? null : r.id)}
                        >
                          <td className={`${table.td} font-medium tabular-nums`}>{r.rank ? `#${r.rank}` : "—"}</td>
                          <td className={`${table.td} font-medium`}>{r.name}</td>
                          <td className={`${table.td} text-right tabular-nums`}>{r.target.month ? zar(r.target.month) : "Not set"}</td>
                          <td className={`${table.td} text-right font-medium tabular-nums`}>{zar(r.actual.month)}</td>
                          <td className={`${table.td} text-right tabular-nums`}>{pctText(r.pct.month)}</td>
                          <td className={`${table.td} text-right tabular-nums`}>
                            {zar(r.target.week)} / {zar(r.actual.week)}
                            <div className="text-xs text-muted-foreground">{pctText(r.pct.week)}</div>
                          </td>
                          <td className={`${table.td} text-right tabular-nums`}>
                            {zar(r.target.day)} / {zar(r.actual.day)}
                            <div className="text-xs text-muted-foreground">{pctText(r.pct.day)}</div>
                          </td>
                          <td className={`${table.td} text-right tabular-nums`}>{zar(r.remaining)}</td>
                          <td className={table.td}>
                            <StatusBadge value={r.progress} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {focused && <PersonDetail row={focused} data={data} month={month} />}
            </Section>

            <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              <ChartCard title="Cash collected vs monthly target" legend={[{ label: "Monthly target", color: "var(--viz-grid-strong, #94a3b8)" }, { label: "Cash collected", color: "var(--viz-1)" }]}>
                {lb.some((r) => r.target.month || r.actual.month) ? (
                  <BarChart data={lb.map((r) => ({ name: r.name.split(" ")[0], target: r.target.month, cash: r.actual.month }))} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis tickFormatter={compactZar} width={48} {...axisProps} />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip format={zar} />} />
                    <Bar isAnimationActive={false} dataKey="target" name="Monthly target" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    <Bar isAnimationActive={false} dataKey="cash" name="Cash collected" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  </BarChart>
                ) : null}
              </ChartCard>

              <ChartCard
                title="Daily cash collection vs target pace"
                note={c.datesPending ? "Receipts without an exact date are not plotted by day." : undefined}
                legend={[{ label: "Cash collected (cumulative)", color: "var(--viz-1)" }, { label: "Target pace", color: "var(--viz-2)", dashed: true }]}
              >
                {c.target.month || data.dailyPace.some((d: any) => d.cash) ? (
                  <LineChart data={data.dailyPace.map((d: any) => ({ ...d, day: shortDay(d.date) }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="day" interval={2} {...axisProps} />
                    <YAxis tickFormatter={compactZar} width={48} {...axisProps} />
                    <Tooltip content={<ChartTooltip format={zar} />} labelFormatter={(l) => `Day ${l}`} />
                    <Line isAnimationActive={false} type="monotone" dataKey="pace" name="Target pace" stroke="var(--viz-2)" strokeDasharray="5 4" dot={false} strokeWidth={2} />
                    <Line isAnimationActive={false} type="stepAfter" dataKey="cash" name="Cash collected" stroke="var(--viz-1)" dot={false} strokeWidth={2} connectNulls={false} />
                  </LineChart>
                ) : null}
              </ChartCard>

              <ChartCard title="Monthly performance trend (12 months)" legend={[{ label: "Cash collected", color: "var(--viz-1)" }, { label: "Company target", color: "var(--viz-2)", dashed: true }]}>
                {data.trend.some((t: any) => t.actual || t.target) ? (
                  <ComposedChart data={data.trend.map((t: any) => ({ ...t, target: t.target || null, label: monthLabel(t.month).slice(0, 3) }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis tickFormatter={compactZar} width={48} {...axisProps} />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip format={zar} />} />
                    <Bar isAnimationActive={false} dataKey="actual" name="Cash collected" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    <Line isAnimationActive={false} type="monotone" dataKey="target" name="Company target" stroke="var(--viz-2)" strokeDasharray="5 4" dot={false} strokeWidth={2} />
                  </ComposedChart>
                ) : null}
              </ChartCard>

              <ChartCard title="Individual target achievement (month)" legend={[{ label: "% of monthly target", color: "var(--viz-1)" }]}>
                {lb.some((r) => r.pct.month.value !== null) ? (
                  <BarChart data={lb.filter((r) => r.pct.month.value !== null).map((r) => ({ name: r.name.split(" ")[0], pct: Math.round(r.pct.month.value * 1000) / 10 }))} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis tickFormatter={(v) => `${v}%`} {...axisProps} />
                    <ReferenceLine y={100} stroke="var(--viz-2)" strokeDasharray="5 4" />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip format={(v: number) => `${v}%`} />} />
                    <Bar isAnimationActive={false} dataKey="pct" name="% of target" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                ) : null}
              </ChartCard>

              <ChartCard title="Pipeline: current stages" legend={[{ label: "Opportunities", color: "var(--viz-1)" }]}>
                {data.pipeline.stages.some((s: any) => s.count) ? (
                  <BarChart data={data.pipeline.stages} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
                    <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
                    <XAxis type="number" allowDecimals={false} {...axisProps} />
                    <YAxis type="category" dataKey="stage" width={104} {...axisProps} />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip />} />
                    <Bar isAnimationActive={false} dataKey="count" name="Opportunities" fill="var(--viz-1)" radius={[0, 4, 4, 0]} maxBarSize={16} />
                  </BarChart>
                ) : null}
              </ChartCard>

              <ChartCard
                title="Lead setter: daily calls"
                note={data.setter.undatedCalls ? `${data.setter.undatedCalls} call(s) this month have no exact date and are not plotted by day.` : undefined}
                legend={[{ label: "Calls made", color: "var(--viz-1)" }, { label: "Connected", color: "var(--viz-2)" }]}
              >
                {data.setter.dailyCalls.some((d: any) => d.calls) ? (
                  <BarChart data={data.setter.dailyCalls.map((d: any) => ({ ...d, day: shortDay(d.date) }))} barGap={1} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="day" interval={2} {...axisProps} />
                    <YAxis allowDecimals={false} {...axisProps} />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip />} labelFormatter={(l) => `Day ${l}`} />
                    <Bar isAnimationActive={false} dataKey="calls" name="Calls made" fill="var(--viz-1)" radius={[3, 3, 0, 0]} maxBarSize={10} />
                    <Bar isAnimationActive={false} dataKey="connected" name="Connected" fill="var(--viz-2)" radius={[3, 3, 0, 0]} maxBarSize={10} />
                  </BarChart>
                ) : null}
              </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              <Section title="Setter activity by caller" description="Calls count attempts; qualified and booked count distinct leads this month.">
                {data.setter.bySetter.length === 0 ? (
                  <EmptyState title="No setter activity this month" />
                ) : (
                  <div className={table.wrap}>
                    <table className={`${table.table} min-w-[460px]`}>
                      <thead className={table.thead}>
                        <tr>
                          <th className={table.th}>Caller</th>
                          <th className={`${table.th} px-2 text-right`}>Attempts</th>
                          <th className={`${table.th} text-right`}>Calls</th>
                          <th className={`${table.th} text-right`}>Connected</th>
                          <th className={`${table.th} text-right`}>Qualified</th>
                          <th className={`${table.th} text-right`}>Booked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.setter.bySetter.map((s: any) => (
                          <tr key={s.id} className={table.tr}>
                            <td className={`${table.td} font-medium`}>{s.name}</td>
                            <td className={`${table.td} text-right tabular-nums`}>{s.attempts}</td>
                            <td className={`${table.td} text-right tabular-nums`}>{s.calls}</td>
                            <td className={`${table.td} text-right tabular-nums`}>{s.connected}</td>
                            <td className={`${table.td} text-right tabular-nums`}>{s.qualifiedLeads}</td>
                            <td className={`${table.td} text-right tabular-nums`}>{s.bookedLeads}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
              <Section
                title="Competitor analyses & growth audits"
                description="Completed and sent count this month; the other two are the current backlog."
                actions={
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/sales-arena/lead-magnets">Open</Link>
                  </Button>
                }
              >
                <StatGrid cols={2}>
                  <StatCard label="Completed this month" value={data.leadMagnets.completedThisMonth} hint="With date and report" />
                  <StatCard label="Sent this month" value={data.leadMagnets.sentThisMonth} />
                  <StatCard label="Completed, not sent" value={data.leadMagnets.completedNotSent} />
                  <StatCard label="Overdue preparation" value={data.leadMagnets.overduePreparation} hint={data.leadMagnets.detailsPending ? `${data.leadMagnets.detailsPending} completed with details pending` : undefined} />
                </StatGrid>
              </Section>
            </div>

            <Section title="Week-by-week target plan" description="Weekly targets follow Mon–Fri working days inside the month; public holidays are not excluded.">
              <div className={table.wrap}>
                <table className={`${table.table} min-w-[720px]`}>
                  <thead className={table.thead}>
                    <tr>
                      <th className={table.th}>Week</th>
                      <th className={`${table.th} text-right`}>Working days</th>
                      <th className={`${table.th} text-right`}>Company</th>
                      {lb.map((r) => (
                        <th key={r.id} className={`${table.th} text-right`}>
                          {r.name.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeklyPlan.map((w: any) => (
                      <tr key={w.from} className={table.tr}>
                        <td className={table.td}>
                          {fmtDate(w.from)} – {fmtDate(w.to)}
                        </td>
                        <td className={`${table.td} text-right tabular-nums`}>{w.workdays}</td>
                        <td className={`${table.td} text-right tabular-nums`}>{zar(w.company)}</td>
                        {lb.map((r) => (
                          <td key={r.id} className={`${table.td} text-right tabular-nums`}>
                            {zar(w.people[r.id] ?? 0)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </ArenaGate>
    </Page>
  );
}

function PersonDetail({ row, data, month }: { row: any; data: any; month: string }) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{row.name} — {monthLabel(month)}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/sales-arena/pipeline" search={{ salesperson: row.id } as any}>Pipeline</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/sales-arena/payments" search={{ salesperson: row.id, month } as any}>Receipts</Link>
          </Button>
        </div>
      </div>
      <StatGrid cols={4}>
        <StatCard label="Month: cash / target" value={`${zar(row.actual.month)} / ${row.target.month ? zar(row.target.month) : "Not set"}`} hint={pctText(row.pct.month)} />
        <StatCard label="Week: cash / target" value={`${zar(row.actual.week)} / ${zar(row.target.week)}`} hint={pctText(row.pct.week)} />
        <StatCard label="Day: cash / target" value={`${zar(row.actual.day)} / ${zar(row.target.day)}`} hint={pctText(row.pct.day)} />
        <StatCard label="Remaining to target" value={zar(row.remaining)} hint={row.datesPending ? `${zar(row.pendingAmount)} awaiting receipt dates` : undefined} />
      </StatGrid>
      <p className="mt-3 text-xs text-muted-foreground">
        Weekly targets this month: {data.weeklyPlan.map((w: any) => `${fmtDate(w.from).replace(/ \d{4}$/, "")}: ${zar(w.people[row.id] ?? 0)}`).join(" · ")}
      </p>
    </div>
  );
}

function ChartCard({ title, legend, note, children }: { title: string; legend: { label: string; color: string; dashed?: boolean }[]; note?: string; children: any }) {
  return (
    <Section title={title}>
      <div className="mb-2">
        <ChartLegend items={legend} />
      </div>
      {children ? (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-16 text-center text-xs text-muted-foreground">No records for this period yet.</p>
      )}
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </Section>
  );
}
