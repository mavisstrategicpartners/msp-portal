import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState, selectClass } from "@/components/layout/page";
import { useArenaMe, monthLabel } from "@/lib/sales-arena-api";
import { shiftMonth, todayZA } from "@/lib/sales-arena-shared";
import { cn } from "@/lib/utils";

/** Section links shared by every Sales Arena page (scrolls sideways on phones). */
export function ArenaNav() {
  const { data: me } = useArenaMe();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!me || (!me.isCEO && !me.salesperson)) return null;
  const links = [
    me?.isCEO ? { to: "/ceo/sales-arena", label: "Dashboard" } : { to: "/sales-arena", label: "My performance" },
    { to: "/sales-arena/pipeline", label: "Pipeline" },
    { to: "/sales-arena/activity", label: "Setter activity" },
    { to: "/sales-arena/lead-magnets", label: "Lead magnets" },
    { to: "/sales-arena/payments", label: "Payments" },
    { to: "/sales-arena/targets", label: me?.isCEO ? "Team targets" : "My targets" },
  ];
  return (
    <nav aria-label="Sales Arena" className="-mx-1 overflow-x-auto">
      <div className="flex min-w-max gap-1 border-b border-border px-1">
        {links.map((l) => {
          const active = l.to === "/sales-arena" || l.to === "/ceo/sales-arena" ? path === l.to : path.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to as any}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
                active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MonthSelect({ value, onChange, back = 24 }: { value: string; onChange: (m: string) => void; back?: number }) {
  const now = todayZA().slice(0, 7);
  const months = Array.from({ length: back + 2 }, (_, i) => shiftMonth(now, 1 - i));
  if (!months.includes(value)) months.push(value);
  return (
    <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Reporting month">
      {months.map((m) => (
        <option key={m} value={m}>
          {monthLabel(m)}
        </option>
      ))}
    </select>
  );
}

const TONE: Record<string, string> = {
  Overdue: "border-destructive/40 bg-destructive/10 text-destructive",
  "Overdue preparation": "border-destructive/40 bg-destructive/10 text-destructive",
  "Check dates / link": "border-destructive/40 bg-destructive/10 text-destructive",
  "Due today": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Set follow-up": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Add report link": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Completed - details pending": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Completed - not sent": "border-primary/30 bg-primary/10 text-primary",
  "Dates pending": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Won: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Sent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Discussed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Achieved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Lost: "border-border bg-muted text-muted-foreground",
  Declined: "border-border bg-muted text-muted-foreground",
  Closed: "border-border bg-muted text-muted-foreground",
  Done: "border-border bg-muted text-muted-foreground",
};
export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap text-xs font-normal", TONE[value] ?? "")}>
      {value}
    </Badge>
  );
}

/** Shown when the API refuses (no salesperson link, or a CEO-only section). */
export function ArenaGate({ error, children }: { error: any; children: ReactNode }) {
  if (error?.status === 403)
    return (
      <EmptyState
        icon={Lock}
        title="No access"
        description={error.message || "This Sales Arena information is not available to your account."}
      />
    );
  if (error) return <EmptyState title="Could not load this page" description={error.message} />;
  return <>{children}</>;
}

export const Loading = () => <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;

export function FieldRow({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
export const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50";
export const textareaClass =
  "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Options({ list, placeholder = "Not set" }: { list: readonly string[]; placeholder?: string | false }) {
  return (
    <>
      {placeholder !== false && <option value="">{placeholder}</option>}
      {list.map((x) => (
        <option key={x} value={x}>
          {x}
        </option>
      ))}
    </>
  );
}

export function ChartTooltip({ active, payload, label, format }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload
        .filter((p: any) => p.value !== null && p.value !== undefined)
        .map((p: any) => (
          <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
            {p.name}: <span className="font-medium tabular-nums text-foreground">{format ? format(p.value) : p.value}</span>
          </p>
        ))}
    </div>
  );
}
export function ChartLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3" style={{ background: i.dashed ? "transparent" : i.color, borderTop: i.dashed ? `2px dashed ${i.color}` : undefined, height: i.dashed ? 0 : 8, borderRadius: 2 }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
export const axisProps = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, tickLine: false, axisLine: false } as const;
export const compactZar = (n: number) => (Math.abs(n) >= 1000 ? `R${Math.round(n / 1000)}k` : `R${Math.round(n)}`);
