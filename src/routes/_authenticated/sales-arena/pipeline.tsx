import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, selectClass, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, Loading, Options, StatusBadge, inputClass } from "@/components/sales-arena/ArenaUI";
import { DealForm } from "@/components/sales-arena/DealForm";
import { arenaDownload, fmtDate, useArenaMe, useArenaQuery, zar } from "@/lib/sales-arena-api";
import { STAGES } from "@/lib/sales-arena-shared";

export const Route = createFileRoute("/_authenticated/sales-arena/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — Sales Arena" }] }),
  validateSearch: z.object({ salesperson: z.string().optional(), stage: z.string().optional(), followUp: z.string().optional(), view: z.string().optional() }),
  component: PipelinePage,
});

function PipelinePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: me } = useArenaMe();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const params = new URLSearchParams();
  if (search.salesperson) params.set("salesperson", search.salesperson);
  if (search.stage) params.set("stage", search.stage);
  if (search.followUp) params.set("followUp", search.followUp);
  if (q.trim()) params.set("q", q.trim());
  const { data, isLoading, error } = useArenaQuery<any>(["opportunities", params.toString()], `/opportunities?${params}`);
  const setSearch = (patch: Record<string, string | undefined>) => navigate({ search: (s: any) => ({ ...s, ...patch }) as any, replace: true });
  const list: any[] = data?.opportunities ?? [];
  const view = search.view === "actions" ? "actions" : "all";
  const open = list.filter((o) => o.stage !== "Won" && o.stage !== "Lost");

  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title="Lead pipeline & follow-ups"
        description={me?.isCEO ? "Every opportunity in the company pipeline." : "Deals where you are the salesperson or the lead setter."}
        actions={
          <div className="flex flex-wrap gap-2">
            {me?.isCEO && (
              <Button variant="outline" onClick={() => arenaDownload("/export/pipeline", "sales-arena-pipeline.csv").catch((e) => toast.error(e.message))}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            )}
            {(me?.isCEO || me?.salesperson) && (
              <Button onClick={() => setAdding(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add lead
              </Button>
            )}
          </div>
        }
      />
      <ArenaNav />
      <ArenaGate error={error}>
        <StatGrid cols={4}>
          <StatCard label="Open deals" value={isLoading ? "—" : open.length} />
          <StatCard label="Overdue follow-ups" value={isLoading ? "—" : list.filter((o) => o.follow_up_status === "Overdue").length} onClick={() => setSearch({ followUp: "overdue" })} active={search.followUp === "overdue"} />
          <StatCard label="Due today" value={isLoading ? "—" : list.filter((o) => o.follow_up_status === "Due today").length} onClick={() => setSearch({ followUp: "today" })} active={search.followUp === "today"} />
          <StatCard label="No follow-up set" value={isLoading ? "—" : list.filter((o) => o.follow_up_status === "Set follow-up").length} onClick={() => setSearch({ followUp: "none" })} active={search.followUp === "none"} />
        </StatGrid>
        <Section>
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input className={`${inputClass} pl-8`} placeholder="Search company, contact, deal ID, phone or email" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className={selectClass} value={search.stage ?? ""} onChange={(e) => setSearch({ stage: e.target.value || undefined })} aria-label="Stage">
                <Options list={STAGES} placeholder="All stages" />
              </select>
              <select className={selectClass} value={search.followUp ?? ""} onChange={(e) => setSearch({ followUp: e.target.value || undefined })} aria-label="Follow-up">
                <option value="">All follow-ups</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="week">Next 7 days</option>
                <option value="none">No follow-up set</option>
              </select>
              {me?.isCEO && (
                <select className={selectClass} value={search.salesperson ?? ""} onChange={(e) => setSearch({ salesperson: e.target.value || undefined })} aria-label="Salesperson">
                  <option value="">All salespeople</option>
                  {me.people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <select className={selectClass} value={view} onChange={(e) => setSearch({ view: e.target.value === "actions" ? "actions" : undefined })} aria-label="View">
                <option value="all">All deals</option>
                <option value="actions">Next actions</option>
              </select>
            </div>
          </div>
          {isLoading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState title="No records found" description={search.stage || search.followUp || q ? "No deals match these filters." : "Add the first lead to start the pipeline."} />
          ) : view === "actions" ? (
            <div className="grid gap-2">
              {open.map((o) => (
                <Link key={o.id} to="/sales-arena/deal/$dealId" params={{ dealId: o.id }} className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{o.next_action || "No next action recorded"}</div>
                    <div className="text-xs text-muted-foreground">{o.company} · {o.deal_ref} · {o.stage}{me?.isCEO && o.salesperson_name ? ` · ${o.salesperson_name}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{o.next_follow_up ? fmtDate(o.next_follow_up) : ""}</span>
                    <StatusBadge value={o.follow_up_status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={table.wrap}>
              <table className={`${table.table} min-w-[900px]`}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Deal</th>
                    <th className={table.th}>Salesperson</th>
                    <th className={table.th}>Stage</th>
                    <th className={`${table.th} text-right`}>Quoted fee</th>
                    <th className={`${table.th} text-right`}>Signed value</th>
                    <th className={table.th}>Next follow-up</th>
                    <th className={table.th}>Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id} className={table.tr}>
                      <td className={table.td}>
                        <Link to="/sales-arena/deal/$dealId" params={{ dealId: o.id }} className="font-medium text-foreground hover:underline">
                          {o.company}
                        </Link>
                        <div className="text-xs text-muted-foreground">{o.deal_ref}{o.contact_name ? ` · ${o.contact_name}` : ""}</div>
                      </td>
                      <td className={table.td}>{o.salesperson_name || <span className="text-muted-foreground">Not assigned</span>}</td>
                      <td className={table.td}><StatusBadge value={o.stage} /></td>
                      <td className={`${table.td} text-right tabular-nums`}>{o.quoted_fee != null ? zar(o.quoted_fee) : "—"}</td>
                      <td className={`${table.td} text-right tabular-nums`}>{o.signed_value != null ? zar(o.signed_value) : "—"}</td>
                      <td className={table.td}>
                        <StatusBadge value={o.follow_up_status} />
                        <div className="mt-1 text-xs text-muted-foreground">{o.next_follow_up ? fmtDate(o.next_follow_up) : ""}</div>
                      </td>
                      <td className={`${table.td} max-w-[260px] text-muted-foreground`}>{o.next_action || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </ArenaGate>
      <DealForm open={adding} onOpenChange={setAdding} />
    </Page>
  );
}
