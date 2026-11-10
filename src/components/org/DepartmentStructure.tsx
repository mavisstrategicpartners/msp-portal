/**
 * MSP organisation structure: CEO → General Manager → department managers → employees.
 * Read from the database (department_leads, department_members). The CEO and administrators
 * can appoint department managers and place employees; the General Manager can view it.
 */
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Building2, Loader2, UserCog, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { useDepartments } from "@/lib/department-scope";
import { ManagerAccounts } from "@/components/org/ManagerAccounts";

type OrgPersonRow = {
  id: string;
  name: string;
  email: string;
  title: string;
  recordedDepartment: string | null;
  primary: string | null;
  additional: string[];
  leads: string[];
  source: string | null;
  /** CEO / General Manager / Administrator: above or outside the departments. */
  position: string | null;
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

export function DepartmentStructure() {
  const qc = useQueryClient();
  const deptQ = useDepartments();
  const canEdit = Boolean(deptQ.data?.canConfigure);
  const peopleQ = useQuery({
    queryKey: ["staff", "org-people"],
    queryFn: async () => (await api("/api/staff/org/people")).people as OrgPersonRow[],
  });
  const departments = deptQ.data?.departments ?? [];
  const nameOf = (key: string | null) => departments.find((d) => d.key === key)?.name ?? key ?? "";
  const people = peopleQ.data ?? [];
  // People who are not department employees by design: they sit above or outside the departments.
  const unplaced = people.filter((p) => !p.primary && !p.leads.length && !p.position);
  const noManager = departments.filter((d) => !d.lead);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["staff", "departments"] });
    qc.invalidateQueries({ queryKey: ["staff", "org-people"] });
    qc.invalidateQueries({ queryKey: ["executive-overview"] });
  };

  if (deptQ.isLoading || peopleQ.isLoading)
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading the organisation structure…
      </p>
    );
  if (deptQ.error || peopleQ.error)
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        {((deptQ.error || peopleQ.error) as Error).message}
      </Card>
    );

  return (
    <div className="space-y-5">
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Reporting lines</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
          <li><span className="font-medium text-foreground">CEO</span> — sees every department, manager, employee and task.</li>
          <li><span className="font-medium text-foreground">General Manager</span> — oversees all department managers; directs work to them, and assigns a department's work only while it has no manager.</li>
          <li><span className="font-medium text-foreground">Department managers</span> — assign and review work for their own department's employees.</li>
          <li><span className="font-medium text-foreground">Employees</span> — receive tasks from their department manager, update progress and submit work.</li>
        </ol>
        <p className="text-[11px] text-muted-foreground">
          {canEdit
            ? "You can appoint managers and place employees. Changes apply immediately to task assignment."
            : "Only the CEO or an administrator can change this."}
        </p>
      </Card>

      {(noManager.length > 0 || unplaced.length > 0) && (
        <Card className="p-4 border-amber-500/40 bg-amber-500/5 space-y-1.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Needs configuration
          </p>
          {noManager.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{noManager.length} department(s) without a manager:</span>{" "}
              {noManager.map((d) => d.name).join(", ")}. The General Manager assigns their work until a manager is appointed.
            </p>
          )}
          {unplaced.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unplaced.length} active account(s) not in a department:</span>{" "}
              {unplaced.map((p) => p.name).join(", ")}. They cannot be assigned work until placed.
            </p>
          )}
        </Card>
      )}

      <Tabs defaultValue="departments" className="space-y-3">
        <TabsList>
          <TabsTrigger value="departments">
            <Building2 className="mr-1.5 h-3.5 w-3.5" /> Departments ({departments.length})
          </TabsTrigger>
          <TabsTrigger value="people">
            <Users className="mr-1.5 h-3.5 w-3.5" /> People ({people.length})
          </TabsTrigger>
          <TabsTrigger value="managers">
            <UserCog className="mr-1.5 h-3.5 w-3.5" /> Manager accounts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((d) => (
              <DepartmentCard key={d.key} dept={d} people={people} canEdit={canEdit} onSaved={refresh} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="managers">
          <ManagerAccounts />
        </TabsContent>
        <TabsContent value="people">
          <PeopleTable people={people} departments={departments} nameOf={nameOf} canEdit={canEdit} onSaved={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DepartmentCard({
  dept,
  people,
  canEdit,
  onSaved,
}: {
  dept: any;
  people: OrgPersonRow[];
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [choice, setChoice] = useState("");
  const [saving, setSaving] = useState(false);
  const members = (dept.members ?? []) as { id: string; name: string; title: string; primary: boolean }[];
  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/staff/departments/${encodeURIComponent(dept.key)}/lead`, {
        method: "PUT",
        body: JSON.stringify({ userId: choice === "none" ? null : choice }),
      });
      toast.success(choice === "none" ? `${dept.name}: manager removed` : `${dept.name}: manager appointed`);
      setChoice("");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card className="p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{dept.name}</p>
        <Badge variant="outline" className="text-[10px]">
          {members.length} employee{members.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <p className="text-xs">
        {dept.lead ? (
          <span className="text-foreground">
            <UserCog className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {dept.lead.name}
            {dept.lead.title ? <span className="text-muted-foreground"> — {dept.lead.title}</span> : null}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" /> Manager not assigned
          </span>
        )}
      </p>
      <p className="text-[11px] text-muted-foreground line-clamp-3">
        {members.length
          ? members.map((m) => (m.primary ? m.name : `${m.name} (also)`)).join(", ")
          : "No employees recorded in this department."}
      </p>
      {canEdit && (
        <div className="flex items-center gap-1.5 pt-1">
          <Select value={choice} onValueChange={setChoice}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue placeholder={dept.lead ? "Change manager" : "Appoint manager"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {dept.lead && (
                <SelectItem value="none" className="text-xs">
                  No manager
                </SelectItem>
              )}
              {people
                .filter((p) => p.position !== "CEO")
                .map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                    {p.title ? ` — ${p.title}` : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" disabled={!choice || saving} onClick={save}>
            Save
          </Button>
        </div>
      )}
    </Card>
  );
}

function PeopleTable({
  people,
  departments,
  nameOf,
  canEdit,
  onSaved,
}: {
  people: OrgPersonRow[];
  departments: { key: string; name: string }[];
  nameOf: (k: string | null) => string;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? people.filter((p) => [p.name, p.email, p.title, nameOf(p.primary)].some((v) => (v || "").toLowerCase().includes(t)))
      : people;
  }, [people, q, nameOf]);
  return (
    <div className="space-y-2">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" className="h-8 w-64 text-xs" />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Person</th>
              <th className="px-3 py-2 font-medium">Department</th>
              <th className="px-3 py-2 font-medium">Also works in</th>
              <th className="px-3 py-2 font-medium">Manages</th>
              {canEdit && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <PersonRow key={p.id} p={p} departments={departments} nameOf={nameOf} canEdit={canEdit} onSaved={onSaved} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PersonRow({
  p,
  departments,
  nameOf,
  canEdit,
  onSaved,
}: {
  p: OrgPersonRow;
  departments: { key: string; name: string }[];
  nameOf: (k: string | null) => string;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [primary, setPrimary] = useState<string>(p.primary ?? "none");
  const [additional, setAdditional] = useState<string[]>(p.additional);
  const [saving, setSaving] = useState(false);
  const dirty = primary !== (p.primary ?? "none") || additional.join() !== p.additional.join();
  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/staff/org/members/${encodeURIComponent(p.id)}`, {
        method: "PUT",
        body: JSON.stringify({ primary: primary === "none" ? null : primary, additional: primary === "none" ? [] : additional }),
      });
      toast.success(`${p.name}: department updated`);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };
  return (
    <tr className="border-t border-border align-top">
      <td className="px-3 py-2">
        <p className="font-medium text-foreground">
          {p.name}
          {p.position && (
            <Badge variant="outline" className="ml-1.5 text-[9px]">
              {p.position}
            </Badge>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground">{p.title || p.email}</p>
        {p.recordedDepartment && (
          <p className="text-[10px] text-muted-foreground">Profile department: {p.recordedDepartment}</p>
        )}
      </td>
      <td className="px-3 py-2">
        {canEdit && p.position !== "CEO" ? (
          <Select value={primary} onValueChange={setPrimary}>
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="none" className="text-xs">Not in a department</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.key} value={d.key} className="text-xs">
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : p.primary ? (
          nameOf(p.primary)
        ) : (
          <span className="text-muted-foreground">Not in a department</span>
        )}
        {p.primary && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {p.source === "recorded" ? "From profile department" : "Set by CEO / administrator"}
          </p>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {additional.map((k) => (
            <Badge key={k} variant="secondary" className="text-[10px]">
              {nameOf(k)}
              {canEdit && (
                <button
                  type="button"
                  aria-label={`Remove ${nameOf(k)}`}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setAdditional((a) => a.filter((x) => x !== k))}
                >
                  ×
                </button>
              )}
            </Badge>
          ))}
          {canEdit && p.position !== "CEO" && primary !== "none" && (
            <Select value="" onValueChange={(v) => setAdditional((a) => [...new Set([...a, v])])}>
              <SelectTrigger className="h-6 w-28 text-[10px]">
                <SelectValue placeholder="+ Add" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {departments
                  .filter((d) => d.key !== primary && !additional.includes(d.key))
                  .map((d) => (
                    <SelectItem key={d.key} value={d.key} className="text-xs">
                      {d.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          {!canEdit && !additional.length && <span className="text-muted-foreground">—</span>}
        </div>
      </td>
      <td className="px-3 py-2">{p.leads.length ? p.leads.map(nameOf).join(", ") : <span className="text-muted-foreground">—</span>}</td>
      {canEdit && (
        <td className="px-3 py-2 text-right">
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!dirty || saving || p.position === "CEO"} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </td>
      )}
    </tr>
  );
}
