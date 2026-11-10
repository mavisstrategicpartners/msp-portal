/**
 * CEO Executive Dashboard — company-wide summary with drill-down.
 * All figures come from /api/executive/overview (live portal records).
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquarePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DepartmentGrid,
  ExecHeader,
  FeedList,
  FollowUpDialog,
  FollowUpList,
  Kpi,
  OverviewGate,
  ReadOnlyNote,
  SectionTitle,
  StatusPill,
  zar,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import type { ExecutiveOverview, FeedItem } from "@/lib/executive.types";

const FEED_FILTERS: { value: string; label: string; match: (f: FeedItem) => boolean }[] = [
  { value: "all", label: "All activity", match: () => true },
  { value: "work", label: "Tasks & deliverables", match: (f) => f.category === "tasks" || f.category === "deliverables" },
  { value: "clients", label: "Clients", match: (f) => f.category === "clients" },
  { value: "people", label: "People, attendance & leave", match: (f) => ["people", "attendance", "leave"].includes(f.category) },
  { value: "finance", label: "Finance & sales", match: (f) => f.category === "finance" || f.category === "sales" },
  { value: "follow-ups", label: "Follow-ups", match: (f) => f.category === "follow-ups" },
];

export function CeoDashboard({ focus }: { focus?: string }) {
  return <OverviewGate>{(data) => <ExecutiveDashboard data={data} focus={focus} />}</OverviewGate>;
}

function ExecutiveDashboard({ data, focus }: { data: ExecutiveOverview; focus?: string }) {
  const [feedFilter, setFeedFilter] = useState("all");
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const b = data.business;
  const feed = useMemo(
    () => data.feed.filter(FEED_FILTERS.find((f) => f.value === feedFilter)!.match),
    [data.feed, feedFilter],
  );
  const openFollowUps = data.followUps.filter((f) => f.status !== "Resolved");
  const present = data.attendance.clockedIn + data.attendance.onBreak;

  useEffect(() => {
    if (focus === "follow-ups") document.getElementById("exec-follow-ups")?.scrollIntoView({ behavior: "smooth" });
  }, [focus]);

  return (
    <div className="space-y-6">
      <ExecHeader
        title="Executive Dashboard"
        subtitle="Company-wide view of every department, employee, client and decision, drawn from live portal records."
        data={data}
        actions={
          <Button size="sm" onClick={() => setDraft({})}>
            <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> Request follow-up
          </Button>
        }
      />

      {/* Company status */}
      <Card className="p-4 flex flex-wrap items-center gap-3 border-border bg-card">
        <StatusPill status={b.status} />
        <p className="text-sm text-foreground">
          {b.status === "on-track"
            ? "No overdue work, delayed onboardings or outstanding financial issues are recorded."
            : `${b.attentionCount} item${b.attentionCount === 1 ? "" : "s"} need${b.attentionCount === 1 ? "s" : ""} executive attention`}
          {b.statusReasons.length > 0 && <span className="text-muted-foreground">: {b.statusReasons.join(" · ")}</span>}
        </p>
      </Card>

      {/* Business overview */}
      <section className="space-y-3">
        <SectionTitle title="Business overview" />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Kpi
            label="Active clients"
            value={b.activeClients}
            hint={`${b.clientsAddedLast30} added in the last 30 days`}
            to="/ceo/clients"
          />
          <Kpi
            label="Onboarding"
            value={b.onboardingInProgress}
            hint={b.onboardingDelayed ? `${b.onboardingDelayed} past target date` : "in progress, none delayed"}
            tone={b.onboardingDelayed ? "bad" : undefined}
            to="/ceo/clients"
          />
          <Kpi
            label="At-risk clients"
            value={b.atRiskClients}
            hint="delays, blockers, escalations or overdue work"
            tone={b.atRiskClients ? "warn" : "good"}
            to="/ceo/clients"
            search={{ filter: "at-risk" }}
          />
          <Kpi
            label="Open tasks"
            value={b.openTasks}
            hint={`${b.overdueTasks} overdue`}
            tone={b.overdueTasks ? "bad" : undefined}
            to="/ceo/delivery"
          />
          <Kpi
            label="Awaiting review"
            value={b.awaitingReview}
            hint="deliverables with department managers"
            tone={b.awaitingReview ? "warn" : undefined}
            to="/ceo/delivery"
            search={{ filter: "review" }}
          />
          <Kpi
            label="Team"
            value={b.headcount}
            hint={`${present} working now · ${b.joinersLast30} added in 30 days`}
            to="/ceo/team"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Decisions & interventions */}
          <section className="space-y-3">
            <SectionTitle
              title="Needs your attention"
              hint="Overdue work, stalled reviews, client delays, financial matters and unanswered follow-ups."
            />
            <FeedList items={data.decisions} limit={6} empty="Nothing is waiting on an executive decision." />
          </section>

          {/* Department performance */}
          <section className="space-y-3">
            <SectionTitle
              title="Department performance"
              hint="Scorecards from each department's assigned tasks and reviewed deliverables. Open one to drill down."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link to="/ceo/departments">All departments</Link>
                </Button>
              }
            />
            <DepartmentGrid departments={data.departments} />
          </section>

          {/* Finance & sales snapshot */}
          <section className="grid gap-3 md:grid-cols-2">
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Financial snapshot</p>
                <Link to="/ceo/revenue" className="text-xs text-primary hover:underline">
                  Details
                </Link>
              </div>
              {data.finance.recorded ? (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Agency fees invoiced" value={zar(data.finance.invoicedAgencyFees)} />
                  <Mini label="Collected" value={zar(data.finance.collected)} />
                  <Mini label="Overdue" value={zar(data.finance.overdueAmount)} bad={data.finance.overdueAmount > 0} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No invoices, expenses or budgets have been recorded in the Finance module yet.
                </p>
              )}
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Sales snapshot</p>
                <Link to="/ceo/sales" className="text-xs text-primary hover:underline">
                  Details
                </Link>
              </div>
              {data.sales.recorded ? (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Leads" value={String(data.sales.leads)} />
                  <Mini label="Open pipeline / month" value={zar(data.sales.openPipelineValue)} />
                  <Mini label="Won this month" value={`${data.sales.wonThisMonth} · ${zar(data.sales.wonValueThisMonth)}`} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No leads have been captured in the Sales module yet.</p>
              )}
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          {/* Activity feed */}
          <section className="space-y-3">
            <SectionTitle
              title="Executive activity feed"
              action={
                <Select value={feedFilter} onValueChange={setFeedFilter}>
                  <SelectTrigger className="h-8 w-[190px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEED_FILTERS.map((f) => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
            <FeedList items={feed} limit={8} empty="No notable activity in this category." />
          </section>

          {/* Follow-ups */}
          <section id="exec-follow-ups" className="space-y-3 scroll-mt-20">
            <SectionTitle
              title="Your follow-ups"
              hint={`${openFollowUps.length} open · ${data.followUps.length - openFollowUps.length} resolved`}
            />
            <FollowUpList
              followUps={data.followUps.slice(0, 8)}
              mode="ceo"
              empty="Use “Request follow-up” to ask a manager to act on something you've seen."
            />
          </section>
        </div>
      </div>

      <ReadOnlyNote />
      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}

function Mini({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <p className={`font-bold ${bad ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
