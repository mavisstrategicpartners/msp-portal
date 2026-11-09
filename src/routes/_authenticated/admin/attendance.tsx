import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  Search,
  Coffee,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  Filter,
  Download,
  ShieldCheck,
  Briefcase,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileDown,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useProfile } from "@/lib/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getAttendanceBoard,
  getAttendanceRegister,
  formatElapsed,
  computeNetWorkedMs,
  computeTotalBreakMs,
  StaffPresenceMember,
} from "@/lib/attendance-client";
import {
  exportLivePresencePdf,
  exportAttendanceRegisterPdf,
  AttendanceRegisterData,
} from "@/lib/pdf-export";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({
    meta: [
      {
        title:
          "Admin Command Center — Workforce Presence & Attendance Register",
      },
    ],
  }),
  component: AdminAttendanceCommandCenter,
});

export function AdminAttendanceCommandCenter() {
  const [activeTab, setActiveTab] = useState<"live" | "register">("live");

  // Live Presence state
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [rawStaff, setRawStaff] = useState<StaffPresenceMember[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [now, setNow] = useState<number>(Date.now());
  const { data: profile } = useProfile();

  // Attendance Register state
  const [registerWeekStart, setRegisterWeekStart] = useState<string>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff);
    return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
  });
  const [registerData, setRegisterData] = useState<AttendanceRegisterData | null>(null);
  const [loadingRegister, setLoadingRegister] = useState(false);

  // 1. Load Live Presence
  const loadAttendance = useCallback(async () => {
    try {
      const { staff } = await getAttendanceBoard();
      setRawStaff(staff);
    } catch (err) {
      console.warn("Error loading admin attendance:", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoadingLive(false);
    }
  }, []);

  // 2. Load Attendance Register (Mon - Fri)
  const loadRegister = useCallback(async (mondayDateStr: string) => {
    setLoadingRegister(true);
    try {
      const data = await getAttendanceRegister(mondayDateStr);
      if (data) {
        setRegisterData(data);
      }
    } catch (err) {
      console.warn("Error loading attendance register:", err);
      toast.error("Failed to load weekly attendance register");
    } finally {
      setLoadingRegister(false);
    }
  }, []);

  // Set up listeners and timers
  useEffect(() => {
    loadAttendance();
    loadRegister(registerWeekStart);

    // Realtime channel
    const channel = supabase
      .channel("attendance-realtime")
      .on("broadcast", { event: "attendance_update" }, () => {
        loadAttendance();
        if (activeTab === "register") {
          loadRegister(registerWeekStart);
        }
      })
      .subscribe();

    // 10-second polling
    const pollTimer = setInterval(() => {
      loadAttendance();
    }, 10_000);

    // 1-second ticker for continuous time calculation
    const tickTimer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollTimer);
      clearInterval(tickTimer);
    };
  }, [loadAttendance, loadRegister, registerWeekStart, activeTab]);

  // Recalculate live worked time and break duration every second for active staff
  const staffList = useMemo(() => {
    return rawStaff.map((s) => {
      if ((s.status === "Clocked In" || s.status === "On Break") && s.clockInTime) {
        const netMs = computeNetWorkedMs(
          s.clockInTime,
          s.status,
          s.totalBreakMs || 0,
          s.breakStartTime,
          now
        );
        const breakMs = computeTotalBreakMs(
          s.totalBreakMs || 0,
          s.status,
          s.breakStartTime,
          now
        );
        return {
          ...s,
          hours: formatElapsed(netMs),
          breakDuration: breakMs > 0 ? formatElapsed(breakMs) : "0m",
        };
      }
      return {
        ...s,
        hours: s.hours || "0h 0m",
        breakDuration: s.breakDuration || "—",
      };
    });
  }, [rawStaff, now]);

  // Filter Live Presence
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        s.currentProject.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        selectedDept === "All" ||
        (selectedDept === "Interns"
          ? s.tier === "Intern"
          : s.department === selectedDept);

      const matchesStatus =
        selectedStatus === "All" || s.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, search, selectedDept, selectedStatus]);

  // Filter Register
  const filteredRegisterRows = useMemo(() => {
    if (!registerData) return [];
    if (!search.trim() && selectedDept === "All") return registerData.rows;
    const q = search.toLowerCase();
    return registerData.rows.filter((r) => {
      const matchQ =
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      const matchD =
        selectedDept === "All" ||
        (selectedDept === "Interns"
          ? r.tier === "Intern"
          : r.department === selectedDept);
      return matchQ && matchD;
    });
  }, [registerData, search, selectedDept]);

  const stats = useMemo(() => {
    return {
      total: staffList.length,
      active: staffList.filter((s) => s.status === "Clocked In").length,
      break: staffList.filter((s) => s.status === "On Break").length,
      out: staffList.filter((s) => s.status === "Clocked Out").length,
      interns: staffList.filter((s) => s.tier === "Intern").length,
    };
  }, [staffList]);

  const activeRate = Math.round(
    ((stats.active + stats.break) / (stats.total || 1)) * 100
  );

  // PDF & CSV Exports
  const handleExportLivePdf = () => {
    exportLivePresencePdf(staffList as any, {
      generatedBy: profile?.profile?.full_name || "MSP Administrator",
    });
    toast.success("Live Presence PDF Downloaded");
  };

  const handleExportRegisterPdf = () => {
    if (!registerData) return;
    exportAttendanceRegisterPdf(registerData);
    toast.success("Official Attendance Register PDF Downloaded");
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Name", "Department", "Role", "Tier", "Status", "Clock In", "Break Duration", "Hours Worked"],
        ...staffList.map((s) => [
          s.name,
          s.department,
          s.role,
          s.tier,
          s.status,
          s.time,
          s.breakDuration || "—",
          s.hours,
        ]),
      ]
        .map((e) => e.map((val) => `"${val}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MSP_Live_Presence_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export downloaded");
  };

  // Week navigation for register
  const handlePrevWeek = () => {
    const d = new Date(registerWeekStart + "T00:00:00");
    d.setDate(d.getDate() - 7);
    const newMon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setRegisterWeekStart(newMon);
    loadRegister(newMon);
  };

  const handleNextWeek = () => {
    const d = new Date(registerWeekStart + "T00:00:00");
    d.setDate(d.getDate() + 7);
    const newMon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setRegisterWeekStart(newMon);
    loadRegister(newMon);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff);
    const curMon = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
    setRegisterWeekStart(curMon);
    loadRegister(curMon);
  };

  const departments = [
    "All",
    "Operations",
    "Sales",
    "Client Relationship",
    "Social Media",
    "Graphics",
    "Admin",
    "Human Resources",
    "Interns",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              MSP Operations Command Center
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Workforce Presence & Attendance Register
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Official working hours: <strong>Monday to Friday, 08:00 – 17:00 (SAST)</strong>. Monitor live status, verified HR leave, and export official records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "live" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5 text-xs h-9"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={handleExportLivePdf}
                className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleExportRegisterPdf}
              disabled={!registerData || loadingRegister}
              className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <FileDown className="h-4 w-4" />
              Download Register (PDF)
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadAttendance();
              loadRegister(registerWeekStart);
            }}
            disabled={loadingLive || loadingRegister}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingLive || loadingRegister ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "live"
              ? "border-primary text-primary bg-primary/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          }`}
        >
          <Clock className="h-4 w-4" />
          Live Presence Board
          <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {stats.active} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "register"
              ? "border-primary text-primary bg-primary/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Weekly Attendance Register (Mon – Fri, 08:00 – 17:00)
        </button>
      </div>

      {/* ================= TAB 1: LIVE PRESENCE BOARD ================= */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Workforce
                </p>
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.total}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({stats.interns} interns)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                All permanent staff & interns
              </p>
            </Card>

            <Card className="p-4 border-border/70 border-l-4 border-l-emerald-500 bg-emerald-500/[0.03] shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Clocked In (Working)
                </p>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.active}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeRate}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Continuous real-time calculation
              </p>
            </Card>

            <Card className="p-4 border-border/70 border-l-4 border-l-amber-500 bg-amber-500/[0.03] shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  On Break
                </p>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Coffee className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.break}
                </span>
                <span className="text-xs text-muted-foreground">paused</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Timer temporarily paused
              </p>
            </Card>

            <Card className="p-4 border-border/70 border-l-4 border-l-slate-400 bg-slate-400/[0.03] shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Clocked Out / Off
                </p>
                <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.out}
                </span>
                <span className="text-xs text-muted-foreground">inactive</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Off-duty or yet to clock in
              </p>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/70">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff, role, department..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Department selector */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>

              {/* Status selector */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Clocked In">Clocked In Only</option>
                <option value="On Break">On Break Only</option>
                <option value="Clocked Out">Clocked Out Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <Card className="p-0 border-border/70 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Staff Member</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Contract Tier</th>
                    <th className="py-3 px-4 font-semibold">Live Presence</th>
                    <th className="py-3 px-4 font-semibold">Clocked In At</th>
                    <th className="py-3 px-4 font-semibold text-center">Break Duration</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingLive && staffList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        Loading real-time workforce presence…
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        No team members match your selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr
                        key={staff.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 text-xs">
                              {staff.avatar && <AvatarImage src={staff.avatar} />}
                              <AvatarFallback className="text-[11px] font-semibold uppercase bg-primary/10 text-primary">
                                {staff.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground text-sm">
                                {staff.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {staff.role}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border/80">
                            {staff.department}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                              staff.tier === "Intern"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-300/40"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {staff.tier}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider ${
                              staff.status === "Clocked In"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/30"
                                : staff.status === "On Break"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/30"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                staff.status === "Clocked In"
                                  ? "bg-emerald-500 animate-pulse"
                                  : staff.status === "On Break"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {staff.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {staff.time}
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              staff.status === "On Break"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 font-bold"
                                : staff.breakDuration && staff.breakDuration !== "—" && staff.breakDuration !== "0m"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Coffee className="h-3 w-3" />
                            {staff.breakDuration || "—"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono text-sm font-bold ${
                              staff.status === "Clocked In"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }`}
                          >
                            {staff.hours}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: WEEKLY ATTENDANCE REGISTER ================= */}
      {activeTab === "register" && (
        <div className="space-y-6">
          {/* Working Schedule Banner */}
          <Card className="p-4 border-primary/20 bg-primary/[0.03] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Official Shift: Monday to Friday | 08:00 – 17:00 (SAST)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard 9-hour working shift (including lunch). Green marks attendance between 08:00 and 17:00. Approved HR leave is automatically certified.
                </p>
              </div>
            </div>

            {/* Week navigation buttons */}
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevWeek}
                className="h-8 px-2 text-xs"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 py-1 font-semibold text-xs rounded-md bg-secondary border border-border">
                {registerData?.weekLabel || "Current Week"}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="h-8 px-2 text-xs"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCurrentWeek}
                className="h-8 text-xs text-primary"
              >
                This Week
              </Button>
            </div>
          </Card>

          {/* Register Statistics Cards */}
          {registerData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4 border-border/70 shadow-sm">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Workforce Tracked
                </p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {registerData.stats.totalStaff} Members
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Permanent & intern rosters
                </p>
              </Card>

              <Card className="p-4 border-border/70 border-l-4 border-l-emerald-500 bg-emerald-500/[0.03]">
                <p className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                  Attendance & Leave Rate
                </p>
                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {registerData.stats.avgAttendanceRate}%
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Present or official HR leave
                </p>
              </Card>

              <Card className="p-4 border-border/70 border-l-4 border-l-primary">
                <p className="text-[11px] font-semibold uppercase text-primary">
                  Total Logged Hours
                </p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {registerData.stats.totalHoursLogged}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Across 08:00 – 17:00 shifts
                </p>
              </Card>

              <Card className="p-4 border-border/70 border-l-4 border-l-amber-500 bg-amber-500/[0.03]">
                <p className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                  Approved HR Leave
                </p>
                <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {registerData.stats.totalLeaveDays} Days
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Verified HR requests
                </p>
              </Card>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/70">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff, role, department..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={handleExportRegisterPdf}
                disabled={!registerData || loadingRegister}
                className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Register Grid Table */}
          <Card className="p-0 border-border/70 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-3 font-semibold w-48">Employee / Role</th>
                    <th className="py-3 px-3 font-semibold w-28">Department</th>
                    <th className="py-3 px-3 font-semibold text-center w-36">
                      Mon ({registerData?.rows[0]?.days[0]?.formattedDate || "Mon"})
                      <div className="text-[10px] font-normal text-muted-foreground">08:00 – 17:00</div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center w-36">
                      Tue ({registerData?.rows[0]?.days[1]?.formattedDate || "Tue"})
                      <div className="text-[10px] font-normal text-muted-foreground">08:00 – 17:00</div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center w-36">
                      Wed ({registerData?.rows[0]?.days[2]?.formattedDate || "Wed"})
                      <div className="text-[10px] font-normal text-muted-foreground">08:00 – 17:00</div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center w-36">
                      Thu ({registerData?.rows[0]?.days[3]?.formattedDate || "Thu"})
                      <div className="text-[10px] font-normal text-muted-foreground">08:00 – 17:00</div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center w-36">
                      Fri ({registerData?.rows[0]?.days[4]?.formattedDate || "Fri"})
                      <div className="text-[10px] font-normal text-muted-foreground">08:00 – 17:00</div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-right w-28">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingRegister ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        Generating official Monday to Friday attendance register…
                      </td>
                    </tr>
                  ) : filteredRegisterRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No attendance records for the selected period.
                      </td>
                    </tr>
                  ) : (
                    filteredRegisterRows.map((row) => (
                      <tr key={row.userId} className="hover:bg-muted/20 transition-colors">
                        {/* Employee info */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground text-sm">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.role}
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-[10px] font-medium border border-border">
                            {row.department}
                          </span>
                        </td>

                        {/* Mon - Fri Days */}
                        {row.days.map((day) => (
                          <td key={day.dateStr} className="py-2.5 px-2 text-center">
                            {day.status === "Present" && (
                              <div className="rounded-md border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/40 p-1.5 text-[11px]">
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                                  ✓ Present
                                </span>
                                <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 block font-mono">
                                  {day.clockInTime} – {day.clockOutTime}
                                </span>
                                <span className="text-[10px] text-muted-foreground block font-medium">
                                  ({day.hoursWorked})
                                </span>
                              </div>
                            )}

                            {day.status === "Approved Leave" && (
                              <div className="rounded-md border border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40 p-1.5 text-[11px]">
                                <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                                  Approved Leave
                                </span>
                                <span className="text-[10px] text-amber-800/80 dark:text-amber-400/80 block">
                                  HR Approved
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate max-w-[120px] mx-auto" title={day.leaveReason}>
                                  {day.leaveReason || "Leave"}
                                </span>
                              </div>
                            )}

                            {day.status === "Did Not Clock In" && (
                              <div className="rounded-md border border-rose-300/40 bg-rose-50/60 dark:bg-rose-950/30 p-1.5 text-[11px]">
                                <span className="font-semibold text-rose-700 dark:text-rose-400 block">
                                  Did Not Clock In
                                </span>
                                <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block">
                                  (Absent)
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  0h 0m
                                </span>
                              </div>
                            )}

                            {day.status === "Upcoming" && (
                              <div className="rounded-md border border-border/50 bg-muted/20 p-2 text-[11px] text-muted-foreground">
                                <span>Upcoming</span>
                              </div>
                            )}
                          </td>
                        ))}

                        {/* Total Hours */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-mono text-sm font-bold text-foreground">
                            {row.totalHoursWorked}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {row.daysPresent}/5 Days
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {row.complianceRate}% Rate
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with sign-off reminder */}
            <div className="bg-muted/30 px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Standard working hours: 08:00 – 17:00 (SAST) | Export contains official sign-off certificates.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportRegisterPdf}
                disabled={!registerData || loadingRegister}
                className="gap-1.5 text-xs h-8 self-start sm:self-auto"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download Register PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
