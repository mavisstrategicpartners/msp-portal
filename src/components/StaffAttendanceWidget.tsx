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
  formatElapsed,
  formatJohannesburgTime,
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

  // Calculate live net hours worked (excludes all breaks)
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
    return formatElapsed(Math.max(0, elapsed));
  };

  // Calculate total break duration (completed + ongoing)
  const calculateBreakDuration = (): string => {
    let total = record.totalBreakMs || 0;
    if (record.state === "On Break" && record.breakStartTime) {
      total += (now - record.breakStartTime);
    }
    if (total <= 0) return "0m";
    return formatElapsed(total);
  };

  /** Send the action to the server and show what it saved. Returns the saved record, or null. */
  const updateRecord = async (newRecord: AttendanceRecord): Promise<AttendanceRecord | null> => {
    if (!userIdRef.current || saving) return null;
    setSaving(true);
    try {
      const res = await recordAttendance(userIdRef.current, newRecord);
      if (res.ok) {
        setRecord(res.record);
        return res.record;
      }
      toast.error("Attendance not updated", { description: res.error });
      // Show the true current status (for example, already clocked in on another device).
      setRecord(await getTodayAttendance(userIdRef.current));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleClockIn = async () => {
    const saved = await updateRecord({ ...DEFAULT_RECORD, state: "Clocked In" });
    if (saved)
      toast.success("Clocked in", {
        description: `Started at ${formatJohannesburgTime(saved.clockInTime)}. Time keeps counting even if you sign out.`,
      });
  };

  const handleStartBreak = async () => {
    const saved = await updateRecord({ ...record, state: "On Break" });
    if (saved) toast.info("Break started", { description: "Break time is not counted as working time." });
  };

  const handleEndBreak = async () => {
    const saved = await updateRecord({ ...record, state: "Clocked In" });
    if (saved) toast.success("Break ended", { description: "Work timer resumed." });
  };

  const handleClockOut = async () => {
    const saved = await updateRecord({ ...record, state: "Clocked Out" });
    if (saved)
      toast.success("Clocked out", {
        description: `Hours worked today (breaks excluded): ${saved.hoursWorked}.`,
      });
  };

  const { state } = record;
  const breakDuration = calculateBreakDuration();
  const hasBreaks = record.totalBreakMs > 0 || (record.state === "On Break" && record.breakStartTime);

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
              ? `Started at ${formatJohannesburgTime(record.clockInTime)}`
              : "Not clocked in today"}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {calculateHoursWorked()}
          </div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            {state === "Clocked In" ? "Net Working Time" : state === "On Break" ? "Net Working Time" : "Total Logged"}
          </div>
        </div>
      </div>

      {/* Break duration display — shown when any breaks have occurred */}
      {hasBreaks && (
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Coffee className={`w-3.5 h-3.5 ${state === "On Break" ? "text-amber-500" : "text-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground">Break:</span>
          <span className={`text-xs font-mono font-semibold ${
            state === "On Break" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          }`}>
            {breakDuration}
          </span>
          {state === "On Break" && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">
              (active)
            </span>
          )}
        </div>
      )}

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
