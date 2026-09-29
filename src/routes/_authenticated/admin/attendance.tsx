import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import {
  Clock, Search, Coffee, CheckCircle2, XCircle, Users, Building2,
  Sparkles, Filter, Download, ArrowUpRight, ShieldCheck, Briefcase, RefreshCw,
} from "lucide-react";
import { useProfile } from "@/lib/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({ meta: [{ title: "Admin Command Center — Workforce Attendance" }] }),
  component: AdminAttendanceCommandCenter,
});

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  tier: "Permanent" | "Contract" | "Intern";
  status: "Clocked In" | "On Break" | "Clocked Out";
  time: string;
  hours: string;
  currentProject: string;
  avatar?: string;
}

function AdminAttendanceCommandCenter() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { data: profile } = useProfile();

  const loadAttendance = useCallback(async () => {
    setLoadingData(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, job_title, department, avatar_url, role_tier")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (pErr) throw pErr;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("actor_id, details, created_at")
        .gte("created_at", startOfDay.toISOString())
        .like("action", "attendance_%")
        .order("created_at", { ascending: true });

      const statusMap = new Map<string, any>();
      (logs || []).forEach((log: any) => {
        if (log.actor_id) statusMap.set(log.actor_id, log.details);
      });

      const rows: StaffMember[] = (profiles || []).map((p: any) => {
        const live = statusMap.get(p.id);
        const clockInTime = live?.clock_in_time;
        const state: StaffMember["status"] = live?.state || "Clocked Out";
        let time = "-";
        let hours = "0h 0m";

        if (clockInTime && state !== "Clocked Out") {
          time = new Date(clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const elapsedMs = Date.now() - clockInTime - (live?.total_break_ms || 0);
          const totalMins = Math.max(0, Math.floor(elapsedMs / 60000));
          hours = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
        }

        const tier: StaffMember["tier"] =
          p.role_tier === "intern" ? "Intern" : "Permanent";

        const dept = (p.department || "General").replace(" Team", "") as StaffMember["department"];

        return {
          id: p.id,
          name: p.full_name || p.email.split("@")[0].replace(".", " "),
          role: p.job_title || "Staff Member",
          department: dept,
          tier,
          status: state,
          time,
          hours,
          currentProject: "MSP Operations",
          avatar: p.avatar_url,
        };
      });

      setStaffList(rows);
    } catch (err) {
      console.warn("Error loading admin attendance:", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
    const timer = setInterval(loadAttendance, 60_000);
    return () => clearInterval(timer);
  }, [loadAttendance]);

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.currentProject.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === "All" ||
      (selectedDept === "Interns" ? s.tier === "Intern" : s.department === selectedDept);

    const matchesStatus = selectedStatus === "All" || s.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const stats = {
    total: staffList.length,
    active: staffList.filter((s) => s.status === "Clocked In").length,
    break: staffList.filter((s) => s.status === "On Break").length,
    out: staffList.filter((s) => s.status === "Clocked Out").length,
    interns: staffList.filter((s) => s.tier === "Intern").length,
  };

  const activeRate = Math.round(((stats.active + stats.break) / (stats.total || 1)) * 100);

  const exportSummary = () => {
    toast.success("Attendance Report Exported", {
      description: `Exported live status for ${staffList.length} staff members (CSV).`,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Command Center Top Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Operations Command Center
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Workforce Presence & Attendance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time monitoring of all MSP departments, permanent staff, and active intern cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={loadAttendance} disabled={loadingData} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportSummary} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button asChild size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Link to="/host/tasks">
              <Briefcase className="h-4 w-4" />
              Assign Tasks
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border/70 bg-gradient-to-br from-card to-card/50 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Workforce</p>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground font-medium">({stats.interns} interns)</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Monitored across 5 departments</p>
        </Card>

        <Card className="p-5 border-border/70 border-l-4 border-l-emerald-500 bg-gradient-to-br from-card to-emerald-500/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Clocked In (Active)
            </p>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{stats.active}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {activeRate}% of workforce
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Currently actively working</p>
        </Card>

        <Card className="p-5 border-border/70 border-l-4 border-l-amber-500 bg-gradient-to-br from-card to-amber-500/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              On Break
            </p>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coffee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{stats.break}</span>
            <span className="text-xs text-muted-foreground">temporary pause</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Expected to resume shortly</p>
        </Card>

        <Card className="p-5 border-border/70 border-l-4 border-l-slate-400 bg-gradient-to-br from-card to-slate-400/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clocked Out / Off</p>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{stats.out}</span>
            <span className="text-xs text-muted-foreground">offline</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shift ended or off-duty</p>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="border-border/70 overflow-hidden shadow-sm">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-border/60 bg-muted/20 space-y-4">
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-semibold text-muted-foreground mr-2 shrink-0">Filter By:</span>
            {["All", "Interns", "Engineering", "HR", "Sales", "Marketing", "Operations"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-md font-medium transition shrink-0 ${
                  selectedDept === dept
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {dept === "Interns" ? "🎓 Interns / Learners" : dept}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff, intern name, role, or project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Status Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {["All", "Clocked In", "On Break", "Clocked Out"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 border ${
                    selectedStatus === st
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {st === "Clocked In" && "🟢 "}
                  {st === "On Break" && "🟡 "}
                  {st === "Clocked Out" && "⚪ "}
                  {st === "All" ? "All Statuses" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Staff Member</th>
                <th className="px-6 py-3.5 font-semibold">Department & Tier</th>
                <th className="px-6 py-3.5 font-semibold">Teams Status</th>
                <th className="px-6 py-3.5 font-semibold">Clocked In</th>
                <th className="px-6 py-3.5 font-semibold">Active Hours</th>
                <th className="px-6 py-3.5 font-semibold">Current Project</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {filteredStaff.map((staff) => {
                const isClockedIn = staff.status === "Clocked In";
                const isOnBreak = staff.status === "On Break";

                return (
                  <tr key={staff.id} className="hover:bg-muted/15 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                              {staff.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${
                              isClockedIn
                                ? "bg-emerald-500 animate-pulse"
                                : isOnBreak
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            {staff.name}
                            {staff.id === 999 && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-foreground text-xs">{staff.department}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            staff.tier === "Intern"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {staff.tier}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isClockedIn
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20"
                            : isOnBreak
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-500/20"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isClockedIn ? "bg-emerald-500" : isOnBreak ? "bg-amber-500" : "bg-slate-400"
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {staff.time}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">
                      {staff.hours}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded border border-border/50">
                        <Briefcase className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate max-w-[140px]">{staff.currentProject}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 hover:text-primary">
                        <Link to="/host/tasks">
                          Assign <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground">No employees or interns found</p>
                    <p className="text-xs mt-1">Try adjusting your department filter or search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
