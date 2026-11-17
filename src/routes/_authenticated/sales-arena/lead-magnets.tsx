import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, FileDown, Plus } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, selectClass, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, Loading, StatusBadge } from "@/components/sales-arena/ArenaUI";
import { MagnetForm } from "@/components/sales-arena/Forms";
import { arenaFetch, fmtDate, useArenaMe, useArenaMutation, useArenaQuery } from "@/lib/sales-arena-api";

export const Route = createFileRoute("/_authenticated/sales-arena/lead-magnets")({
  head: () => ({ meta: [{ title: "Lead magnets — Sales Arena" }] }),
  component: LeadMagnetsPage,
});

const DELIVERY = ["In preparation", "Overdue preparation", "Completed - details pending", "Add report link", "Completed - not sent", "Sent", "Discussed", "Declined", "Check dates / link"];

function LeadMagnetsPage() {
  const { data: me } = useArenaMe();
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const done = useArenaMutation("PATCH");
  const { data, isLoading, error } = useArenaQuery<any>(["magnets"], "/lead-magnets");
  const all: any[] = data?.leadMagnets ?? [];
  const list = status ? all.filter((m) => m.delivery_status === status) : all;
  const count = (s: string) => all.filter((m) => m.delivery_status === s).length;
  const openFile = async (m: any) => {
    try {
      const r = await arenaFetch<any>(`/lead-magnets/${m.id}/file`);
      window.open(r.url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title="Competitor analyses & growth audits"
        description="One entry per lead and report type. Completion needs a date and the report; sending and discussing are recorded separately. Completing a report is never counted as a sale."
        actions={(me?.isCEO || me?.salesperson) && <Button onClick={() => setAdding(true)}><Plus className="mr-1.5 h-4 w-4" /> Request report</Button>}
      />
      {(me?.isCEO || me?.salesperson) && <ArenaNav />}
      <ArenaGate error={error}>
        <StatGrid cols={5}>
          <StatCard label="In preparation" value={isLoading ? "—" : count("In preparation")} onClick={() => setStatus("In preparation")} active={status === "In preparation"} />
          <StatCard label="Overdue preparation" value={isLoading ? "—" : count("Overdue preparation")} onClick={() => setStatus("Overdue preparation")} active={status === "Overdue preparation"} />
          <StatCard label="Completed, details pending" value={isLoading ? "—" : count("Completed - details pending") + count("Add report link")} onClick={() => setStatus("Completed - details pending")} active={status === "Completed - details pending"} />
          <StatCard label="Completed, not sent" value={isLoading ? "—" : count("Completed - not sent")} onClick={() => setStatus("Completed - not sent")} active={status === "Completed - not sent"} />
          <StatCard label="Sent / discussed" value={isLoading ? "—" : count("Sent") + count("Discussed")} onClick={() => setStatus("Sent")} active={status === "Sent"} />
        </StatGrid>
        <Section
          title="Reports"
          actions={
            <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Delivery status">
              <option value="">All statuses</option>
              {DELIVERY.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          }
        >
          {isLoading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState title="No records found" description={status ? "No reports with this status." : "No report requests yet."} />
          ) : (
            <div className={table.wrap}>
              <table className={`${table.table} min-w-[980px]`}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Prospect</th>
                    <th className={table.th}>Report</th>
                    <th className={table.th}>Owner / prepared by</th>
                    <th className={table.th}>Due</th>
                    <th className={table.th}>Completed</th>
                    <th className={table.th}>Sent / discussed</th>
                    <th className={table.th}>Delivery</th>
                    <th className={table.th}>Follow-up</th>
                    <th className={table.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id} className={table.tr}>
                      <td className={table.td}>
                        <div className="font-medium">{m.company}</div>
                        <div className="text-xs text-muted-foreground">{m.deal_ref || "No lead ID"}</div>
                      </td>
                      <td className={table.td}>
                        {m.report_type}
                        <div className="flex gap-2 text-xs">
                          {m.report_link && <a href={m.report_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">Link <ExternalLink className="h-3 w-3" /></a>}
                          {m.has_file && <button type="button" onClick={() => openFile(m)} className="inline-flex items-center gap-0.5 text-primary hover:underline">File <FileDown className="h-3 w-3" /></button>}
                        </div>
                      </td>
                      <td className={table.td}>
                        {m.sales_owner_name || <span className="text-muted-foreground">Owner not confirmed</span>}
                        <div className="text-xs text-muted-foreground">{m.prepared_by_name ? `Prepared by ${m.prepared_by_name}` : ""}</div>
                      </td>
                      <td className={`${table.td} whitespace-nowrap`}>{m.due_date ? fmtDate(m.due_date) : "—"}</td>
                      <td className={`${table.td} whitespace-nowrap`}>{m.completed_date ? fmtDate(m.completed_date) : "—"}</td>
                      <td className={`${table.td} whitespace-nowrap`}>
                        {m.sent_date ? fmtDate(m.sent_date) : "—"}
                        <div className="text-xs text-muted-foreground">{m.discussed_date ? `Discussed ${fmtDate(m.discussed_date)}` : ""}</div>
                      </td>
                      <td className={table.td}><StatusBadge value={m.delivery_status} /></td>
                      <td className={table.td}>
                        <StatusBadge value={m.next_follow_up || m.follow_up_done_at ? m.follow_up_status : null} />
                        <div className="mt-1 text-xs text-muted-foreground">{m.next_follow_up ? fmtDate(m.next_follow_up) : ""}</div>
                      </td>
                      <td className={`${table.td} whitespace-nowrap text-right`}>
                        {m.can_edit && (
                          <>
                            {m.next_follow_up && !m.follow_up_done_at && (
                              <Button size="sm" variant="ghost" disabled={done.isPending} onClick={() => done.mutateAsync({ path: `/lead-magnets/${m.id}`, body: { completeFollowUp: true } }).then(() => toast.success("Follow-up marked done")).catch((e) => toast.error(e.message))}>
                                Done
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>Update</Button>
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
      <MagnetForm open={adding} onOpenChange={setAdding} />
      <MagnetForm open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)} magnet={editing ?? undefined} />
    </Page>
  );
}
