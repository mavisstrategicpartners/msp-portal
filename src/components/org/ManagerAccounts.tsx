/**
 * Manager accounts: every department's manager and login status, appointments awaiting an
 * account, and vacancies. The CEO / administrators record appointments; an administrator runs
 * the one-time provisioning, whose temporary passwords are shown once here and never stored.
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Copy, Download, KeyRound, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthHeaders } from "@/lib/api-auth-headers";

type Account = { exists: boolean; active: boolean; lastSignInAt: string | null; mustChangePassword: boolean };
type Row = {
  key: string;
  name: string;
  state: "existing" | "pending" | "vacant";
  manager: { id: string; name: string; email: string; title: string; account: Account } | null;
  appointment: { id: string; fullName: string; email: string; jobTitle: string | null; createdAt: string } | null;
};
type Report = {
  departments: Row[];
  history: { id: string; department: string; fullName: string; email: string; status: string; failureReason: string | null; processedAt: string | null }[];
  canAppoint: boolean;
  canProvision: boolean;
};
type RunResult = {
  existing: { department: string; name: string; email: string; title: string }[];
  created: { department: string; name: string; email: string; role: string; temporaryPassword: string }[];
  linked: { department: string; name: string; email: string; role: string }[];
  failed: { department: string; name: string; email: string; reason: string }[];
  awaiting: { department: string }[];
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const ago = (iso: string | null) => {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};

function AccountBadge({ a }: { a: Account }) {
  if (!a.exists) return <Badge variant="outline" className="text-[10px] text-rose-600">No login found</Badge>;
  if (!a.active) return <Badge variant="outline" className="text-[10px] text-rose-600">Deactivated</Badge>;
  if (a.mustChangePassword)
    return <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400">Temporary password not yet changed</Badge>;
  return (
    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
      Active{a.lastSignInAt ? ` · signed in ${ago(a.lastSignInAt)}` : " · never signed in"}
    </Badge>
  );
}

export function ManagerAccounts() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["staff", "org-managers"], queryFn: async () => (await api("/api/staff/org/managers")) as Report });
  const [appointFor, setAppointFor] = useState<Row | null>(null);
  const [confirmRun, setConfirmRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["staff", "org-managers"] });
    qc.invalidateQueries({ queryKey: ["staff", "departments"] });
    qc.invalidateQueries({ queryKey: ["staff", "org-people"] });
    qc.invalidateQueries({ queryKey: ["executive-overview"] });
  };

  if (q.isLoading)
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking manager accounts…
      </p>
    );
  if (q.error || !q.data) return <p className="p-6 text-sm text-muted-foreground">{(q.error as Error)?.message}</p>;
  const r = q.data;
  const counts = {
    existing: r.departments.filter((d) => d.state === "existing").length,
    pending: r.departments.filter((d) => d.state === "pending").length,
    vacant: r.departments.filter((d) => d.state === "vacant").length,
  };

  const cancel = async (id: string) => {
    try {
      await api(`/api/staff/org/appointments/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast.success("Appointment cancelled");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const run = async () => {
    setRunning(true);
    try {
      const res = (await api("/api/staff/org/provision", { method: "POST" })) as RunResult;
      setResult(res);
      setConfirmRun(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="text-sm">
          <p className="font-semibold text-foreground">Department manager accounts</p>
          <p className="text-xs text-muted-foreground">
            {counts.existing} with a manager · {counts.pending} appointed, awaiting account · {counts.vacant} vacant.
            Existing managers keep their accounts and passwords.
          </p>
        </div>
        {r.canProvision && (
          <Button size="sm" disabled={!counts.pending} onClick={() => setConfirmRun(true)}>
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Provision pending accounts ({counts.pending})
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Department</th>
              <th className="px-4 py-2.5 font-medium">Manager</th>
              <th className="px-4 py-2.5 font-medium">Login</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {r.departments.map((d) => (
              <tr key={d.key} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                <td className="px-4 py-3 text-xs">
                  {d.manager ? (
                    <>
                      <p className="text-foreground">{d.manager.name}</p>
                      <p className="text-muted-foreground">{d.manager.email}</p>
                    </>
                  ) : d.appointment ? (
                    <>
                      <p className="text-foreground">{d.appointment.fullName}</p>
                      <p className="text-muted-foreground">{d.appointment.email} · {d.appointment.jobTitle}</p>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> Position vacant — a person needs to be appointed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {d.manager ? (
                    <AccountBadge a={d.manager.account} />
                  ) : d.appointment ? (
                    <Badge variant="outline" className="text-[10px]">Appointed · awaiting provisioning</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.canAppoint && d.state === "vacant" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAppointFor(d)}>
                      <UserPlus className="mr-1 h-3 w-3" /> Appoint
                    </Button>
                  )}
                  {r.canAppoint && d.appointment && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => cancel(d.appointment!.id)}>
                      <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {r.history.length > 0 && (
        <details className="rounded-xl border border-border bg-card p-4 text-xs">
          <summary className="cursor-pointer font-medium text-foreground">Provisioning history ({r.history.length})</summary>
          <ul className="mt-3 space-y-1.5">
            {r.history.map((h) => (
              <li key={h.id} className="text-muted-foreground">
                <span className="text-foreground">{h.fullName}</span> ({h.email}) — {h.department}:{" "}
                {h.status === "provisioned" ? "account created" : h.status === "linked" ? "existing account linked" : h.status}
                {h.failureReason ? ` — ${h.failureReason}` : ""}
                {h.processedAt ? ` · ${new Date(h.processedAt).toLocaleDateString("en-ZA")}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}

      <AppointDialog row={appointFor} onClose={() => setAppointFor(null)} onSaved={refresh} />

      <Dialog open={confirmRun} onOpenChange={setConfirmRun}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provision {counts.pending} manager account(s)?</DialogTitle>
            <DialogDescription className="text-xs">
              Existing accounts are linked without changing their passwords. New accounts get a one-time temporary
              password, shown once on the next screen, that must be changed at first sign-in. Departments that already
              have a manager are never changed. Running this again creates nothing twice.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmRun(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? "Provisioning…" : "Provision accounts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResultDialog result={result} onClose={() => setResult(null)} />
    </div>
  );
}

function AppointDialog({ row, onClose, onSaved }: { row: Row | null; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await api("/api/staff/org/appointments", {
        method: "POST",
        body: JSON.stringify({ departmentKey: row.key, fullName, email, jobTitle: jobTitle || undefined }),
      });
      toast.success(`${row.name}: ${fullName} appointed. Run provisioning to create or link the account.`);
      setFullName("");
      setEmail("");
      setJobTitle("");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={row !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Appoint {row?.name} manager</DialogTitle>
          <DialogDescription className="text-xs">
            Enter the confirmed person and their MSP work email. If they already have a portal account it is linked
            (their password is not changed); otherwise an account is created when provisioning runs. An existing
            employee can also be appointed directly on the Departments tab.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs">Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First name and surname" className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Work email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mavisstrategicpartners.co.za" className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Job title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={`${row?.name ?? ""} Manager`} className="h-9 text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !fullName.trim() || !email.trim()}>
            {saving ? "Saving…" : "Record appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultDialog({ result, onClose }: { result: RunResult | null; onClose: () => void }) {
  if (!result) return null;
  const csv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["Department", "Name", "Email", "Temporary password", "Sign-in"],
      ...result.created.map((c) => [c.department, c.name, c.email, c.temporaryPassword, `${location.origin}/auth`]),
    ];
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `msp-manager-logins-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = (c: RunResult["created"][number]) =>
    navigator.clipboard
      .writeText(`MSP portal: ${location.origin}/auth\nEmail: ${c.email}\nTemporary password: ${c.temporaryPassword}\nYou will be asked to choose your own password when you first sign in.`)
      .then(() => toast.success(`Login details for ${c.name} copied`));
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provisioning summary</DialogTitle>
          <DialogDescription className="text-xs">
            {result.created.length
              ? "Temporary passwords are shown only now and are not stored. Copy or download them before closing; if one is lost, use Reset password in Manage Staff."
              : "No new accounts were needed."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          <Section title={`Accounts created (${result.created.length})`}>
            {result.created.map((c) => (
              <div key={c.email} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2.5">
                <div>
                  <p className="font-medium text-foreground">{c.name} — {c.department}</p>
                  <p className="text-muted-foreground">{c.email}</p>
                  <p className="mt-1 font-mono text-foreground">{c.temporaryPassword}</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => copy(c)}>
                  <Copy className="mr-1 h-3 w-3" /> Copy login details
                </Button>
              </div>
            ))}
          </Section>
          <Section title={`Existing accounts linked as managers (${result.linked.length})`}>
            {result.linked.map((c) => (
              <p key={c.email}><CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" />{c.name} ({c.email}) — {c.department}; password unchanged</p>
            ))}
          </Section>
          <Section title={`Managers whose accounts already existed (${result.existing.length})`}>
            {result.existing.map((c) => (
              <p key={c.department}>{c.department}: {c.name} ({c.email})</p>
            ))}
          </Section>
          <Section title={`Could not be completed (${result.failed.length})`}>
            {result.failed.map((c) => (
              <p key={c.email} className="text-rose-700 dark:text-rose-400">{c.department}: {c.name} ({c.email}) — {c.reason}</p>
            ))}
          </Section>
          <Section title={`Positions still to be appointed (${result.awaiting.length})`}>
            <p className="text-muted-foreground">{result.awaiting.map((a) => a.department).join(", ") || "None"}</p>
          </Section>
        </div>
        <DialogFooter>
          {result.created.length > 0 && (
            <Button size="sm" variant="outline" onClick={csv}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download login details (CSV)
            </Button>
          )}
          <Button size="sm" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const empty = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-foreground">{title}</p>
      {empty ? <p className="text-muted-foreground">None</p> : children}
    </div>
  );
}
