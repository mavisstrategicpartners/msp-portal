/**
 * CEO Executive Dashboard — company-wide command centre for Mavis Muchena.
 *
 * Layout (one 12-column grid, the same panel style throughout):
 *   1. Executive header        greeting, date, one-line company status, refresh, follow-up
 *   2. Business overview       eight KPI cards
 *   3. Intervention queue  |  Company activity
 *   4. Department performance  (table, with a delivery-trend tab)
 *   5. Financial overview  |  Team & workforce
 *
 * Every figure comes from /api/executive/overview (live portal records). Where a record type
 * has no data yet the card says so; nothing is estimated or filled in.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  MessageSquarePlus,
  RefreshCw,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FollowUpDialog,
  FollowUpList,
  OverviewGate,
  ReadOnlyNote,
  SEV_ICON,
  StatusPill,
  relTime,
  splitLink,
  useAlertState,
  zar,
  type FollowUpDraft,
} from "@/components/executive/ExecutiveUI";
import { useExecutiveOverview } from "@/lib/executive.service";
import { useStaffNotifications } from "@/lib/staff-tasks.service";
import type { DepartmentScorecard, ExecutiveOverview, FeedItem } from "@/lib/executive.types";
import { navContextFromProfile } from "@/lib/navigation";
import { useProfile } from "@/lib/use-profile";

const DAY = 86_400_000;

/** Employees whose main department is this one (from the organisation structure). */
function employeesIn(data: ExecutiveOverview, key: string) {
  return data.people.filter((p) => p.accountType !== "executive" && p.departments[0] === key).length;
}

export function CeoDashboard({ focus }: { focus?: string }) {
  return <OverviewGate>{(data) => <ExecutiveDashboard data={data} focus={focus} />}</OverviewGate>;
}

// ── Layout primitives ────────────────────────────────────────────────────────
function Panel({
  title,
  description,
  action,
  children,
  className = "",
  id,
  bodyClassName = "p-4",
  bare,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  bodyClassName?: string;
  /** Inside a detail panel: content only, no card chrome. */
  bare?: boolean;
}) {
  if (bare) return <div className={bodyClassName === "p-0" ? "" : "px-5 py-4"}>{children}</div>;
  return (
    <section id={id} className={`rounded-xl border border-border bg-card scroll-mt-20 ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
  context,
  tone,
  to,
  search,
}: {
  label: string;
  value: ReactNode;
  context: ReactNode;
  tone?: "bad" | "warn" | "good" | "muted";
  to?: string;
  search?: Record<string, string>;
}) {
  const valueColor =
    tone === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
  const body = (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card px-3.5 py-3 transition hover:border-primary/40">
      <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-xl font-semibold tabular-nums tracking-tight ${valueColor}`}>{value}</p>
      <p className="mt-auto pt-1 text-[11px] leading-snug text-muted-foreground">{context}</p>
    </div>
  );
  return to ? (
    <Link to={to as any} search={search as any} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

function Figure({ label, value, tone }: { label: string; value: ReactNode; tone?: "bad" | "good" }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          tone === "bad" ? "text-rose-600 dark:text-rose-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartTooltip({ active, payload, label, format }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-foreground tabular-nums">{format ? format(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "var(--muted-foreground)" },
} as const;

// ── Page ─────────────────────────────────────────────────────────────────────
type DetailKey = "attention" | "departments" | "clients" | "finance" | "workforce" | "activity";

function ExecutiveDashboard({ data, focus }: { data: ExecutiveOverview; focus?: string }) {
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);
  const [detail, setDetail] = useState<DetailKey | null>(focus === "follow-ups" ? "attention" : null);
  const [queueTab, setQueueTab] = useState(focus === "follow-ups" ? "follow-ups" : "new");
  const profile = useProfile();
  const isCEO = Boolean(navContextFromProfile(profile.data)?.isCEO);

  useEffect(() => {
    if (focus === "follow-ups") {
      setQueueTab("follow-ups");
      setDetail("attention");
    }
  }, [focus]);

  const openAttention = (tab = "new") => {
    setQueueTab(tab);
    setDetail("attention");
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ExecutiveHeader data={data} name={profile.data?.profile?.full_name} onFollowUp={() => setDraft({})} />
      <BusinessOverview data={data} />

      <div className="grid gap-4 lg:grid-cols-12">
        <AttentionSummary
          data={data}
          tracksAlerts={isCEO}
          onFollowUp={setDraft}
          onViewAll={openAttention}
          className="lg:col-span-7"
        />
        <DepartmentSummary data={data} onViewAll={() => setDetail("departments")} className="lg:col-span-5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClientsSummary data={data} onViewAll={() => setDetail("clients")} />
        <FinanceSummary data={data} onViewAll={() => setDetail("finance")} />
        <WorkforceSummary data={data} onViewAll={() => setDetail("workforce")} />
        <ActivitySummary data={data} onViewAll={() => setDetail("activity")} />
      </div>

      <ReadOnlyNote />

      <DetailSheet
        open={detail === "attention"}
        onClose={() => setDetail(null)}
        title="Needs your attention"
        description="Every open issue with the person responsible and the suggested next step, plus your follow-ups."
        page={{ to: "/ceo/notifications", label: "Open all notifications" }}
      >
        <InterventionQueue
          data={data}
          tracksAlerts={isCEO}
          tab={queueTab}
          onTab={setQueueTab}
          onFollowUp={(d) => {
            setDraft(d);
          }}
          bare
        />
      </DetailSheet>
      <DetailSheet
        open={detail === "departments"}
        onClose={() => setDetail(null)}
        title="Department performance"
        description="Every department's manager, employees and recorded work, with the weekly delivery trend."
        page={{ to: "/ceo/departments", label: "Open department pages" }}
        wide
      >
        <DepartmentPerformance data={data} bare />
      </DetailSheet>
      <DetailSheet
        open={detail === "clients"}
        onClose={() => setDetail(null)}
        title="Clients & projects"
        description="All active clients with onboarding progress, delays and open work."
        page={{ to: "/ceo/clients", label: "Open Clients & Onboarding" }}
      >
        <ClientsDetail data={data} />
      </DetailSheet>
      <DetailSheet
        open={detail === "finance"}
        onClose={() => setDetail(null)}
        title="Financial overview"
        description="Agency fees only — client ad spend is paid to the platforms directly and is not MSP revenue."
        page={{ to: "/ceo/revenue", label: "Open Financial Overview" }}
      >
        <FinancialOverview data={data} bare />
      </DetailSheet>
      <DetailSheet
        open={detail === "workforce"}
        onClose={() => setDetail(null)}
        title="Team & workforce"
        description="Headcount, attendance, leave and staffing by department."
        page={{ to: "/ceo/team", label: "Open People & Workforce" }}
      >
        <WorkforceOverview data={data} bare />
      </DetailSheet>
      <DetailSheet
        open={detail === "activity"}
        onClose={() => setDetail(null)}
        title="Company activity"
        description="Work assigned and completed, submissions, new clients and follow-ups — last 30 days."
      >
        <CompanyActivity data={data} bare />
      </DetailSheet>

      <FollowUpDialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)} draft={draft} data={data} />
    </div>
  );
}

// ── Detail panel and "View more" ─────────────────────────────────────────────
function DetailSheet({
  open,
  onClose,
  title,
  description,
  page,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  page?: { to: string; label: string };
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className={`w-full overflow-y-auto p-0 ${wide ? "sm:max-w-4xl" : "sm:max-w-2xl"}`}
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
          <SheetDescription className="text-xs">{description}</SheetDescription>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="text-xs font-medium text-primary hover:underline">
              ← Back to dashboard
            </button>
            {page && (
              <Link to={page.to as any} onClick={onClose} className="text-xs font-medium text-primary hover:underline">
                {page.label}
              </Link>
            )}
          </div>
        </SheetHeader>
        <div className="pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function ViewMore({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {label} <ArrowRight className="h-3 w-3" />
    </button>
  );
}

function SummaryCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-border bg-card ${className}`}>
      <header className="flex items-center justify-between gap-2 px-4 pt-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </header>
      <div className="flex-1 px-4 py-3">{children}</div>
      <footer className="border-t border-border px-4 py-2.5">{action}</footer>
    </section>
  );
}

// ── Compact summaries (main dashboard) ───────────────────────────────────────
function AttentionSummary({
  data,
  tracksAlerts,
  onFollowUp,
  onViewAll,
  className,
}: {
  data: ExecutiveOverview;
  tracksAlerts: boolean;
  onFollowUp: (d: FollowUpDraft) => void;
  onViewAll: (tab?: string) => void;
  className?: string;
}) {
  const alerts = useAlertState();
  const navigate = useNavigate();
  const items = useQueueItems(data);
  const fresh = tracksAlerts ? items.filter((i) => alerts.isUnread(i.f)) : items;
  const reviewed = items.length - fresh.length;
  // Critical items are never hidden behind "View all"; others fill up to five rows.
  const critical = fresh.filter((i) => i.f.severity === "critical");
  const rest = fresh.filter((i) => i.f.severity !== "critical");
  const shown = [...critical, ...rest.slice(0, Math.max(0, 5 - critical.length))];
  const openFollowUps = data.followUps.filter((f) => f.status !== "Resolved").length;
  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-border bg-card ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Needs your attention</h2>
          {fresh.length > 0 && (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              {fresh.length} new
            </span>
          )}
        </div>
        <button type="button" onClick={() => onViewAll("follow-ups")} className="text-xs text-muted-foreground hover:text-foreground">
          {openFollowUps} open follow-up{openFollowUps === 1 ? "" : "s"}
        </button>
      </header>
      <div className="flex-1 px-1.5 py-2">
        {shown.length ? (
          <ul>
            {shown.map(({ f, dept, responsible, when }) => {
              const open = () => {
                if (tracksAlerts) alerts.markRead(f);
                const { to, search } = splitLink(f.link);
                navigate({ to: to as any, search: search as any });
              };
              return (
                <li key={f.id} className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/40">
                  <span className="mt-0.5">{SEV_ICON[f.severity]}</span>
                  <button type="button" onClick={open} className="min-w-0 flex-1 text-left">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium leading-snug text-foreground">
                      <span className="min-w-0 truncate">{f.title}</span>
                      <span className={`shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold ${PRIORITY[f.severity].cls}`}>
                        {PRIORITY[f.severity].label}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {dept?.name ?? "Company-wide"} ·{" "}
                      <span className={responsible ? "" : "text-amber-700 dark:text-amber-400"}>
                        {responsible ?? "Manager not assigned"}
                      </span>
                      {when ? ` · ${relTime(when)}` : ""}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      title="Request follow-up"
                      aria-label="Request follow-up"
                      onClick={() =>
                        onFollowUp({
                          subject: f.title.slice(0, 160),
                          note: nextAction(f, responsible, dept?.name) ?? "",
                          departmentKey: dept?.key ?? null,
                          departmentName: dept?.name ?? null,
                          assigneeId: dept?.leads[0]?.id,
                        })
                      }
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                    </button>
                    {tracksAlerts && (
                      <button
                        type="button"
                        title="Mark reviewed"
                        aria-label="Mark reviewed"
                        onClick={() => alerts.markRead(f)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-2.5 py-8 text-center text-xs text-muted-foreground">
            {tracksAlerts ? "You're up to date — nothing new needs your attention." : "Nothing is waiting on an executive decision."}
          </p>
        )}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <ViewMore
          label={fresh.length > shown.length ? `View all ${fresh.length} with next steps` : "View details and next steps"}
          onClick={() => onViewAll("new")}
        />
        {tracksAlerts && reviewed > 0 && (
          <button type="button" onClick={() => onViewAll("reviewed")} className="text-xs text-muted-foreground hover:text-foreground">
            {reviewed} reviewed
          </button>
        )}
      </footer>
    </section>
  );
}

function DepartmentSummary({
  data,
  onViewAll,
  className,
}: {
  data: ExecutiveOverview;
  onViewAll: () => void;
  className?: string;
}) {
  const real = data.departments.filter((d) => d.key !== "unassigned");
  const ranked = [...data.departments].filter((d) => d.status !== "no-activity");
  const counts = {
    attention: real.filter((d) => d.status === "attention").length,
    watch: real.filter((d) => d.status === "watch").length,
    ok: real.filter((d) => d.status === "on-track").length,
    noManager: real.filter((d) => !d.leads.length).length,
  };
  const dot: Record<string, string> = {
    attention: "bg-rose-500",
    watch: "bg-amber-500",
    "on-track": "bg-emerald-500",
    "no-activity": "bg-muted-foreground/40",
  };
  return (
    <SummaryCard
      title="Department performance"
      className={className}
      action={<ViewMore label={`View all ${real.length} departments`} onClick={onViewAll} />}
    >
      <p className="text-[11px] text-muted-foreground">
        <span className="font-medium text-rose-700 dark:text-rose-400">{counts.attention} need attention</span> ·{" "}
        {counts.watch} to watch · {counts.ok} on track ·{" "}
        <span className="text-amber-700 dark:text-amber-400">{counts.noManager} without a manager</span>
      </p>
      {ranked.length ? (
        <ul className="mt-2 divide-y divide-border">
          {ranked.slice(0, 6).map((d) => (
            <li key={d.key} className="flex items-center gap-2.5 py-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot[d.status]}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <Link
                  to="/ceo/departments"
                  search={{ dept: d.key } as any}
                  className="block truncate text-sm font-medium text-foreground hover:text-primary"
                >
                  {d.name}
                </Link>
                <p className="truncate text-[11px] text-muted-foreground">
                  {d.leads[0]?.name ?? <span className="text-amber-700 dark:text-amber-400">Manager not assigned</span>}
                </p>
              </div>
              <div className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                <p>
                  {d.tasksOpen} active
                  {d.tasksOverdue ? (
                    <span className="font-semibold text-rose-600 dark:text-rose-400"> · {d.tasksOverdue} overdue</span>
                  ) : null}
                </p>
                <p>{d.completionRate === null ? "—" : `${d.completionRate}% complete`}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-xs text-muted-foreground">No work is recorded against any department yet.</p>
      )}
    </SummaryCard>
  );
}

function ClientsSummary({ data, onViewAll }: { data: ExecutiveOverview; onViewAll: () => void }) {
  const atRisk = data.clients.filter((c) => c.atRisk);
  return (
    <SummaryCard title="Clients & projects" action={<ViewMore label={`View all ${data.clients.length} clients`} onClick={onViewAll} />}>
      <div className="grid grid-cols-3 gap-2">
        <Figure label="Active" value={data.business.activeClients} />
        <Figure label="Onboarding" value={data.business.onboardingInProgress} />
        <Figure label="At risk" value={atRisk.length} tone={atRisk.length ? "bad" : undefined} />
      </div>
      {atRisk.length > 0 && (
        <ul className="mt-3 space-y-1">
          {atRisk.slice(0, 3).map((c) => (
            <li key={c.id} className="truncate text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{c.name}</span> — {c.riskReasons[0] ?? "needs attention"}
            </li>
          ))}
        </ul>
      )}
    </SummaryCard>
  );
}

function FinanceSummary({ data, onViewAll }: { data: ExecutiveOverview; onViewAll: () => void }) {
  const f = data.finance;
  const s = data.sales;
  return (
    <SummaryCard title="Finance & sales" action={<ViewMore label="View more" onClick={onViewAll} />}>
      {f.recorded ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          <Figure label="Received" value={zar(f.collected)} />
          <Figure label="Outstanding" value={zar(Math.max(0, f.invoicedAgencyFees - f.collected))} tone={f.overdueInvoices ? "bad" : undefined} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No invoices or expenses are recorded in Finance yet.</p>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        {s.recorded
          ? `Pipeline: ${s.leads} lead${s.leads === 1 ? "" : "s"} · ${zar(s.openPipelineValue)}/month open · ${s.wonThisMonth} won this month`
          : "No sales leads captured yet."}
      </p>
    </SummaryCard>
  );
}

function WorkforceSummary({ data, onViewAll }: { data: ExecutiveOverview; onViewAll: () => void }) {
  const a = data.attendance;
  const onLeave = data.leave.upcomingApproved.filter((l) => l.start <= data.today && l.end >= data.today).length;
  return (
    <SummaryCard title="Team & workforce" action={<ViewMore label="View more" onClick={onViewAll} />}>
      <div className="grid grid-cols-3 gap-2">
        <Figure label="Employees" value={data.business.headcount} />
        <Figure label="Working now" value={a.clockedIn + a.onBreak} />
        <Figure label="On leave" value={onLeave} />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        {data.leave.pending.length ? `${data.leave.pending.length} leave request(s) awaiting HR` : "No leave awaiting HR"}
        {a.missingClockOut.length ? ` · ${a.missingClockOut.length} unclosed clock-in(s)` : ""}
      </p>
    </SummaryCard>
  );
}

function ActivitySummary({ data, onViewAll }: { data: ExecutiveOverview; onViewAll: () => void }) {
  const all = useMemo(() => buildActivity(data), [data]);
  return (
    <SummaryCard
      title="Recent activity"
      action={<ViewMore label={all.length ? `View all ${all.length} updates` : "View activity"} onClick={onViewAll} />}
    >
      {all.length ? (
        <ul className="space-y-2">
          {all.slice(0, 3).map((a, i) => (
            <li key={i} className="min-w-0">
              <p className="truncate text-xs text-foreground">{a.text}</p>
              <p className="text-[11px] text-muted-foreground">
                {a.meta} · {relTime(a.at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No recorded activity in the last 30 days.</p>
      )}
    </SummaryCard>
  );
}

function ClientsDetail({ data }: { data: ExecutiveOverview }) {
  const clients = [...data.clients].sort(
    (a, b) => Number(b.atRisk) - Number(a.atRisk) || (b.onboarding?.daysOverdue ?? 0) - (a.onboarding?.daysOverdue ?? 0),
  );
  if (!clients.length) return <p className="px-5 py-10 text-center text-xs text-muted-foreground">No clients are recorded.</p>;
  return (
    <ul className="divide-y divide-border">
      {clients.map((c) => (
        <li key={c.id} className="space-y-1.5 px-5 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/ceo/clients"
                search={{ client: c.id } as any}
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {c.name}
              </Link>
              <p className="text-[11px] text-muted-foreground">
                {[c.package, c.industry, c.accountManager && `Account manager: ${c.accountManager}`].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            {c.atRisk && <StatusPill status="attention" />}
          </div>
          {c.onboarding ? (
            <div className="flex items-center gap-2">
              <Progress value={c.onboarding.progress} className="h-1.5 flex-1" />
              <span className="w-40 text-right text-[11px] text-muted-foreground">
                {c.onboarding.progress}% onboarded
                {c.onboarding.delayed ? ` · ${c.onboarding.daysOverdue}d late` : ""}
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No onboarding record.</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            {c.openTasks} open task{c.openTasks === 1 ? "" : "s"}
            {c.overdueTasks ? ` · ${c.overdueTasks} overdue` : ""}
            {c.riskReasons.length ? ` · ${c.riskReasons.join("; ")}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

// ── 1. Executive header ──────────────────────────────────────────────────────
function greeting(d = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-ZA", { hour: "numeric", hour12: false, timeZone: "Africa/Johannesburg" }).format(d));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function ExecutiveHeader({
  data,
  name,
  onFollowUp,
}: {
  data: ExecutiveOverview;
  name?: string | null;
  onFollowUp: () => void;
}) {
  const { refetch, isFetching } = useExecutiveOverview();
  const b = data.business;
  const first = (name || "Mavis").trim().split(/\s+/)[0];
  const date = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(new Date());
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          Chief Executive Officer · {date}
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, {first}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <StatusPill status={b.status} />
          <span className="text-muted-foreground">
            {b.status === "on-track"
              ? "No overdue work, delayed onboardings or outstanding financial issues are recorded."
              : b.statusReasons.join(" · ")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-muted-foreground sm:inline">Updated {relTime(data.generatedAt)}</span>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh data">
          <RefreshCw className={`h-3.5 w-3.5 sm:mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button size="sm" onClick={onFollowUp}>
          <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> Request follow-up
        </Button>
      </div>
    </header>
  );
}

// ── 2. Business overview ─────────────────────────────────────────────────────
function onTimeRate(data: ExecutiveOverview) {
  const done = data.tasks.filter((t) => t.status === "Completed" && t.dueDate && t.completionDate);
  if (!done.length) return { rate: null as number | null, n: 0 };
  const onTime = done.filter((t) => t.completionDate!.slice(0, 10) <= t.dueDate!).length;
  return { rate: Math.round((onTime / done.length) * 100), n: done.length };
}

function BusinessOverview({ data }: { data: ExecutiveOverview }) {
  const b = data.business;
  const f = data.finance;
  const perf = onTimeRate(data);
  const outstanding = Math.max(0, f.invoicedAgencyFees - f.collected);
  return (
    <section aria-label="Key indicators" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Metric
        label="Active clients"
        value={b.activeClients}
        context={b.clientsAddedLast30 ? `+${b.clientsAddedLast30} in the last 30 days` : "None added in 30 days"}
        to="/ceo/clients"
      />
      <Metric
        label="Monthly billing (MRR)"
        value={f.invoicedThisMonth === null ? "—" : zar(f.invoicedThisMonth)}
        context={f.invoicedThisMonth === null ? "No invoices recorded yet" : "Agency fees invoiced this month"}
        tone={f.invoicedThisMonth === null ? "muted" : undefined}
        to="/ceo/revenue"
      />
      <Metric
        label="Outstanding payments"
        value={f.recorded ? zar(outstanding) : "—"}
        context={
          !f.recorded
            ? "No invoices recorded yet"
            : f.overdueInvoices
              ? `${f.overdueInvoices} overdue (${zar(f.overdueAmount)})`
              : `${f.awaitingPayment} awaiting payment`
        }
        tone={!f.recorded ? "muted" : f.overdueInvoices ? "bad" : undefined}
        to="/ceo/revenue"
      />
      <Metric
        label="Active client projects"
        value={b.onboardingInProgress}
        context={b.onboardingDelayed ? `${b.onboardingDelayed} past target date` : "All on schedule"}
        tone={b.onboardingDelayed ? "warn" : undefined}
        to="/ceo/clients"
        search={b.onboardingDelayed ? { filter: "at-risk" } : undefined}
      />
      <Metric
        label="Overdue tasks"
        value={b.overdueTasks}
        context={`of ${b.openTasks} open · ${b.awaitingReview} awaiting review`}
        tone={b.overdueTasks ? "bad" : "good"}
        to="/ceo/delivery"
      />
      <Metric
        label="On-time delivery"
        value={perf.rate === null ? "—" : `${perf.rate}%`}
        context={perf.rate === null ? "No completed tasks with due dates" : `of ${perf.n} completed with a due date`}
        tone={perf.rate === null ? "muted" : perf.rate < 70 ? "warn" : undefined}
        to="/ceo/performance"
      />
    </section>
  );
}

// ── 3a. Intervention queue ───────────────────────────────────────────────────
const RESPONSIBLE_DEPT: Record<string, string> = {
  clients: "operations",
  finance: "finance",
  leave: "hr",
  attendance: "hr",
  people: "hr",
};
const PRIORITY: Record<FeedItem["severity"], { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  warning: { label: "High", cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  info: { label: "Normal", cls: "border-border bg-muted text-muted-foreground" },
};

function useQueueItems(data: ExecutiveOverview) {
  const notifs = useStaffNotifications();
  const firstSeen = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of notifs.data?.notifications ?? [])
      if (n.type === "executive_alert" && n.eventGroup) {
        const prev = m.get(n.eventGroup);
        if (!prev || n.createdAt > prev) m.set(n.eventGroup, n.createdAt);
      }
    return m;
  }, [notifs.data]);
  return useMemo(
    () =>
      // Informational items (attendance, leave, team changes) live in the workforce section and the bell.
      data.feed
        .filter((f) => f.severity !== "info")
        .map((f) => {
          const deptKey = f.departmentKey || RESPONSIBLE_DEPT[f.category] || null;
          const dept = deptKey ? data.departments.find((d) => d.key === deptKey) : undefined;
          const lead = dept?.leads[0]?.name ?? null;
          const followUpOwner = f.category === "follow-ups" ? f.detail.split(" · ")[0] : null;
          const responsible = followUpOwner || lead;
          return { f, dept, responsible, when: f.at || firstSeen.get(f.eventGroup) || null };
        }),
    [data, firstSeen],
  );
}

function nextAction(f: FeedItem, who: string | null, deptName?: string) {
  const owner = who ?? (deptName ? `the General Manager (${deptName} has no manager)` : "the General Manager");
  if (f.category === "tasks") return `Ask ${owner} for a recovery date on the overdue work.`;
  if (f.eventGroup.startsWith("review:")) return `Ask ${owner} to review the submission.`;
  if (f.category === "deliverables") return `Check with ${owner} why work is being returned for rework.`;
  if (f.category === "clients") return `Agree an onboarding recovery plan with ${owner}.`;
  if (f.eventGroup.startsWith("approval:")) return `Ask ${owner} to approve or decline the request.`;
  if (f.category === "finance") return `Ask ${owner} to follow up the outstanding invoices.`;
  if (f.category === "follow-ups") return `Chase ${who ?? "the assignee"} for an acknowledgement.`;
  if (f.category === "attendance") return `Check with ${owner} before acting.`;
  return null;
}

function InterventionQueue({
  data,
  tracksAlerts,
  tab,
  onTab,
  onFollowUp,
  className,
  bare,
}: {
  data: ExecutiveOverview;
  tracksAlerts: boolean;
  tab: string;
  onTab: (t: string) => void;
  onFollowUp: (d: FollowUpDraft) => void;
  className?: string;
  bare?: boolean;
}) {
  const alerts = useAlertState();
  const items = useQueueItems(data);
  const fresh = tracksAlerts ? items.filter((i) => alerts.isUnread(i.f)) : items;
  const reviewed = tracksAlerts ? items.filter((i) => !alerts.isUnread(i.f)) : [];
  const openFollowUps = data.followUps.filter((f) => f.status !== "Resolved");
  return (
    <Panel
      id="exec-queue"
      title="Needs your attention"
      description="Critical issues, overdue decisions, client escalations and financial risks, with the person responsible."
      className={className}
      bodyClassName="p-0"
      bare={bare}
    >
      <Tabs value={tab} onValueChange={onTab}>
        <div className="border-b border-border px-5 pt-3">
          <TabsList className="h-8">
            <TabsTrigger value="new" className="text-xs">
              {tracksAlerts ? "New" : "Open"} ({fresh.length})
            </TabsTrigger>
            {tracksAlerts && (
              <TabsTrigger value="reviewed" className="text-xs">
                Reviewed ({reviewed.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="follow-ups" className="text-xs">
              Your follow-ups ({openFollowUps.length})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="new" className="m-0">
          <QueueList
            items={fresh}
            onFollowUp={onFollowUp}
            onReviewed={tracksAlerts ? (f) => alerts.markRead(f) : undefined}
            empty={
              tracksAlerts
                ? "You're up to date. Reviewed items are under Reviewed and in the notification bell."
                : "Nothing is waiting on an executive decision."
            }
          />
        </TabsContent>
        {tracksAlerts && (
          <TabsContent value="reviewed" className="m-0">
            <QueueList items={reviewed} onFollowUp={onFollowUp} empty="Nothing reviewed is still open." muted />
          </TabsContent>
        )}
        <TabsContent value="follow-ups" className="m-0 p-5">
          <FollowUpList
            followUps={data.followUps.slice(0, 10)}
            mode="ceo"
            empty="Use “Request follow-up” to ask a manager to act on something you've seen."
          />
        </TabsContent>
      </Tabs>
    </Panel>
  );
}

function QueueList({
  items,
  onFollowUp,
  onReviewed,
  empty,
  muted,
}: {
  items: ReturnType<typeof useQueueItems>;
  onFollowUp: (d: FollowUpDraft) => void;
  onReviewed?: (f: FeedItem) => void;
  empty: string;
  muted?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  if (!items.length) return <p className="px-5 py-10 text-center text-xs text-muted-foreground">{empty}</p>;
  const shown = showAll ? items : items.slice(0, 5);
  return (
    <div>
      <ul className="divide-y divide-border">
        {shown.map(({ f, dept, responsible, when }) => {
          const action = nextAction(f, responsible, dept?.name);
          const open = () => {
            onReviewed?.(f);
            const { to, search } = splitLink(f.link);
            navigate({ to: to as any, search: search as any });
          };
          return (
            <li key={f.id} className={`px-5 py-4 ${muted ? "opacity-80" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{SEV_ICON[f.severity]}</span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY[f.severity].cls}`}>
                      {PRIORITY[f.severity].label}
                    </span>
                    <p className="text-sm font-medium leading-snug text-foreground">{f.title}</p>
                  </div>
                  {f.detail && <p className="line-clamp-2 text-xs text-muted-foreground">{f.detail}</p>}
                  <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <div>
                      <dt className="inline">Department: </dt>
                      <dd className="inline text-foreground">{dept?.name ?? "Company-wide"}</dd>
                    </div>
                    <div>
                      <dt className="inline">Responsible: </dt>
                      <dd className={`inline ${responsible ? "text-foreground" : "text-amber-700 dark:text-amber-400"}`}>
                        {responsible ?? "Manager not assigned"}
                      </dd>
                    </div>
                    {when && (
                      <div>
                        <dt className="inline">Raised: </dt>
                        <dd className="inline">{relTime(when)}</dd>
                      </div>
                    )}
                  </dl>
                  {action && (
                    <p className="text-xs text-foreground">
                      <span className="text-muted-foreground">Next step: </span>
                      {action}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 pl-7">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={open}>
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() =>
                    onFollowUp({
                      subject: f.title.slice(0, 160),
                      note: action ?? "",
                      departmentKey: dept?.key ?? null,
                      departmentName: dept?.name ?? null,
                      assigneeId: dept?.leads[0]?.id,
                    })
                  }
                >
                  <MessageSquarePlus className="mr-1 h-3 w-3" /> Request follow-up
                </Button>
                {onReviewed && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onReviewed(f)}>
                    <Check className="mr-1 h-3 w-3" /> Mark reviewed
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {items.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-medium text-primary hover:bg-muted/40"
        >
          {showAll ? "Show fewer" : `Show all ${items.length}`}
          <ChevronDown className={`h-3.5 w-3.5 transition ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

// ── 3b. Company activity ─────────────────────────────────────────────────────
type Activity = { at: string; text: string; meta: string; link?: string };

function buildActivity(data: ExecutiveOverview): Activity[] {
  const since = Date.now() - 30 * DAY;
  const out: Activity[] = [];
  const recent = (iso?: string | null) => Boolean(iso && new Date(iso).getTime() >= since);
  for (const t of data.tasks) {
    if (recent(t.completionDate) && t.status === "Completed")
      out.push({ at: t.completionDate!, text: `${t.assignedToName} completed “${t.title}”`, meta: t.department, link: "/ceo/delivery" });
    if (recent(t.createdAt))
      out.push({ at: t.createdAt, text: `${t.assignedByName} assigned “${t.title}” to ${t.assignedToName}`, meta: t.department, link: "/ceo/delivery" });
  }
  for (const e of data.evidence)
    if (recent(e.submittedAt))
      out.push({ at: e.submittedAt, text: `${e.submittedBy} submitted “${e.taskTitle}” for review`, meta: e.department, link: `/ceo/evidence?evidence=${encodeURIComponent(e.id)}` });
  for (const c of data.clients)
    if (recent(c.createdAt))
      out.push({ at: c.createdAt!, text: `New client: ${c.name}`, meta: c.package || c.industry || "Client", link: `/ceo/clients?client=${encodeURIComponent(c.id)}` });
  for (const f of data.followUps) {
    if (recent(f.createdAt)) out.push({ at: f.createdAt, text: `Follow-up requested: ${f.subject}`, meta: f.assigneeName, link: "/ceo?tab=follow-ups" });
    if (f.status === "Resolved" && recent(f.updatedAt))
      out.push({ at: f.updatedAt, text: `${f.assigneeName} resolved: ${f.subject}`, meta: "Follow-up", link: "/ceo?tab=follow-ups" });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const key = (x: Date) => x.toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg" });
  if (key(d) === key(new Date())) return "Today";
  if (key(d) === key(new Date(Date.now() - DAY))) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Johannesburg" });
}

function CompanyActivity({ data, className, bare }: { data: ExecutiveOverview; className?: string; bare?: boolean }) {
  const [limit, setLimit] = useState(10);
  const all = useMemo(() => buildActivity(data), [data]);
  const shown = all.slice(0, limit);
  const groups: { label: string; items: Activity[] }[] = [];
  for (const a of shown) {
    const label = dayLabel(a.at);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(a);
    else groups.push({ label, items: [a] });
  }
  return (
    <Panel
      title="Company activity"
      description="Work assigned and completed, submissions, new clients and follow-ups — last 30 days."
      className={className}
      bodyClassName="p-0"
      bare={bare}
    >
      {!all.length ? (
        <p className="px-5 py-10 text-center text-xs text-muted-foreground">No recorded activity in the last 30 days.</p>
      ) : (
        <div>
          <div className="space-y-4 px-5 py-4">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</p>
                <ol className="space-y-2.5 border-l border-border pl-3.5">
                  {g.items.map((a, i) => (
                    <li key={i} className="relative">
                      <CircleDot className="absolute -left-[21px] top-0.5 h-3 w-3 bg-card text-muted-foreground" />
                      {a.link ? (
                        <Link
                          to={splitLink(a.link).to as any}
                          search={splitLink(a.link).search as any}
                          className="text-xs leading-snug text-foreground hover:text-primary"
                        >
                          {a.text}
                        </Link>
                      ) : (
                        <p className="text-xs leading-snug text-foreground">{a.text}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {a.meta} · {new Date(a.at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          {all.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + 15)}
              className="w-full border-t border-border py-2.5 text-xs font-medium text-primary hover:bg-muted/40"
            >
              Show earlier activity ({all.length - limit} more)
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}

// ── 4. Department performance ────────────────────────────────────────────────
function DepartmentPerformance({ data, bare }: { data: ExecutiveOverview; bare?: boolean }) {
  const [showQuiet, setShowQuiet] = useState(false);
  const active = data.departments.filter((d) => d.status !== "no-activity");
  const quiet = data.departments.filter((d) => d.status === "no-activity");
  const real = data.departments.filter((d) => d.key !== "unassigned");
  const noManager = real.filter((d) => !d.leads.length).length;
  const rows = showQuiet ? [...active, ...quiet] : active;
  return (
    <Panel
      title="Department performance"
      description={`Work recorded against each department. ${noManager} of ${real.length} departments have no manager appointed.`}
      action={
        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link to="/ceo/structure">Department structure</Link>
        </Button>
      }
      bodyClassName="p-0"
      bare={bare}
    >
      <Tabs defaultValue="table">
        <div className="border-b border-border px-5 pt-3">
          <TabsList className="h-8">
            <TabsTrigger value="table" className="text-xs">
              Departments
            </TabsTrigger>
            <TabsTrigger value="trend" className="text-xs">
              Delivery trend
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="table" className="m-0">
          {/* Desktop / tablet: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Department</th>
                  <th className="px-3 py-2.5 font-medium">Manager</th>
                  <th className="px-3 py-2.5 text-right font-medium">Employees</th>
                  <th className="px-3 py-2.5 text-right font-medium">Active</th>
                  <th className="px-3 py-2.5 text-right font-medium">Completed</th>
                  <th className="px-3 py-2.5 text-right font-medium">Overdue</th>
                  <th className="w-44 px-3 py-2.5 font-medium">Completion</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <DeptRow key={d.key} d={d} employees={employeesIn(data, d.key)} />
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: one card per department */}
          <ul className="divide-y divide-border md:hidden">
            {rows.map((d) => (
              <li key={d.key} className="space-y-2 px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to="/ceo/departments" search={{ dept: d.key } as any} className="text-sm font-medium text-foreground">
                    {d.name}
                  </Link>
                  <StatusPill status={d.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {d.leads[0]?.name ?? <span className="text-amber-700 dark:text-amber-400">Manager not assigned</span>} ·{" "}
                  {employeesIn(data, d.key)} employee{employeesIn(data, d.key) === 1 ? "" : "s"}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Figure label="Active" value={d.tasksOpen} />
                  <Figure label="Completed" value={d.tasksCompleted} />
                  <Figure label="Overdue" value={d.tasksOverdue} tone={d.tasksOverdue ? "bad" : undefined} />
                </div>
                {d.completionRate !== null && <Progress value={d.completionRate} className="h-1.5" />}
              </li>
            ))}
          </ul>
          {quiet.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQuiet((v) => !v)}
              className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-medium text-primary hover:bg-muted/40"
            >
              {showQuiet ? "Hide" : "Show"} {quiet.length} department{quiet.length === 1 ? "" : "s"} with no recorded work
              <ChevronDown className={`h-3.5 w-3.5 transition ${showQuiet ? "rotate-180" : ""}`} />
            </button>
          )}
        </TabsContent>
        <TabsContent value="trend" className="m-0 p-5">
          <DeliveryTrend data={data} />
        </TabsContent>
      </Tabs>
    </Panel>
  );
}

function DeptRow({ d, employees }: { d: DepartmentScorecard; employees: number }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="px-5 py-3">
        <Link to="/ceo/departments" search={{ dept: d.key } as any} className="font-medium text-foreground hover:text-primary">
          {d.name}
        </Link>
      </td>
      <td className="px-3 py-3 text-xs">
        {d.leads[0] ? (
          <span className="text-foreground">{d.leads[0].name}</span>
        ) : (
          <span className="text-amber-700 dark:text-amber-400">Not assigned</span>
        )}
      </td>
      <td className="px-3 py-3 text-right tabular-nums">{employees}</td>
      <td className="px-3 py-3 text-right tabular-nums">{d.tasksOpen}</td>
      <td className="px-3 py-3 text-right tabular-nums">{d.tasksCompleted}</td>
      <td className={`px-3 py-3 text-right tabular-nums ${d.tasksOverdue ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}>
        {d.tasksOverdue}
      </td>
      <td className="px-3 py-3">
        {d.completionRate === null ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <div className="flex items-center gap-2">
            <Progress value={d.completionRate} className="h-1.5 flex-1" />
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{d.completionRate}%</span>
          </div>
        )}
      </td>
      <td className="px-5 py-3">
        <StatusPill status={d.status} />
      </td>
    </tr>
  );
}

function weekStart(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(x.getTime() - dow * DAY);
}

function DeliveryTrend({ data }: { data: ExecutiveOverview }) {
  const series = useMemo(() => {
    const start = weekStart(new Date());
    return Array.from({ length: 8 }, (_, i) => {
      const from = new Date(start.getTime() - (7 - i) * 7 * DAY);
      const to = new Date(from.getTime() + 7 * DAY);
      const inWeek = (iso?: string | null) => Boolean(iso && new Date(iso) >= from && new Date(iso) < to);
      return {
        week: from.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
        assigned: data.tasks.filter((t) => inWeek(t.createdAt)).length,
        completed: data.tasks.filter((t) => t.status === "Completed" && inWeek(t.completionDate)).length,
      };
    });
  }, [data.tasks]);
  const any = series.some((s) => s.assigned || s.completed);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">Tasks assigned and completed per week</p>
          <p className="text-xs text-muted-foreground">Last 8 weeks, weeks starting Monday</p>
        </div>
        <Legend
          items={[
            { label: "Assigned", color: "var(--viz-1)" },
            { label: "Completed", color: "var(--viz-2)" },
          ]}
        />
      </div>
      {any ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip />} />
              <Bar isAnimationActive={false} dataKey="assigned" name="Assigned" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar isAnimationActive={false} dataKey="completed" name="Completed" fill="var(--viz-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-10 text-center text-xs text-muted-foreground">No tasks were assigned or completed in the last 8 weeks.</p>
      )}
    </div>
  );
}

// ── 5a. Financial overview ───────────────────────────────────────────────────
function FinancialOverview({ data, bare }: { data: ExecutiveOverview; bare?: boolean }) {
  const f = data.finance;
  const s = data.sales;
  const months = f.monthly.map((m) => ({
    ...m,
    label: new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-ZA", { month: "short", year: "2-digit", timeZone: "UTC" }),
  }));
  const anyMonthly = months.some((m) => m.invoiced || m.collected);
  return (
    <Panel
      title="Financial overview"
      description="Agency fees only — client ad spend is paid to the platforms directly and is not MSP revenue."
      action={
        <Link to="/ceo/revenue" className="text-xs font-medium text-primary hover:underline">
          Details
        </Link>
      }
      bare={bare}
    >
      {f.recorded ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Figure label="Invoiced" value={zar(f.invoicedAgencyFees)} />
            <Figure label="Received" value={zar(f.collected)} />
            <Figure label="Outstanding" value={zar(Math.max(0, f.invoicedAgencyFees - f.collected))} tone={f.overdueInvoices ? "bad" : undefined} />
            <Figure label="Expenses paid" value={zar(f.expensesPaid)} />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-xs font-medium text-foreground">Monthly invoicing, last 6 months</p>
              <Legend
                items={[
                  { label: "Invoiced", color: "var(--viz-1)" },
                  { label: "Received", color: "var(--viz-2)" },
                ]}
              />
            </div>
            {anyMonthly ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...axisProps} width={56} tickFormatter={(v) => (v >= 1000 ? `R${Math.round(v / 1000)}k` : `R${v}`)} />
                    <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip format={zar} />} />
                    <Bar isAnimationActive={false} dataKey="invoiced" name="Invoiced" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    <Bar isAnimationActive={false} dataKey="collected" name="Received" fill="var(--viz-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No invoices fall in the last 6 months.</p>
            )}
          </div>
          {f.pendingApprovals.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {f.pendingApprovals.length} spending approval{f.pendingApprovals.length > 1 ? "s" : ""} pending with Finance.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">No financial records yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Revenue, payments and expenses appear here once Finance records invoices and expenses in the portal.
          </p>
        </div>
      )}
      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Sales pipeline</p>
          <Link to="/ceo/sales" className="text-xs font-medium text-primary hover:underline">
            Pipeline
          </Link>
        </div>
        {s.recorded ? (
          <div className="grid grid-cols-3 gap-4">
            <Figure label="Leads" value={s.leads} />
            <Figure label="Open pipeline / month" value={zar(s.openPipelineValue)} />
            <Figure label="Won this month" value={`${s.wonThisMonth} · ${zar(s.wonValueThisMonth)}`} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No leads have been captured in the Sales module yet.</p>
        )}
      </div>
    </Panel>
  );
}

// ── 5b. Team & workforce ─────────────────────────────────────────────────────
function WorkforceOverview({ data, bare }: { data: ExecutiveOverview; bare?: boolean }) {
  const a = data.attendance;
  const real = data.departments.filter((d) => d.key !== "unassigned");
  const managers = real.filter((d) => d.leads.length).length;
  const today = data.today;
  const onLeave = data.leave.upcomingApproved.filter((l) => l.start <= today && l.end >= today).length;
  const staffing = data.departments
    .map((d) => ({ key: d.key, name: d.name, members: employeesIn(data, d.key) }))
    .filter((d) => d.members > 0)
    .sort((x, y) => y.members - x.members);
  const maxMembers = Math.max(1, ...staffing.map((d) => d.members));
  const daily = a.daily.map((d) => ({
    ...d,
    label: new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", timeZone: "UTC" }),
  }));
  return (
    <Panel
      title="Team & workforce"
      description="Headcount, staffing by department, attendance and leave. Individual records are on People & Workforce."
      action={
        <Link to="/ceo/team" className="text-xs font-medium text-primary hover:underline">
          People
        </Link>
      }
      bare={bare}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Figure label="Employees" value={data.business.headcount} />
        <Figure label="Department managers" value={`${managers} of ${real.length}`} />
        <Figure label="Working now" value={a.clockedIn + a.onBreak} />
        <Figure label="On leave today" value={onLeave} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {data.leave.pending.length
          ? `${data.leave.pending.length} leave request${data.leave.pending.length > 1 ? "s" : ""} awaiting HR`
          : "No leave requests awaiting HR"}
        {a.missingClockOut.length ? ` · ${a.missingClockOut.length} clock-in session(s) never closed` : ""}
        {data.business.sharedAccounts ? ` · ${data.business.sharedAccounts} shared/system logins not counted` : ""}
      </p>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-medium text-foreground">Employees clocked in, last 7 days</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip />} />
              <Bar isAnimationActive={false} dataKey="present" name="Clocked in" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-medium text-foreground">Staffing by department</p>
        {staffing.length ? (
          <ul className="space-y-1.5">
            {staffing.map((d) => (
              <li key={d.key} className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-3 text-xs">
                <span className="truncate text-muted-foreground">{d.name}</span>
                <span className="h-1.5 rounded-full bg-muted">
                  <span
                    className="block h-1.5 rounded-full"
                    style={{ width: `${(d.members / maxMembers) * 100}%`, background: "var(--viz-1)" }}
                  />
                </span>
                <span className="text-right tabular-nums text-foreground">{d.members}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No employees are placed in departments yet.</p>
        )}
      </div>
    </Panel>
  );
}

