import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExecHeader,
  FeedList,
  FollowUpDialog,
  FollowUpList,
  OverviewGate,
  SectionTitle,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/initiatives")({
  head: () => ({ meta: [{ title: "Strategic Initiatives — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <InitiativesPage data={data} />}</OverviewGate>,
});

function InitiativesPage({ data }: { data: ExecutiveOverview }) {
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const open = data.followUps.filter((f) => f.status !== "Resolved");
  const done = data.followUps.filter((f) => f.status === "Resolved");
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Strategic Initiatives"
        subtitle="The actions you have asked managers to take, and the decisions and interventions waiting on leadership."
        source="your executive follow-ups and the live decision list"
        data={data}
        actions={
          <Button size="sm" onClick={() => setDraft({})}>
            <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> New initiative / follow-up
          </Button>
        }
      />
      <p className="text-xs text-muted-foreground">
        Initiatives are recorded as follow-ups assigned to a named manager, who is notified and reports back here.
      </p>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <SectionTitle title="Your initiatives and follow-ups" />
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">In progress ({open.length})</TabsTrigger>
              <TabsTrigger value="done">Completed ({done.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="pt-3">
              <FollowUpList followUps={open} mode="ceo" empty="Nothing in progress. Start one with “New initiative / follow-up”." />
            </TabsContent>
            <TabsContent value="done" className="pt-3">
              <FollowUpList followUps={done} mode="ceo" empty="No completed follow-ups yet." />
            </TabsContent>
          </Tabs>
        </section>
        <section className="space-y-3">
          <SectionTitle title="Decisions and interventions needed" hint="Overdue work, stalled reviews, client delays and financial matters." />
          <FeedList items={data.decisions} empty="Nothing is waiting on a leadership decision." />
        </section>
      </div>
      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}
