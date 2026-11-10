import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvidenceReviewDialog } from "@/components/evidence/EvidenceReviewDialog";
import {
  Empty,
  EvidenceList,
  ExecHeader,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  relTime,
  zar,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/evidence")({
  validateSearch: z.object({ evidence: z.string().optional() }),
  head: () => ({ meta: [{ title: "Evidence & Approvals — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <EvidencePage data={data} />}</OverviewGate>,
});

function EvidencePage({ data }: { data: ExecutiveOverview }) {
  const search = Route.useSearch();
  const [evidenceId, setEvidenceId] = useState<string | null>(search.evidence || null);
  const ev = data.evidence;
  const pending = ev.filter((e) => e.status === "Submitted for Review");
  const returned = ev.filter((e) => e.status === "Changes Requested" || e.status === "Rejected");
  const approved = ev.filter((e) => e.status === "Approved");
  const spend = data.finance.pendingApprovals;
  const leave = data.leave.pending;
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Evidence & Approvals"
        subtitle="Every staff submission across all departments, and everything waiting for a manager's decision."
        source="evidence submissions, Finance spend approvals and leave requests"
        data={data}
      />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Kpi label="Awaiting review" value={pending.length} tone={pending.length ? "warn" : undefined} />
        <Kpi label="Sent back" value={returned.length} />
        <Kpi label="Approved" value={approved.length} tone="good" />
        <Kpi label="Spend approvals pending" value={spend.length} />
        <Kpi label="Leave awaiting HR" value={leave.length} />
      </div>
      <Tabs defaultValue="pending" className="space-y-3">
        <TabsList>
          <TabsTrigger value="pending">Awaiting review ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All submissions ({ev.length})</TabsTrigger>
          <TabsTrigger value="approvals">Other approvals ({spend.length + leave.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <EvidenceList evidence={pending} onOpen={setEvidenceId} empty="No submissions are waiting for a manager's review." />
        </TabsContent>
        <TabsContent value="all">
          <EvidenceList evidence={ev} onOpen={setEvidenceId} empty="No evidence has been submitted yet." />
        </TabsContent>
        <TabsContent value="approvals" className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Spend approvals (Finance and the GM decide)</p>
            {spend.length ? (
              spend.map((a) => (
                <Card key={a.id} className="p-3 text-xs flex justify-between gap-2">
                  <span>
                    <span className="font-semibold text-foreground">{a.title}</span> · {a.department} · {a.requestedBy} · {a.date}
                  </span>
                  <span className="font-bold">{zar(a.amount)}</span>
                </Card>
              ))
            ) : (
              <Empty>No spend approvals are pending in the Finance module.</Empty>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Leave requests (HR decides)</p>
            {leave.length ? (
              leave.map((l) => (
                <Card key={l.id} className="p-3 text-xs">
                  <span className="font-semibold text-foreground">{l.name}</span>: {l.start} to {l.end} · requested {relTime(l.createdAt)}
                </Card>
              ))
            ) : (
              <Empty>No leave requests are waiting for HR.</Empty>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Budget, deadline and exception requests are not yet captured in the shared database.{" "}
            <Link to="/ceo/delivery" className="text-primary hover:underline">See all tasks and deliverables</Link>.
          </p>
        </TabsContent>
      </Tabs>
      <ReadOnlyNote />
      <EvidenceReviewDialog evidenceId={evidenceId} open={!!evidenceId} onOpenChange={(o) => !o && setEvidenceId(null)} />
    </div>
  );
}
