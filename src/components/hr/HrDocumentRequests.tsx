/**
 * HR → Document Requests. HR asks employees (individuals, departments or everyone) to sign,
 * complete or upload documents, tracks who is outstanding, reviews what comes back and
 * accepts or returns it. Server: /api/staff/hr-documents/requests (HR manager and
 * administrators manage; the CEO can view).
 */
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, FileSignature, Loader2, Plus, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/departments";
import { FileLinks, KIND_LABEL, StatusBadge, hrApi, isOverdue, type HrFile, type HrRequest } from "@/components/hr/MyHrDocuments";

type ListResponse = { requests: HrRequest[]; people: { id: string; name: string; title: string | null }[]; canManage: boolean };
const KEY = ["hr-documents", "requests"];
const fmt = (d?: string | null) => (d ? format(parseISO(d), "d MMM yyyy") : "—");
const DONE = ["Submitted", "Signed", "Accepted"];

export function HrDocumentRequestsPage() {
  const q = useQuery({ queryKey: KEY, queryFn: async () => (await hrApi("/api/staff/hr-documents/requests")) as ListResponse });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "outstanding" | "review" | "overdue">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const batches = useMemo(() => {
    const m = new Map<string, HrRequest[]>();
    for (const r of q.data?.requests ?? []) {
      if (r.status === "Cancelled") continue;
      const k = r.batch_id ?? r.id;
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    const s = search.trim().toLowerCase();
    return [...m.entries()]
      .map(([id, rows]) => ({ id, rows, head: rows[0] }))
      .map((b) => ({
        ...b,
        rows: b.rows.filter(
          (r) =>
            (filter === "all" ||
              (filter === "outstanding" && ["Outstanding", "Returned"].includes(r.status)) ||
              (filter === "review" && ["Submitted", "Signed"].includes(r.status)) ||
              (filter === "overdue" && isOverdue(r))) &&
            (!s || [b.head.title, r.employee_name].some((v) => String(v ?? "").toLowerCase().includes(s))),
        ),
      }))
      .filter((b) => b.rows.length);
  }, [q.data, filter, search]);

  const all = (q.data?.requests ?? []).filter((r) => r.status !== "Cancelled");
  const counts = {
    outstanding: all.filter((r) => ["Outstanding", "Returned"].includes(r.status)).length,
    review: all.filter((r) => ["Submitted", "Signed"].includes(r.status)).length,
    overdue: all.filter((r) => isOverdue(r)).length,
    accepted: all.filter((r) => r.status === "Accepted").length,
  };

  return (
    <div className="mx-auto max-w-[1300px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <FileSignature className="h-3.5 w-3.5" /> HR
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Document Requests</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Ask employees to sign, complete or upload documents. Each employee sees only what you request from them in My HR Documents.
          </p>
        </div>
        {q.data?.canManage && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> New request
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Outstanding", counts.outstanding, "outstanding"],
          ["To review", counts.review, "review"],
          ["Overdue", counts.overdue, "overdue"],
          ["Accepted", counts.accepted, "all"],
        ].map(([label, n, f]) => (
          <button key={label as string} type="button" onClick={() => setFilter(f as any)} className={`rounded-xl border bg-card px-4 py-3 text-left transition hover:border-primary/40 ${filter === f && f !== "all" ? "border-primary" : "border-border"}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-semibold ${label === "Overdue" && Number(n) > 0 ? "text-rose-600" : ""}`}>{n as number}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search document or employee" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="h-8 rounded-md border border-input bg-background px-2 text-xs" aria-label="Status">
          <option value="all">All requests</option>
          <option value="outstanding">Outstanding</option>
          <option value="review">Submitted / signed — to review</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {q.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : q.error ? (
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error).message}</Card>
      ) : !batches.length ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {all.length ? "No requests match these filters." : "No document requests yet. Use “New request” to ask employees for a document."}
        </Card>
      ) : (
        <div className="space-y-3">
          {batches.map((b) => {
            const total = (q.data?.requests ?? []).filter((r) => (r.batch_id ?? r.id) === b.id && r.status !== "Cancelled");
            const done = total.filter((r) => DONE.includes(r.status)).length;
            const isOpen = open[b.id] ?? batches.length === 1;
            return (
              <Card key={b.id} className="overflow-hidden">
                <button type="button" onClick={() => setOpen((o) => ({ ...o, [b.id]: !isOpen }))} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-muted/30" aria-expanded={isOpen}>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{b.head.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {KIND_LABEL[b.head.kind]} · {b.head.audience} · sent {fmt(b.head.created_at)}
                      {b.head.due_date ? ` · due ${fmt(b.head.due_date)}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{done} of {total.length} done</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-border border-t border-border">
                    {b.rows.map((r) => <EmployeeRow key={r.id} r={r} canManage={Boolean(q.data?.canManage)} />)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {creating && q.data && <NewRequestDialog people={q.data.people} onClose={() => setCreating(false)} />}
    </div>
  );
}

function EmployeeRow({ r, canManage }: { r: HrRequest; canManage: boolean }) {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const files = useQuery({ queryKey: ["hr-documents", "requests", r.id, "files"], queryFn: async () => hrApi(`/api/staff/hr-documents/requests/${r.id}/files`), enabled: show });
  const act = async (action: "accept" | "return" | "cancel") => {
    if (action === "cancel" && !confirm(`Cancel this request for ${r.employee_name}? It will disappear from their HR Documents.`)) return;
    setBusy(true);
    try {
      await hrApi(`/api/staff/hr-documents/requests/${r.id}`, { method: "PATCH", body: JSON.stringify({ action, note }) });
      toast.success(action === "accept" ? "Accepted" : action === "return" ? "Returned to the employee" : "Request cancelled");
      setNote("");
      await qc.invalidateQueries({ queryKey: ["hr-documents"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const review = ["Submitted", "Signed"].includes(r.status);
  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="min-w-0 flex-1 font-medium">{r.employee_name ?? "Former employee"}</span>
        <span className="text-xs text-muted-foreground">
          {r.signed_at ? `signed ${fmt(r.signed_at)} as ${r.signature_name}` : r.submitted_at ? `submitted ${fmt(r.submitted_at)}` : "not yet submitted"}
        </span>
        <StatusBadge r={r} />
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShow((v) => !v)}>{show ? "Close" : review ? "Review" : "Details"}</Button>
      </div>
      {show && (
        <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/20 p-3">
          {r.response && <p className="text-xs"><span className="font-medium">Employee note:</span> {r.response}</p>}
          {r.review_note && <p className="text-xs"><span className="font-medium">HR note:</span> {r.review_note}</p>}
          {files.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (
            <>
              {files.data?.template && <div><p className="mb-1 text-[11px] font-medium text-muted-foreground">Sent by HR</p><FileLinks files={[files.data.template]} /></div>}
              {files.data?.submission?.length > 0 && <div><p className="mb-1 text-[11px] font-medium text-muted-foreground">Returned by the employee</p><FileLinks files={files.data.submission} /></div>}
            </>
          )}
          {canManage && (
            <div className="flex flex-wrap items-end gap-2">
              {review && (
                <>
                  <div className="min-w-[16rem] flex-1">
                    <Label className="text-xs" htmlFor={`note-${r.id}`}>Note to the employee (required to return)</Label>
                    <Input id={`note-${r.id}`} value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <Button size="sm" className="h-8 text-xs" disabled={busy} onClick={() => act("accept")}>Accept</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" disabled={busy || !note.trim()} onClick={() => act("return")}>Return for changes</Button>
                </>
              )}
              {r.status !== "Accepted" && (
                <Button size="sm" variant="ghost" className="h-8 text-xs text-rose-600" disabled={busy} onClick={() => act("cancel")}>Cancel request</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewRequestDialog({ people, onClose }: { people: ListResponse["people"]; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HrRequest["kind"]>("sign");
  const [category, setCategory] = useState("");
  const [instructions, setInstructions] = useState("");
  const [due, setDue] = useState("");
  const [audience, setAudience] = useState<"people" | "departments" | "all">("people");
  const [chosen, setChosen] = useState<string[]>([]);
  const [depts, setDepts] = useState<string[]>([]);
  const [find, setFind] = useState("");
  const [template, setTemplate] = useState<HrFile | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const s = await hrApi("/api/staff/hr-documents/requests/upload-url", { method: "POST", body: JSON.stringify({ fileName: file.name, size: file.size, mimeType: file.type }) });
      const { error } = await supabase.storage.from("hr-documents").uploadToSignedUrl(s.path, s.token, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      setTemplate({ name: file.name, path: s.path, size: file.size, mimeType: file.type });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    setBusy(true);
    try {
      const res = await hrApi("/api/staff/hr-documents/requests", {
        method: "POST",
        body: JSON.stringify({
          title: kind === "declaration" && !title.trim() ? "Internal Confidentiality and Conflict Declaration" : title,
          kind,
          category,
          instructions,
          dueDate: due,
          template,
          audience: audience === "all" ? "all" : undefined,
          employees: audience === "people" ? chosen : [],
          departments: audience === "departments" ? depts : [],
        }),
      });
      toast.success(`Request sent to ${res.created} employee${res.created === 1 ? "" : "s"}`, { description: "They were notified and will see it in My HR Documents." });
      await qc.invalidateQueries({ queryKey: ["hr-documents"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const shown = people.filter((p) => !find.trim() || p.name.toLowerCase().includes(find.toLowerCase()));
  const needsFile = kind === "sign";
  const ready = (kind === "declaration" || title.trim()) && (!needsFile || template) && (audience === "all" || (audience === "people" ? chosen.length : depts.length));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 pb-3 pt-5 text-left">
          <DialogTitle>New document request</DialogTitle>
          <DialogDescription className="text-xs">Each chosen employee gets their own request and a notification.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="req-kind">What should they do?</Label>
            <select id="req-kind" value={kind} onChange={(e) => setKind(e.target.value as any)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              <option value="sign">Read and sign a document</option>
              <option value="complete">Complete a form and return it</option>
              <option value="upload">Upload a document (e.g. ID, bank letter, certificate)</option>
              <option value="declaration">Sign the Internal Confidentiality and Conflict Declaration</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="req-title">Document name {kind === "declaration" ? "(optional)" : "*"}</Label>
            <Input id="req-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "declaration" ? "Internal Confidentiality and Conflict Declaration" : kind === "upload" ? "e.g. Certified copy of ID" : "e.g. Employment contract 2026"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="req-cat">Category</Label>
              <select id="req-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="">—</option>
                {["Contracts", "Identification", "Tax & Banking", "Qualifications", "Policies & Declarations", "Performance", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="req-due">Deadline</Label>
              <Input id="req-due" type="date" value={due} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="req-ins">Instructions</Label>
            <Textarea id="req-ins" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What the employee needs to do" />
          </div>
          {kind !== "declaration" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Document to send {needsFile ? "*" : "(optional)"}</Label>
              {template ? (
                <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
                  <span className="min-w-0 flex-1 truncate">{template.name}</span>
                  <button type="button" onClick={() => setTemplate(null)} aria-label="Remove document" className="rounded p-1 text-muted-foreground hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-3 py-3 text-sm hover:border-muted-foreground/50">
                  <input type="file" className="sr-only" aria-label="Document to send" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv,.zip" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                  <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Attach file"}
                </label>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs">Send to</Label>
            <div className="flex gap-1.5">
              {(["people", "departments", "all"] as const).map((a) => (
                <Button key={a} type="button" size="sm" variant={audience === a ? "default" : "outline"} className="h-8 text-xs" onClick={() => setAudience(a)}>
                  {a === "people" ? "Specific employees" : a === "departments" ? "Departments" : "All employees"}
                </Button>
              ))}
            </div>
            {audience === "people" && (
              <div className="rounded-md border border-border p-2">
                <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find employee" className="mb-2 h-8 text-xs" />
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {shown.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={chosen.includes(p.id)} onChange={(e) => setChosen((c) => (e.target.checked ? [...c, p.id] : c.filter((x) => x !== p.id)))} />
                      <span className="truncate">{p.name}{p.title ? <span className="text-muted-foreground"> — {p.title}</span> : null}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{chosen.length} selected</p>
              </div>
            )}
            {audience === "departments" && (
              <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-2">
                {DEPARTMENTS.map((d) => (
                  <label key={d.key} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={depts.includes(d.key)} onChange={(e) => setDepts((c) => (e.target.checked ? [...c, d.key] : c.filter((x) => x !== d.key)))} />
                    {d.name}
                  </label>
                ))}
              </div>
            )}
            {audience === "all" && <p className="text-[11px] text-muted-foreground">Everyone placed in a department receives this request.</p>}
          </div>
        </div>
        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-3 sm:space-x-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!ready || busy} onClick={send}>{busy ? "Sending…" : "Send request"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
