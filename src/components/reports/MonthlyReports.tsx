/**
 * Monthly Reports.
 *  - Department reports: each department writes one report per month (summary, achievements,
 *    key figures, challenges, next month's priorities, support needed, supporting files). The
 *    department's manager and employees write and submit it; the CEO, General Manager and
 *    administrators see every department's reports and which departments have not submitted.
 *  - Client reports: the existing read-only client report library.
 * All department-report reads and writes go through /api/staff/reports (permissions are enforced
 * there and by the database's access rules).
 */
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subMonths } from "date-fns";
import {
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Download,
  Eye,
  FileBarChart2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ClientReportsPanel } from "@/components/portal-pages";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { REPORT_SECTIONS, type MonthlyReportRow, type ReportFile } from "@/lib/monthly-reports";

type ReportsResponse = {
  reports: MonthlyReportRow[];
  writable: { key: string; name: string; manages: boolean }[];
  oversees: boolean;
  departments: { key: string; name: string }[] | null;
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body?.error || `Request failed (${res.status})`), { body });
  return body;
}

const KEY = ["staff", "monthly-reports"];
const ALL = "__all__";
const monthLabel = (iso: string) => format(parseISO(iso), "MMMM yyyy");
const monthValue = (iso: string) => iso.slice(0, 7);
const sizeLabel = (n: number) => (n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip,.mp4,.mov";
const previewable = (f: ReportFile) => /^image\//.test(f.mimeType) || /\.(pdf|png|jpe?g|webp|gif)$/i.test(f.name);
/** Reports cover a finished month, so the default month is the previous one. */
const defaultMonth = () => format(subMonths(new Date(), 1), "yyyy-MM");

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted")
    return (
      <Badge className="gap-1 border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Submitted
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <CircleDashed className="h-3 w-3" /> Draft
    </Badge>
  );
}

export function MonthlyReportsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: async () => (await api("/api/staff/reports")) as ReportsResponse });
  const [month, setMonth] = useState<string>(ALL);
  const [dept, setDept] = useState<string>(ALL);
  const [open, setOpen] = useState<MonthlyReportRow | null>(null);
  const [editing, setEditing] = useState<MonthlyReportRow | "new" | null>(null);
  const [coverageMonth, setCoverageMonth] = useState(defaultMonth());

  const deptReports = useMemo(() => (q.data?.reports ?? []).filter((r) => r.department_key), [q.data]);
  const months = useMemo(() => {
    const set = new Set(deptReports.map((r) => monthValue(r.reporting_month)));
    return Array.from(set).sort().reverse();
  }, [deptReports]);
  const deptOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of q.data?.departments ?? []) m.set(d.key, d.name);
    for (const r of deptReports) m.set(r.department_key!, r.department_name ?? r.department_key!);
    return Array.from(m, ([key, name]) => ({ key, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [q.data, deptReports]);
  const shown = deptReports.filter((r) => (month === ALL || monthValue(r.reporting_month) === month) && (dept === ALL || r.department_key === dept));
  const canWrite = (q.data?.writable.length ?? 0) > 0;
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });

  // Keep the open report in step with the list after a change.
  const current = open ? deptReports.find((r) => r.id === open.id) ?? open : null;

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <FileBarChart2 className="h-3.5 w-3.5" /> Reporting
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Monthly Reports</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {q.data?.oversees
              ? "Every department's monthly report, who prepared it and when it was submitted."
              : "Your department's monthly reports. Prepare the report for the month, attach supporting files and submit it to management."}
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="mr-1 h-4 w-4" /> New monthly report
          </Button>
        )}
      </div>

      <Tabs defaultValue="department">
        <TabsList>
          <TabsTrigger value="department">Department reports</TabsTrigger>
          <TabsTrigger value="client">Client reports</TabsTrigger>
        </TabsList>

        <TabsContent value="department" className="mt-4 space-y-4">
          {q.isLoading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
            </p>
          ) : q.error ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{(q.error as Error).message}</p>
          ) : (
            <>
              {q.data?.oversees && q.data.departments && (
                <Coverage
                  month={coverageMonth}
                  setMonth={setCoverageMonth}
                  departments={q.data.departments}
                  reports={deptReports}
                  onOpen={setOpen}
                />
              )}

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="mb-1 block text-xs">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-9 w-44 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL} className="text-xs">All months</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">{monthLabel(`${m}-01`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {deptOptions.length > 1 && (
                  <div>
                    <Label className="mb-1 block text-xs">Department</Label>
                    <Select value={dept} onValueChange={setDept}>
                      <SelectTrigger className="h-9 w-56 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value={ALL} className="text-xs">All departments</SelectItem>
                        {deptOptions.map((d) => (
                          <SelectItem key={d.key} value={d.key} className="text-xs">{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {shown.length} report{shown.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                {shown.length ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">Report</th>
                        <th className="px-3 py-2.5 font-medium">Department</th>
                        <th className="px-3 py-2.5 font-medium">Month</th>
                        <th className="px-3 py-2.5 font-medium">Responsible</th>
                        <th className="px-3 py-2.5 font-medium">Submitted</th>
                        <th className="px-3 py-2.5 font-medium">Status</th>
                        <th className="px-3 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.id} onClick={() => setOpen(r)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="max-w-[20rem] px-4 py-2.5">
                            <p className="truncate font-medium text-foreground">{r.title}</p>
                            {r.attachments?.length ? (
                              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Paperclip className="h-3 w-3" /> {r.attachments.length} file{r.attachments.length === 1 ? "" : "s"}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 text-xs">{r.department_name}</td>
                          <td className="px-3 py-2.5 text-xs">{monthLabel(r.reporting_month)}</td>
                          <td className="px-3 py-2.5 text-xs">{r.prepared_by_name || "—"}</td>
                          <td className="px-3 py-2.5 text-xs tabular-nums">{r.submitted_at ? format(parseISO(r.submitted_at), "d MMM yyyy, HH:mm") : "—"}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                          <td className="px-3 py-2.5 text-right">
                            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <FileBarChart2 className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {deptReports.length ? "No reports match these filters." : "No department reports yet"}
                    </p>
                    {!deptReports.length && canWrite && (
                      <p className="mt-1 text-xs text-muted-foreground">Start this month's report with “New monthly report”.</p>
                    )}
                    {!deptReports.length && !canWrite && !q.data?.oversees && (
                      <p className="mt-1 text-xs text-muted-foreground">You are not placed in a department yet, so you cannot write a department report.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="client" className="mt-4">
          <ClientReportsPanel />
        </TabsContent>
      </Tabs>

      {current && !editing && (
        <ReportViewer
          report={current}
          onClose={() => setOpen(null)}
          onEdit={() => setEditing(current)}
          onChanged={refresh}
          onDeleted={() => {
            setOpen(null);
            refresh();
          }}
        />
      )}
      {editing && q.data && (
        <ReportEditor
          report={editing === "new" ? null : editing}
          writable={q.data.writable}
          onClose={() => setEditing(null)}
          onSaved={(r) => {
            refresh();
            setEditing(null);
            setOpen(r);
          }}
          onOpenExisting={(id) => {
            const r = deptReports.find((x) => x.id === id);
            setEditing(null);
            if (r) setOpen(r);
          }}
        />
      )}
    </div>
  );
}

/** Which departments have submitted their report for a month (CEO, General Manager, administrators). */
function Coverage({
  month,
  setMonth,
  departments,
  reports,
  onOpen,
}: {
  month: string;
  setMonth: (m: string) => void;
  departments: { key: string; name: string }[];
  reports: MonthlyReportRow[];
  onOpen: (r: MonthlyReportRow) => void;
}) {
  const options = useMemo(() => Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), i), "yyyy-MM")), []);
  const forMonth = reports.filter((r) => monthValue(r.reporting_month) === month);
  const submitted = forMonth.filter((r) => r.status === "submitted").length;
  return (
    <section className="rounded-xl border border-border bg-card p-4" aria-label="Report submissions by department">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Submissions for {monthLabel(`${month}-01`)}</h2>
          <p className="text-xs text-muted-foreground">
            {submitted} of {departments.length} departments submitted
          </p>
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="h-8 w-44 text-xs" aria-label="Month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((m) => (
              <SelectItem key={m} value={m} className="text-xs">{monthLabel(`${m}-01`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((d) => {
          const r = forMonth.find((x) => x.department_key === d.key);
          const state = r ? (r.status === "submitted" ? "Submitted" : "Draft in progress") : "Not submitted";
          return (
            <button
              key={d.key}
              type="button"
              disabled={!r}
              onClick={() => r && onOpen(r)}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left transition enabled:hover:bg-muted/40 disabled:cursor-default"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-foreground">{d.name}</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {r?.submitted_at ? `${format(parseISO(r.submitted_at), "d MMM")} · ${r.prepared_by_name ?? ""}` : r ? r.prepared_by_name : "—"}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  state === "Submitted"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : state === "Draft in progress"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {state}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FileList({ report }: { report: MonthlyReportRow }) {
  const links = useQuery({
    queryKey: ["staff", "monthly-reports", "files", report.id, report.updated_at],
    queryFn: async () => (await api(`/api/staff/reports/${report.id}/files`)).files as ReportFile[],
    enabled: Boolean(report.attachments?.length),
    staleTime: 10 * 60_000,
  });
  if (!report.attachments?.length) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Supporting files</h3>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {report.attachments.map((f) => {
          const l = links.data?.find((x) => x.path === f.path);
          const Icon = /^image\//.test(f.mimeType) ? ImageIcon : FileText;
          return (
            <li key={f.path} className="flex items-center gap-2 px-3 py-2 text-xs">
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium" title={f.name}>{f.name}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{sizeLabel(f.size)}</span>
              {links.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              {l?.available && previewable(f) && (
                <a href={l.url} target="_blank" rel="noreferrer" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Preview ${f.name}`} title="Preview">
                  <Eye className="h-3.5 w-3.5" />
                </a>
              )}
              {l?.available && (
                <a href={l.downloadUrl} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Download ${f.name}`} title="Download">
                  <Download className="h-3.5 w-3.5" />
                </a>
              )}
              {l && !l.available && <span className="text-[10px] text-rose-600">missing</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Opens a print-ready copy of the report; the browser's print dialog saves it as a PDF. */
function printReport(r: MonthlyReportRow) {
  const sections = REPORT_SECTIONS.filter((s) => r.data?.[s.key])
    .map((s) => `<h2>${esc(s.label)}</h2><p>${esc(String(r.data[s.key])).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const files = r.attachments?.length ? `<h2>Supporting files</h2><ul>${r.attachments.map((f) => `<li>${esc(f.name)}</li>`).join("")}</ul>` : "";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.title)}</title><style>
    body{font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;color:#111;max-width:760px;margin:40px auto;padding:0 24px}
    h1{font-size:22px;margin:0 0 4px}.meta{color:#555;font-size:12px;margin-bottom:24px;border-bottom:1px solid #ddd;padding-bottom:12px}
    h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8;margin:22px 0 6px}p{margin:0;white-space:normal}
  </style></head><body><h1>${esc(r.title)}</h1><div class="meta">Mavis Strategic Partners · ${esc(r.department_name ?? "")} · ${esc(monthLabel(r.reporting_month))}<br>
    Prepared by ${esc(r.prepared_by_name ?? "—")} · ${r.submitted_at ? `Submitted ${esc(format(parseISO(r.submitted_at), "d MMMM yyyy, HH:mm"))}` : "Draft — not yet submitted"}</div>
    ${sections}${files}</body></html>`;
  const w = window.open("", "_blank");
  if (!w) {
    toast.error("Allow pop-ups for this site to print or save the report.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

function ReportViewer({
  report: r,
  onClose,
  onEdit,
  onChanged,
  onDeleted,
}: {
  report: MonthlyReportRow;
  onClose: () => void;
  onEdit: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const act = async (action: "submit" | "reopen") => {
    setBusy(true);
    try {
      await api(`/api/staff/reports/${r.id}`, { method: "PATCH", body: JSON.stringify({ action }) });
      toast.success(action === "submit" ? "Report submitted" : "Report returned to draft", {
        description: action === "submit" ? "Management has been notified." : undefined,
      });
      onChanged();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const del = async () => {
    if (!confirm("Delete this draft report and its files?")) return;
    try {
      await api(`/api/staff/reports/${r.id}`, { method: "DELETE" });
      toast.success("Draft deleted");
      onDeleted();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="pr-6">{r.title}</SheetTitle>
          <SheetDescription className="text-xs">
            {r.department_name} · {monthLabel(r.reporting_month)}
          </SheetDescription>
        </SheetHeader>
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border p-3 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5"><StatusBadge status={r.status} /></dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Responsible</dt>
            <dd className="mt-0.5 font-medium">{r.prepared_by_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Submitted</dt>
            <dd className="mt-0.5 font-medium">{r.submitted_at ? format(parseISO(r.submitted_at), "d MMM yyyy, HH:mm") : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd className="mt-0.5 font-medium">{format(parseISO(r.updated_at), "d MMM yyyy")}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-5">
          {REPORT_SECTIONS.map((s) =>
            r.data?.[s.key] ? (
              <section key={s.key}>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">{s.label}</h3>
                <p className="whitespace-pre-line text-sm text-foreground">{r.data[s.key]}</p>
              </section>
            ) : null,
          )}
          {!REPORT_SECTIONS.some((s) => r.data?.[s.key]) && <p className="text-sm text-muted-foreground">Nothing written yet.</p>}
          <FileList report={r} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button size="sm" variant="outline" onClick={() => printReport(r)}>
            <Printer className="mr-1 h-3.5 w-3.5" /> Print / save as PDF
          </Button>
          {r.can_edit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {r.status === "draft" && r.can_edit && (
            <Button size="sm" onClick={() => act("submit")} disabled={busy}>
              <Send className="mr-1 h-3.5 w-3.5" /> Submit report
            </Button>
          )}
          {r.status === "submitted" && r.can_manage && (
            <Button size="sm" variant="outline" onClick={() => act("reopen")} disabled={busy}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Return to draft
            </Button>
          )}
          {r.status === "draft" && r.can_edit && (
            <Button size="sm" variant="ghost" className="ml-auto text-rose-600" onClick={del}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete draft
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ReportEditor({
  report,
  writable,
  onClose,
  onSaved,
  onOpenExisting,
}: {
  report: MonthlyReportRow | null;
  writable: ReportsResponse["writable"];
  onClose: () => void;
  onSaved: (r: MonthlyReportRow) => void;
  onOpenExisting: (id: string) => void;
}) {
  const isNew = !report;
  const [dept, setDept] = useState(report?.department_key ?? (writable.length === 1 ? writable[0].key : ""));
  const [month, setMonth] = useState(report ? monthValue(report.reporting_month) : defaultMonth());
  const [title, setTitle] = useState(report?.title ?? "");
  const [data, setData] = useState<Record<string, string>>({ ...(report?.data ?? {}) });
  const [files, setFiles] = useState<ReportFile[]>(report?.attachments ?? []);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const saved = useMemo(() => new Set((report?.attachments ?? []).map((f) => f.path)), [report]);
  const filesRef = useRef(files);
  filesRef.current = files;
  const doneRef = useRef(false);

  const discard = (paths: string[]) => {
    for (const path of paths) api("/api/staff/reports/discard-upload", { method: "POST", body: JSON.stringify({ path }) }).catch(() => {});
  };
  const close = () => {
    if (!doneRef.current) discard(filesRef.current.filter((f) => !saved.has(f.path)).map((f) => f.path));
    onClose();
  };

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    if (!dept) {
      toast.error("Choose the department first.");
      return;
    }
    const chosen = Array.from(list).slice(0, Math.max(0, 10 - files.length));
    if (chosen.length < list.length) toast.warning("At most 10 files can be attached.");
    setUploading((n) => n + chosen.length);
    for (const file of chosen) {
      try {
        if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} is larger than 25 MB.`);
        const slot = await api("/api/staff/reports/upload-url", {
          method: "POST",
          body: JSON.stringify({ departmentKey: dept, fileName: file.name, mimeType: file.type, size: file.size }),
        });
        const mimeType = file.type || "application/octet-stream";
        const { error } = await supabase.storage.from("evidence").uploadToSignedUrl(slot.path, slot.token, file, { contentType: mimeType, upsert: false });
        if (error) throw new Error(`${file.name}: upload failed (${error.message}).`);
        setFiles((f) => [...f, { name: file.name, path: slot.path, size: file.size, mimeType }]);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const removeFile = (f: ReportFile) => {
    setFiles((list) => list.filter((x) => x.path !== f.path));
    if (!saved.has(f.path)) discard([f.path]);
  };

  const save = async (submit: boolean) => {
    if (!dept) return toast.error("Choose the department.");
    if (submit && !data.summary?.trim()) return toast.error("Write the summary before submitting.");
    setSaving(true);
    const payload = {
      departmentKey: dept,
      reportingMonth: month,
      title: title.trim() || undefined,
      data,
      attachments: files.map(({ name, path, size, mimeType }) => ({ name, path, size, mimeType })),
    };
    try {
      let res;
      if (isNew) res = await api("/api/staff/reports", { method: "POST", body: JSON.stringify({ ...payload, submit }) });
      else
        res = await api(`/api/staff/reports/${report!.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, title: title.trim() || report!.title, ...(submit && report!.status !== "submitted" ? { action: "submit" } : {}) }),
        });
      doneRef.current = true;
      toast.success(submit ? "Report submitted" : "Draft saved", { description: submit ? "Management has been notified." : undefined });
      onSaved(res.report);
    } catch (e: any) {
      if (e.body?.existingId) {
        toast.error(e.message, { action: { label: "Open it", onClick: () => onOpenExisting(e.body.existingId) } });
      } else toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploading > 0;
  return (
    <Sheet open onOpenChange={(o) => !o && close()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b border-border px-6 pb-3 pt-6 text-left">
          <SheetTitle>{isNew ? "New monthly report" : "Edit monthly report"}</SheetTitle>
          <SheetDescription className="text-xs">
            Write from your department's own records. Save a draft at any time; submitting sends it to management.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Department *</Label>
              <Select value={dept || undefined} onValueChange={setDept} disabled={!isNew || files.length > 0}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {(isNew ? writable : [{ key: report!.department_key!, name: report!.department_name ?? "" }]).map((d) => (
                    <SelectItem key={d.key} value={d.key} className="text-xs">{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="report-month">Reporting month *</Label>
              <Input id="report-month" type="month" value={month} max={format(new Date(), "yyyy-MM")} onChange={(e) => setMonth(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs" htmlFor="report-title">Title</Label>
              <Input id="report-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave empty to use “<Department> — Monthly Report (<Month>)”" className="h-9 text-xs" />
            </div>
          </div>
          {REPORT_SECTIONS.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <Label className="text-xs" htmlFor={`report-${s.key}`}>
                {s.label}
                {"required" in s && s.required ? " *" : ""}
              </Label>
              <Textarea
                id={`report-${s.key}`}
                value={data[s.key] ?? ""}
                onChange={(e) => setData((d) => ({ ...d, [s.key]: e.target.value }))}
                rows={s.key === "summary" ? 4 : 3}
                placeholder={s.help}
                className="text-xs"
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <Paperclip className="h-3.5 w-3.5" /> Supporting files <span className="font-normal text-muted-foreground">({files.length} of 10)</span>
            </Label>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/30 px-3 py-3 text-center hover:border-muted-foreground/50">
              <input type="file" multiple accept={ACCEPT} className="sr-only" aria-label="Attach files" disabled={!dept || files.length >= 10} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <Paperclip className="h-3.5 w-3.5" /> {uploading ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…` : dept ? "Attach files" : "Choose the department to attach files"}
              </span>
              <span className="text-[10px] text-muted-foreground">PDF, Word, Excel, PowerPoint, images, CSV, ZIP. Max 25 MB each.</span>
            </label>
            {files.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {files.map((f) => (
                  <li key={f.path} className="flex items-center gap-2 px-3 py-2 text-xs">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate" title={f.name}>{f.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{sizeLabel(f.size)}</span>
                    <button type="button" onClick={() => removeFile(f)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${f.name}`} title="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-6 py-3">
          <Button size="sm" variant="outline" onClick={close}>Cancel</Button>
          {(isNew || report!.status === "draft") && (
            <Button size="sm" variant="outline" onClick={() => save(false)} disabled={busy}>
              {saving ? "Saving…" : "Save draft"}
            </Button>
          )}
          <Button size="sm" onClick={() => save(true)} disabled={busy}>
            <Send className="mr-1 h-3.5 w-3.5" /> {isNew || report!.status === "draft" ? "Submit report" : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
