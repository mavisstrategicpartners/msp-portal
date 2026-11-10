/**
 * Building blocks for the CEO executive pages. Everything here renders data
 * from /api/executive; nothing is hard-coded.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock,
  FileCheck2,
  Info,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateFollowUp, useExecutiveOverview, useUpdateFollowUp } from "@/lib/executive.service";
import type {
  DepartmentScorecard,
  ExecEvidence,
  ExecPerson,
  ExecTask,
  ExecutiveOverview,
  FeedItem,
  FollowUp,
} from "@/lib/executive.types";

// ── Formatting ───────────────────────────────────────────────────────────────
export const zar = (n: number) =>
  `R${Math.round(n).toLocaleString("en-ZA").replace(/,/g, " ")}`;

export function relTime(iso?: string | null) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

// ── Page scaffolding ─────────────────────────────────────────────────────────
export function useOverview() {
  return useExecutiveOverview();
}

export function OverviewGate({
  children,
}: {
  children: (data: ExecutiveOverview) => ReactNode;
}) {
  const { data, isLoading, error, refetch, isFetching } = useOverview();
  if (isLoading)
    return (
      <div className="flex items-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading company-wide data…
      </div>
    );
  if (error || !data)
    return (
      <Card className="p-6 border-rose-500/30 bg-rose-500/5 space-y-3">
        <p className="text-sm font-semibold text-foreground">The executive view could not be loaded.</p>
        <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try again
        </Button>
      </Card>
    );
  return <>{children(data)}</>;
}

export function ExecHeader({
  title,
  subtitle,
  data,
  actions,
}: {
  title: string;
  subtitle: string;
  data?: ExecutiveOverview;
  actions?: ReactNode;
}) {
  const { refetch, isFetching } = useOverview();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {data && (
          <span className="text-[11px] text-muted-foreground">
            Live data · updated {relTime(data.generatedAt)}
          </span>
        )}
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
        {actions}
      </div>
    </div>
  );
}

export function ReadOnlyNote() {
  return (
    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
      <ShieldAlert className="h-3.5 w-3.5" />
      Executive view: you can see every department's records. Approvals, reviews and financial actions
      stay with the responsible managers; use a follow-up to ask for action.
    </p>
  );
}

// ── Status & KPIs ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  attention: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  watch: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "on-track": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "no-activity": "bg-muted text-muted-foreground border-border",
};
const STATUS_LABEL: Record<string, string> = {
  attention: "Needs attention",
  watch: "Watch",
  "on-track": "On track",
  "no-activity": "No activity recorded",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold whitespace-nowrap shrink-0 ${STATUS_STYLE[status] || ""}`}>
      {STATUS_LABEL[status] || status}
    </Badge>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone,
  to,
  search,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "bad" | "warn" | "good";
  to?: string;
  search?: Record<string, string>;
}) {
  const color =
    tone === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "good"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-foreground";
  const body = (
    <Card className="p-4 h-full border-border bg-card hover:border-primary/40 transition">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </Card>
  );
  return to ? (
    <Link to={to as any} search={search as any} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────────────
const SEV_ICON = {
  critical: <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />,
  warning: <Clock className="h-4 w-4 text-amber-500 shrink-0" />,
  info: <Info className="h-4 w-4 text-sky-500 shrink-0" />,
};

export function FeedList({ items, limit, empty }: { items: FeedItem[]; limit?: number; empty?: string }) {
  const [showAll, setShowAll] = useState(false);
  const shown = limit && !showAll ? items.slice(0, limit) : items;
  if (!items.length) return <Empty>{empty || "Nothing needs your attention right now."}</Empty>;
  return (
    <div className="space-y-1.5">
      {shown.map((f) => {
        const [path, query] = f.link.split("?");
        const search = Object.fromEntries(new URLSearchParams(query || ""));
        return (
          <Link
            key={f.id}
            to={path as any}
            search={search as any}
            className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/40 hover:bg-muted/30 transition"
          >
            {SEV_ICON[f.severity]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground leading-snug">{f.title}</p>
              {f.detail && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{f.detail}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {f.at && <span className="text-[10px] text-muted-foreground">{relTime(f.at)}</span>}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
      {limit && items.length > limit && (
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer" : `Show all ${items.length}`}
        </Button>
      )}
    </div>
  );
}

// ── Departments ──────────────────────────────────────────────────────────────
export function pct(v: number | null) {
  return v === null ? "—" : `${v}%`;
}

export function DepartmentGrid({
  departments,
  includeInactive = false,
}: {
  departments: DepartmentScorecard[];
  includeInactive?: boolean;
}) {
  const active = departments.filter((d) => d.status !== "no-activity");
  const inactive = departments.filter((d) => d.status === "no-activity");
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {active.map((d) => (
          <Link
            key={d.key}
            to="/ceo/departments"
            search={{ dept: d.key } as any}
            className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {d.leads.length ? d.leads.map((l) => l.name).join(", ") : "No lead on record"} · {d.members}{" "}
                  {d.members === 1 ? "person" : "people"}
                </p>
              </div>
              <StatusPill status={d.status} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <Stat label="Open" value={d.tasksOpen} />
              <Stat label="Overdue" value={d.tasksOverdue} bad={d.tasksOverdue > 0} />
              <Stat label="In review" value={d.awaitingReview} warn={d.awaitingReview > 0} />
              <Stat label="Done" value={pct(d.completionRate)} />
            </div>
            {d.statusReasons.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">{d.statusReasons.join(" · ")}</p>
            )}
          </Link>
        ))}
      </div>
      {inactive.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          No portal activity recorded yet for:{" "}
          {inactive.map((d, i) => (
            <span key={d.key}>
              {i > 0 && ", "}
              {includeInactive ? (
                <Link to="/ceo/departments" search={{ dept: d.key } as any} className="underline hover:text-foreground">
                  {d.name}
                </Link>
              ) : (
                d.name
              )}
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, bad, warn }: { label: string; value: ReactNode; bad?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-md bg-muted/40 py-1.5">
      <p
        className={`text-sm font-bold ${
          bad ? "text-rose-600 dark:text-rose-400" : warn ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Tasks & evidence ─────────────────────────────────────────────────────────
const TASK_STATUS_STYLE: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Submitted for Review": "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  "Changes Requested": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Blocked: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${TASK_STATUS_STYLE[status] || ""}`}>
      {status}
    </Badge>
  );
}

export function TaskTable({
  tasks,
  onOpenEvidence,
  onFollowUp,
  showDepartment = true,
  empty = "No tasks match.",
}: {
  tasks: ExecTask[];
  onOpenEvidence?: (id: string) => void;
  onFollowUp?: (t: ExecTask) => void;
  showDepartment?: boolean;
  empty?: string;
}) {
  if (!tasks.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Task</th>
            {showDepartment && <th className="px-3 py-2">Department</th>}
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">Due</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Evidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-muted/20">
              <td className="px-3 py-2.5">
                <p className="font-medium text-foreground">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.clientName ? `${t.clientName} · ` : ""}
                  {t.priority} priority · assigned by {t.assignedByName}
                </p>
              </td>
              {showDepartment && <td className="px-3 py-2.5 text-muted-foreground">{t.department}</td>}
              <td className="px-3 py-2.5 text-foreground">{t.assignedToName}</td>
              <td className={`px-3 py-2.5 font-mono ${t.overdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}`}>
                {t.dueDate || "—"}
                {t.overdue && <span className="block text-[10px] font-sans">Overdue</span>}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-3 py-2.5 text-right whitespace-nowrap">
                {t.latestEvidenceId && onOpenEvidence ? (
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenEvidence(t.latestEvidenceId!)}>
                    <FileCheck2 className="mr-1 h-3 w-3" /> Open
                  </Button>
                ) : (
                  <span className="text-[11px] text-muted-foreground">None yet</span>
                )}
                {onFollowUp && t.status !== "Completed" && (
                  <Button size="sm" variant="ghost" className="ml-1 h-7 text-[11px]" onClick={() => onFollowUp(t)}>
                    <MessageSquarePlus className="h-3 w-3" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EvidenceList({
  evidence,
  onOpen,
  empty = "No submissions match.",
}: {
  evidence: ExecEvidence[];
  onOpen: (id: string) => void;
  empty?: string;
}) {
  if (!evidence.length) return <Empty>{empty}</Empty>;
  return (
    <div className="space-y-1.5">
      {evidence.map((e) => (
        <button
          key={e.id}
          onClick={() => onOpen(e.id)}
          className="w-full text-left flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/40 transition"
        >
          <FileCheck2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{e.taskTitle}</p>
            <p className="text-[11px] text-muted-foreground">
              {e.submittedBy} · {e.department} · {e.fileCount} file(s), {e.linkCount} link(s) · {relTime(e.submittedAt)}
              {e.reviewedBy ? ` · reviewed by ${e.reviewedBy}` : ""}
            </p>
            {e.reviewerFeedback && (
              <p className="mt-0.5 text-[11px] text-muted-foreground italic line-clamp-1">“{e.reviewerFeedback}”</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={e.status} />
            {e.hoursWaiting !== null && (
              <span className={`text-[10px] ${e.hoursWaiting >= 48 ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}`}>
                waiting {e.hoursWaiting}h
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── People ───────────────────────────────────────────────────────────────────
const ATT_STYLE: Record<string, string> = {
  "Clocked In": "text-emerald-600 dark:text-emerald-400",
  "On Break": "text-amber-600 dark:text-amber-400",
  "Clocked Out": "text-muted-foreground",
  "No clock-in": "text-muted-foreground/70",
};

export function PeopleTable({ people, empty = "No employees match." }: { people: ExecPerson[]; empty?: string }) {
  if (!people.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Employee</th>
            <th className="px-3 py-2">Department</th>
            <th className="px-3 py-2">Today</th>
            <th className="px-3 py-2 text-center">Days in (7d)</th>
            <th className="px-3 py-2 text-center">Open</th>
            <th className="px-3 py-2 text-center">Overdue</th>
            <th className="px-3 py-2 text-center">Done</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {people.map((p) => (
            <tr key={p.id} className="hover:bg-muted/20">
              <td className="px-3 py-2.5">
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.title || "No job title"}</p>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{p.orgDepartment}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex items-center gap-1 font-medium ${ATT_STYLE[p.attendanceToday]}`}>
                  <CircleDot className="h-3 w-3" /> {p.attendanceToday}
                </span>
                {(p.clockInToday || p.hoursToday) && (
                  <span className="block text-[10px] text-muted-foreground">
                    {p.clockInToday ? `in ${p.clockInToday}` : ""}
                    {p.clockOutToday ? ` · out ${p.clockOutToday}` : ""}
                    {p.hoursToday ? ` · ${p.hoursToday}` : ""}
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-center">{p.daysPresentLast7}</td>
              <td className="px-3 py-2.5 text-center">{p.openTasks}</td>
              <td className={`px-3 py-2.5 text-center ${p.overdueTasks ? "text-rose-600 dark:text-rose-400 font-semibold" : ""}`}>
                {p.overdueTasks}
              </td>
              <td className="px-3 py-2.5 text-center">{p.completedTasks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Follow-ups ───────────────────────────────────────────────────────────────
export type FollowUpDraft = {
  subject?: string;
  note?: string;
  departmentKey?: string | null;
  departmentName?: string | null;
  assigneeId?: string;
  relatedTaskId?: string | null;
  relatedClientId?: string | null;
};

export function FollowUpDialog({
  open,
  onOpenChange,
  draft,
  data,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  draft: FollowUpDraft | null;
  data: ExecutiveOverview;
}) {
  const create = useCreateFollowUp();
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [dueDate, setDueDate] = useState("");
  const [lastDraft, setLastDraft] = useState<FollowUpDraft | null>(null);

  const dept = data.departments.find((d) => d.key === draft?.departmentKey);
  // Suggested people: the department's leads first, then other managers.
  const options = useMemo(() => {
    const leads = new Set((dept?.leads || []).map((l) => l.id));
    return [...data.people]
      .filter((p) => p.active)
      .sort((a, b) => Number(leads.has(b.id)) - Number(leads.has(a.id)) || a.name.localeCompare(b.name))
      .map((p) => ({ ...p, isLead: leads.has(p.id) }));
  }, [data.people, dept]);

  if (open && draft !== lastDraft) {
    setLastDraft(draft);
    setSubject(draft?.subject || "");
    setNote(draft?.note || "");
    setAssigneeId(draft?.assigneeId || dept?.leads[0]?.id || "");
    setPriority("Normal");
    setDueDate("");
  }

  const submit = async () => {
    try {
      await create.mutateAsync({
        subject,
        note,
        assigneeId,
        priority,
        dueDate: dueDate || null,
        departmentKey: draft?.departmentKey ?? null,
        departmentName: draft?.departmentName ?? dept?.name ?? null,
        relatedTaskId: draft?.relatedTaskId ?? null,
        relatedClientId: draft?.relatedClientId ?? null,
      });
      toast.success("Follow-up sent. They have been notified.");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not send the follow-up.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a management follow-up</DialogTitle>
          <DialogDescription className="text-xs">
            The person you choose is notified in the portal and can acknowledge and resolve it. This does not
            change any task, approval or record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Subject *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What needs attention?" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Who should follow up *</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a person" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {options.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.title || p.orgDepartment}
                    {p.isLead ? " (department lead)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Respond by</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Details</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="What do you expect them to do?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!subject.trim() || !assigneeId || create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const FU_STYLE: Record<string, string> = {
  Open: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Acknowledged: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
};

export function FollowUpList({
  followUps,
  mode,
  empty = "No follow-ups yet.",
}: {
  followUps: FollowUp[];
  mode: "ceo" | "assignee";
  empty?: string;
}) {
  const update = useUpdateFollowUp();
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  if (!followUps.length) return <Empty>{empty}</Empty>;
  const act = async (f: FollowUp, status: FollowUp["status"], resp?: string) => {
    try {
      await update.mutateAsync({ id: f.id, status, response: resp });
      toast.success(`Follow-up marked ${status.toLowerCase()}.`);
      setResponding(null);
      setResponse("");
    } catch (e: any) {
      toast.error(e?.message || "Could not update the follow-up.");
    }
  };
  return (
    <div className="space-y-2">
      {followUps.map((f) => (
        <div key={f.id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{f.subject}</p>
              <p className="text-[11px] text-muted-foreground">
                {mode === "ceo" ? `To ${f.assigneeName}` : `From ${f.createdByName}`}
                {f.departmentName ? ` · ${f.departmentName}` : ""} · {f.priority} · {relTime(f.createdAt)}
                {f.dueDate ? ` · respond by ${f.dueDate}` : ""}
              </p>
            </div>
            <Badge variant="outline" className={`text-[10px] ${FU_STYLE[f.status]}`}>
              {f.status}
            </Badge>
          </div>
          {f.note && <p className="mt-1.5 text-xs text-foreground whitespace-pre-wrap">{f.note}</p>}
          {f.response && (
            <p className="mt-1.5 text-xs text-muted-foreground border-l-2 border-primary/40 pl-2">
              Response: {f.response}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mode === "assignee" && f.status === "Open" && (
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => act(f, "Acknowledged")}>
                Acknowledge
              </Button>
            )}
            {mode === "assignee" && f.status !== "Resolved" && (
              <Button size="sm" className="h-7 text-[11px]" onClick={() => setResponding(f.id)}>
                <CheckCircle2 className="mr-1 h-3 w-3" /> Resolve with a note
              </Button>
            )}
            {mode === "ceo" && f.status !== "Resolved" && (
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => act(f, "Resolved")}>
                Close
              </Button>
            )}
            {mode === "ceo" && f.status === "Resolved" && (
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => act(f, "Open")}>
                Reopen
              </Button>
            )}
          </div>
          {responding === f.id && (
            <div className="mt-2 space-y-1.5">
              <Textarea rows={3} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="What was done?" />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-7 text-[11px]" disabled={!response.trim() || update.isPending} onClick={() => act(f, "Resolved", response)}>
                  Submit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setResponding(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
