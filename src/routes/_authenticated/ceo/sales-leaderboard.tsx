import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  Page,
  PageHeader,
  Section,
  StatCard,
  StatGrid,
  selectClass,
  table,
} from "@/components/layout/page";
import { formatZAR } from "@/lib/currency";
import { canViewSalesLeaderboard } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";
import { useSalesLeaderboard } from "@/lib/sales.service";

/**
 * Monthly Sales Leaderboard & Performance Rankings — confidential, CEO only.
 *
 * Access is enforced in three places, none of which depend on this page:
 *  - the route guard (RESTRICTED_SHARED_PAGES in src/lib/navigation.ts) redirects anyone else;
 *  - /api/sales/leaderboard answers 403 unless canViewSalesLeaderboard(access);
 *  - the database only lets administrators read the raw sales ledger, and sales rows only for the
 *    Root Administrator (policy audit_logs_admin_read).
 */
export const Route = createFileRoute("/_authenticated/ceo/sales-leaderboard")({
  head: () => ({ meta: [{ title: "Sales Leaderboard — Executive View" }] }),
  component: SalesLeaderboardPage,
});

function monthOptions() {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 13; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({
      value: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`,
      label: x.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

function SalesLeaderboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const allowed = canViewSalesLeaderboard(profile as any);
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0].value);
  const { data: rankings = [], isLoading, error } = useSalesLeaderboard(month, { enabled: allowed });

  const header = (
    <PageHeader
      eyebrow="CEO workspace · Confidential"
      title="Sales Leaderboard"
      description="Each consultant's target, closed-won revenue and ranking for the month. Visible to the CEO only; Sales staff see only their own figures."
      actions={
        allowed ? (
          <select className={selectClass} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        ) : undefined
      }
    />
  );

  if (profileLoading) return <Page>{header}</Page>;

  if (!allowed || (error as any)?.status === 403) {
    return (
      <Page>
        {header}
        <EmptyState
          icon={Lock}
          title="Restricted"
          description="The sales leaderboard and performance rankings are confidential and available to the CEO only."
        />
      </Page>
    );
  }

  const withTarget = rankings.filter((r) => r.targetAmount > 0);
  const totalWon = rankings.reduce((a, r) => a + r.actualWonAmount, 0);
  const totalTarget = rankings.reduce((a, r) => a + r.targetAmount, 0);
  const onTarget = withTarget.filter((r) => r.actualWonAmount >= r.targetAmount).length;

  return (
    <Page>
      {header}
      <StatGrid cols={4}>
        <StatCard label="Consultants ranked" value={isLoading ? "—" : rankings.length} />
        <StatCard label="Closed-won revenue" value={isLoading ? "—" : formatZAR(totalWon)} />
        <StatCard
          label="Team target"
          value={isLoading ? "—" : totalTarget ? formatZAR(totalTarget) : "—"}
          hint={totalTarget ? `${Math.round((totalWon / totalTarget) * 100)}% achieved` : "No targets set"}
        />
        <StatCard
          label="At or above target"
          value={isLoading ? "—" : withTarget.length ? `${onTarget} of ${withTarget.length}` : "—"}
          hint={withTarget.length ? undefined : "No targets set"}
        />
      </StatGrid>

      <Section title="Monthly Sales Leaderboard & Performance Rankings">
        {error ? (
          <EmptyState title="Could not load the leaderboard" description={(error as Error).message} />
        ) : isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : rankings.length === 0 ? (
          <EmptyState icon={Trophy} title="No records found" description="No Sales team members or closed deals for this month yet." />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead className={table.thead}>
                <tr>
                  <th className={table.th}>Rank</th>
                  <th className={table.th}>Consultant</th>
                  <th className={table.th}>Target</th>
                  <th className={table.th}>Closed-won</th>
                  <th className={table.th}>Achievement</th>
                  <th className={table.th}>Deals won / leads</th>
                  <th className={`${table.th} text-right`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => {
                  const hasTarget = r.targetAmount > 0;
                  return (
                    <tr key={r.consultantId} className={table.tr}>
                      <td className={`${table.td} font-medium`}>#{r.rank}</td>
                      <td className={table.td}>
                        <div className="font-medium text-foreground">{r.consultantName}</div>
                        <div className="text-xs text-muted-foreground">{r.consultantEmail}</div>
                      </td>
                      <td className={`${table.td} tabular-nums`}>{hasTarget ? formatZAR(r.targetAmount) : "Not set"}</td>
                      <td className={`${table.td} tabular-nums font-medium`}>{formatZAR(r.actualWonAmount)}</td>
                      <td className={table.td}>
                        {hasTarget ? (
                          <div className="flex items-center gap-2">
                            <span className="w-10 tabular-nums">{r.percentageAchieved}%</span>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, r.percentageAchieved)}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={`${table.td} tabular-nums`}>
                        {r.wonDealsCount} / {r.leadsCount}
                      </td>
                      <td className={`${table.td} text-right`}>
                        <Badge variant="outline" className="text-xs">
                          {!hasTarget ? "No target set" : r.status === "exceeded" ? "Exceeded" : r.status === "reached" ? "Target reached" : "Below target"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}
