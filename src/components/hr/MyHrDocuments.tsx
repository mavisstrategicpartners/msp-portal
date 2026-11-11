/**
 * My HR Documents — the documents HR has asked this employee to sign, complete or upload.
 * Nothing is shown that HR has not requested. Reads and writes go through
 * /api/staff/hr-documents/mine (the employee's own requests only).
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock, Download, Eye, FileSignature, FileText, Loader2, Paperclip, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";

export type HrFile = { name: string; path: string; size: number; mimeType: string; url?: string; downloadUrl?: string; available?: boolean };
export type HrRequest = {
  id: string;
  title: string;
  kind: "sign" | "complete" | "upload" | "declaration";
  category: string | null;
  instructions: string | null;
  due_date: string | null;
  status: "Outstanding" | "Submitted" | "Signed" | "Accepted" | "Returned" | "Cancelled";
  template: HrFile | null;
  submission: HrFile[];
  response: string | null;
  signature_name: string | null;
  signed_at: string | null;
  submitted_at: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  requested_by_name: string | null;
  created_at: string;
  employee_name?: string | null;
  employee_id?: string;
  batch_id?: string;
  audience?: string | null;
};

export const KIND_LABEL: Record<HrRequest["kind"], string> = {
  sign: "Read and sign",
  complete: "Complete and return",
  upload: "Upload a document",
  declaration: "Confidentiality & Conflict Declaration",
};

export async function hrApi(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), "Content-Type": "application/json", ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

export const isOverdue = (r: Pick<HrRequest, "due_date" | "status">) =>
  Boolean(r.due_date) && ["Outstanding", "Returned"].includes(r.status) && r.due_date! < new Date().toISOString().slice(0, 10);

export function StatusBadge({ r }: { r: Pick<HrRequest, "status" | "due_date"> }) {
  const late = isOverdue(r);
  const cls =
    r.status === "Accepted" || r.status === "Signed"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : r.status === "Submitted"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
        : r.status === "Returned" || late
          ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
          : r.status === "Cancelled"
            ? "text-muted-foreground"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return <Badge variant="outline" className={`text-[10px] ${cls}`}>{late ? "Overdue" : r.status === "Returned" ? "Returned for changes" : r.status}</Badge>;
}

const fmtDate = (d?: string | null) => (d ? format(parseISO(d), "d MMM yyyy") : "—");
const sizeLabel = (n: number) => (n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function FileLinks({ files }: { files: (HrFile | null | undefined)[] }) {
  const list = files.filter(Boolean) as HrFile[];
  if (!list.length) return null;
  return (
    <ul className="space-y-1">
      {list.map((f) => (
        <li key={f.path} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate" title={f.name}>{f.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{sizeLabel(f.size)}</span>
          {f.available === false && <span className="text-[10px] text-rose-600">missing</span>}
          {f.url && (
            <a href={f.url} target="_blank" rel="noreferrer" className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label={`View ${f.name}`} title="View">
              <Eye className="h-3.5 w-3.5" />
            </a>
          )}
          {f.downloadUrl && (
            <a href={f.downloadUrl} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label={`Download ${f.name}`} title="Download">
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

type Mine = { requests: HrRequest[]; declarations: { id: string; declaration_date: string; signature_typed_name: string; submitted_at: string }[] };

export function useMyHrDocuments(enabled = true) {
  return useQuery({ queryKey: ["hr-documents", "mine"], queryFn: async () => (await hrApi("/api/staff/hr-documents/mine")) as Mine, enabled });
}

export function MyHrDocumentsPage() {
  const q = useMyHrDocuments();
  const open = (q.data?.requests ?? []).filter((r) => r.status === "Outstanding" || r.status === "Returned");
  const done = (q.data?.requests ?? []).filter((r) => !["Outstanding", "Returned", "Cancelled"].includes(r.status));
  const legacy = q.data?.declarations ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <FileSignature className="h-3.5 w-3.5" /> HR
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">My HR Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Documents HR has asked you to sign, complete or upload, and the ones you have already handed in.</p>
      </div>

      {q.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : q.error ? (
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error).message}</Card>
      ) : (
        <>
          <section className="space-y-3" aria-label="Outstanding">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-amber-500" /> Outstanding ({open.length})
            </h2>
            {open.length ? open.map((r) => <OpenRequest key={r.id} r={r} />) : (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-emerald-500" />
                {done.length || legacy.length ? "Nothing outstanding — you are up to date." : "HR has not requested any documents from you."}
              </Card>
            )}
          </section>

          {(done.length > 0 || legacy.length > 0) && (
            <section className="space-y-2" aria-label="Completed">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed</h2>
              <Card className="divide-y divide-border">
                {done.map((r) => <DoneRow key={r.id} r={r} />)}
                {legacy.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">Internal Confidentiality and Conflict Declaration</p>
                      <p className="text-xs text-muted-foreground">Signed as {d.signature_typed_name} on {fmtDate(d.declaration_date)}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Signed</Badge>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DoneRow({ r }: { r: HrRequest }) {
  const [show, setShow] = useState(false);
  const files = useQuery({ queryKey: ["hr-documents", "mine", r.id, "files"], queryFn: async () => hrApi(`/api/staff/hr-documents/mine/${r.id}/files`), enabled: show });
  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">
            {KIND_LABEL[r.kind]} · {r.status === "Signed" || r.kind === "sign" || r.kind === "declaration" ? `signed as ${r.signature_name ?? "—"} on ${fmtDate(r.signed_at)}` : `submitted ${fmtDate(r.submitted_at)}`}
            {r.status === "Accepted" ? ` · accepted ${fmtDate(r.reviewed_at)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge r={r} />
          {(r.template || r.submission?.length > 0) && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShow((v) => !v)}>{show ? "Hide files" : "Files"}</Button>
          )}
        </div>
      </div>
      {show && (
        <div className="mt-2">
          {files.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <FileLinks files={[files.data?.template, ...(files.data?.submission ?? [])]} />}
        </div>
      )}
    </div>
  );
}

function OpenRequest({ r }: { r: HrRequest }) {
  const qc = useQueryClient();
  const late = isOverdue(r);
  const files = useQuery({ queryKey: ["hr-documents", "mine", r.id, "files"], queryFn: async () => hrApi(`/api/staff/hr-documents/mine/${r.id}/files`), enabled: Boolean(r.template) });
  const [ack, setAck] = useState(false);
  const [signature, setSignature] = useState("");
  const [response, setResponse] = useState("");
  const [uploads, setUploads] = useState<HrFile[]>([]);
  const [busy, setBusy] = useState(false);

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    for (const file of Array.from(list).slice(0, 10 - uploads.length)) {
      try {
        if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} is larger than 25 MB.`);
        const s = await hrApi(`/api/staff/hr-documents/mine/${r.id}/upload-url`, { method: "POST", body: JSON.stringify({ fileName: file.name, size: file.size, mimeType: file.type }) });
        const { error } = await supabase.storage.from("hr-documents").uploadToSignedUrl(s.path, s.token, file, { contentType: file.type || "application/octet-stream", upsert: false });
        if (error) throw new Error(`${file.name}: upload failed (${error.message}).`);
        setUploads((u) => [...u, { name: file.name, path: s.path, size: file.size, mimeType: file.type }]);
      } catch (e: any) {
        toast.error(e.message);
      }
    }
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    try {
      await hrApi(`/api/staff/hr-documents/mine/${r.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ acknowledged: ack, signature, response, files: uploads }),
      });
      toast.success(r.kind === "sign" || r.kind === "declaration" ? "Signed and sent to HR" : "Submitted to HR");
      await qc.invalidateQueries({ queryKey: ["hr-documents"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const signs = r.kind === "sign" || r.kind === "declaration";
  const ready = signs ? ack && signature.trim().length >= 2 : uploads.length > 0;

  return (
    <Card className={`p-5 ${late ? "border-rose-500/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">{r.title}</h3>
          <p className="text-xs text-muted-foreground">
            {KIND_LABEL[r.kind]}
            {r.category ? ` · ${r.category}` : ""} · requested by {r.requested_by_name ?? "HR"} on {fmtDate(r.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {r.due_date && <span className={`text-xs ${late ? "font-semibold text-rose-600" : "text-muted-foreground"}`}>Due {fmtDate(r.due_date)}</span>}
          <StatusBadge r={r} />
        </div>
      </div>

      {r.status === "Returned" && r.review_note && (
        <p className="mt-3 flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs text-rose-700 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" /> HR returned this: {r.review_note}
        </p>
      )}
      {r.instructions && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{r.instructions}</p>}
      {r.template && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium">Document from HR</p>
          {files.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <FileLinks files={[files.data?.template]} />}
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {r.kind === "declaration" && (
          <>
            <p className="text-sm text-muted-foreground">I acknowledge confidentiality, non-solicitation and company information handling rules for Mavis Strategic Partners.</p>
            <div className="space-y-1.5">
              <Label htmlFor={`resp-${r.id}`}>Outside employment / conflict details</Label>
              <Textarea id={`resp-${r.id}`} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type none, or explain any outside work." />
            </div>
          </>
        )}
        {signs ? (
          <>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} />
              <span>{r.kind === "declaration" ? "I understand and acknowledge the confidentiality declaration." : "I have read this document and agree to it."}</span>
            </label>
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor={`sig-${r.id}`}>Typed signature</Label>
              <Input id={`sig-${r.id}`} value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your full name" />
            </div>
          </>
        ) : (
          <>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/30 px-3 py-4 text-center hover:border-muted-foreground/50">
              <input type="file" multiple className="sr-only" aria-label={`Attach files for ${r.title}`} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.heic,.txt,.csv,.zip" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <span className="inline-flex items-center gap-1.5 text-sm font-medium"><Upload className="h-4 w-4" /> {r.kind === "complete" ? "Upload the completed document" : "Upload the requested document"}</span>
              <span className="text-[11px] text-muted-foreground">PDF, Word, Excel, images or ZIP · up to 25 MB each</span>
            </label>
            {uploads.length > 0 && (
              <ul className="space-y-1">
                {uploads.map((f) => (
                  <li key={f.path} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{sizeLabel(f.size)}</span>
                    <button type="button" className="rounded p-1 text-muted-foreground hover:text-rose-600" aria-label={`Remove ${f.name}`} onClick={() => setUploads((u) => u.filter((x) => x.path !== f.path))}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-1.5">
              <Label htmlFor={`note-${r.id}`} className="text-xs">Note to HR (optional)</Label>
              <Textarea id={`note-${r.id}`} value={response} onChange={(e) => setResponse(e.target.value)} rows={2} />
            </div>
          </>
        )}
        <Button onClick={submit} disabled={!ready || busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : signs ? <FileSignature className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
          {signs ? "Sign and send to HR" : "Submit to HR"}
        </Button>
      </div>
    </Card>
  );
}
