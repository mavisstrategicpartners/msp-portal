import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { hrApi } from "@/components/hr/MyHrDocuments";
import { EmptyState, Page, PageHeader, Section, StatCard, StatGrid, greetName } from "@/components/layout/page";
import {
  Users,
  Clock,
  FileCheck,
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
import { toast } from "@/lib/notify";

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
  docOutstanding: number;
  docOverdue: number;
  docToReview: number;
  docCompleted: number;
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
    docOutstanding: 0,
    docOverdue: 0,
    docToReview: 0,
    docCompleted: 0,
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

      // 5. HR document requests (pending, completed, overdue)
      let docOutstanding = 0, docOverdue = 0, docToReview = 0, docCompleted = 0;
      try {
        const { data: reqs } = await (supabase as any).from("hr_document_requests").select("status, due_date");
        const today = new Date().toISOString().slice(0, 10);
        for (const r of reqs || []) {
          if (r.status === "Outstanding" || r.status === "Returned") {
            docOutstanding++;
            if (r.due_date && r.due_date < today) docOverdue++;
          } else if (r.status === "Submitted" || r.status === "Signed") docToReview++;
          else if (r.status === "Accepted") docCompleted++;
        }
      } catch {
        /* counts stay at zero */
      }

      setTelemetry({
        docOutstanding,
        docOverdue,
        docToReview,
        docCompleted,
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
      // Through the HR API so the decision is audited and the employee is notified.
      await hrApi(`/api/staff/hr/leave/${id}`, { method: "PATCH", body: JSON.stringify({ action: "approve" }) });

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
      title: "Employee Folders",
      desc: "Each employee's HR folder: details, contracts, IDs, certificates, leave and history.",
      icon: Folder,
      badge: "Confidential",
      badgeColor: "bg-muted text-muted-foreground",
    },
    {
      to: "/hr/document-requests",
      title: "Document Requests",
      desc: `${telemetry.docToReview} to review · ${telemetry.docCompleted} completed · ${telemetry.docOverdue} overdue`,
      icon: ClipboardList,
      badge: `${telemetry.docOutstanding} outstanding`,
      badgeColor: telemetry.docOverdue > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : telemetry.docOutstanding > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-muted text-muted-foreground",
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

  const leaveHint = telemetry.pendingLeaveCount === 1 ? "1 application" : `${telemetry.pendingLeaveCount} applications`;
  return (
    <Page>
      <PageHeader
        eyebrow="HR workspace"
        title={`${greetingText}, ${greetName(userName)}`}
        description="Workforce presence, leave, document requests and employee records."
        actions={
          <Button variant="outline" size="sm" onClick={loadHRData} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      <StaffAttendanceWidget />

      <StatGrid cols={6}>
        <StatCard label="Employees" value={telemetry.totalEmployees} icon={Users} hint="Active accounts" />
        <StatCard label="Clocked in now" value={telemetry.clockedInCount} icon={Clock} tone={telemetry.clockedInCount ? "success" : "default"} hint="Present on duty" />
        <StatCard label="On break" value={telemetry.onBreakCount} icon={Coffee} hint="Currently on a break" />
        <StatCard label="Leave awaiting HR" value={telemetry.pendingLeaveCount} icon={CalendarDays} tone={telemetry.pendingLeaveCount ? "warning" : "default"} hint={telemetry.pendingLeaveCount ? leaveHint : "Nothing waiting"} onClick={() => navigate({ to: "/hr/leave" })} />
        <StatCard label="Documents to review" value={telemetry.docToReview} icon={FileCheck} tone={telemetry.docToReview ? "warning" : "default"} hint={`${telemetry.docOutstanding} outstanding · ${telemetry.docOverdue} overdue`} onClick={() => navigate({ to: "/hr/document-requests" })} />
        <StatCard label="Timesheets to review" value={telemetry.timesheetReviewCount} icon={ClipboardList} hint="Submitted for approval" onClick={() => navigate({ to: "/hr/timesheets" })} />
      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        <Section
          className="xl:col-span-2"
          title="Leave awaiting approval"
          description="Approve here, or open Leave Management to decline or ask for more information."
          actions={
            <Link to="/hr/leave" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Leave Management <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {telemetry.pendingLeaveRequests.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={CheckCircle2} title="No leave waiting for HR" description="New applications appear here as soon as employees submit them." />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {telemetry.pendingLeaveRequests.slice(0, 6).map((req) => {
                const staffName = req.profiles?.full_name || "Employee";
                return (
                  <li key={req.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {staffName} <span className="font-normal text-muted-foreground">· {req.leave_type || "Leave"}</span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {req.start_date} to {req.end_date}
                        {req.reason ? ` · ${req.reason}` : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate({ to: "/hr/leave" })}>
                      Review
                    </Button>
                    <Button size="sm" onClick={() => handleApproveLeave(req.id, staffName)}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Document requests" actions={<Link to="/hr/document-requests" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">Open <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Outstanding", telemetry.docOutstanding, ""],
              ["Overdue", telemetry.docOverdue, telemetry.docOverdue ? "text-rose-600 dark:text-rose-400" : ""],
              ["To review", telemetry.docToReview, telemetry.docToReview ? "text-amber-600 dark:text-amber-400" : ""],
              ["Completed", telemetry.docCompleted, ""],
            ].map(([label, n, cls]) => (
              <div key={label as string}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className={`text-xl font-semibold tabular-nums ${cls}`}>{n as number}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">HR modules</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {hrModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to as any} className="group">
                <Card className="flex h-full items-start gap-3 p-4 transition-colors hover:border-primary/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </Page>
  );
}
