import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Input } from "@/components/ui/input";
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
  EvidenceList,
  ExecHeader,
  FollowUpDialog,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  TaskTable,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/delivery")({
  validateSearch: z.object({ filter: z.string().optional(), evidence: z.string().optional() }),
  head: () => ({ meta: [{ title: "Tasks & Deliverables — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <DeliveryPage data={data} />}</OverviewGate>,
});

const TASK_FILTERS = [
  { value: "open", label: "Open tasks" },
  { value: "overdue", label: "Overdue" },
  { value: "review", label: "Awaiting review" },
  { value: "rework", label: "Changes requested / rejected" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All tasks" },
];

function DeliveryPage({ data }: { data: ExecutiveOverview }) {
  const search = Route.useSearch();
  const [filter, setFilter] = useState(search.filter || "open");
  const [dept, setDept] = useState("all");
  const [q, setQ] = useState("");
  const [evidenceId, setEvidenceId] = useState<string | null>(search.evidence || null);
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const tab = search.evidence || search.filter === "review" || search.filter === "rework" ? "evidence" : "tasks";

  const depts = useMemo(
    () => [...new Map(data.tasks.map((t) => [t.departmentKey, t.department])).entries()],
    [data.tasks],
  );
  const tasks = data.tasks.filter((t) => {
    if (dept !== "all" && t.departmentKey !== dept) return false;
    if (q && !`${t.title} ${t.assignedToName} ${t.clientName || ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    switch (filter) {
      case "open":
        return t.status !== "Completed";
      case "overdue":
        return t.overdue;
      case "review":
        return t.status === "Submitted for Review" || t.latestEvidenceStatus === "Submitted for Review";
      case "rework":
        return t.status === "Changes Requested" || t.latestEvidenceStatus === "Rejected";
      case "blocked":
        return t.status === "Blocked";
      case "completed":
        return t.status === "Completed";
      default:
        return true;
    }
  });
  const evidence = data.evidence.filter((e) => {
    if (dept !== "all" && e.departmentKey !== dept) return false;
    if (filter === "review") return e.status === "Submitted for Review";
    if (filter === "rework") return e.status === "Changes Requested" || e.status === "Rejected";
    return true;
  });
  const t = data.tasks;
  const ev = data.evidence;

  return (
    <div className="space-y-6">
      <ExecHeader
        title="Tasks & Deliverables"
        subtitle="Every task assigned in the portal and every deliverable submitted as evidence, across all departments."
        data={data}
      />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Open" value={t.filter((x) => x.status !== "Completed").length} hint={`${t.length} tasks in total`} />
        <Kpi label="Overdue" value={t.filter((x) => x.overdue).length} tone={t.some((x) => x.overdue) ? "bad" : "good"} />
        <Kpi label="Blocked" value={t.filter((x) => x.status === "Blocked").length} />
        <Kpi label="Awaiting review" value={ev.filter((x) => x.status === "Submitted for Review").length} tone="warn" />
        <Kpi label="Sent back" value={ev.filter((x) => x.status === "Changes Requested" || x.status === "Rejected").length} />
        <Kpi label="Approved" value={ev.filter((x) => x.status === "Approved").length} tone="good" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value} className="text-xs">
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All departments</SelectItem>
            {depts.map(([k, name]) => (
              <SelectItem key={k} value={k} className="text-xs">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input className="h-8 w-56 text-xs" placeholder="Search task, owner or client" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Tabs defaultValue={tab} className="space-y-3">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="evidence">Evidence submissions ({evidence.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <TaskTable
            tasks={tasks}
            onOpenEvidence={setEvidenceId}
            onFollowUp={(task) =>
              setDraft({
                departmentKey: task.departmentKey,
                departmentName: task.department,
                subject: `${task.title}${task.overdue ? " (overdue)" : ""}`,
                relatedTaskId: task.id,
              })
            }
          />
        </TabsContent>
        <TabsContent value="evidence">
          <EvidenceList evidence={evidence} onOpen={setEvidenceId} />
        </TabsContent>
      </Tabs>
      <ReadOnlyNote />
      <EvidenceReviewDialog evidenceId={evidenceId} open={!!evidenceId} onOpenChange={(o) => !o && setEvidenceId(null)} />
      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}
