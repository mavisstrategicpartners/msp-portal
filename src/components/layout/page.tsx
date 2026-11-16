/**
 * MSP design standard — shared page building blocks.
 *
 * Every portal page uses the same structure so the system reads as one platform:
 *   <Page>
 *     <PageHeader eyebrow="HR workspace" title="Leave Management" description="…" actions={…} />
 *     <StatGrid> <StatCard … /> … </StatGrid>
 *     <Section title="…"> … </Section>
 *   </Page>
 *
 * Rules: one H1 per page (text-2xl semibold); muted eyebrow and description; actions top-right;
 * stat labels in sentence case; colour only to signal status (overdue, warning, success),
 * never for decoration.
 */
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full space-y-6", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  /** Small context line above the title, e.g. the workspace or a back link. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons shown on the right (primary action last). */
  actions?: ReactNode;
  /** Extra line under the description (status, source, last updated…). */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-3xl space-y-1">
        {eyebrow && <div className="text-xs font-medium text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
        {meta && <div className="pt-0.5 text-xs text-muted-foreground">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const TONES = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
  primary: "text-primary",
} as const;
export type StatTone = keyof typeof TONES;

export function StatGrid({ children, className, cols = 4 }: { children: ReactNode; className?: string; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const c = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4", 5: "sm:grid-cols-3 xl:grid-cols-5", 6: "sm:grid-cols-3 2xl:grid-cols-6" }[cols];
  return <div className={cn("grid grid-cols-2 gap-3", c, className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  onClick,
  active,
  children,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: StatTone;
  /** Makes the card a filter/shortcut button. */
  onClick?: () => void;
  active?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />}
      </div>
      <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums tracking-tight", TONES[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </>
  );
  const cls = cn(
    "min-w-0 rounded-lg border bg-card p-4 text-left shadow-xs",
    active ? "border-primary ring-1 ring-primary/30" : "border-border",
    onClick && "transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card shadow-xs", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon?: ComponentType<{ className?: string }>; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      {Icon && <Icon className="mb-1 h-6 w-6 text-muted-foreground/60" />}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Native <select> styled like the shadcn inputs (for compact filter bars). */
export const selectClass =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

/** "Good afternoon, Mavis" — first name for people, the full name for shared role accounts ("MSP Human Resources"). */
export function greetName(fullName?: string | null) {
  const n = (fullName || "").trim();
  if (!n) return "there";
  return /^msp\b/i.test(n) ? n : n.split(/\s+/)[0];
}

/** Time-of-day greeting in the company's time zone. */
export function greeting(now = new Date()) {
  const h = Number(now.toLocaleString("en-ZA", { hour: "2-digit", hour12: false, timeZone: "Africa/Johannesburg" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Standard data-table classes (use with plain <table> markup). */
export const table = {
  wrap: "overflow-x-auto rounded-lg border border-border bg-card",
  table: "w-full min-w-[640px] text-left text-sm",
  thead: "border-b border-border bg-muted/40 text-xs text-muted-foreground",
  th: "whitespace-nowrap px-4 py-2.5 font-medium",
  tr: "border-b border-border last:border-0 hover:bg-muted/30",
  td: "px-4 py-3 align-middle",
};
