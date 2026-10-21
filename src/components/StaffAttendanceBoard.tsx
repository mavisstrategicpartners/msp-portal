import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Coffee, CheckCircle2, XCircle, Search, RefreshCw, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  getAttendanceBoard,
  StaffPresenceMember,
  formatElapsed,
  computeNetWorkedMs,
  computeTotalBreakMs,
} from "@/lib/attendance-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StaffAttendanceBoard({
  title = "Live Workforce Presence",
  description = "Real-time monitoring of team presence, check-ins, and active hours across all departments.",
}: {
  title?: string;
  description?: string;
}) {
  const [search, setSearch] = useState("");
  const [allStaff, setAllStaff] = useState<StaffPresenceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [now, setNow] = useState<number>(Date.now());

  const loadData = useCallback(async () => {
    try {
      const { staff } = await getAttendanceBoard();
      setAllStaff(staff);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("[StaffAttendanceBoard] Error loading presence data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + Realtime Channel Subscription + Polling
  useEffect(() => {
    loadData();

    // 1. Subscribe to real-time broadcast channel
    const channel = supabase
      .channel("attendance-realtime")
      .on("broadcast", { event: "attendance_update" }, (payload) => {
        console.log("[StaffAttendanceBoard] Realtime event received:", payload);
        loadData();
      })
      .subscribe();

    // 2. Background poll every 30 seconds to guarantee freshness
    const pollInterval = setInterval(loadData, 30_000);

    // 3. Second-by-second ticker for continuous time calculation
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, [loadData]);

  // Compute live elapsed worked time and break duration for each member in real time
  const enrichedStaff = useMemo(() => {
    return allStaff.map((staff) => {
      if ((staff.status === "Clocked In" || staff.status === "On Break") && staff.clockInTime) {
        const netMs = computeNetWorkedMs(
          staff.clockInTime,
          staff.status,
          staff.totalBreakMs || 0,
          staff.breakStartTime,
          now,
        );
        const breakMs = computeTotalBreakMs(
          staff.totalBreakMs || 0,
          staff.status,
          staff.breakStartTime,
          now,
        );
        return {
          ...staff,
          liveHours: formatElapsed(netMs),
          liveBreakDuration: breakMs > 0 ? formatElapsed(breakMs) : "0m",
        };
      }
      return {
        ...staff,
        liveHours: staff.hours || "0h 0m",
        liveBreakDuration: staff.breakDuration || "—",
      };
    });
  }, [allStaff, now]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enrichedStaff;
    const q = search.toLowerCase();
    return enrichedStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [enrichedStaff, search]);

  const stats = useMemo(() => {
    return {
      total: allStaff.length,
      active: allStaff.filter((s) => s.status === "Clocked In").length,
      break: allStaff.filter((s) => s.status === "On Break").length,
      out: allStaff.filter((s) => s.status === "Clocked Out").length,
    };
  }, [allStaff]);

  return (
    <div className="space-y-5 w-full">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold mt-0.5 text-foreground">{stats.total}</p>
          </div>
          <Users className="w-7 h-7 text-muted-foreground/30" />
        </Card>

        <Card className="p-3.5 border-border/70 flex items-center justify-between border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div>
            <p className="text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">Clocked In</p>
            <p className="text-2xl font-bold mt-0.5 text-emerald-700 dark:text-emerald-400">{stats.active}</p>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-500/40" />
        </Card>

        <Card className="p-3.5 border-border/70 flex items-center justify-between border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10">
          <div>
            <p className="text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-400">On Break</p>
            <p className="text-2xl font-bold mt-0.5 text-amber-700 dark:text-amber-400">{stats.break}</p>
          </div>
          <Coffee className="w-7 h-7 text-amber-500/40" />
        </Card>

        <Card className="p-3.5 border-border/70 flex items-center justify-between border-l-4 border-l-muted-foreground/30">
          <div>
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">Clocked Out</p>
            <p className="text-2xl font-bold mt-0.5 text-muted-foreground">{stats.out}</p>
          </div>
          <XCircle className="w-7 h-7 text-muted-foreground/20" />
        </Card>
      </div>

      {/* Main Board Table */}
      <Card className="p-4 border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search staff, role, department..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {allStaff.length} team members
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Staff Member</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Clocked In At</th>
                <th className="py-2.5 px-3 font-semibold text-center">Break Duration</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && allStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    Connecting to live presence system…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 text-xs">
                          {staff.avatar && <AvatarImage src={staff.avatar} />}
                          <AvatarFallback className="text-[10px] font-semibold uppercase bg-primary/10 text-primary">
                            {staff.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{staff.name}</div>
                          <div className="text-[10px] text-muted-foreground">{staff.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-muted-foreground">
                      <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground border border-border">
                        {staff.department}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          staff.status === "Clocked In"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/30"
                            : staff.status === "On Break"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            staff.status === "Clocked In"
                              ? "bg-emerald-500 animate-pulse"
                              : staff.status === "On Break"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {staff.time}
                    </td>

                    {/* Break Duration column */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-mono text-xs ${
                          staff.status === "On Break"
                            ? "text-amber-600 dark:text-amber-400 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {staff.liveBreakDuration}
                      </span>
                    </td>

                    {/* Net Hours Worked column */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-mono font-semibold ${
                          staff.status === "Clocked In"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : staff.status === "On Break"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }`}
                      >
                        {staff.liveHours}
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
  );
}
