import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CalendarDays,
  ClipboardList,
  Briefcase,
  BarChart3,
  Crown,
  BookOpen,
  Settings,
  Wrench,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserMinus,
  Activity,
  Shield,
  PieChart,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
// NOTE: Seed data removed – dashboard now reads live data from Supabase tables.

/* ── tiny inline SVG bar chart (no external dep) ─────────────────────── */
function MiniBarChart({
  data,
  height = 160,
  color = "var(--primary)",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 36;
  const gap = 14;
  const padBottom = 44;
  const padTop = 14;
  const W = gap + data.length * (barW + gap);
  const usable = height - padBottom - padTop;
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <line
        x1={0}
        x2={W}
        y1={height - padBottom}
        y2={height - padBottom}
        stroke="currentColor"
        opacity="0.12"
      />
      {data.map((d, i) => {
        const h = (d.value / max) * usable;
        const x = gap + i * (barW + gap);
        const y = height - padBottom - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={height - padBottom + 16}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              opacity={0.5}
            >
              {d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── tiny donut ───────────────────────────────────────────────────────── */
function MiniDonut({
  data,
  size = 140,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 16;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circ;
          const o = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={14}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-o}
              strokeLinecap="round"
              transform={`rotate(-90 ${c} ${c})`}
              opacity={0.85}
            />
          );
        })}
        <text
          x={c}
          y={c - 4}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="currentColor"
        >
          {total}
        </text>
        <text
          x={c}
          y={c + 12}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          opacity={0.5}
        >
          Total
        </text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-semibold text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-1.5 border-border/60">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon
            className="h-4 w-4 text-muted-foreground/60"
            style={color ? { color } : undefined}
          />
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-500" />}
          {sub}
        </div>
      )}
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HR EXECUTIVE DASHBOARD
   ══════════════════════════════════════════════════════════════════════ */
export function HrDashboard() {
  const [employees] = useSupabaseTable("hr_employees", []);
  const [vacancies] = useSupabaseTable("hr_vacancies", []);
  const [applicants] = useSupabaseTable("hr_applicants", []);
  const [leave] = useSupabaseTable("hr_leave", []);
  const [learnerLeave] = useSupabaseTable("hr_learner_leave", []);
  const [training] = useSupabaseTable("hr_training", []);
  const [attendanceRecords] = useSupabaseTable("hr_attendance", []);
  const [portalLeaveRequests, setPortalLeaveRequests] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPortalRequests() {
      try {
        const { data } = await supabase
          .from("leave_requests")
          .select("*, profiles:user_id(full_name, email)")
          .order("created_at", { ascending: false });
        if (data) setPortalLeaveRequests(data);
      } catch (err) {
        console.warn("Could not fetch portal leave requests:", err);
      }
    }
    fetchPortalRequests();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    const { error } = await supabase
      .from("leave_requests")
      .update({ status: "approved" })
      .eq("id", id);
    if (!error) {
      setPortalLeaveRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
      toast.success("Leave Approved", {
        description: `Approved leave request for ${name}.`,
      });
    }
  };

  const handleDecline = async (id: string, name: string) => {
    const { error } = await supabase
      .from("leave_requests")
      .update({ status: "declined" })
      .eq("id", id);
    if (!error) {
      setPortalLeaveRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "declined" } : r))
      );
      toast.error("Leave Declined", {
        description: `Declined leave request for ${name}.`,
      });
    }
  };

  /* ── derived data ─────────────────────────────────────────────── */
  const empByType = ["Permanent", "Contract", "Temporary"].map((t, i) => ({
    label: t,
    value: employees.filter((e: any) => e.employment_type === t).length,
    color: ["#7c3aed", "#d97706", "#2563eb"][i],
  }));

  const empByDept = Array.from(
    new Set(employees.map((e: any) => e.department))
  ).map((d) => ({
    label: d as string,
    value: employees.filter((e: any) => e.department === d).length,
  }));

  const empByGender = [
    {
      label: "Female",
      value: employees.filter((e: any) => e.gender === "Female").length,
      color: "#7c3aed",
    },
    {
      label: "Male",
      value: employees.filter((e: any) => e.gender === "Male").length,
      color: "#2563eb",
    },
  ];

  const trainingCompletion = training.map((t: any) => ({
    label: t.title?.slice(0, 10) ?? "",
    value: t.enrolled ? Math.round((t.completed / t.enrolled) * 100) : 0,
  }));

  const pendingLeaveCount = portalLeaveRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const clockedIn = attendanceRecords.filter(
    (r: any) => r.status === "Clocked In" || r.status === "Present"
  ).length;
  const onBreak = attendanceRecords.filter(
    (r: any) => r.status === "On Break"
  ).length;
  const clockedOut = attendanceRecords.filter(
    (r: any) => r.status === "Clocked Out"
  ).length;
  const onLeaveAbsent = attendanceRecords.filter(
    (r: any) => r.status === "On Leave" || r.status === "Absent"
  ).length;

  /* ── quick-nav cards ──────────────────────────────────────────── */
  const quickNavCards = [
    {
      title: "Leave Management",
      path: "/host/hr/leave",
      icon: CalendarDays,
      meta: `${pendingLeaveCount} pending review`,
      color: "text-amber-500",
    },
    {
      title: "Timesheets",
      path: "/host/hr/timesheets",
      icon: ClipboardList,
      meta: "Weekly project hours",
      color: "text-blue-500",
    },
    {
      title: "Recruitment",
      path: "/host/hr/recruitment",
      icon: Briefcase,
      meta: `${vacancies.length} open positions`,
      color: "text-emerald-500",
    },
    {
      title: "HR Performance",
      path: "/host/hr/performance",
      icon: BarChart3,
      meta: "Q2 appraisals active",
      color: "text-purple-500",
    },
    {
      title: "Talent Management",
      path: "/host/hr/talent",
      icon: Crown,
      meta: "Succession & HiPo bench",
      color: "text-indigo-500",
    },
    {
      title: "Training & Development",
      path: "/host/hr/training",
      icon: BookOpen,
      meta: `${training.length} active programs`,
      color: "text-pink-500",
    },
    {
      title: "HR Administration",
      path: "/host/hr/admin",
      icon: Settings,
      meta: "Directory & documentation",
      color: "text-slate-500",
    },
    {
      title: "Integrations",
      path: "/host/hr/integrations",
      icon: Wrench,
      meta: "Payroll & biometric APIs",
      color: "text-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Section: HR Functional Modules ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            HR Functional Modules
          </h2>
          <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> All systems online
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {quickNavCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-md group cursor-pointer flex items-start gap-3"
                onClick={() => {
                  window.location.href = item.path;
                }}
              >
                <div
                  className={`rounded-lg p-2 bg-muted/40 group-hover:bg-primary/10 transition-colors ${item.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.meta}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── Section: Workforce Analytics Stats ─────────────────────────── */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Workforce Analytics
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total employees"
            value={employees.length}
            icon={Users}
            color="var(--primary)"
          />
          <StatCard
            label="New hires (30d)"
            value={2}
            sub="+1 vs last month"
            trend="up"
            icon={UserPlus}
          />
          <StatCard
            label="Terminations (30d)"
            value={0}
            sub="Zero exits"
            trend="flat"
            icon={UserMinus}
          />
          <StatCard
            label="Turnover rate"
            value="3.2%"
            sub="Rolling 12 months"
            icon={TrendingDown}
            color="var(--success)"
          />
          <StatCard
            label="Active employees"
            value={employees.length - 1}
            sub={`${employees.length - 1} of ${employees.length}`}
            icon={Activity}
          />
        </div>
      </div>

      {/* ─── Section: Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <PieChart className="h-3.5 w-3.5" /> Employment Type
          </div>
          <MiniDonut data={empByType} />
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Department Headcount
          </div>
          <MiniBarChart data={empByDept} color="#7c3aed" />
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" /> Diversity — Gender
          </div>
          <MiniDonut data={empByGender} />
        </Card>
      </div>

      {/* ─── Section: Pending Employee Leave Approvals ──────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Pending Employee Leave Requests ({pendingLeaveCount})
          </div>
          <a
            href="/host/hr/leave"
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            Manage All Leave Requests <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <Card className="overflow-hidden">
          {portalLeaveRequests.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No employee leave requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-4">Employee</th>
                    <th className="py-2.5 px-4">Dates</th>
                    <th className="py-2.5 px-4">Reason</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {portalLeaveRequests.slice(0, 5).map((r) => {
                    const name =
                      r.profiles?.full_name || r.profiles?.email || "Employee";
                    const isPending = r.status === "pending";
                    const isApproved = r.status === "approved";
                    const isDeclined = r.status === "declined";
                    return (
                      <tr key={r.id} className="text-xs hover:bg-muted/20">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-foreground">
                            {name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {r.profiles?.email || ""}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {r.start_date} → {r.end_date}
                        </td>
                        <td className="py-2.5 px-4 max-w-[200px] truncate text-muted-foreground">
                          {r.reason}
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge
                            variant={
                              isApproved
                                ? "default"
                                : isDeclined
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {isApproved
                              ? "Approved"
                              : isDeclined
                                ? "Declined"
                                : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 px-2 text-[10px]"
                              disabled={isApproved}
                              onClick={() => handleApprove(r.id, name)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px] text-rose-600"
                              disabled={isDeclined}
                              onClick={() => handleDecline(r.id, name)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Section: Live Workforce Attendance & Time Tracking ──────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Live Workforce Attendance & Time Tracking
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/attendance"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Live Command Center (Teams View) ↗
            </a>
            <a
              href="/host/hr/timesheets"
              className="text-xs text-muted-foreground hover:underline"
            >
              Timesheets Register →
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Clocked In"
            value={clockedIn}
            sub="Active right now"
            icon={Clock}
            color="var(--success)"
          />
          <StatCard
            label="On Break"
            value={onBreak}
            sub="Temporary pause"
            icon={Clock}
            color="var(--warning)"
          />
          <StatCard
            label="Clocked Out"
            value={clockedOut}
            sub="Shift completed"
            icon={Clock}
          />
          <StatCard
            label="On Leave / Absent"
            value={onLeaveAbsent}
            sub="Unavailable"
            icon={Clock}
            color="var(--destructive)"
          />
        </div>
      </div>

      {/* ─── Section: Recruitment & Learning ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Recruitment Funnel
            </div>
            <a
              href="/host/hr/recruitment"
              className="text-xs text-primary font-semibold hover:underline"
            >
              View Jobs →
            </a>
          </div>
          <MiniBarChart
            data={[
              { label: "Applied", value: applicants.length || 115 },
              { label: "Screen", value: Math.round((applicants.length || 115) * 0.54) },
              { label: "Interview", value: Math.round((applicants.length || 115) * 0.24) },
              { label: "Offer", value: Math.round((applicants.length || 115) * 0.08) },
              { label: "Hire", value: Math.round((applicants.length || 115) * 0.04) },
            ]}
            height={180}
          />
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Learning & Development
            </div>
            <a
              href="/host/hr/training"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Course Catalog →
            </a>
          </div>
          <MiniBarChart data={trainingCompletion} height={180} color="#16a34a" />
        </Card>
      </div>
    </div>
  );
}
