import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AttendanceState = "Clocked Out" | "Clocked In" | "On Break";

interface AttendanceRecord {
  state: AttendanceState;
  clockInTime: number | null;
  breakStartTime: number | null;
  totalBreakMs: number;
}

const DEFAULT_RECORD: AttendanceRecord = {
  state: "Clocked Out",
  clockInTime: null,
  breakStartTime: null,
  totalBreakMs: 0,
};

async function loadTodayAttendance(userId: string): Promise<AttendanceRecord> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("actor_id", userId)
    .gte("created_at", startOfDay.toISOString())
    .like("action", "attendance_%")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !logs || logs.length === 0) return DEFAULT_RECORD;

  const details = logs[0].details as any;
  return {
    state: details?.state ?? "Clocked Out",
    clockInTime: details?.clock_in_time ?? null,
    breakStartTime: details?.break_start_time ?? null,
    totalBreakMs: details?.total_break_ms ?? 0,
  };
}

async function saveAttendance(userId: string, record: AttendanceRecord, hoursWorked: string) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: userId,
    action: `attendance_${record.state.toLowerCase().replace(/\s+/g, "_")}`,
    details: {
      state: record.state,
      clock_in_time: record.clockInTime,
      break_start_time: record.breakStartTime,
      total_break_ms: record.totalBreakMs,
      hours_worked: hoursWorked,
      updated_at: new Date().toISOString(),
    },
  });
  if (error) console.warn("Failed to save attendance to Supabase:", error);
}

export function StaffAttendanceWidget() {
  const [record, setRecord] = useState<AttendanceRecord>(DEFAULT_RECORD);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Load current user and their today's attendance on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userIdRef.current = user.id;
        const rec = await loadTodayAttendance(user.id);
        setRecord(rec);
      } catch (e) {
        console.warn("Error loading attendance:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateHoursWorked = (): string => {
    if (!record.clockInTime || record.state === "Clocked Out") return "0h 0m";
    let elapsed = now - record.clockInTime - record.totalBreakMs;
    if (record.state === "On Break" && record.breakStartTime) {
      elapsed -= (now - record.breakStartTime);
    }
    const totalMinutes = Math.max(0, Math.floor(elapsed / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const updateRecord = async (newRecord: AttendanceRecord) => {
    setRecord(newRecord);
    if (userIdRef.current) {
      await saveAttendance(userIdRef.current, newRecord, calculateHoursWorked());
    }
  };

  const handleClockIn = async () => {
    const newRecord: AttendanceRecord = {
      state: "Clocked In",
      clockInTime: Date.now(),
      breakStartTime: null,
      totalBreakMs: 0,
    };
    await updateRecord(newRecord);
    toast.success("Clocked In", { description: "Have a great day at work!" });
  };

  const handleStartBreak = async () => {
    const newRecord: AttendanceRecord = { ...record, state: "On Break", breakStartTime: Date.now() };
    await updateRecord(newRecord);
    toast("Break Started", { description: "Enjoy your break!" });
  };

  const handleEndBreak = async () => {
    const extraBreak = record.breakStartTime ? Date.now() - record.breakStartTime : 0;
    const newRecord: AttendanceRecord = {
      ...record,
      state: "Clocked In",
      breakStartTime: null,
      totalBreakMs: record.totalBreakMs + extraBreak,
    };
    await updateRecord(newRecord);
    toast("Break Ended", { description: "Welcome back." });
  };

  const handleClockOut = async () => {
    const extraBreak =
      record.state === "On Break" && record.breakStartTime ? Date.now() - record.breakStartTime : 0;
    const newRecord: AttendanceRecord = {
      ...record,
      state: "Clocked Out",
      breakStartTime: null,
      totalBreakMs: record.totalBreakMs + extraBreak,
    };
    await updateRecord(newRecord);
    toast.success("Clocked Out", { description: "Great work today! See you tomorrow." });
  };

  const { state } = record;

  if (loading) {
    return (
      <Card className="flex flex-col border-border/70 p-5 items-center justify-center min-h-[120px]">
        <Clock className="w-5 h-5 animate-pulse text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Loading attendance…</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-border/70 p-5 transition-colors hover:border-primary/40 relative overflow-hidden">
      {/* Decorative background element */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${
        state === 'Clocked In' ? 'bg-green-500' : state === 'On Break' ? 'bg-orange-500' : 'bg-gray-500'
      }`} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Time Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your attendance</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {calculateHoursWorked()}
          </div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            Active Time
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 relative z-10">
        {state === "Clocked Out" && (
          <Button onClick={handleClockIn} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:scale-[1.02]">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        )}

        {state === "Clocked In" && (
          <>
            <Button onClick={handleStartBreak} variant="outline" className="flex-1 border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400">
              <Coffee className="w-4 h-4 mr-2" />
              Take Break
            </Button>
            <Button onClick={handleClockOut} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          </>
        )}

        {state === "On Break" && (
          <>
            <Button onClick={handleEndBreak} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Resume Work
            </Button>
            <Button onClick={handleClockOut} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium relative z-10">
        <span className="text-muted-foreground">Status:</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
          state === 'Clocked In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          state === 'On Break' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {state}
        </span>
      </div>
    </Card>
  );
}
