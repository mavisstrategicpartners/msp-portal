import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, selectClass, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, Loading, MonthSelect, StatusBadge, inputClass } from "@/components/sales-arena/ArenaUI";
import { PaymentForm } from "@/components/sales-arena/Forms";
import { arenaDownload, fmtDate, monthLabel, useArenaMe, useArenaQuery, zar } from "@/lib/sales-arena-api";
import { todayZA } from "@/lib/sales-arena-shared";

export const Route = createFileRoute("/_authenticated/sales-arena/payments")({
  head: () => ({ meta: [{ title: "Payments received — Sales Arena" }] }),
  validateSearch: z.object({ salesperson: z.string().optional(), month: z.string().optional() }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: me } = useArenaMe();
  const month = search.month && /^\d{4}-\d{2}$/.test(search.month) ? search.month : todayZA().slice(0, 7);
  const [allMonths, setAllMonths] = useState(false);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const params = new URLSearchParams();
  if (!allMonths) params.set("month", month);
  if (search.salesperson) params.set("salesperson", search.salesperson);
  if (q.trim()) params.set("q", q.trim());
  const { data, isLoading, error } = useArenaQuery<any>(["payments", params.toString()], `/payments?${params}`);
  const list: any[] = data?.payments ?? [];
  const refunds = list.filter((p) => Number(p.amount) < 0).reduce((s, p) => s + Number(p.amount), 0);
  const setSearch = (patch: any) => navigate({ search: (s: any) => ({ ...s, ...patch }), replace: true });
  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title="Payments received"
        description={me?.isCEO ? "Every actual receipt of MSP fees (excluding VAT and client ad spend). This is the only source of Sales Arena revenue." : "Receipts credited to you. Only you and the CEO can see them."}
        actions={
          <div className="flex flex-wrap gap-2">
            <MonthSelect value={month} onChange={(m) => setSearch({ month: m })} />
            {me?.isCEO && (
              <Button variant="outline" onClick={() => arenaDownload(`/export/payments${allMonths ? "" : `?month=${month}`}`, `sales-arena-payments-${allMonths ? "all" : month}.csv`).catch((e) => toast.error(e.message))}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            )}
            {(me?.isCEO || me?.salesperson) && <Button onClick={() => setAdding(true)}><Plus className="mr-1.5 h-4 w-4" /> Record payment</Button>}
          </div>
        }
      />
      <ArenaNav />
      <ArenaGate error={error}>
        <StatGrid cols={4}>
          <StatCard label={allMonths ? "Total received (all months)" : `Received in ${monthLabel(month)}`} value={isLoading ? "—" : zar(data?.total)} hint="Net of refunds" />
          <StatCard label="Receipts" value={isLoading ? "—" : list.filter((p) => Number(p.amount) > 0).length} />
          <StatCard label="Refunds" value={isLoading ? "—" : zar(refunds)} />
          <StatCard label="Receipt date pending" value={isLoading ? "—" : data?.undated ?? 0} hint="Counted in the month; not in week/day figures" />
        </StatGrid>
        <Section>
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input className={`${inputClass} pl-8`} placeholder="Search client, deal ID, invoice or payment reference" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className={selectClass} value={allMonths ? "all" : "month"} onChange={(e) => setAllMonths(e.target.value === "all")} aria-label="Period">
                <option value="month">Selected month</option>
                <option value="all">All months (history)</option>
              </select>
              {me?.isCEO && (
                <select className={selectClass} value={search.salesperson ?? ""} onChange={(e) => setSearch({ salesperson: e.target.value || undefined })} aria-label="Salesperson">
                  <option value="">All salespeople</option>
                  {me.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </div>
          </div>
          {isLoading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState title="No records found" description="No receipts match this period and these filters." />
          ) : (
            <div className={table.wrap}>
              <table className={`${table.table} min-w-[960px]`}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Receipt date</th>
                    <th className={table.th}>Client</th>
                    {me?.isCEO && <th className={table.th}>Salesperson</th>}
                    <th className={table.th}>Service / type</th>
                    <th className={table.th}>Deal / invoice / payment ref</th>
                    <th className={`${table.th} text-right`}>MSP fee (R)</th>
                    <th className={table.th}>Notes</th>
                    <th className={table.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className={table.tr}>
                      <td className={`${table.td} whitespace-nowrap`}>
                        {p.receipt_date ? fmtDate(p.receipt_date) : <StatusBadge value="Dates pending" />}
                        <div className="text-xs text-muted-foreground">{monthLabel(p.revenue_month)}</div>
                      </td>
                      <td className={`${table.td} font-medium`}>{p.client}</td>
                      {me?.isCEO && <td className={table.td}>{p.salesperson_name}</td>}
                      <td className={table.td}>{p.service || "—"}<div className="text-xs text-muted-foreground">{p.receipt_type || ""}</div></td>
                      <td className={`${table.td} text-xs`}>
                        <div>{p.deal_ref || "—"}</div>
                        <div className="text-muted-foreground">{[p.invoice_ref, p.payment_ref].filter(Boolean).join(" · ")}</div>
                      </td>
                      <td className={`${table.td} text-right font-medium tabular-nums ${Number(p.amount) < 0 ? "text-destructive" : ""}`}>{zar(p.amount, { cents: true })}</td>
                      <td className={`${table.td} max-w-[240px] text-muted-foreground`}>{p.notes || "—"}</td>
                      <td className={`${table.td} whitespace-nowrap text-right`}>
                        {(me?.isCEO || !p.receipt_date) && (
                          <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>{me?.isCEO ? "Edit" : "Add date"}</Button>
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
      <PaymentForm open={adding} onOpenChange={setAdding} />
      <PaymentForm open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)} payment={editing ?? undefined} />
    </Page>
  );
}
