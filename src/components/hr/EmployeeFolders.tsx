/**
 * HR → Employee Folders. Every employee has a digital HR folder: personal and employment
 * details, documents (contracts, ID, qualifications, certificates, leave and disciplinary
 * records…), document requests, leave history and an audit history of what HR did.
 * Server: /api/staff/hr/* (HR manager and administrators manage; the CEO can view).
 */
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Copy, Download, Eye, FolderOpen, Loader2, Pencil, Plus, Search, Trash2, Upload, UserPlus } from "lucide-react";
import { toast, uploading } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_TYPES, FOLDER_CATEGORIES } from "@/lib/hr-shared";
import { KIND_LABEL, StatusBadge, hrApi, type HrRequest } from "@/components/hr/MyHrDocuments";
import { LeaveStatusBadge } from "@/components/hr/LeaveShared";
import { StatCard, StatGrid, selectClass } from "@/components/layout/page";
import { confirmAction } from "@/lib/confirm";

type Dept = { key: string; name: string };
type EmployeeRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  role_tier: string | null;
  is_active: boolean | null;
  department: Dept | null;
  employee_number: string | null;
  employment_type: string | null;
  join_date: string | null;
  documents: number;
  open_requests: number;
  overdue_requests: number;
  pending_leave: number;
};
type ListResponse = { employees: EmployeeRow[]; canManage: boolean; departments: Dept[] };
type FolderDoc = {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  size: number | null;
  document_date: string | null;
  uploaded: string | null;
  uploaded_by_name: string | null;
  notes: string | null;
  source: string | null;
  storage_path: string | null;
  created_at: string;
};
type Folder = {
  profile: { id: string; full_name: string; email: string; phone: string | null; job_title: string | null; role_tier: string | null; is_active: boolean; created_at: string; department: Dept | null };
  details: Record<string, any> | null;
  documents: FolderDoc[];
  requests: HrRequest[];
  leave: any[];
  declarations: { id: string; declaration_date: string; signature_typed_name: string; submitted_at: string }[];
  audit: { id: string; at: string; actor: string; action: string; details: string | null; created_at: string }[];
  canManage: boolean;
};

const LIST_KEY = ["hr", "employees"];
const fmt = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(parseISO(d), "d MMM yyyy");
  } catch {
    return d;
  }
};
const size = (n?: number | null) => (!n ? "" : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const sel = `${selectClass} w-full`;

export function EmployeeFoldersPage() {
  const [openId, setOpenId] = useState<string | null>(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("employee") : null));
  const q = useQuery({ queryKey: LIST_KEY, queryFn: async () => (await hrApi("/api/staff/hr/employees")) as ListResponse });
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data?.employees ?? []).filter(
      (e) =>
        (!dept || e.department?.key === dept) &&
        (!s || [e.full_name, e.email, e.job_title, e.employee_number].some((v) => String(v ?? "").toLowerCase().includes(s))),
    );
  }, [q.data, search, dept]);

  const go = (id: string | null) => {
    setOpenId(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("employee", id);
    else u.searchParams.delete("employee");
    window.history.replaceState(null, "", u.toString());
  };

  if (openId) return <FolderView id={openId} departments={q.data?.departments ?? []} onBack={() => go(null)} />;

  const all = q.data?.employees ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">HR workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Employee Folders</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Each employee's confidential HR folder: details, documents, requests, leave and a full history of HR actions. Only HR and administrators can change records; the CEO can view them.
          </p>
        </div>
        {q.data?.canManage && (
          <Button onClick={() => setAdding(true)}>
            <UserPlus className="mr-1 h-4 w-4" /> Add employee
          </Button>
        )}
      </div>

      <StatGrid>
        <StatCard label="Employees" value={all.length} />
        <StatCard label="Documents on file" value={all.reduce((n, e) => n + e.documents, 0)} />
        <StatCard label="Open document requests" value={all.reduce((n, e) => n + e.open_requests, 0)} />
        <StatCard label="Leave awaiting HR" value={all.reduce((n, e) => n + e.pending_leave, 0)} />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or employee number" className="h-9 w-72 pl-8" />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={selectClass} aria-label="Department">
          <option value="">All departments</option>
          {(q.data?.departments ?? []).map((d) => (
            <option key={d.key} value={d.key}>{d.name}</option>
          ))}
        </select>
      </div>

      {q.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : q.error ? (
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error).message}</Card>
      ) : !rows.length ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No employees match.</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Employee</th>
                  <th className="px-4 py-2 font-medium">Department</th>
                  <th className="px-4 py-2 font-medium">Employment</th>
                  <th className="px-4 py-2 text-right font-medium">Documents</th>
                  <th className="px-4 py-2 text-right font-medium">Open requests</th>
                  <th className="px-4 py-2 text-right font-medium">Leave pending</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{e.full_name ?? e.email}</p>
                      <p className="text-xs text-muted-foreground">{[e.job_title, e.email].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{e.department?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {e.employment_type ?? "—"}
                      {e.join_date ? <span className="text-muted-foreground"> · since {fmt(e.join_date)}</span> : null}
                    </td>
                    <td className="px-4 py-2.5 text-right">{e.documents}</td>
                    <td className="px-4 py-2.5 text-right">
                      {e.open_requests}
                      {e.overdue_requests > 0 && <span className="ml-1 text-xs font-semibold text-rose-600">({e.overdue_requests} overdue)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">{e.pending_leave}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => go(e.id)}>
                        <FolderOpen className="mr-1 h-3.5 w-3.5" /> Open folder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {adding && q.data && <AddEmployeeDialog departments={q.data.departments} onClose={() => setAdding(false)} onCreated={(id) => { setAdding(false); go(id); }} />}
    </div>
  );
}

function FolderView({ id, departments, onBack }: { id: string; departments: Dept[]; onBack: () => void }) {
  const q = useQuery({ queryKey: ["hr", "folder", id], queryFn: async () => (await hrApi(`/api/staff/hr/employees/${id}`)) as Folder, staleTime: 30_000 });
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");

  if (q.isLoading) return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Opening folder…</p>;
  if (q.error || !q.data)
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> All employees</Button>
        <Card className="p-6 text-sm text-muted-foreground">{(q.error as Error)?.message ?? "Folder not found."}</Card>
      </div>
    );
  const f = q.data;
  const p = f.profile;
  const d = f.details ?? {};
  const docs = f.documents.filter((x) => !category || (x.category ?? x.type) === category);
  const reqs = f.requests.filter((r) => r.status !== "Cancelled");

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> All employees</Button>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{p.full_name}</h1>
            <p className="text-sm text-muted-foreground">{[p.job_title, p.department?.name, p.email].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {d.employee_number ? `Employee no. ${d.employee_number} · ` : ""}
              {d.employment_type ?? "Employment type not recorded"}
              {d.join_date ? ` · started ${fmt(d.join_date)}` : ""}
              {d.end_date ? ` · ends ${fmt(d.end_date)}` : ""}
              {p.is_active === false ? " · inactive" : ""}
            </p>
          </div>
          {f.canManage && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit details</Button>
              <Button size="sm" variant="outline" onClick={() => setUploading(true)}><Upload className="mr-1 h-3.5 w-3.5" /> Add document</Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/hr/document-requests?employee=${p.id}`}><Plus className="mr-1 h-3.5 w-3.5" /> Request a document</a>
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Tabs defaultValue="documents">
        <TabsList className="flex-wrap">
          <TabsTrigger value="documents">Documents ({f.documents.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="requests">Requests ({reqs.length})</TabsTrigger>
          <TabsTrigger value="leave">Leave ({f.leave.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {["", ...FOLDER_CATEGORIES].map((c) => {
              const n = c ? f.documents.filter((x) => (x.category ?? x.type) === c).length : f.documents.length;
              if (c && !n) return null;
              return (
                <button key={c || "all"} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1 text-xs ${category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {c || "All"} ({n})
                </button>
              );
            })}
          </div>
          {!docs.length ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No documents in this folder yet.{f.canManage ? " Use “Add document”, or request one from the employee." : ""}
            </Card>
          ) : (
            <Card className="divide-y divide-border">
              {docs.map((doc) => <DocRow key={doc.id} employeeId={p.id} doc={doc} canManage={f.canManage} />)}
            </Card>
          )}
          {f.declarations.length > 0 && (
            <Card className="p-4 text-sm">
              <p className="font-medium">Signed declarations on record</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {f.declarations.map((x) => (
                  <li key={x.id}>Internal Confidentiality and Conflict Declaration — signed as {x.signature_typed_name} on {fmt(x.declaration_date)}</li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card className="grid gap-x-8 gap-y-3 p-5 text-sm sm:grid-cols-2">
            {[
              ["Full name", p.full_name],
              ["Work email", p.email],
              ["Phone", p.phone],
              ["Job title", p.job_title],
              ["Department", p.department?.name],
              ["Employee number", d.employee_number],
              ["Employment type", d.employment_type],
              ["Start date", d.join_date && fmt(d.join_date)],
              ["End date", d.end_date && fmt(d.end_date)],
              ["Reports to", d.manager],
              ["ID / passport number", d.id_number],
              ["Date of birth", d.date_of_birth && fmt(d.date_of_birth)],
              ["Gender", d.gender],
              ["Home address", d.address],
              ["Emergency contact", [d.emergency_contact_name, d.emergency_contact_phone].filter(Boolean).join(" · ")],
              ["Portal account since", fmt(p.created_at)],
            ].map(([k, v]) => (
              <div key={k as string}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="whitespace-pre-line">{(v as string) || "—"}</p>
              </div>
            ))}
            {d.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">HR notes</p>
                <p className="whitespace-pre-line">{d.notes}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          {!reqs.length ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No document requests for this employee.</Card>
          ) : (
            <Card className="divide-y divide-border">
              {reqs.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {KIND_LABEL[r.kind]} · requested {fmt(r.created_at)}
                      {r.due_date ? ` · due ${fmt(r.due_date)}` : ""}
                      {r.review_note ? ` · HR note: ${r.review_note}` : ""}
                    </p>
                  </div>
                  <StatusBadge r={r} />
                </div>
              ))}
            </Card>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Review submissions on <Link to="/hr/document-requests" className="underline">Document Requests</Link>. Accepted documents are filed under Documents.</p>
        </TabsContent>

        <TabsContent value="leave">
          {!f.leave.length ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No leave applications.</Card>
          ) : (
            <Card className="divide-y divide-border">
              {f.leave.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.leave_type ?? "Leave"} · {fmt(l.start_date)} – {fmt(l.end_date)}{l.days ? ` (${l.days} day${l.days === 1 ? "" : "s"})` : ""}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.reason}
                      {l.hr_note ? ` · HR: ${l.hr_note}` : ""}
                      {l.reviewed_by_name ? ` · decided by ${l.reviewed_by_name} on ${fmt(l.reviewed_at)}` : ""}
                    </p>
                  </div>
                  <LeaveStatusBadge status={l.status} />
                </div>
              ))}
            </Card>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Approve or decline applications on <Link to="/hr/leave" className="underline">Leave Management</Link>.</p>
        </TabsContent>

        <TabsContent value="history">
          {!f.audit.length ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No HR actions recorded yet.</Card>
          ) : (
            <Card className="divide-y divide-border">
              {f.audit.map((a) => (
                <div key={a.id} className="px-4 py-2.5 text-sm">
                  <p><span className="font-medium">{a.action}</span> <span className="text-muted-foreground">by {a.actor}</span></p>
                  <p className="text-xs text-muted-foreground">{a.at}{a.details ? ` · ${a.details}` : ""}</p>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {editing && <EditDetailsDialog folder={f} departments={departments} onClose={() => setEditing(false)} />}
      {uploading && <UploadDialog employeeId={p.id} employeeName={p.full_name} onClose={() => setUploading(false)} />}
    </div>
  );
}

function DocRow({ employeeId, doc, canManage }: { employeeId: string; doc: FolderDoc; canManage: boolean }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(doc.name);
  const [cat, setCat] = useState(doc.category ?? doc.type ?? "Other");
  const [date, setDate] = useState(doc.document_date ?? "");
  const [notes, setNotes] = useState(doc.notes ?? "");
  const base = `/api/staff/hr/employees/${employeeId}/documents/${encodeURIComponent(doc.id)}`;
  const open = async (download: boolean) => {
    setBusy(true);
    try {
      const l = await hrApi(`${base}/link`);
      window.open(download ? l.downloadUrl : l.url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    try {
      await hrApi(base, { method: "PATCH", body: JSON.stringify({ name, category: cat, documentDate: date, notes }) });
      toast.success("Document updated");
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["hr"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!(await confirmAction({
      title: "Remove document from folder?",
      description: `"${doc.name}" will be removed from this employee folder. ${doc.source === "upload" ? "The uploaded file will be permanently deleted." : "The original stays with its document request."}`,
      confirmText: "Remove",
      variant: "destructive",
    }))) return;
    setBusy(true);
    try {
      await hrApi(base, { method: "DELETE" });
      toast.success("Document removed");
      await qc.invalidateQueries({ queryKey: ["hr"] });
    } catch (e: any) {
      toast.error(e.message);
      setBusy(false);
    }
  };
  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{doc.name}</p>
          <p className="text-xs text-muted-foreground">
            {doc.category ?? doc.type ?? "Other"}
            {doc.document_date ? ` · dated ${fmt(doc.document_date)}` : ""} · added {fmt(doc.created_at)}
            {doc.uploaded_by_name ? ` by ${doc.uploaded_by_name}` : ""}
            {doc.source === "request" ? " · from a document request" : ""}
            {doc.size ? ` · ${size(doc.size)}` : ""}
          </p>
          {doc.notes && !editing && <p className="mt-0.5 text-xs text-muted-foreground">{doc.notes}</p>}
        </div>
        {doc.storage_path && (
          <>
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={busy} onClick={() => open(false)}><Eye className="mr-1 h-3.5 w-3.5" /> View</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={busy} onClick={() => open(true)}><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
          </>
        )}
        {canManage && (
          <>
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={busy} onClick={() => setEditing((v) => !v)} aria-label={`Edit ${doc.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-600" disabled={busy} onClick={remove} aria-label={`Remove ${doc.name}`}><Trash2 className="h-3.5 w-3.5" /></Button>
          </>
        )}
      </div>
      {editing && (
        <div className="mt-3 grid gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-3">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
              {FOLDER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Document date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <Button size="sm" className="h-8 text-xs" disabled={busy || !name.trim()} onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadDialog({ employeeId, employeeName, onClose }: { employeeId: string; employeeName: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<string>("Employment contract");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return toast.error("Files must be 25 MB or smaller.");
    setBusy(true);
    try {
      const base = `/api/staff/hr/employees/${employeeId}/documents`;
      const s = await hrApi(`${base}/upload-url`, { method: "POST", body: JSON.stringify({ fileName: file.name, size: file.size }) });
      const { error } = await uploading(file.name, () => supabase.storage.from("hr-documents").uploadToSignedUrl(s.path, s.token, file, { contentType: file.type || "application/octet-stream", upsert: false }));
      if (error) throw new Error(`Upload failed: ${error.message}`);
      await hrApi(base, { method: "POST", body: JSON.stringify({ path: s.path, name: name.trim() || file.name, category: cat, documentDate: date, notes, size: file.size, mimeType: file.type }) });
      toast.success("Added to the folder");
      await qc.invalidateQueries({ queryKey: ["hr"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a document to {employeeName}'s folder</DialogTitle>
          <DialogDescription className="text-xs">Stored privately. Only HR and administrators can open it; the CEO can view it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/30 px-3 py-4 text-center hover:border-muted-foreground/50">
            <input type="file" className="sr-only" aria-label="Choose file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.heic,.txt,.csv,.zip" onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); if (f && !name) setName(f.name.replace(/\.[^.]+$/, "")); }} />
            <span className="inline-flex items-center gap-1.5 text-sm font-medium"><Upload className="h-4 w-4" /> {file ? file.name : "Choose a file"}</span>
            <span className="text-[11px] text-muted-foreground">PDF, Word, Excel, images or ZIP · up to 25 MB</span>
          </label>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="doc-name">Document name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="doc-cat">Category</Label>
              <select id="doc-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={sel}>
                {FOLDER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="doc-date">Document date</Label>
              <Input id="doc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="doc-notes">Notes</Label>
            <Textarea id="doc-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!file || busy} onClick={save}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add to folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDetailsDialog({ folder, departments, onClose }: { folder: Folder; departments: Dept[]; onClose: () => void }) {
  const qc = useQueryClient();
  const p = folder.profile;
  const d = folder.details ?? {};
  const [v, setV] = useState<Record<string, string>>({
    fullName: p.full_name ?? "",
    phone: p.phone ?? "",
    jobTitle: p.job_title ?? "",
    departmentKey: p.department?.key ?? "",
    employee_number: d.employee_number ?? "",
    employment_type: d.employment_type ?? "",
    join_date: d.join_date ?? "",
    end_date: d.end_date ?? "",
    manager: d.manager ?? "",
    id_number: d.id_number ?? "",
    date_of_birth: d.date_of_birth ?? "",
    gender: d.gender ?? "",
    address: d.address ?? "",
    emergency_contact_name: d.emergency_contact_name ?? "",
    emergency_contact_phone: d.emergency_contact_phone ?? "",
    notes: d.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));
  const lockedDept = ["manager", "root_admin"].includes(p.role_tier ?? "");
  const save = async () => {
    setBusy(true);
    try {
      const { fullName, phone, jobTitle, departmentKey, ...details } = v;
      const res = await hrApi(`/api/staff/hr/employees/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fullName, phone, jobTitle, departmentKey: lockedDept ? undefined : departmentKey || undefined, details }),
      });
      toast.success(res.changed?.length ? "Employee record updated" : "No changes to save");
      await qc.invalidateQueries({ queryKey: ["hr"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const field = (k: string, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-xs" htmlFor={`ed-${k}`}>{label}</Label>
      <Input id={`ed-${k}`} type={type} value={v[k]} onChange={set(k)} />
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Edit {p.full_name}</DialogTitle>
          <DialogDescription className="text-xs">Every change is recorded in the folder's history.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-2">
          <p className="text-xs font-semibold text-muted-foreground">Employment</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("fullName", "Full name")}
            {field("jobTitle", "Job title")}
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="ed-dept">Department</Label>
              <select id="ed-dept" value={v.departmentKey} onChange={set("departmentKey")} className={sel} disabled={lockedDept}>
                <option value="">—</option>
                {departments.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}
              </select>
              {lockedDept && <p className="text-[11px] text-muted-foreground">Managers and administrators change department on Department Structure.</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="ed-type">Employment type</Label>
              <select id="ed-type" value={v.employment_type} onChange={set("employment_type")} className={sel}>
                <option value="">—</option>
                {EMPLOYMENT_TYPES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            {field("employee_number", "Employee number")}
            {field("manager", "Reports to")}
            {field("join_date", "Start date", "date")}
            {field("end_date", "End date (if any)", "date")}
          </div>
          <p className="text-xs font-semibold text-muted-foreground">Personal</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("phone", "Phone")}
            {field("id_number", "ID / passport number")}
            {field("date_of_birth", "Date of birth", "date")}
            {field("gender", "Gender")}
            {field("emergency_contact_name", "Emergency contact name")}
            {field("emergency_contact_phone", "Emergency contact phone")}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ed-address">Home address</Label>
            <Textarea id="ed-address" rows={2} value={v.address} onChange={set("address")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ed-notes">HR notes (confidential)</Label>
            <Textarea id="ed-notes" rows={3} value={v.notes} onChange={set("notes")} />
          </div>
        </div>
        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={busy || v.fullName.trim().length < 2} onClick={save}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddEmployeeDialog({ departments, onClose, onCreated }: { departments: Dept[]; onClose: () => void; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [v, setV] = useState({ fullName: "", email: "", phone: "", jobTitle: "", departmentKey: "", roleTier: "staff", employment_type: "", join_date: "", employee_number: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; email: string; password: string } | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      const res = await hrApi("/api/staff/hr/employees", {
        method: "POST",
        body: JSON.stringify({
          fullName: v.fullName,
          email: v.email,
          phone: v.phone,
          jobTitle: v.jobTitle,
          departmentKey: v.departmentKey,
          roleTier: v.roleTier,
          details: { employment_type: v.employment_type, join_date: v.join_date, employee_number: v.employee_number },
        }),
      });
      await qc.invalidateQueries({ queryKey: ["hr"] });
      setDone({ id: res.employee.id, email: res.employee.email, password: res.temporaryPassword });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (done)
    return (
      <Dialog open onOpenChange={(o) => !o && onCreated(done.id)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee added</DialogTitle>
            <DialogDescription className="text-xs">Give these sign-in details to the employee privately. The temporary password is shown only once; they must change it when they first sign in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm">
            <p>{done.email}</p>
            <p className="flex items-center justify-between gap-2">
              {done.password}
              <Button size="sm" variant="ghost" className="h-7" onClick={() => navigator.clipboard.writeText(done.password).then(() => toast.success("Copied"))} aria-label="Copy password"><Copy className="h-3.5 w-3.5" /></Button>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onCreated(done.id)}>Open their folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription className="text-xs">Creates their portal account and HR folder. HR can add staff and interns; managers are appointed by the Root Admin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs" htmlFor="ae-name">Full name *</Label>
            <Input id="ae-name" value={v.fullName} onChange={set("fullName")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs" htmlFor="ae-email">Work email *</Label>
            <Input id="ae-email" type="email" value={v.email} onChange={set("email")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-dept">Department *</Label>
            <select id="ae-dept" value={v.departmentKey} onChange={set("departmentKey")} className={sel}>
              <option value="">Choose…</option>
              {departments.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-tier">Access</Label>
            <select id="ae-tier" value={v.roleTier} onChange={set("roleTier")} className={sel}>
              <option value="staff">Staff</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-title">Job title</Label>
            <Input id="ae-title" value={v.jobTitle} onChange={set("jobTitle")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-phone">Phone</Label>
            <Input id="ae-phone" value={v.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-type">Employment type</Label>
            <select id="ae-type" value={v.employment_type} onChange={set("employment_type")} className={sel}>
              <option value="">—</option>
              {EMPLOYMENT_TYPES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="ae-start">Start date</Label>
            <Input id="ae-start" type="date" value={v.join_date} onChange={set("join_date")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={busy || v.fullName.trim().length < 2 || !v.email.includes("@") || !v.departmentKey} onClick={save}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
