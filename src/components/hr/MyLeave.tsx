/**
 * My Leave (every employee). Apply for leave, follow its status, answer HR's questions and
 * withdraw an application HR has not decided yet. Server: /api/staff/leave (own records only).
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CalendarDays, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hrApi } from "@/components/hr/MyHrDocuments";
import { LeaveStatusBadge, type LeaveRequest } from "@/components/hr/LeaveShared";
import { LEAVE_TYPES, workingDays } from "@/lib/hr-shared";

const fmt = (d?: string | null) => (d ? format(parseISO(d), "d MMM yyyy") : "—");
const KEY = ["leave", "mine"];

export function MyLeavePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: async () => (await hrApi("/api/staff/leave/mine")) as { requests: LeaveRequest[] } });
  const [type, setType] = useState<string>(LEAVE_TYPES[0]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const days = start && end && end >= start ? workingDays(start, end) : 0;
  const year = new Date().getFullYear().toString();
  const approvedThisYear = (q.data?.requests ?? []).filter((r) => r.status === "approved" && r.start_date.startsWith(year));

  const apply = async () => {
    setBusy(true);
    try {
      await hrApi("/api/staff/leave", { method: "POST", body: JSON.stringify({ leaveType: type, startDate: start, endDate: end, reason }) });
      toast.success("Leave application sent to HR");
      setStart("");
      setEnd("");
      setReason("");
      await qc.invalidateQueries({ queryKey: KEY });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><CalendarDays className="h-6 w-6 text-primary" /> My Leave</h1>
        <p className="mt-1 text-sm text-muted-foreground">Apply for leave and follow HR's decision. Only you and HR can see your applications.</p>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-semibold">Apply for leave</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="lv-type">Type of leave</Label>
            <select id="lv-type" value={type} onChange={(e) => setType(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="lv-start">First day</Label>
            <Input id="lv-start" type="date" value={start} onChange={(e) => { setStart(e.target.value); if (!end || end < e.target.value) setEnd(e.target.value); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="lv-end">Last day</Label>
            <Input id="lv-end" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="lv-reason">Reason</Label>
          <Textarea id="lv-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family holiday, medical appointment" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={apply} disabled={busy || !start || !end || end < start || !days || !reason.trim()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send to HR
          </Button>
          {start && end && end >= start && <span className="text-xs text-muted-foreground">{days} working day{days === 1 ? "" : "s"} (weekends excluded)</span>}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">My applications</h2>
        <span className="text-xs text-muted-foreground">Approved in {year}: {approvedThisYear.reduce((n, r) => n + (r.days ?? 0), 0)} working days</span>
      </div>
      {q.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : q.error ? (
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error).message}</Card>
      ) : !q.data?.requests.length ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">You have not applied for leave yet.</Card>
      ) : (
        <Card className="divide-y divide-border">
          {q.data.requests.map((r) => <MyLeaveRow key={r.id} r={r} />)}
        </Card>
      )}
    </div>
  );
}

function MyLeaveRow({ r }: { r: LeaveRequest }) {
  const qc = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const call = async (init: RequestInit, ok: string) => {
    setBusy(true);
    try {
      await hrApi(`/api/staff/leave/mine/${r.id}`, init);
      toast.success(ok);
      await qc.invalidateQueries({ queryKey: KEY });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{r.leave_type ?? "Leave"} · {fmt(r.start_date)} – {fmt(r.end_date)}</p>
          <p className="text-xs text-muted-foreground">
            {r.days ? `${r.days} working day${r.days === 1 ? "" : "s"} · ` : ""}applied {fmt(r.created_at.slice(0, 10))}
            {r.reviewed_by_name && (r.status === "approved" || r.status === "declined") ? ` · ${r.status} by ${r.reviewed_by_name}` : ""}
          </p>
        </div>
        <LeaveStatusBadge status={r.status} />
        {(r.status === "pending" || r.status === "info_requested") && (
          <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-600" disabled={busy} onClick={() => confirm("Withdraw this leave application?") && call({ method: "DELETE" }, "Application withdrawn")}>Withdraw</Button>
        )}
      </div>
      {r.hr_note && (
        <p className={`mt-2 flex gap-2 rounded-md border p-2 text-xs ${r.status === "info_requested" ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/30"}`}>
          {r.status === "info_requested" && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />} HR: {r.hr_note}
        </p>
      )}
      {r.status === "info_requested" && (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="min-w-[16rem] flex-1">
            <Label className="text-xs" htmlFor={`ans-${r.id}`}>Your answer</Label>
            <Input id={`ans-${r.id}`} value={answer} onChange={(e) => setAnswer(e.target.value)} className="h-8 text-xs" />
          </div>
          <Button size="sm" className="h-8 text-xs" disabled={busy || !answer.trim()} onClick={() => call({ method: "PATCH", body: JSON.stringify({ response: answer }) }, "Sent to HR")}>Send to HR</Button>
        </div>
      )}
    </div>
  );
}
