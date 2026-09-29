import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Coffee, CheckCircle2, XCircle, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface StaffRow {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  time: string;
  hours: string;
}

export function StaffAttendanceBoard({
  title = "Staff Attendance",
  description = "Monitor real-time check-ins and breaks across all departments.",
}) {
  const [search, setSearch] = useState("");
  const [allStaff, setAllStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all real company profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, job_title, department, avatar_url")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (pErr) throw pErr;

      // Load today's latest attendance log per user
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("actor_id, details, created_at")
        .gte("created_at", startOfDay.toISOString())
        .like("action", "attendance_%")
        .order("created_at", { ascending: true });

      // Build a map: user_id → their latest attendance details
      const statusMap = new Map<string, any>();
      (logs || []).forEach((log: any) => {
        if (log.actor_id) {
          statusMap.set(log.actor_id, log.details);
        }
      });

      const rows: StaffRow[] = (profiles || []).map((p: any) => {
        const live = statusMap.get(p.id);
        const clockInTime = live?.clock_in_time;
        const state = live?.state || "Clocked Out";

        let time = "-";
        let hours = "0h 0m";

        if (clockInTime && state !== "Clocked Out") {
          time = new Date(clockInTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const elapsedMs = Date.now() - clockInTime - (live?.total_break_ms || 0);
          const totalMins = Math.max(0, Math.floor(elapsedMs / 60000));
          hours = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
        }

        return {
          id: p.id,
          name: p.full_name || p.email.split("@")[0].replace(".", " "),
          role: p.job_title || "Staff Member",
          department: p.department || "General",
          status: state,
          time,
          hours,
        };
      });

      setAllStaff(rows);
    } catch (err) {
      console.warn("Error loading staff attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 60 seconds
    const timer = setInterval(loadData, 60_000);
    return () => clearInterval(timer);
  }, []);

  const filtered = allStaff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: allStaff.length,
    active: allStaff.filter((s) => s.status === "Clocked In").length,
    break: allStaff.filter((s) => s.status === "On Break").length,
    out: allStaff.filter((s) => s.status === "Clocked Out").length,
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Clocked In</p>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-500/20" />
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-orange-500">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">On Break</p>
            <p className="text-2xl font-bold mt-1">{stats.break}</p>
          </div>
          <Coffee className="w-8 h-8 text-orange-500/20" />
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-gray-400">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Clocked Out</p>
            <p className="text-2xl font-bold mt-1">{stats.out}</p>
          </div>
          <XCircle className="w-8 h-8 text-gray-400/20" />
        </Card>
      </div>

      <Card className="border-border/70">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-3 font-semibold">Staff Member</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Clock In Time</th>
                <th className="px-6 py-3 font-semibold text-right">Hours Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading attendance data…
                  </td>
                </tr>
              )}
              {!loading && filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{staff.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                      staff.status === "Clocked In"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : staff.status === "On Break"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{staff.time}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">{staff.hours}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No staff members found matching your search.
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
