/**
 * HR → Leave Management. HR approves, declines or asks for more information on leave
 * applications (public.leave_requests). Every decision is kept in the employee's HR folder
 * and in the audit history. Server: /api/staff/hr/leave.
 */
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, FolderOpen, Loader2, Search } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hrApi } from "@/components/hr/MyHrDocuments";
import { StatCard, StatGrid, selectClass } from "@/components/layout/page";
import { LeaveStatusBadge, type LeaveRequest } from "@/components/hr/LeaveShared";
import { confirmAction } from "@/lib/confirm";

const fmt = (d?: string | null) => (d ? format(parseISO(d), "d MMM yyyy") : "—");
type Filter = "open" | "pending" | "info_requested" | "approved" | "declined" | "all";

export function HrLeavePage() {
  const q = useQuery({ queryKey: ["hr", "leave"], queryFn: async () => (await hrApi("/api/staff/hr/leave")) as { requests: LeaveRequest[]; canManage: boolean } });
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const all = q.data?.requests ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter(
      (r) =>
        (filter === "all" || (filter === "open" ? r.status === "pending" || r.status === "info_requested" : r.status === filter)) &&
        (!s || [r.employee_name, r.leave_type, r.department].some((v) => String(v ?? "").toLowerCase().includes(s))),
    );
  }, [all, filter, search]);
  const onLeave = all.filter((r) => r.status === "approved" && r.start_date <= today && r.end_date >= today);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground">HR workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Leave Management</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Employees apply under My Leave. Approve, decline or ask for more information; the employee is notified and the decision is kept in their HR folder.
        </p>
      </div>

      <StatGrid>
        <StatCard label="Awaiting HR" value={all.filter((r) => r.status === "pending").length} tone={all.some((r) => r.status === "pending") ? "warning" : "default"} active={filter === "pending"} onClick={() => setFilter("pending")} />
        <StatCard label="Waiting on employee" value={all.filter((r) => r.status === "info_requested").length} active={filter === "info_requested"} onClick={() => setFilter("info_requested")} />
        <StatCard label="On leave today" value={onLeave.length} active={filter === "approved"} onClick={() => setFilter("approved")} />
        <StatCard label="Declined" value={all.filter((r) => r.status === "declined").length} active={filter === "declined"} onClick={() => setFilter("declined")} />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, type or department" className="h-9 w-72 pl-8" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className={selectClass} aria-label="Status">
          <option value="open">Open (awaiting HR or employee)</option>
          <option value="pending">Awaiting HR</option>
          <option value="info_requested">More information requested</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="all">All applications</option>
        </select>
      </div>

      {q.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : q.error ? (
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error).message}</Card>
      ) : !rows.length ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">{all.length ? "No applications match these filters." : "No leave applications yet."}</Card>
      ) : (
        <Card className="divide-y divide-border">
          {rows.map((r) => <LeaveRow key={r.id} r={r} canManage={Boolean(q.data?.canManage)} />)}
        </Card>
      )}
    </div>
  );
}

function LeaveRow({ r, canManage }: { r: LeaveRequest; canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(r.status === "pending");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const decided = r.status === "approved" || r.status === "declined";
  const act = async (action: "approve" | "decline" | "request_info") => {
    setBusy(true);
    try {
      await hrApi(`/api/staff/hr/leave/${r.id}`, { method: "PATCH", body: JSON.stringify({ action, note, reopen: decided }) });
      toast.success(action === "approve" ? "Leave approved" : action === "decline" ? "Leave declined" : "Question sent to the employee");
      setNote("");
      await qc.invalidateQueries({ queryKey: ["hr"] });
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
          <p className="font-medium">{r.employee_name ?? "Former employee"} <span className="font-normal text-muted-foreground">· {r.department ?? "—"}</span></p>
          <p className="text-xs text-muted-foreground">
            {r.leave_type ?? "Leave"} · {fmt(r.start_date)} – {fmt(r.end_date)}
            {r.days ? ` · ${r.days} working day${r.days === 1 ? "" : "s"}` : ""} · applied {fmt(r.created_at.slice(0, 10))}
          </p>
        </div>
        <LeaveStatusBadge status={r.status} />
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen((v) => !v)}>{open ? "Close" : r.status === "pending" ? "Review" : "Details"}</Button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
          {r.reason && <p><span className="font-medium">Reason:</span> {r.reason}</p>}
          {r.hr_note && <p><span className="font-medium">HR note:</span> {r.hr_note}</p>}
          {r.employee_response && <p><span className="font-medium">Employee's answer:</span> {r.employee_response}</p>}
          {r.reviewed_by_name && <p className="text-muted-foreground">Last decision by {r.reviewed_by_name} on {fmt(r.reviewed_at?.slice(0, 10))}</p>}
          <a href={`/hr/documents?employee=${r.user_id}`} className="inline-flex items-center gap-1 text-primary underline"><FolderOpen className="h-3.5 w-3.5" /> Open HR folder</a>
          {canManage && (
            <div className="flex flex-wrap items-end gap-2 pt-1">
              <div className="min-w-[16rem] flex-1">
                <Label className="text-xs" htmlFor={`ln-${r.id}`}>Note to the employee (required to decline or ask a question)</Label>
                <Input id={`ln-${r.id}`} value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs" />
              </div>
              {r.status !== "approved" && <Button size="sm" className="h-8 text-xs" disabled={busy} onClick={() => act("approve")}>Approve</Button>}
              {!decided && <Button size="sm" variant="outline" className="h-8 text-xs" disabled={busy || !note.trim()} onClick={() => act("request_info")}>Ask for more information</Button>}
              {r.status !== "declined" && (
                <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600" disabled={busy || !note.trim()} onClick={async () => { if (!decided || (await confirmAction({ title: "Decline an approved application?", description: "This changes an approved leave application to declined. The employee will see the new status and your note.", confirmText: "Decline", variant: "destructive" }))) act("decline"); }}>Decline</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
