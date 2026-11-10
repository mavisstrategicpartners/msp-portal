import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MessageSquarePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  ExecHeader,
  FollowUpDialog,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/clients")({
  validateSearch: z.object({ filter: z.string().optional(), client: z.string().optional() }),
  head: () => ({ meta: [{ title: "Clients & Onboarding — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <ClientsPage data={data} />}</OverviewGate>,
});

function ClientsPage({ data }: { data: ExecutiveOverview }) {
  const search = Route.useSearch();
  const [filter, setFilter] = useState(search.filter || "all");
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const clients = data.clients
    .filter((c) => {
      if (search.client && filter === "all") return true;
      if (filter === "at-risk") return c.atRisk;
      if (filter === "onboarding") return c.onboarding && c.onboarding.progress < 100;
      if (filter === "live") return c.onboarding?.progress === 100;
      return true;
    })
    .sort((a, b) => Number(b.id === search.client) - Number(a.id === search.client) || Number(b.atRisk) - Number(a.atRisk));
  // Confirmed Operations manager (department_leads), if one is set.
  const opsLead = data.departments.find((d) => d.key === "operations")?.leads[0];

  return (
    <div className="space-y-6">
      <ExecHeader
        title="Clients & Onboarding"
        subtitle="Client portfolio, onboarding progress against target dates, and service delivery work per client."
        data={data}
        source="the clients table, onboarding records and client-linked tasks"
      />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Kpi label="Clients" value={data.clients.length} hint={`${data.business.clientsAddedLast30} added in 30 days`} />
        <Kpi label="Onboarding in progress" value={data.business.onboardingInProgress} />
        <Kpi label="Past target date" value={data.business.onboardingDelayed} tone={data.business.onboardingDelayed ? "bad" : "good"} />
        <Kpi label="At risk" value={data.business.atRiskClients} tone={data.business.atRiskClients ? "warn" : "good"} />
      </div>
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All clients</SelectItem>
            <SelectItem value="at-risk" className="text-xs">At risk</SelectItem>
            <SelectItem value="onboarding" className="text-xs">Still onboarding</SelectItem>
            <SelectItem value="live" className="text-xs">Onboarding complete</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{clients.length} shown</span>
      </div>
      {clients.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {clients.map((c) => (
            <Card
              key={c.id}
              className={`p-4 space-y-2.5 ${c.id === search.client ? "ring-2 ring-primary/50" : ""} ${c.atRisk ? "border-amber-500/40" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[c.industry, c.package, c.accountManager && `Account: ${c.accountManager}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] shrink-0"
                  onClick={() =>
                    setDraft({
                      departmentKey: "operations",
                      departmentName: "Operations & Client Relationships",
                      subject: `${c.name}: `,
                      relatedClientId: c.id,
                      assigneeId: opsLead?.id,
                    })
                  }
                >
                  <MessageSquarePlus className="mr-1 h-3 w-3" /> Follow up
                </Button>
              </div>
              {c.onboarding ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Onboarding: {c.onboarding.stage} · {c.onboarding.completedSteps}/{c.onboarding.totalSteps} steps
                    </span>
                    <span className={c.onboarding.delayed ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}>
                      {c.onboarding.targetDate
                        ? c.onboarding.delayed
                          ? `${c.onboarding.daysOverdue}d past ${c.onboarding.targetDate}`
                          : `target ${c.onboarding.targetDate}`
                        : "no target date"}
                    </span>
                  </div>
                  <Progress value={c.onboarding.progress} className="h-1.5" />
                  {c.onboarding.nextStep && c.onboarding.progress < 100 && (
                    <p className="text-[11px] text-muted-foreground">Next step: {c.onboarding.nextStep}</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No onboarding record in the portal.</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                {c.openTasks} open task(s){c.overdueTasks ? ` · ${c.overdueTasks} overdue` : ""}
              </p>
              {c.riskReasons.length > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400">{c.riskReasons.join(" · ")}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Empty>No clients match this filter.</Empty>
      )}
      <p className="text-[11px] text-muted-foreground">
        Client satisfaction scores are not captured in the portal yet, so they are not shown.
      </p>
      <ReadOnlyNote />
      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}
