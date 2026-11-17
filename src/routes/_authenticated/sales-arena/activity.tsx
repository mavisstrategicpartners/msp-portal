import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, selectClass, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, Loading, MonthSelect, StatusBadge } from "@/components/sales-arena/ArenaUI";
import { ActivityForm } from "@/components/sales-arena/Forms";
import { arenaDownload, fmtDate, fmtDateTime, monthLabel, useArenaMe, useArenaMutation, useArenaQuery } from "@/lib/sales-arena-api";
import { todayZA } from "@/lib/sales-arena-shared";

export const Route = createFileRoute("/_authenticated/sales-arena/activity")({
  head: () => ({ meta: [{ title: "Setter activity — Sales Arena" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const { data: me } = useArenaMe();
  const [month, setMonth] = useState(todayZA().slice(0, 7));
  const [setter, setSetter] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const done = useArenaMutation("PATCH");
  const { data, isLoading, error } = useArenaQuery<any>(["activities", month, setter], `/activities?month=${month}${setter ? `&setter=${setter}` : ""}`);
  const list: any[] = data?.activities ?? [];
  const s = data?.summary;
  const due = list.filter((a) => a.follow_up_status === "Due today").length;
  const overdue = list.filter((a) => a.follow_up_status === "Overdue").length;
  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title="Lead setter activity"
        description={`Every call, WhatsApp and email attempt in ${monthLabel(month)}. Calls count attempts; qualified and booked count distinct leads. Activity is never counted as income.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <MonthSelect value={month} onChange={setMonth} />
            {me?.isCEO && (
              <Button variant="outline" onClick={() => arenaDownload(`/export/activity?month=${month}`, `sales-arena-activity-${month}.csv`).catch((e) => toast.error(e.message))}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            )}
            {(me?.isCEO || me?.salesperson) && (
              <Button onClick={() => setAdding(true)}><Plus className="mr-1.5 h-4 w-4" /> Log attempt</Button>
            )}
          </div>
        }
      />
      <ArenaNav />
      <ArenaGate error={error}>
        <StatGrid cols={6}>
          <StatCard label="Calls made" value={s ? s.calls : "—"} />
          <StatCard label="Connected calls" value={s ? s.connected : "—"} />
          <StatCard label="Qualified leads" value={s ? s.qualifiedLeads : "—"} />
          <StatCard label="Meetings booked" value={s ? s.bookedLeads : "—"} />
          <StatCard label="Follow-ups due today" value={isLoading ? "—" : due} />
          <StatCard label="Overdue follow-ups" value={isLoading ? "—" : overdue} />
        </StatGrid>
        <Section
          actions={
            me?.isCEO ? (
              <select className={selectClass} value={setter} onChange={(e) => setSetter(e.target.value)} aria-label="Lead setter">
                <option value="">All callers</option>
                {me.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : undefined
          }
          title={me?.isCEO ? "Activity log" : "My activity"}
        >
          {isLoading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState title="No records found" description={`No contact attempts logged for ${monthLabel(month)}.`} />
          ) : (
            <div className={table.wrap}>
              <table className={`${table.table} min-w-[960px]`}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Date / time</th>
                    <th className={table.th}>Lead</th>
                    <th className={table.th}>Activity</th>
                    <th className={table.th}>Qualified / booked</th>
                    <th className={table.th}>Setter → closer</th>
                    <th className={table.th}>Next follow-up</th>
                    <th className={table.th}>Notes</th>
                    <th className={table.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className={table.tr}>
                      <td className={`${table.td} whitespace-nowrap`}>{a.activity_at ? fmtDateTime(a.activity_at) : <StatusBadge value="Dates pending" />}</td>
                      <td className={table.td}>
                        <div className="font-medium">{a.company || "—"}</div>
                        <div className="text-xs text-muted-foreground">{a.deal_ref || "No lead ID"}</div>
                      </td>
                      <td className={table.td}>{a.activity_type} · {a.result}{a.call_minutes ? ` · ${a.call_minutes} min` : ""}</td>
                      <td className={table.td}>
                        {a.qualified ? "Qualified" : "—"}{a.meeting_booked ? ` · Booked${a.appointment_at ? ` ${fmtDateTime(a.appointment_at)}` : ""}` : ""}
                      </td>
                      <td className={table.td}>{a.setter_name}{a.closer_name ? ` → ${a.closer_name}` : ""}</td>
                      <td className={table.td}>
                        <StatusBadge value={a.next_follow_up || a.follow_up_done_at ? a.follow_up_status : null} />
                        <div className="mt-1 text-xs text-muted-foreground">{a.next_follow_up ? fmtDate(a.next_follow_up) : ""}</div>
                      </td>
                      <td className={`${table.td} max-w-[240px] text-muted-foreground`}>{a.notes || "—"}</td>
                      <td className={`${table.td} whitespace-nowrap text-right`}>
                        {(me?.isCEO || a.setter_id === me?.salesperson?.id) && (
                          <>
                            {a.next_follow_up && !a.follow_up_done_at && (
                              <Button size="sm" variant="ghost" disabled={done.isPending} onClick={() => done.mutateAsync({ path: `/activities/${a.id}`, body: { completeFollowUp: true } }).then(() => toast.success("Follow-up marked done")).catch((e) => toast.error(e.message))}>
                                Done
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>Edit</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </ArenaGate>
      <ActivityForm open={adding} onOpenChange={setAdding} />
      <ActivityForm open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)} activity={editing ?? undefined} />
    </Page>
  );
}
