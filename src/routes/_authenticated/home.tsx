import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/lib/use-profile";
import { TrendingUp, Cog, Workflow, BarChart3, ArrowRight, BookOpen, Briefcase, Wrench, Activity, Users, Clock, Compass, Building2, UserCog } from "lucide-react";
import { useDepartments } from "@/lib/department-scope";
import { StaffAttendanceBoard } from "@/components/StaffAttendanceBoard";
import { StaffWorkspaceDashboard } from "@/components/dashboards/StaffWorkspaceDashboard";
import { HRStaffDashboard } from "@/components/dashboards/HRStaffDashboard";
import { Page } from "@/components/layout/page";

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

function Home() {
  const { data } = useProfile();
  const router = useRouter();
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
    } else if (data?.isDepartmentLead && !isAdmin) {
      // Appointed department manager: their department workspace is their dashboard.
      router.navigate({ to: "/department" as any, replace: true });
    }
  }, [systemRole, router, data?.isDepartmentLead, isAdmin]);

  if (systemRole === "hr") {
    return <HRStaffDashboard />;
  }

  if (isAdmin) {
    return (
      <Page>
        <StaffWorkspaceDashboard eyebrow="Admin control panel" />

        <StaffAttendanceBoard />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Administration</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QuickLink to="/admin/attendance" icon={Clock} title="Live Staff Presence" desc="Real-time clock-in & presence board." />
            <QuickLink to="/admin/users" icon={Users} title="Manage Staff" desc="Add, edit & manage team members." />
            <QuickLink to="/admin/operations" icon={Activity} title="Operations Control" desc="Workflows, client health & KPIs." />
            <QuickLink to="/admin/kpis" icon={BarChart3} title="KPI Dashboards" desc="Performance metrics & reporting." />
          </div>
        </section>
      </Page>
    );
  }

  return (
    <Page>
      <StaffWorkspaceDashboard meta={<MyDepartmentCard />} />

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Jump back in</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickLink to="/sops" icon={BookOpen} title="SOP Library" desc="How every department works." />
          <QuickLink to="/services" icon={Briefcase} title="Our Services" desc="The 7 services we sell." />
          <QuickLink to="/tools" icon={Wrench} title="Tools & Systems" desc="GHL, Meta, Zoho, Slack…" />
          <QuickLink to="/who-we-are" icon={Compass} title="Who We Are" desc="Our team, mission and values." />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">The four core rules</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {CORE_RULES.map((r) => (
            <Card key={r.label} className="p-4">
              <r.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-semibold">{r.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </Page>
  );
}

/** The employee's place in the organisation: their department and the manager they report to. */
function MyDepartmentCard() {
  const q = useDepartments();
  const me = q.data?.me;
  if (!me) return null;
  const name = (k: string) => q.data?.departments.find((d) => d.key === k)?.name ?? k;
  const others = me.departments.filter((k) => k !== me.departmentKey);
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5" />
        Department:{" "}
        <span className="font-medium text-foreground">{me.departmentKey ? name(me.departmentKey) : "not assigned yet"}</span>
        {others.length > 0 && <span>(also {others.map(name).join(", ")})</span>}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <UserCog className="h-3.5 w-3.5" />
        Reports to:{" "}
        {me.manager ? (
          <span className="font-medium text-foreground">{me.manager.name}</span>
        ) : (
          <span className="text-amber-700 dark:text-amber-400">
            {me.departmentKey ? "manager not assigned — the General Manager covers this department" : "—"}
          </span>
        )}
      </span>
      {!me.departmentKey && <span className="w-full">The CEO or an administrator places you in a department.</span>}
    </span>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: typeof BookOpen; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group">
      <Card className="flex h-full items-start justify-between gap-3 p-4 transition-colors hover:border-primary/40">
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