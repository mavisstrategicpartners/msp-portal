import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AttendanceRecord,
  getTodayAttendance,
  recordAttendance,
} from "@/lib/attendance-client";

const DEFAULT_RECORD: AttendanceRecord = {
  state: "Clocked Out",
  clockInTime: null,
  breakStartTime: null,
  totalBreakMs: 0,
  hoursWorked: "0h 0m",
};

export function StaffAttendanceWidget({ className = "" }: { className?: string } = {}) {
  const [record, setRecord] = useState<AttendanceRecord>(DEFAULT_RECORD);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Initialize and load attendance from server
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        userIdRef.current = user.id;

        const rec = await getTodayAttendance(user.id);
        if (mounted) {
          setRecord(rec);
        }
      } catch (e) {
        console.warn("Error loading attendance:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Real-time ticking clock (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate live hours and minutes worked
  const calculateHoursWorked = (): string => {
    if (!record.clockInTime || record.state === "Clocked Out") {
      return record.hoursWorked && record.hoursWorked !== "0h 0m"
        ? record.hoursWorked
        : "0h 0m";
    }
    let elapsed = now - record.clockInTime - (record.totalBreakMs || 0);
    if (record.state === "On Break" && record.breakStartTime) {
      elapsed -= now - record.breakStartTime;
    }
    const totalMinutes = Math.max(0, Math.floor(elapsed / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const updateRecord = async (newRecord: AttendanceRecord) => {
    setRecord(newRecord);
    if (userIdRef.current) {
      setSaving(true);
      try {
        const hoursStr = calculateHoursWorked();
        await recordAttendance(userIdRef.current, newRecord, hoursStr);
      } finally {
        setSaving(false);
      }
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
    toast.success("Clocked In Successfully", {
      description: "Your session is live. Time will calculate continuously even if you log out.",
    });
  };

  const handleStartBreak = async () => {
    const newRecord: AttendanceRecord = {
      ...record,
      state: "On Break",
      breakStartTime: Date.now(),
    };
    await updateRecord(newRecord);
    toast.info("Break Started", { description: "Timer paused for break." });
  };

  const handleEndBreak = async () => {
    const extraBreak = record.breakStartTime ? Date.now() - record.breakStartTime : 0;
    const newRecord: AttendanceRecord = {
      ...record,
      state: "Clocked In",
      breakStartTime: null,
      totalBreakMs: (record.totalBreakMs || 0) + extraBreak,
    };
    await updateRecord(newRecord);
    toast.success("Break Ended", { description: "Welcome back! Work timer resumed." });
  };

  const handleClockOut = async () => {
    const extraBreak =
      record.state === "On Break" && record.breakStartTime
        ? Date.now() - record.breakStartTime
        : 0;
    const finalHours = calculateHoursWorked();
    const newRecord: AttendanceRecord = {
      ...record,
      state: "Clocked Out",
      breakStartTime: null,
      totalBreakMs: (record.totalBreakMs || 0) + extraBreak,
      hoursWorked: finalHours,
    };
    await updateRecord(newRecord);
    toast.success("Clocked Out", {
      description: `Great work today! Final recorded time: ${finalHours}.`,
    });
  };

  const { state } = record;

  if (loading) {
    return (
      <Card className={`flex flex-col border-border/70 p-5 items-center justify-center min-h-[140px] ${className}`}>
        <Clock className="w-5 h-5 animate-pulse text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Connecting to attendance system…</p>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col border-border/70 p-5 transition-colors hover:border-primary/40 relative overflow-hidden ${className}`}>
      {/* Glow highlight */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
          state === "Clocked In"
            ? "bg-emerald-500"
            : state === "On Break"
            ? "bg-amber-500"
            : "bg-muted"
        }`}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Time Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {record.clockInTime
              ? `Started at ${new Date(record.clockInTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Not clocked in today"}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {calculateHoursWorked()}
          </div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            {state === "Clocked In" ? "Working Time" : state === "On Break" ? "Paused (Break)" : "Total Logged"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 relative z-10">
        {state === "Clocked Out" && (
          <Button
            onClick={handleClockIn}
            disabled={saving}
            size="sm"
            className="h-9 px-4 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-white shadow-sm transition-all hover:shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Clock In
          </Button>
        )}

        {state === "Clocked In" && (
          <>
            <Button
              onClick={handleStartBreak}
              disabled={saving}
              variant="outline"
              size="sm"
              className="h-9 px-4 text-sm font-medium border-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 focus-visible:ring-2 focus-visible:ring-amber-400/50 text-amber-700 dark:text-amber-400 transition-all"
            >
              <Coffee className="w-3.5 h-3.5 mr-1.5" />
              Take Break
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={saving}
              variant="destructive"
              size="sm"
              className="h-9 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-destructive/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Clock Out
            </Button>
          </>
        )}

        {state === "On Break" && (
          <>
            <Button
              onClick={handleEndBreak}
              disabled={saving}
              size="sm"
              className="h-9 px-4 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-white transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Resume Work
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={saving}
              variant="destructive"
              size="sm"
              className="h-9 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-destructive/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Clock Out
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-medium relative z-10 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px]">Live Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              state === "Clocked In"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/30"
                : state === "On Break"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {state}
          </span>
        </div>

        {state === "Clocked In" && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            Active
          </span>
        )}
      </div>
    </Card>
  );
}
