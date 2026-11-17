import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "@/lib/notify";
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
      <Card className={`flex min-h-[72px] items-center gap-3 border-border px-5 py-4 ${className}`}>
        <Clock className="h-4 w-4 animate-pulse text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Loading your time record…</p>
      </Card>
    );
  }

  const tone =
    state === "Clocked In"
      ? { dot: "bg-emerald-500", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" }
      : state === "On Break"
        ? { dot: "bg-amber-500", chip: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" }
        : { dot: "bg-muted-foreground/40", chip: "border-border bg-muted text-muted-foreground" };

  // Compact time-tracking bar: one row when there is room, stacked on narrow cards and phones.
  return (
    <Card className={`@container border-border px-5 py-4 ${className}`}>
      <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Time tracking</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
                {state}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {record.clockInTime ? `Started at ${formatJohannesburgTime(record.clockInTime)}` : "Not clocked in today"}
              {hasBreaks && (
                <>
                  {" · "}
                  <Coffee className="inline h-3 w-3 -translate-y-px" /> Break{" "}
                  <span className={`font-mono ${state === "On Break" ? "text-amber-600 dark:text-amber-400" : ""}`}>{breakDuration}</span>
                  {state === "On Break" ? " (on break now)" : ""}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 @lg:justify-end">
          <div className="text-left @lg:text-right">
            <div className="font-mono text-lg font-semibold tabular-nums leading-tight text-foreground">{calculateHoursWorked()}</div>
            <div className="text-[11px] text-muted-foreground">{state === "Clocked Out" ? "Logged today" : "Net working time"}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {state === "Clocked Out" && (
              <Button onClick={handleClockIn} disabled={saving} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Clock in
              </Button>
            )}
            {state === "Clocked In" && (
              <>
                <Button onClick={handleStartBreak} disabled={saving} variant="outline" size="sm">
                  <Coffee className="mr-1 h-3.5 w-3.5" /> Take break
                </Button>
                <Button onClick={handleClockOut} disabled={saving} variant="outline" size="sm" className="text-rose-600 hover:text-rose-700">
                  <LogOut className="mr-1 h-3.5 w-3.5" /> Clock out
                </Button>
              </>
            )}
            {state === "On Break" && (
              <>
                <Button onClick={handleEndBreak} disabled={saving} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resume work
                </Button>
                <Button onClick={handleClockOut} disabled={saving} variant="outline" size="sm" className="text-rose-600 hover:text-rose-700">
                  <LogOut className="mr-1 h-3.5 w-3.5" /> Clock out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
