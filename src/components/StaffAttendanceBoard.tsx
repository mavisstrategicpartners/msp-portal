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
import { StatCard, StatGrid } from "@/components/layout/page";

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <StatGrid>
        <StatCard label="Total staff" value={stats.total} icon={Users} />
        <StatCard label="Clocked in" value={stats.active} icon={CheckCircle2} tone={stats.active ? "success" : "default"} />
        <StatCard label="On break" value={stats.break} icon={Coffee} tone={stats.break ? "warning" : "default"} />
        <StatCard label="Clocked out" value={stats.out} icon={XCircle} />
      </StatGrid>

      {/* Main Board Table */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff, role, department..."
              className="h-9 pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {allStaff.length} team members
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Staff Member</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Department</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Status</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Clocked In At</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium text-center">Break Duration</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium text-right">Net Hours Worked</th>
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
                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground border border-border">
                        {staff.department}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
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

                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {staff.time}
                    </td>

                    {/* Break Duration column */}
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-right">
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
