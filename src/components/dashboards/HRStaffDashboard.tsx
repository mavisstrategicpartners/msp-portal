import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Users,
  Clock,
  CalendarDays,
  ClipboardList,
  Calculator,
  Folder,
  Briefcase,
  BarChart3,
  Sparkles,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Workflow,
  Cog,
  BookOpen,
  Wrench,
  Compass,
  CheckCircle2,
  XCircle,
  Coffee,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";
import { useProfile } from "@/lib/use-profile";
import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CORE_RULES = [
  { icon: TrendingUp, label: "Leads over Followers", desc: "We chase revenue, not vanity metrics." },
  { icon: Workflow, label: "Systems over Campaigns", desc: "A campaign ends. A system compounds." },
  { icon: Cog, label: "Automation over Manual Work", desc: "If it can be automated, it must be." },
  { icon: BarChart3, label: "Data over Opinions", desc: "Numbers decide. Opinions guide." },
];

const TIPS = [
  "Use Live Staff Presence to monitor real-time clock-ins and active breaks across all departments.",
  "Check Leave Management daily to ensure prompt approvals and avoid project scheduling bottlenecks.",
  "Timesheets should be reconciled weekly before the payroll calculation cycle runs.",
  "Press ⌘K (or Ctrl+K) anywhere to search the whole portal.",
  "Verify employee documentation compliance during monthly review cycles.",
];

function getGreeting() {
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

interface HRTelemetry {
  totalEmployees: number;
  clockedInCount: number;
  onBreakCount: number;
  pendingLeaveCount: number;
  timesheetReviewCount: number;
  pendingLeaveRequests: any[];
}

export function HRStaffDashboard() {
  const { data: profileData } = useProfile();
  const navigate = useNavigate();
  const greetingText = getGreeting();
  const userName = profileData?.profile?.full_name?.trim() || "MSP Human Resources";
  const userRole = profileData?.profile?.job_title || "HR Manager";
  const department = profileData?.profile?.department || "Human Resources";
  const tip = TIPS[new Date().getDate() % TIPS.length];

  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<HRTelemetry>({
    totalEmployees: 0,
    clockedInCount: 0,
    onBreakCount: 0,
    pendingLeaveCount: 0,
    timesheetReviewCount: 0,
    pendingLeaveRequests: [],
  });

  const loadHRData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Total Active Employees from profiles table
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, is_active, department")
        .eq("is_active", true);

      const totalEmployees = profiles?.length ?? 0;

      // 2. Real-time Attendance (Clocked in & On Break today)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: attendanceLogs } = await supabase
        .from("audit_logs")
        .select("actor_id, details, created_at")
        .gte("created_at", startOfDay.toISOString())
        .like("action", "attendance_%")
        .order("created_at", { ascending: true });

      const latestStatusMap = new Map<string, any>();
      (attendanceLogs || []).forEach((log: any) => {
        if (log.actor_id) {
          latestStatusMap.set(log.actor_id, log.details);
        }
      });

      let clockedInCount = 0;
      let onBreakCount = 0;
      latestStatusMap.forEach((status) => {
        if (status?.state === "Clocked In") clockedInCount++;
        if (status?.state === "On Break") onBreakCount++;
      });

      // 3. Pending Leave Requests from leave_requests
      const { data: leaveData } = await supabase
        .from("leave_requests")
        .select("id, user_id, leave_type, start_date, end_date, reason, status, created_at, profiles:user_id(full_name, department)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const pendingLeaveRequests = leaveData || [];
      const pendingLeaveCount = pendingLeaveRequests.length;

      // 4. Timesheet review requirement count from hr_timesheets (or total pending register review)
      let timesheetReviewCount = 0;
      try {
        const { data: tsData } = await (supabase as any)
          .from("hr_timesheets")
          .select("id, status")
          .eq("status", "Pending");
        timesheetReviewCount = tsData?.length ?? 0;
      } catch {
        timesheetReviewCount = 0;
      }

      setTelemetry({
        totalEmployees,
        clockedInCount,
        onBreakCount,
        pendingLeaveCount,
        timesheetReviewCount,
        pendingLeaveRequests,
      });
    } catch (err) {
      console.warn("[HRStaffDashboard] Error querying live HR telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHRData();

    // Subscribe to attendance and leave real-time updates
    const channel = supabase
      .channel("hr-dashboard-telemetry")
      .on("broadcast", { event: "attendance_update" }, () => loadHRData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadHRData]);

  // Handle Quick Approve of Leave Request
  const handleApproveLeave = async (id: string, staffName: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Leave Approved", {
        description: `Approved leave request for ${staffName}.`,
      });

      setTelemetry((prev) => ({
        ...prev,
        pendingLeaveCount: Math.max(0, prev.pendingLeaveCount - 1),
        pendingLeaveRequests: prev.pendingLeaveRequests.filter((r) => r.id !== id),
      }));
    } catch (e: any) {
      toast.error("Failed to approve leave", { description: e?.message });
    }
  };

  // Handle Quick Decline of Leave Request
  const handleDeclineLeave = async (id: string, staffName: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({ status: "declined" })
        .eq("id", id);

      if (error) throw error;

      toast.error("Leave Declined", {
        description: `Declined leave request for ${staffName}.`,
      });

      setTelemetry((prev) => ({
        ...prev,
        pendingLeaveCount: Math.max(0, prev.pendingLeaveCount - 1),
        pendingLeaveRequests: prev.pendingLeaveRequests.filter((r) => r.id !== id),
      }));
    } catch (e: any) {
      toast.error("Failed to decline leave", { description: e?.message });
    }
  };

  const hrModules = [
    {
      to: "/hr/attendance",
      title: "Live Staff Presence",
      desc: "Monitor live workforce presence, clock-ins, breaks & hours.",
      icon: Clock,
      badge: `${telemetry.clockedInCount} active`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      to: "/hr/leave",
      title: "Leave Management",
      desc: "Review, approve, and track annual, sick, and family leave.",
      icon: CalendarDays,
      badge: `${telemetry.pendingLeaveCount} pending`,
      badgeColor: telemetry.pendingLeaveCount > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-muted text-muted-foreground",
    },
    {
      to: "/hr/timesheets",
      title: "Timesheets",
      desc: "Weekly attendance registers, project hour tracking, and approvals.",
      icon: ClipboardList,
      badge: "Weekly Review",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      to: "/hr/payroll",
      title: "Payroll Platform",
      desc: "Salary disbursements, tax withholdings, and PAYE records.",
      icon: Calculator,
      badge: "Active",
      badgeColor: "bg-muted text-muted-foreground",
    },
    {
      to: "/hr/documents",
      title: "Employee Documents",
      desc: "Contracts, IDs, compliance declarations, and certifications.",
      icon: Folder,
      badge: "Secure Vault",
      badgeColor: "bg-muted text-muted-foreground",
    },
    {
      to: "/hr/relations",
      title: "Employee Relations",
      desc: "Grievance tracking, disciplinary logs, and workplace policies.",
      icon: Users,
      badge: "Confidential",
      badgeColor: "bg-muted text-muted-foreground",
    },
    {
      to: "/hr/recruitment",
      title: "Employee Recruitment",
      desc: "Manage vacancies, applicant pipelines, and interview stages.",
      icon: Briefcase,
      badge: "Hiring Pipeline",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      to: "/hr/performance",
      title: "HR Performance",
      desc: "Appraisals, talent review, and departmental KPI scorecards.",
      icon: BarChart3,
      badge: "Quarterly Goals",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ─── 1. Standard Employee Header & Profile Info ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              HR & People Operations Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {greetingText}, <span className="brand-text">{userName}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
            Welcome to the Mavis Strategic Partners portal — your single source of truth for how we
            work, workforce oversight, and employee management.
          </p>
        </div>

        {/* Profile Card / Role Badge */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-xs shrink-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{userRole}</span>
              <Badge variant="outline" className="text-[10px] bg-secondary/50 font-semibold border-border">
                {department}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Africa/Johannesburg (08:00–17:00 SAST)
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. Reference Staff Layout: Tip of Day + Clock In / Clock Out ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="flex flex-col justify-center h-full gap-3 border-primary/20 bg-primary/[0.04] p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-primary/20 bg-primary/10 p-2">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">HR Operational Tip</p>
            </div>
            <p className="mt-0.5 flex items-start gap-1.5 text-sm text-foreground leading-relaxed">
              <Lightbulb className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              {tip}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Authorized Role: Human Resources
              </span>
              <span>&bull;</span>
              <span>Company Operations & Performance Dashboard</span>
            </div>
          </Card>
        </div>

        {/* Staff Attendance Widget for HR (Real Clock In, Break, Clock Out, Net Hours) */}
        <div className="md:col-span-1">
          <StaffAttendanceWidget />
        </div>
      </div>

      {/* ─── 3. Genuine HR Management Telemetry ────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Workforce Telemetry & Real-Time Stats
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live figures derived directly from company records.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHRData}
            disabled={loading}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-4 border-border/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Employees
              </span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {telemetry.totalEmployees}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active company staff</p>
          </Card>

          <Card className="p-4 border-border/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Clocked In Today
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {telemetry.clockedInCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Present on duty</p>
          </Card>

          <Card className="p-4 border-border/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Staff On Break
              </span>
              <Coffee className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {telemetry.onBreakCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Temporary rest intervals</p>
          </Card>

          <Card className="p-4 border-border/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Leave
              </span>
              <CalendarDays className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {telemetry.pendingLeaveCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting approval</p>
          </Card>

          <Card className="p-4 border-border/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timesheets
              </span>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {telemetry.timesheetReviewCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Submitted logs for review</p>
          </Card>
        </div>
      </section>

      {/* ─── 4. Outstanding Actions / Pending Leave Requests Review ────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Outstanding Actions & Approvals
            </h2>
            {telemetry.pendingLeaveCount > 0 && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold">
                {telemetry.pendingLeaveCount} Action Required
              </Badge>
            )}
          </div>
          <Link to="/hr/leave" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            Full Leave Queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {telemetry.pendingLeaveRequests.length === 0 ? (
          <Card className="p-6 border-dashed border-border/80 flex items-center justify-center text-center">
            <div className="space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-foreground">All Leave & Workforce Requests Up to Date</p>
              <p className="text-xs text-muted-foreground">
                No leave requests currently require HR review. New employee submissions will appear here automatically.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {telemetry.pendingLeaveRequests.slice(0, 4).map((req) => {
              const staffName = req.profiles?.full_name || "Employee";
              const staffDept = req.profiles?.department || "Operations";
              return (
                <Card key={req.id} className="p-4 border-border/80 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{staffName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {req.leave_type || "Annual"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {staffDept} &bull; {req.start_date} to {req.end_date}
                      </p>
                      {req.reason && (
                        <p className="text-xs text-muted-foreground/90 italic mt-1 bg-muted/40 p-1.5 rounded">
                          "{req.reason}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineLeave(req.id, staffName)}
                      className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-border"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveLeave(req.id, staffName)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 5. Functional HR Modules Navigation ───────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          HR Management Modules & Directory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hrModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to as any} className="group">
                <Card className="flex flex-col justify-between h-full p-5 border-border/70 transition-all hover:border-primary/50 hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="rounded-lg p-2 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-semibold ${item.badgeColor}`}>
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                    Open Module <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 6. The Four Core Rules (Identical to reference staff layout) ───── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          The Four Core Rules
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CORE_RULES.map((r) => (
            <Card key={r.label} className="group border-border/70 p-5 transition-colors hover:border-primary/40">
              <r.icon className="relative h-6 w-6 text-primary" />
              <p className="relative mt-4 text-sm font-semibold">{r.label}</p>
              <p className="relative mt-1 text-xs text-muted-foreground">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 7. Common Staff Navigation Quicklinks (SOPs, Tools, Services) ──── */}
      <section className="pt-6 border-t border-border">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Jump Back In
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/sops" className="group">
            <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40">
              <div>
                <BookOpen className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">SOP Library</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Standard operating procedures for all departments.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
          <Link to="/services" className="group">
            <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40">
              <div>
                <Briefcase className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">Our Services</p>
                <p className="mt-0.5 text-xs text-muted-foreground">The 7 strategic service offerings we sell.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
          <Link to="/tools" className="group">
            <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40">
              <div>
                <Wrench className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">Tools & Systems</p>
                <p className="mt-0.5 text-xs text-muted-foreground">GHL, Meta, Zoho, Slack and internal platforms.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
          <Link to="/who-we-are" className="group">
            <Card className="flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40">
              <div>
                <Compass className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">Who We Are</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Our team structure, mission, and company values.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
