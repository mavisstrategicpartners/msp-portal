import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  ExecHeader,
  Kpi,
  OverviewGate,
  PeopleTable,
  ReadOnlyNote,
  relTime,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/team")({
  validateSearch: z.object({ filter: z.string().optional(), tab: z.string().optional() }),
  head: () => ({ meta: [{ title: "People & Workforce — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <PeoplePage data={data} />}</OverviewGate>,
});

const ATTENDANCE_FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "working", label: "Working now" },
  { value: "no-clock-in", label: "No clock-in today" },
  { value: "missing-clock-out", label: "Missing clock-out" },
  { value: "overdue", label: "Has overdue tasks" },
  { value: "shared", label: "Shared & script-created logins" },
];

function PeoplePage({ data }: { data: ExecutiveOverview }) {
  const search = Route.useSearch();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [att, setAtt] = useState(search.filter || "all");
  const a = data.attendance;
  const orgDepartments = useMemo(
    () => [...new Set(data.people.map((p) => p.orgDepartment))].sort(),
    [data.people],
  );
  const missing = new Set(a.missingClockOut.map((m) => m.id));
  const people = data.people.filter((p) => {
    if (dept !== "all" && p.orgDepartment !== dept) return false;
    if (q && !`${p.name} ${p.title} ${p.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (att === "working") return p.attendanceToday === "Clocked In" || p.attendanceToday === "On Break";
    if (att === "no-clock-in") return p.attendanceToday === "No clock-in";
    if (att === "missing-clock-out") return missing.has(p.id);
    if (att === "overdue") return p.overdueTasks > 0;
    if (att === "shared") return p.accountType !== "named";
    return true;
  });

  return (
    <div className="space-y-6">
      <ExecHeader
        title="People & Workforce"
        subtitle="Employee directory with today's attendance, the last 7 days of clock-ins, workload and leave."
        source="staff profiles, attendance clock-in/out events, the task ledger and leave requests"
        data={data}
      />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Kpi
          label="Named employees"
          value={data.business.headcount}
          hint={`${data.business.sharedAccounts} shared or script-created logins listed separately`}
        />
        <Kpi label="Working now" value={a.clockedIn + a.onBreak} hint={`${a.onBreak} on break`} tone="good" />
        <Kpi label="Clocked out today" value={a.clockedOut} />
        <Kpi
          label="No clock-in today"
          value={a.noClockIn}
          hint={a.workday ? "includes leave and staff who don't clock in" : "weekend"}
        />
        <Kpi
          label="Missing clock-out"
          value={a.missingClockOut.length}
          hint="sessions left open from a previous day"
          tone={a.missingClockOut.length ? "warn" : undefined}
        />
      </div>

      <Tabs defaultValue={search.tab === "leave" ? "leave" : "directory"} className="space-y-3">
        <TabsList>
          <TabsTrigger value="directory">Directory & attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave ({data.leave.pending.length} pending)</TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input className="h-8 w-56 text-xs" placeholder="Search name, title or email" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="h-8 w-52 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All departments</SelectItem>
                {orgDepartments.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={att} onValueChange={setAtt}>
              <SelectTrigger className="h-8 w-52 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATTENDANCE_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="self-center text-xs text-muted-foreground">{people.length} shown</span>
          </div>
          {a.missingClockOut.length > 0 && att === "missing-clock-out" && (
            <Card className="p-3 text-xs text-muted-foreground">
              Open sessions: {a.missingClockOut.map((m) => `${m.name} (since ${m.since})`).join(" · ")}
            </Card>
          )}
          <PeopleTable people={people} />
        </TabsContent>
        <TabsContent value="leave" className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Awaiting HR decision</p>
            {data.leave.pending.length ? (
              data.leave.pending.map((l) => (
                <Card key={l.id} className="p-3 text-xs">
                  <p className="font-semibold text-foreground">
                    {l.name}: {l.start} to {l.end}
                  </p>
                  <p className="text-muted-foreground">
                    {l.reason || "No reason given"} · requested {relTime(l.createdAt)}
                  </p>
                </Card>
              ))
            ) : (
              <Empty>No leave requests are waiting for a decision.</Empty>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Approved leave, current and upcoming</p>
            {data.leave.upcomingApproved.length ? (
              data.leave.upcomingApproved.map((l) => (
                <Card key={l.id} className="p-3 text-xs">
                  {l.name}: {l.start} to {l.end}
                </Card>
              ))
            ) : (
              <Empty>No approved leave is current or upcoming.</Empty>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {data.leave.total} leave request(s) on record. Leave decisions stay with HR.
          </p>
        </TabsContent>
      </Tabs>
      <ReadOnlyNote />
    </div>
  );
}
