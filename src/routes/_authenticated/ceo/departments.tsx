import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvidenceReviewDialog } from "@/components/evidence/EvidenceReviewDialog";
import {
  DepartmentGrid,
  Empty,
  EvidenceList,
  ExecHeader,
  FeedList,
  FollowUpDialog,
  FollowUpList,
  Kpi,
  OverviewGate,
  PeopleTable,
  ReadOnlyNote,
  StatusPill,
  TaskTable,
  pct,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/departments")({
  validateSearch: z.object({ dept: z.string().optional() }),
  head: () => ({ meta: [{ title: "Departments — Executive View" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { dept } = Route.useSearch();
  return (
    <OverviewGate>
      {(data) => (dept ? <DepartmentDetail data={data} deptKey={dept} /> : <DepartmentIndex data={data} />)}
    </OverviewGate>
  );
}

function DepartmentIndex({ data }: { data: ExecutiveOverview }) {
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Departments"
        subtitle="Every department's scorecard. Departments needing attention are listed first."
        data={data}
        source="the task ledger, evidence submissions, staff profiles and attendance"
      />
      <DepartmentGrid departments={data.departments} includeInactive />
      <ReadOnlyNote />
    </div>
  );
}

function DepartmentDetail({ data, deptKey }: { data: ExecutiveOverview; deptKey: string }) {
  const navigate = useNavigate();
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const d = data.departments.find((x) => x.key === deptKey);

  const tasks = useMemo(() => data.tasks.filter((t) => t.departmentKey === deptKey), [data.tasks, deptKey]);
  const evidence = useMemo(() => data.evidence.filter((e) => e.departmentKey === deptKey), [data.evidence, deptKey]);
  const people = useMemo(
    () => data.people.filter((p) => p.departments.includes(deptKey) || tasks.some((t) => t.assignedToId === p.id)),
    [data.people, deptKey, tasks],
  );
  const issues = useMemo(() => data.feed.filter((f) => f.departmentKey === deptKey), [data.feed, deptKey]);
  const followUps = data.followUps.filter((f) => f.departmentKey === deptKey);

  if (!d)
    return (
      <div className="space-y-4">
        <Link to="/ceo/departments" className="text-sm text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> All departments
        </Link>
        <Empty>That department was not found.</Empty>
      </div>
    );

  const openTasks = tasks.filter((t) => t.status !== "Completed");
  const pending = evidence.filter((e) => e.status === "Submitted for Review");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/ceo/departments" className="text-sm text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> All departments
        </Link>
        <Select value={deptKey} onValueChange={(v) => navigate({ to: "/ceo/departments", search: { dept: v } })}>
          <SelectTrigger className="h-8 w-[240px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.departments.map((x) => (
              <SelectItem key={x.key} value={x.key} className="text-xs">
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ExecHeader
        title={d.name}
        subtitle={
          d.leads.length
            ? `Led by ${d.leads.map((l) => `${l.name} (${l.title})`).join(", ")} · ${d.members} ${d.members === 1 ? "person" : "people"}`
            : `No department lead on record · ${d.members} ${d.members === 1 ? "person" : "people"}`
        }
        data={data}
        source="the task ledger, evidence submissions, staff profiles and attendance"
        actions={
          <Button
            size="sm"
            onClick={() => setDraft({ departmentKey: d.key, departmentName: d.name, subject: `${d.name}: ` })}
          >
            <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> Request follow-up
          </Button>
        }
      />

      <Card className="p-4 flex flex-wrap items-center gap-3">
        <StatusPill status={d.status} />
        <p className="text-sm text-muted-foreground">
          {d.statusReasons.length ? d.statusReasons.join(" · ") : "No outstanding issues recorded for this department."}
        </p>
      </Card>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Open tasks" value={d.tasksOpen} hint={`${d.tasksTotal} assigned in total`} />
        <Kpi label="Overdue" value={d.tasksOverdue} tone={d.tasksOverdue ? "bad" : "good"} hint={`${d.tasksBlocked} blocked`} />
        <Kpi label="Awaiting review" value={d.awaitingReview} tone={d.awaitingReview ? "warn" : undefined} hint={`${d.changesRequested} sent back`} />
        <Kpi label="Completion" value={pct(d.completionRate)} hint="of assigned tasks completed" />
        <Kpi label="On time" value={pct(d.onTimeRate)} hint="completed by the due date" />
        <Kpi label="First-time approval" value={pct(d.evidenceApprovalRate)} hint="of reviewed deliverables approved" />
      </div>
      <p className="text-[11px] text-muted-foreground -mt-3">
        No numeric targets are configured for departments yet, so performance is shown against assigned work and due
        dates.
      </p>

      <Tabs defaultValue="tasks" className="space-y-3">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({openTasks.length} open)</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({pending.length} pending)</TabsTrigger>
          <TabsTrigger value="people">People ({people.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups ({followUps.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <TaskTable
            tasks={[...openTasks, ...tasks.filter((t) => t.status === "Completed")]}
            showDepartment={false}
            onOpenEvidence={setEvidenceId}
            onFollowUp={(t) =>
              setDraft({
                departmentKey: d.key,
                departmentName: d.name,
                subject: `${t.title}${t.overdue ? " (overdue)" : ""}`,
                relatedTaskId: t.id,
              })
            }
            empty="No tasks have been assigned in this department yet."
          />
        </TabsContent>
        <TabsContent value="evidence">
          <EvidenceList evidence={evidence} onOpen={setEvidenceId} empty="No deliverables have been submitted yet." />
        </TabsContent>
        <TabsContent value="people">
          <PeopleTable people={people} empty="Nobody is linked to this department yet." />
        </TabsContent>
        <TabsContent value="issues">
          <FeedList items={issues} empty="No open issues for this department." />
        </TabsContent>
        <TabsContent value="follow-ups">
          <FollowUpList followUps={followUps} mode="ceo" empty="No follow-ups requested for this department." />
        </TabsContent>
      </Tabs>

      <ReadOnlyNote />
      <EvidenceReviewDialog evidenceId={evidenceId} open={!!evidenceId} onOpenChange={(o) => !o && setEvidenceId(null)} />
      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}
