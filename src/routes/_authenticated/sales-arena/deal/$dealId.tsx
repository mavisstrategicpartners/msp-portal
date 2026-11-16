import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarCheck, ExternalLink, Pencil, Phone, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, table } from "@/components/layout/page";
import { ArenaGate, Loading, StatusBadge } from "@/components/sales-arena/ArenaUI";
import { DealForm } from "@/components/sales-arena/DealForm";
import { ActivityForm, FollowUpDialog, MagnetForm, PaymentForm } from "@/components/sales-arena/Forms";
import { fmtDate, fmtDateTime, useArenaMe, useArenaQuery, zar } from "@/lib/sales-arena-api";

export const Route = createFileRoute("/_authenticated/sales-arena/deal/$dealId")({
  head: () => ({ meta: [{ title: "Deal — Sales Arena" }] }),
  component: DealPage,
});

const HISTORY_LABELS: Record<string, string> = {
  created: "Deal created", updated: "Details updated", follow_up_completed: "Follow-up completed",
};
function describe(h: any) {
  if (h.action.startsWith("stage:")) return h.action.replace("stage:", "Stage changed:");
  if (h.action === "follow_up_completed") return `Follow-up completed${h.after?.outcome ? ` — ${h.after.outcome}` : ""}${h.after?.next_follow_up ? `; next on ${fmtDate(h.after.next_follow_up)}` : ""}`;
  const fields = Object.keys(h.after ?? {}).filter((k) => !["updated_by", "created_by"].includes(k));
  return `${HISTORY_LABELS[h.action] ?? h.action}${h.action === "updated" && fields.length ? `: ${fields.map((f) => f.replace(/_/g, " ")).join(", ")}` : ""}`;
}

function DealPage() {
  const { dealId } = Route.useParams();
  const { data: me } = useArenaMe();
  const { data, isLoading, error } = useArenaQuery<any>(["deal", dealId], `/opportunities/${dealId}`);
  const [edit, setEdit] = useState(false);
  const [fu, setFu] = useState(false);
  const [act, setAct] = useState(false);
  const [pay, setPay] = useState(false);
  const [mag, setMag] = useState(false);
  const o = data?.opportunity;
  const cash = (data?.payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  return (
    <Page>
      <PageHeader
        eyebrow={
          <Link to="/sales-arena/pipeline" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Pipeline
          </Link>
        }
        title={o ? o.company : "Deal"}
        description={o ? `${o.deal_ref}${o.contact_name ? ` · ${o.contact_name}` : ""}${o.salesperson_name ? ` · Salesperson: ${o.salesperson_name}` : ""}${o.setter_name ? ` · Lead setter: ${o.setter_name}` : ""}` : undefined}
        actions={
          o && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setFu(true)}><CalendarCheck className="mr-1.5 h-4 w-4" /> Complete follow-up</Button>
              <Button variant="outline" onClick={() => setEdit(true)}><Pencil className="mr-1.5 h-4 w-4" /> Edit</Button>
            </div>
          )
        }
      />
      <ArenaGate error={(error as any)?.status === 404 ? Object.assign(new Error("This deal does not exist or is not assigned to you."), { status: 403 }) : error}>
        {isLoading || !o ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={o.stage} />
              <StatusBadge value={o.follow_up_status} />
              {o.ghl_url && (
                <a href={o.ghl_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  GoHighLevel opportunity <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <StatGrid cols={4}>
              <StatCard label="Quoted MSP fee" value={o.quoted_fee != null ? zar(o.quoted_fee) : "—"} hint="Quotation, not income" />
              <StatCard label="Signed contract value" value={o.signed_value != null ? zar(o.signed_value) : "—"} hint="Signed value, not income" />
              <StatCard label={me?.isCEO ? "Cash received" : "Cash received (credited to you)"} value={zar(cash)} hint={`${data.payments.length} receipt(s)`} />
              <StatCard label="Next follow-up" value={o.next_follow_up ? fmtDate(o.next_follow_up) : "Not set"} hint={o.next_action || undefined} />
            </StatGrid>
            <div className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
              <Section title="Details" className="lg:col-span-1">
                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Phone", o.phone], ["Email", o.email], ["Industry", o.industry], ["Service", o.service], ["Lead source", o.lead_source],
                    ["Date received", o.received_date ? fmtDate(o.received_date) : null], ["Expected close", o.expected_close ? fmtDate(o.expected_close) : null],
                    ["Contacted by", o.contacted_by], ["Contact date", o.contact_date ? fmtDate(o.contact_date) : null], ["Website", o.website], ["Location", o.location],
                    ...(o.stage === "Lost" ? [["Lost reason", o.lost_reason]] : []),
                  ].map(([k, v]) => (
                    <div key={k as string} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="break-words text-foreground">{v || <span className="text-muted-foreground">Not recorded</span>}</dd>
                    </div>
                  ))}
                </dl>
                {o.notes && <p className="mt-4 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm text-foreground">{o.notes}</p>}
              </Section>
              <div className="grid gap-4 lg:col-span-2 [&>*]:min-w-0 min-w-0">
                <Section
                  title="Contact attempts"
                  description="Every call, WhatsApp or email against this deal ID."
                  actions={<Button size="sm" variant="outline" onClick={() => setAct(true)}><Phone className="mr-1.5 h-3.5 w-3.5" /> Log attempt</Button>}
                >
                  {data.activities.length === 0 ? (
                    <EmptyState title="No contact attempts recorded" />
                  ) : (
                    <ul className="divide-y divide-border">
                      {data.activities.map((a: any) => (
                        <li key={a.id} className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <span className="font-medium">{a.activity_type} · {a.result}</span>
                            {a.qualified && <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-300">Qualified</span>}
                            {a.meeting_booked && <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-300">Meeting booked{a.appointment_at ? ` ${fmtDateTime(a.appointment_at)}` : ""}</span>}
                            {a.notes && <div className="text-xs text-muted-foreground">{a.notes}</div>}
                          </div>
                          <div className="shrink-0 text-xs text-muted-foreground">
                            {a.activity_at ? fmtDateTime(a.activity_at) : `Date pending (${String(a.activity_month).slice(0, 7)})`} · {a.setter_name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                <Section
                  title="Payments received"
                  description={me?.isCEO ? "Actual receipts recorded against this deal ID." : "Receipts credited to you against this deal ID."}
                  actions={<Button size="sm" variant="outline" onClick={() => setPay(true)}><Receipt className="mr-1.5 h-3.5 w-3.5" /> Record payment</Button>}
                >
                  {data.payments.length === 0 ? (
                    <EmptyState title="No receipts recorded" />
                  ) : (
                    <div className={table.wrap}>
                      <table className={table.table}>
                        <thead className={table.thead}>
                          <tr>
                            <th className={table.th}>Receipt date</th>
                            <th className={table.th}>Type</th>
                            <th className={table.th}>Reference</th>
                            <th className={`${table.th} text-right`}>MSP fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.payments.map((p: any) => (
                            <tr key={p.id} className={table.tr}>
                              <td className={table.td}>{p.receipt_date ? fmtDate(p.receipt_date) : <StatusBadge value="Dates pending" />}</td>
                              <td className={table.td}>{p.receipt_type || "—"}</td>
                              <td className={table.td}>{p.payment_ref || p.invoice_ref || "—"}</td>
                              <td className={`${table.td} text-right tabular-nums`}>{zar(p.amount, { cents: true })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                <Section
                  title="Competitor analyses & growth audits"
                  actions={<Button size="sm" variant="outline" onClick={() => setMag(true)}><FileText className="mr-1.5 h-3.5 w-3.5" /> Request report</Button>}
                >
                  {data.leadMagnets.length === 0 ? (
                    <EmptyState title="No reports for this deal" />
                  ) : (
                    <ul className="divide-y divide-border">
                      {data.leadMagnets.map((m: any) => (
                        <li key={m.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                          <span>{m.report_type}{m.prepared_by_name ? ` · prepared by ${m.prepared_by_name}` : ""}</span>
                          <StatusBadge value={m.delivery_status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                <Section title="Change history" description="Who changed what, and when.">
                  {data.history.length === 0 ? (
                    <EmptyState title="No changes recorded" />
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.history.map((h: any) => (
                        <li key={h.id} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                          <span className="text-foreground">{describe(h)}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{h.actor_name ?? "—"} · {fmtDateTime(h.at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>
            </div>
            <DealForm open={edit} onOpenChange={setEdit} deal={o} />
            <FollowUpDialog open={fu} onOpenChange={setFu} deal={o} />
            <ActivityForm open={act} onOpenChange={setAct} preset={{ deal_ref: o.deal_ref, company: o.company, closer_id: o.salesperson_id }} />
            <PaymentForm open={pay} onOpenChange={setPay} preset={{ deal_ref: o.deal_ref, client: o.company, service: o.service, salesperson_id: o.salesperson_id }} />
            <MagnetForm open={mag} onOpenChange={setMag} preset={{ deal_ref: o.deal_ref, company: o.company, sales_owner_id: o.salesperson_id }} />
          </>
        )}
      </ArenaGate>
    </Page>
  );
}
