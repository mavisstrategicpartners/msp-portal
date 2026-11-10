/**
 * A department module page (IT support requests, campaigns, design briefs, keyword tracking,
 * bugs, client cases, automation workflows, report schedule, initiatives, training…).
 * The record type definition (src/lib/department-modules.ts) decides the fields, statuses and
 * summary figures; the server decides who may see and change what.
 */
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, Link2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { DEPARTMENTS } from "@/lib/departments";
import {
  RECORD_PRIORITIES,
  computeKpis,
  isRecordOverdue,
  typesFor,
  type DeptRecord,
  type ModuleField,
  type RecordType,
} from "@/lib/department-modules";
import { useProfile } from "@/lib/use-profile";

type RecordsResponse = {
  records: DeptRecord[];
  canManage: boolean;
  canView: boolean;
  canCreate: Record<string, boolean>;
  people: { id: string; name: string }[];
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const deptName = (k: string) => DEPARTMENTS.find((d) => d.key === k)?.name ?? k;
const NONE = "__none__";
const TASK_PRIORITY: Record<string, string> = { Low: "Low", Normal: "Medium", High: "High", Urgent: "Urgent" };

function fmt(f: ModuleField, v: any) {
  if (v === undefined || v === null || v === "") return "—";
  if (f.type === "money") return `R${Math.round(Number(v)).toLocaleString("en-ZA").replace(/,/g, " ")}`;
  if (f.type === "percent") return `${v}%`;
  if (f.type === "rating") return `${v} / 5`;
  if (f.type === "url")
    return (
      <a href={String(v)} target="_blank" rel="noreferrer" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
        Open
      </a>
    );
  return String(v);
}

export function RecordModule({ type }: { type: RecordType }) {
  const qc = useQueryClient();
  const profile = useProfile();
  const key = ["staff", "records", type.department];
  const q = useQuery({ queryKey: key, queryFn: async () => (await api(`/api/staff/records?dept=${type.department}`)) as RecordsResponse });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [mine, setMine] = useState(false);
  const [editing, setEditing] = useState<DeptRecord | "new" | null>(null);
  const me = profile.data?.user?.id;

  const all = useMemo(() => (q.data?.records ?? []).filter((r) => r.record_type === type.key), [q.data, type.key]);
  const shown = useMemo(() => {
    const t = search.trim().toLowerCase();
    return all.filter(
      (r) =>
        (status === "all" || (status === "open" ? !type.done.includes(r.status) : r.status === status)) &&
        (!mine || r.assigned_to === me || r.created_by === me) &&
        (!t || [r.title, r.client_name, r.assigned_to_name, ...Object.values(r.data ?? {})].some((v) => String(v ?? "").toLowerCase().includes(t))),
    );
  }, [all, search, status, mine, me, type.done]);
  const kpis = computeKpis(type, all);
  const siblings = typesFor(type.department);
  const listFields = type.fields.filter((f) => f.list);
  const canCreate = Boolean(q.data?.canCreate?.[type.key]);
  const viewOnly = q.data && !q.data.canView;

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to="/department" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> {deptName(type.department)}
          </Link>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">{type.label}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{type.description}</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New {type.singular}
          </Button>
        )}
      </header>

      {siblings.length > 1 && q.data?.canView && (
        <nav className="flex flex-wrap gap-1.5" aria-label={`${deptName(type.department)} modules`}>
          {siblings.map((s) => (
            <Link
              key={s.key}
              to={`/work/${s.slug}` as any}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                s.key === type.key ? "border-primary bg-primary/10 font-medium text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      )}

      {q.isLoading ? (
        <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : q.error ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{(q.error as Error).message}</p>
      ) : (
        <>
          {!viewOnly && (
            <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-border bg-card px-3.5 py-3">
                  <p className="truncate text-xs text-muted-foreground">{k.label}</p>
                  <p className={`mt-0.5 text-xl font-semibold tabular-nums ${k.alert ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{k.value}</p>
                </div>
              ))}
            </section>
          )}
          {viewOnly && (
            <p className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              You are seeing the {type.label.toLowerCase()} you logged. {deptName(type.department)} will pick them up and update the status here.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="h-8 w-56 pl-8 text-xs" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open" className="text-xs">Open</SelectItem>
                <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                {type.statuses.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {q.data?.canView && (
              <Button size="sm" variant={mine ? "secondary" : "ghost"} className="h-8 text-xs" onClick={() => setMine((v) => !v)}>
                Mine only
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {shown.length} of {all.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            {shown.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">{type.singular[0].toUpperCase() + type.singular.slice(1)}</th>
                    {type.client && <th className="px-3 py-2.5 font-medium">Client</th>}
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    {type.priority && <th className="px-3 py-2.5 font-medium">Priority</th>}
                    {listFields.map((f) => (
                      <th key={f.key} className="px-3 py-2.5 font-medium">{f.label}</th>
                    ))}
                    {type.assignee && <th className="px-3 py-2.5 font-medium">{type.assignee.label}</th>}
                    {type.due && <th className="px-3 py-2.5 font-medium">{type.due.label}</th>}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const late = isRecordOverdue(type, r);
                    return (
                      <tr key={r.id} onClick={() => setEditing(r)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="max-w-[18rem] px-4 py-2.5">
                          <p className="truncate font-medium text-foreground">{r.title}</p>
                          {r.task_id && (
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Link2 className="h-3 w-3" /> task linked
                            </p>
                          )}
                        </td>
                        {type.client && <td className="px-3 py-2.5 text-xs">{r.client_name || "Internal"}</td>}
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={`text-[10px] ${type.done.includes(r.status) ? "text-muted-foreground" : ""}`}>{r.status}</Badge>
                        </td>
                        {type.priority && <td className="px-3 py-2.5 text-xs">{r.priority || "—"}</td>}
                        {listFields.map((f) => (
                          <td key={f.key} className="px-3 py-2.5 text-xs">
                            {f.type === "percent" && r.data?.[f.key] !== undefined ? (
                              <div className="flex w-24 items-center gap-1.5">
                                <Progress value={Number(r.data[f.key])} className="h-1.5" />
                                <span className="tabular-nums">{r.data[f.key]}%</span>
                              </div>
                            ) : (
                              fmt(f, r.data?.[f.key])
                            )}
                          </td>
                        ))}
                        {type.assignee && <td className="px-3 py-2.5 text-xs">{r.assigned_to_name || <span className="text-muted-foreground">Unassigned</span>}</td>}
                        {type.due && (
                          <td className={`px-3 py-2.5 text-xs tabular-nums ${late ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}>
                            {r.due_date || "—"}
                            {late ? " · overdue" : ""}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  {all.length ? "Nothing matches these filters." : `No ${type.label.toLowerCase()} yet`}
                </p>
                {!all.length && canCreate && (
                  <p className="mt-1 text-xs text-muted-foreground">Add the first {type.singular} with “New {type.singular}”.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {editing && q.data && (
        <RecordEditor
          type={type}
          record={editing === "new" ? null : editing}
          data={q.data}
          me={me ?? null}
          onClose={() => setEditing(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: key })}
        />
      )}
    </div>
  );
}

function RecordEditor({
  type,
  record,
  data,
  me,
  onClose,
  onSaved,
}: {
  type: RecordType;
  record: DeptRecord | null;
  data: RecordsResponse;
  me: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !record;
  const own = record && (record.assigned_to === me || record.created_by === me);
  const canEdit = isNew ? Boolean(data.canCreate[type.key]) : data.canManage || (data.canView && own);
  const outsider = !data.canView;
  const [title, setTitle] = useState(record?.title ?? "");
  const [status, setStatus] = useState(record?.status ?? type.statuses[0]);
  const [priority, setPriority] = useState(record?.priority ?? (type.priority ? "Normal" : ""));
  const [client, setClient] = useState(record?.client_name ?? "");
  const [due, setDue] = useState(record?.due_date ?? "");
  const [assignee, setAssignee] = useState(record?.assigned_to ?? NONE);
  const [fields, setFields] = useState<Record<string, any>>({ ...(record?.data ?? {}) });
  const [saving, setSaving] = useState(false);
  const [taskFor, setTaskFor] = useState<string>(record?.assigned_to ?? "");

  const body = () => ({
    type: type.key,
    title,
    ...(outsider ? {} : { status }),
    ...(type.priority ? { priority } : {}),
    ...(type.client ? { clientName: client } : {}),
    ...(type.due ? { dueDate: due } : {}),
    ...(type.assignee && data.canManage ? { assignedTo: assignee === NONE ? null : assignee } : {}),
    data: fields,
  });

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) await api("/api/staff/records", { method: "POST", body: JSON.stringify(body()) });
      else await api(`/api/staff/records/${record!.id}`, { method: "PATCH", body: JSON.stringify(body()) });
      toast.success(isNew ? `${type.singular[0].toUpperCase()}${type.singular.slice(1)} added` : "Saved");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!record || !confirm(`Delete this ${type.singular}?`)) return;
    try {
      await api(`/api/staff/records/${record.id}`, { method: "DELETE" });
      toast.success("Deleted");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const createTask = async () => {
    if (!record || !taskFor) return;
    try {
      const details = type.fields
        .filter((f) => record.data?.[f.key] !== undefined && record.data?.[f.key] !== "")
        .map((f) => `${f.label}: ${record.data[f.key]}`)
        .join("\n");
      const res = await api("/api/staff/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: record.title,
          description: `${type.singular[0].toUpperCase()}${type.singular.slice(1)}${record.client_name ? ` for ${record.client_name}` : ""}.\n${details}`,
          department: deptName(type.department),
          assignedToId: taskFor,
          clientName: record.client_name || undefined,
          taskType: record.client_name ? "Client Work" : "Internal Operations",
          priority: TASK_PRIORITY[record.priority || "Normal"] || "Medium",
          dueDate: record.due_date || undefined,
          evidenceRequired: `Completed ${type.singular}`,
        }),
      });
      await api(`/api/staff/records/${record.id}`, {
        method: "PATCH",
        body: JSON.stringify({ taskId: res.task?.id, ...(type.assignee && !record.assigned_to ? { assignedTo: taskFor } : {}) }),
      });
      toast.success("Task created and assigned", { description: "It appears on the employee's dashboard and they were notified." });
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const field = (f: ModuleField) => {
    const v = fields[f.key] ?? "";
    const set = (nv: any) => setFields((x) => ({ ...x, [f.key]: nv }));
    if (outsider && f.key === "resolution") return null;
    if (f.key === "requester" && (isNew || !data.canManage)) return null;
    return (
      <div key={f.key} className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
        <Label className="text-xs">
          {f.label}
          {f.required ? " *" : ""}
        </Label>
        {f.type === "textarea" ? (
          <Textarea value={v} onChange={(e) => set(e.target.value)} disabled={!canEdit} rows={3} className="text-xs" />
        ) : f.type === "select" ? (
          <Select value={v || NONE} onValueChange={(x) => set(x === NONE ? "" : x)} disabled={!canEdit}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE} className="text-xs">—</SelectItem>
              {f.options!.map((o) => (
                <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={f.type === "date" ? "date" : ["number", "money", "percent", "rating"].includes(f.type) ? "number" : f.type === "url" ? "url" : "text"}
            min={f.type === "rating" ? 1 : f.type === "percent" ? 0 : undefined}
            max={f.type === "rating" ? 5 : f.type === "percent" ? 100 : undefined}
            value={v}
            onChange={(e) => set(e.target.value)}
            disabled={!canEdit}
            className="h-9 text-xs"
          />
        )}
        {f.help && <p className="text-[10px] text-muted-foreground">{f.help}</p>}
      </div>
    );
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{isNew ? `New ${type.singular}` : record!.title}</SheetTitle>
          <SheetDescription className="text-xs">
            {deptName(type.department)} · {type.label}
            {record?.created_by_name ? ` · added by ${record.created_by_name}` : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} className="h-9 text-xs" />
          </div>
          {!outsider && (
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {type.statuses.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {type.priority && (
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority || "Normal"} onValueChange={setPriority} disabled={!canEdit}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {type.client && (
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Leave empty for internal work" disabled={!canEdit} className="h-9 text-xs" />
            </div>
          )}
          {type.due && (
            <div className="space-y-1.5">
              <Label className="text-xs">{type.due.label}</Label>
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} disabled={!canEdit} className="h-9 text-xs" />
            </div>
          )}
          {type.assignee && data.canManage && (
            <div className="space-y-1.5">
              <Label className="text-xs">{type.assignee.label}</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE} className="text-xs">Unassigned</SelectItem>
                  {data.people.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {type.fields.map(field)}
        </div>

        {!isNew && data.canManage && (
          <div className="mt-5 space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-foreground">{record!.task_id ? "A task is linked to this record" : "Turn into a task"}</p>
            <p className="text-[11px] text-muted-foreground">
              Creates a task for a {deptName(type.department)} employee. It appears on their dashboard, they are notified, and
              their submission comes back to you for review.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={taskFor || NONE} onValueChange={(v) => setTaskFor(v === NONE ? "" : v)}>
                <SelectTrigger className="h-8 w-56 text-xs">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE} className="text-xs">Choose employee</SelectItem>
                  {data.people.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!taskFor} onClick={createTask}>
                Create task
              </Button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          {!isNew && data.canManage ? (
            <Button size="sm" variant="ghost" className="text-rose-600" onClick={remove}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              {canEdit ? "Cancel" : "Close"}
            </Button>
            {canEdit && (
              <Button size="sm" onClick={save} disabled={saving || !title.trim()}>
                {saving ? "Saving…" : isNew ? "Add" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
