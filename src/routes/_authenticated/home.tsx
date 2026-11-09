import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/lib/use-profile";
import { Sparkles, Lightbulb, TrendingUp, Cog, Workflow, BarChart3, ArrowRight, BookOpen, Briefcase, Wrench, Activity, Users, Clock, Compass } from "lucide-react";
import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { StaffAttendanceBoard } from "@/components/StaffAttendanceBoard";
import { StaffWorkspaceDashboard } from "@/components/dashboards/StaffWorkspaceDashboard";
import { HRStaffDashboard } from "@/components/dashboards/HRStaffDashboard";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home — MSP Portal" }] }),
  component: Home,
});

const CORE_RULES = [
  { icon: TrendingUp, label: "Leads over Followers", desc: "We chase revenue, not vanity metrics." },
  { icon: Workflow, label: "Systems over Campaigns", desc: "A campaign ends. A system compounds." },
  { icon: Cog, label: "Automation over Manual Work", desc: "If it can be automated, it must be." },
  { icon: BarChart3, label: "Data over Opinions", desc: "Numbers decide. Opinions guide." },
];

const TIPS = [
  "Ask Msp 'how do I send a client invoice?' and it'll walk you through the SOP.",
  "New here? Check the SOP Library to see exactly what's expected in your role.",
  "Leads contacted within 5 minutes are 21× more likely to convert.",
  "Press ⌘K (or Ctrl+K) anywhere to search the whole portal.",
  "Every ad needs Hook → Problem → Solution → CTA. No exceptions.",
];

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { data } = useProfile();
  const router = useRouter();
  const greetingText = greeting();
  const name = data?.profile?.full_name?.trim() ?? "there";
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const isAdmin = data?.isAdmin ?? false;
  const systemRole = data?.systemRole;

  // Dedicated role dashboards — redirect authorized roles to their dedicated workspaces
  useEffect(() => {
    if (systemRole === "general_manager") {
      router.navigate({ to: "/gm" as any, replace: true });
    } else if (systemRole === "hr") {
      router.navigate({ to: "/hr" as any, replace: true });
    } else if (systemRole === "department_manager") {
      router.navigate({ to: "/department" as any, replace: true });
    } else if (systemRole === "sales" || systemRole === "sales_manager" || systemRole === "sales_consultant") {
      router.navigate({ to: "/sales" as any, replace: true });
    } else if (systemRole === "finance_admin") {
      router.navigate({ to: "/finance" as any, replace: true });
    } else if (systemRole === "operations") {
      router.navigate({ to: "/operations" as any, replace: true });
    } else if (systemRole === "ceo") {
      router.navigate({ to: "/ceo" as any, replace: true });
    }
  }, [systemRole, router]);

  if (systemRole === "hr") {
    return <HRStaffDashboard />;
  }

  if (isAdmin) {
    return (
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Admin Control Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {greetingText}, <span className="brand-text">{name}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            You're logged in as an administrator. Monitor live workforce presence, manage staff, and control operations below.
          </p>
        </div>

        <Card className="flex flex-col gap-3 border-primary/20 bg-primary/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin tip</p>
          </div>
          <p className="flex items-start gap-1.5 text-sm text-foreground">
            <Lightbulb className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Use Live Staff Presence to see who is clocked in right now across all departments in real time.
          </p>
        </Card>

        {/* ─── Personal Staff Workspace & Deliverables ──────────────────────── */}
        <section className="pt-2">
          <StaffWorkspaceDashboard />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Live workforce presence
            </h2>
            <Link to="/admin/attendance" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              Full view <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <StaffAttendanceBoard />
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Quick actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink to="/admin/attendance" icon={Clock} title="Live Staff Presence" desc="Real-time clock-in & presence board." />
            <QuickLink to="/admin/users" icon={Users} title="Manage Staff" desc="Add, edit & manage team members." />
            <QuickLink to="/admin/operations" icon={Activity} title="Operations Control" desc="Workflows, client health & KPIs." />
            <QuickLink to="/admin/kpis" icon={BarChart3} title="KPI Dashboards" desc="Performance metrics & reporting." />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ─── Staff Workspace Dashboard Component ───────────────────────────── */}
      <StaffWorkspaceDashboard />

      {/* ─── Learning & Portal Quicklinks ───────────────────────────────────── */}
      <section className="pt-6 border-t border-border">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Jump back in</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink to="/sops" icon={BookOpen} title="SOP Library" desc="How every department works." />
          <QuickLink to="/services" icon={Briefcase} title="Our Services" desc="The 7 services we sell." />
          <QuickLink to="/tools" icon={Wrench} title="Tools & Systems" desc="GHL, Meta, Zoho, Slack…" />
          <QuickLink to="/who-we-are" icon={Compass} title="Who We Are" desc="Our team, mission and values." />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">The four core rules</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CORE_RULES.map((r) => (
            <Card key={r.label} className="group border-border/70 p-5 transition-colors hover:border-primary/40">
              <r.icon className="relative h-6 w-6 text-primary" />
              <p className="relative mt-4 text-sm font-semibold">{r.label}</p>
              <p className="relative mt-1 text-xs text-muted-foreground">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: typeof BookOpen; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group">
      <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40">
        <div>
          <Icon className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </Card>
    </Link>
  );
}