import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, table } from "@/components/layout/page";
import { ArenaGate, ArenaNav, FieldRow, Loading, MonthSelect, inputClass } from "@/components/sales-arena/ArenaUI";
import { fmtDate, fmtDateTime, monthLabel, useArenaMe, useArenaMutation, useArenaQuery, zar } from "@/lib/sales-arena-api";
import { todayZA } from "@/lib/sales-arena-shared";

export const Route = createFileRoute("/_authenticated/sales-arena/targets")({
  head: () => ({ meta: [{ title: "Team targets — Sales Arena" }] }),
  component: TargetsPage,
});

function TargetsPage() {
  const { data: me } = useArenaMe();
  const [month, setMonth] = useState(todayZA().slice(0, 7));
  const { data, isLoading, error } = useArenaQuery<any>(["targets", month], `/targets?month=${month}`);
  return (
    <Page>
      <PageHeader
        eyebrow="Sales Arena"
        title={me?.isCEO ? "Team targets" : "My targets"}
        description="Enter monthly cash targets only. Daily target = monthly ÷ Mon–Fri working days in the month; weekly target = daily × working days of that week inside the month. Public holidays are not excluded."
        actions={<MonthSelect value={month} onChange={setMonth} />}
      />
      <ArenaNav />
      <ArenaGate error={error}>
        {isLoading || !data ? <Loading /> : me?.isCEO ? <CeoTargets data={data} month={month} /> : <MyTargets data={data} month={month} />}
      </ArenaGate>
    </Page>
  );
}

function WeeklyPlan({ plan, columns }: { plan: any[]; columns: { id: string; name: string }[] }) {
  return (
    <div className={table.wrap}>
      <table className={`${table.table} min-w-[640px]`}>
        <thead className={table.thead}>
          <tr>
            <th className={table.th}>Week</th>
            <th className={`${table.th} text-right`}>Working days</th>
            <th className={`${table.th} text-right`}>{columns.length ? "Company" : "My target"}</th>
            {columns.map((c) => <th key={c.id} className={`${table.th} text-right`}>{c.name.split(" ")[0]}</th>)}
          </tr>
        </thead>
        <tbody>
          {plan.map((w) => (
            <tr key={w.from} className={table.tr}>
              <td className={table.td}>{fmtDate(w.from)} – {fmtDate(w.to)}</td>
              <td className={`${table.td} text-right tabular-nums`}>{w.workdays}</td>
              <td className={`${table.td} text-right tabular-nums`}>{zar(w.company)}</td>
              {columns.map((c) => <td key={c.id} className={`${table.td} text-right tabular-nums`}>{zar(w.people?.[c.id] ?? 0)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MyTargets({ data, month }: { data: any; month: string }) {
  const p = data.people[0];
  return (
    <>
      <StatGrid cols={3}>
        <StatCard label={`Monthly target · ${monthLabel(month)}`} value={p.monthly ? zar(p.monthly) : "Not set"} />
        <StatCard label="This week's target" value={zar(p.week)} hint={`${data.period.workdaysInWeek} working day(s) this week in the month`} />
        <StatCard label="Daily target" value={zar(p.dailyRate)} hint={`${data.period.workdaysInMonth} working days in the month`} />
      </StatGrid>
      {data.setterTargets.length > 0 && (
        <StatGrid cols={2}>
          {data.setterTargets.map((t: any) => <StatCard key={t.kind} label={t.kind === "daily_calls" ? "Daily call target" : "Daily booking target"} value={t.amount} />)}
        </StatGrid>
      )}
      <Section title="Week-by-week plan">
        <WeeklyPlan plan={data.weeklyPlan} columns={[]} />
      </Section>
    </>
  );
}

function CeoTargets({ data, month }: { data: any; month: string }) {
  const save = useArenaMutation("PUT");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [company, setCompany] = useState("");
  const [setterVals, setSetterVals] = useState<Record<string, string>>({});
  const [personDlg, setPersonDlg] = useState<any>(null);
  const { data: hist } = useArenaQuery<any>(["targets-history", month], `/targets/history?month=${month}`);
  useEffect(() => {
    setVals(Object.fromEntries(data.people.map((p: any) => [p.id, p.monthly ? String(p.monthly) : ""])));
    setCompany(data.company.explicitAmount ? String(data.company.explicitAmount) : "");
    setSetterVals(Object.fromEntries(data.setterTargets.map((t: any) => [`${t.salesperson_id}:${t.kind}`, String(t.amount)])));
  }, [data]);
  const people = data.people as any[];
  const dirty =
    people.some((p) => (vals[p.id] ?? "") !== (p.monthly ? String(p.monthly) : "")) ||
    company !== (data.company.explicitAmount ? String(data.company.explicitAmount) : "") ||
    Object.entries(setterVals).some(([k, v]) => v !== String(data.setterTargets.find((t: any) => `${t.salesperson_id}:${t.kind}` === k)?.amount ?? ""));
  const submit = async () => {
    try {
      const r: any = await save.mutateAsync({
        path: "/targets",
        body: {
          month,
          company: company === "" ? 0 : company,
          people: people.map((p) => ({ id: p.id, amount: vals[p.id] === "" || vals[p.id] === undefined ? 0 : vals[p.id] })),
          setterTargets: Object.entries(setterVals).filter(([, v]) => v !== "").map(([k, v]) => {
            const [salesperson_id, kind] = k.split(":");
            return { salesperson_id, kind, amount: Number(v) };
          }),
        },
      });
      toast.success(r.changed ? `${r.changed} target(s) saved for ${monthLabel(month)}` : "No changes");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <StatGrid cols={4}>
        <StatCard label="Company monthly target" value={zar(data.company.total)} hint={data.company.isExplicit ? "Set separately" : "Sum of individual targets"} />
        <StatCard label="Assigned to team" value={zar(data.company.assigned)} />
        <StatCard label="Unassigned target" value={zar(data.company.unassigned)} hint={data.company.unassigned ? "Company target not allocated to salespeople" : undefined} />
        <StatCard label={`Working days · ${monthLabel(month)}`} value={data.period.workdaysInMonth} hint={`Company daily ${zar(data.company.dailyRate)} · this week ${zar(data.company.week)}`} />
      </StatGrid>
      <Section
        title="Salespeople and monthly cash targets"
        description={`Changes are saved for ${monthLabel(month)} and recorded with who changed them and when.`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPersonDlg({})}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add salesperson</Button>
            <Button size="sm" onClick={submit} disabled={!dirty || save.isPending}>{save.isPending ? "Saving…" : "Save targets"}</Button>
          </div>
        }
      >
        {people.length === 0 ? (
          <EmptyState title="No salespeople yet" description="Add the salespeople whose cash collections should be tracked." />
        ) : (
          <div className={table.wrap}>
            <table className={`${table.table} min-w-[860px]`}>
              <thead className={table.thead}>
                <tr>
                  <th className={table.th}>Salesperson</th>
                  <th className={table.th}>Monthly cash target (R)</th>
                  <th className={`${table.th} text-right`}>This week</th>
                  <th className={`${table.th} text-right`}>Daily</th>
                  <th className={table.th}>Setter daily calls / bookings</th>
                  <th className={table.th}></th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} className={`${table.tr} ${p.is_active ? "" : "opacity-60"}`}>
                    <td className={table.td}>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.is_active ? (p.is_setter ? "Closer & lead setter" : "Closer") : "Inactive"}</div>
                    </td>
                    <td className={table.td}>
                      <input className={`${inputClass} max-w-[160px]`} inputMode="decimal" value={vals[p.id] ?? ""} placeholder="0" onChange={(e) => setVals({ ...vals, [p.id]: e.target.value })} />
                    </td>
                    <td className={`${table.td} text-right tabular-nums`}>{zar(p.week)}</td>
                    <td className={`${table.td} text-right tabular-nums`}>{zar(p.dailyRate)}</td>
                    <td className={table.td}>
                      {p.is_setter ? (
                        <div className="flex gap-2">
                          {["daily_calls", "daily_bookings"].map((k) => (
                            <input key={k} className={`${inputClass} w-20`} inputMode="numeric" aria-label={k} placeholder={k === "daily_calls" ? "Calls" : "Bookings"} value={setterVals[`${p.id}:${k}`] ?? ""} onChange={(e) => setSetterVals({ ...setterVals, [`${p.id}:${k}`]: e.target.value })} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className={`${table.td} text-right`}>
                      <Button size="sm" variant="ghost" onClick={() => setPersonDlg(p)}>Edit</Button>
                    </td>
                  </tr>
                ))}
                <tr className={table.tr}>
                  <td className={`${table.td} font-medium`}>Company target (optional)</td>
                  <td className={table.td}>
                    <input className={`${inputClass} max-w-[160px]`} inputMode="decimal" value={company} placeholder={`Sum: ${data.company.assigned}`} onChange={(e) => setCompany(e.target.value)} />
                  </td>
                  <td className={table.td} colSpan={4}>
                    <span className="text-xs text-muted-foreground">Leave blank to use the sum of individual targets. Only set it if MSP has a separate overall goal.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Section>
      <Section title="Week-by-week target plan">
        <WeeklyPlan plan={data.weeklyPlan} columns={people.filter((p) => p.monthly).map((p) => ({ id: p.id, name: p.name }))} />
      </Section>
      <Section title="Target change history" description={`Changes to ${monthLabel(month)} targets.`}>
        {!hist?.history?.length ? (
          <EmptyState title="No target changes recorded" />
        ) : (
          <ul className="space-y-2 text-sm">
            {hist.history.map((h: any) => (
              <li key={h.id} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <span>
                  {h.after?.salesperson}: {h.before ? `${zar(h.before.amount)} → ` : "set to "}
                  {h.after?.kind === "cash" ? zar(h.after.amount) : `${h.after?.amount} ${h.after?.kind === "daily_calls" ? "calls/day" : "bookings/day"}`}
                </span>
                <span className="text-xs text-muted-foreground">{h.actor_name} · {fmtDateTime(h.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <PersonDialog person={personDlg} onClose={() => setPersonDlg(null)} />
    </>
  );
}

function PersonDialog({ person, onClose }: { person: any; onClose: () => void }) {
  const open = Boolean(person);
  const isNew = open && !person?.id;
  const create = useArenaMutation("POST");
  const update = useArenaMutation("PATCH");
  const { data } = useArenaQuery<any>(["people-admin"], open ? "/people" : null);
  const [f, setF] = useState<any>({});
  useEffect(() => {
    if (!open) return;
    const linked = data?.people?.find((x: any) => x.id === person.id);
    setF({ display_name: person.name ?? "", profile_id: linked?.profile_id ?? "", is_setter: Boolean(person.is_setter), is_closer: linked ? linked.is_closer : true, is_active: person.is_active ?? true });
  }, [open, person, data]);
  const save = async () => {
    try {
      const body = { ...f, profile_id: f.profile_id || null };
      if (isNew) await create.mutateAsync({ path: "/people", body });
      else await update.mutateAsync({ path: `/people/${person.id}`, body });
      toast.success(isNew ? "Salesperson added" : "Salesperson updated");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add salesperson" : `Edit ${person?.name}`}</DialogTitle>
          <DialogDescription>Linking a portal account lets that person see their own Sales Arena figures — never anyone else's.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FieldRow label="Name *"><input className={inputClass} value={f.display_name ?? ""} onChange={(e) => setF({ ...f, display_name: e.target.value })} /></FieldRow>
          <FieldRow label="Portal account" hint="Optional. Leave blank for someone without a portal login.">
            <select className={inputClass} value={f.profile_id ?? ""} onChange={(e) => setF({ ...f, profile_id: e.target.value })}>
              <option value="">No portal account</option>
              {(data?.profiles ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
            </select>
          </FieldRow>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(f.is_closer)} onChange={(e) => setF({ ...f, is_closer: e.target.checked })} /> Closer (credited with receipts)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(f.is_setter)} onChange={(e) => setF({ ...f, is_setter: e.target.checked })} /> Lead setter</label>
            {!isNew && <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(f.is_active)} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Active</label>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={create.isPending || update.isPending || !(f.display_name ?? "").trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
