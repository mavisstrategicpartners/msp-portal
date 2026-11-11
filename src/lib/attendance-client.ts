import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";

export type AttendanceState = "Clocked In" | "On Break" | "Clocked Out";

export interface AttendanceRecord {
  state: AttendanceState;
  clockInTime: number | null;
  breakStartTime: number | null;
  totalBreakMs: number;
  clockOutTime?: number | null;
  hoursWorked?: string;
}

export interface StaffPresenceMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  tier: "Permanent" | "Contract" | "Intern";
  avatar?: string;
  status: AttendanceState;
  clockInTime: number | null;
  breakStartTime: number | null;
  totalBreakMs: number;
  clockOutTime?: number | null;
  time: string;
  hours: string;
  elapsedMinutes: number;
  currentProject: string;
  /** Total break duration string e.g. "15m" or "1h 5m", computed server-side for clocked-out users */
  breakDuration: string;
  /** For live calculation of ongoing break in the client (ms since break started) */
  liveBreakMs: number;
}

const LOCAL_STORAGE_KEY_PREFIX = "msp_attendance_";

/** Format milliseconds into a human-readable duration string like "2h 37m" */
export function formatElapsed(ms: number): string {
  const totalMins = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format timestamp into Africa/Johannesburg timezone (SAST = UTC+2)
 * e.g. "08:50 AM", "09:49 AM"
 */
export function formatJohannesburgTime(timestamp: number | null): string {
  if (!timestamp) return "—";
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

/**
 * Compute net working time for an employee from their attendance record and current time.
 * Formula: Net Hours Worked = Elapsed Time Since Clock-In − Total Break Duration
 * Handles:
 * - Currently clocked in: now - clockInTime - completed breaks
 * - Currently on break: now - clockInTime - completed breaks - active break duration
 * - Clocked out: clockOutTime - clockInTime - total recorded breaks (or saved hours)
 * - Not clocked in: 0
 */
export function computeNetWorkedMs(
  clockInTime: number | null,
  state: AttendanceState,
  totalBreakMs: number,
  breakStartTime: number | null,
  now: number,
  savedHoursWorked?: string,
  clockOutTime?: number | null,
): number {
  if (!clockInTime) return 0;

  // Sanitize any clock desynchronization where client sent a timestamp in the future
  const effectiveClockIn = Math.min(clockInTime, now);

  if (state === "Clocked Out") {
    // If we have actual clock-out timestamp, calculate precisely: clockOut - clockIn - totalBreaks
    if (clockOutTime && clockOutTime > effectiveClockIn) {
      const elapsed = clockOutTime - effectiveClockIn - (totalBreakMs || 0);
      return Math.max(0, elapsed);
    }

    // Fall back to stored formatted hours string (e.g. "7h 45m")
    if (savedHoursWorked && savedHoursWorked !== "0h 0m") {
      const match = savedHoursWorked.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        return (parseInt(match[1], 10) * 60 + parseInt(match[2], 10)) * 60000;
      }
    }
    return 0;
  }

  // Active session: elapsed time since clock in minus completed breaks
  let elapsed = now - effectiveClockIn - (totalBreakMs || 0);

  // If currently on break, subtract the ongoing active break as well
  if (state === "On Break" && breakStartTime) {
    const effectiveBreakStart = Math.min(breakStartTime, now);
    elapsed -= (now - effectiveBreakStart);
  }

  return Math.max(0, elapsed);
}

/**
 * Compute total break duration in ms (completed breaks + ongoing break if currently on break).
 */
export function computeTotalBreakMs(
  totalBreakMs: number,
  state: AttendanceState,
  breakStartTime: number | null,
  now: number,
): number {
  let total = totalBreakMs || 0;
  if (state === "On Break" && breakStartTime) {
    const effectiveBreakStart = Math.min(breakStartTime, now);
    total += (now - effectiveBreakStart);
  }
  return Math.max(0, total);
}

// 1. Load today's active attendance for a specific user
export async function getTodayAttendance(userId: string): Promise<AttendanceRecord> {
  const defaultRecord: AttendanceRecord = {
    state: "Clocked Out",
    clockInTime: null,
    breakStartTime: null,
    totalBreakMs: 0,
    hoursWorked: "0h 0m",
  };

  try {
    const res = await fetch(`/api/attendance/status?userId=${encodeURIComponent(userId)}`, { headers: await getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        // Cache in localStorage as backup
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
        } catch {
          // ignore localStorage error
        }
        return {
          state: data.state,
          clockInTime: data.clockInTime,
          breakStartTime: data.breakStartTime,
          totalBreakMs: data.totalBreakMs || 0,
          hoursWorked: data.hoursWorked || "0h 0m",
        };
      }
    }
  } catch (err) {
    console.warn("[Attendance Client] API fetch error, checking local fallback:", err);
  }

  // Fallback to localStorage if offline
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  return defaultRecord;
}

// 2. Save attendance event (Clock in, Break start, Break end, Clock out)
export type AttendanceSaveResult = { ok: true; record: AttendanceRecord } | { ok: false; error: string };

/**
 * Ask the server to clock in, start/end a break or clock out. The server checks the action
 * against the person's current status, stamps the time and computes hours; the returned record
 * is what was saved. Nothing is shown as saved unless the server accepted it.
 */
export async function recordAttendance(
  userId: string,
  record: AttendanceRecord,
  _hoursWorked?: string
): Promise<AttendanceSaveResult> {
  let res: Response;
  try {
    res = await fetch("/api/attendance", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ state: record.state }),
    });
  } catch {
    return { ok: false, error: "No connection to the attendance system. Check your internet and try again." };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.data) return { ok: false, error: body?.error || "Attendance could not be saved." };
  const d = body.data;
  const saved: AttendanceRecord = {
    state: d.state,
    clockInTime: d.clock_in_time ?? null,
    breakStartTime: d.break_start_time ?? null,
    totalBreakMs: d.total_break_ms || 0,
    hoursWorked: d.hours_worked || "0h 0m",
    ...(d.clock_out_time ? { clockOutTime: d.clock_out_time } : {}),
  } as AttendanceRecord;

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(saved));
  } catch {
    // ignore
  }
  // Tell open attendance boards straight away.
  try {
    supabase.channel("attendance-realtime").send({
      type: "broadcast",
      event: "attendance_update",
      payload: { userId, ...saved, timestamp: Date.now() },
    });
  } catch (e) {
    console.warn("[Attendance Client] Realtime broadcast error:", e);
  }
  return { ok: true, record: saved };
}

// 3. Fetch all staff members for the Live Attendance Board
export async function getAttendanceBoard(): Promise<{ staff: StaffPresenceMember[]; timestamp: number }> {
  try {
    const res = await fetch("/api/attendance/board", { headers: await getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return {
        staff: data.staff || [],
        timestamp: data.now || Date.now(),
      };
    }
  } catch (err) {
    console.warn("[Attendance Client] Failed to fetch attendance board:", err);
  }

  return { staff: [], timestamp: Date.now() };
}

// 4. Fetch Monday to Friday Attendance Register & Timesheet
export async function getAttendanceRegister(weekStart?: string): Promise<any | null> {
  try {
    const url = weekStart
      ? `/api/attendance/register?weekStart=${encodeURIComponent(weekStart)}`
      : "/api/attendance/register";
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[Attendance Client] Failed to fetch attendance register:", err);
  }
  return null;
}
