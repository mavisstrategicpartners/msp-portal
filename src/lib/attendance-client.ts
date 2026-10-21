import { supabase } from "@/integrations/supabase/client";

export type AttendanceState = "Clocked In" | "On Break" | "Clocked Out";

export interface AttendanceRecord {
  state: AttendanceState;
  clockInTime: number | null;
  breakStartTime: number | null;
  totalBreakMs: number;
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
 * Compute net working time for an employee from their attendance record and current time.
 * Handles all three states: Clocked In, On Break, Clocked Out.
 */
export function computeNetWorkedMs(
  clockInTime: number | null,
  state: AttendanceState,
  totalBreakMs: number,
  breakStartTime: number | null,
  now: number,
  savedHoursWorked?: string,
): number {
  if (!clockInTime) return 0;

  if (state === "Clocked Out") {
    // Use saved hours if available, otherwise return 0
    if (savedHoursWorked && savedHoursWorked !== "0h 0m") {
      const match = savedHoursWorked.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        return (parseInt(match[1], 10) * 60 + parseInt(match[2], 10)) * 60000;
      }
    }
    return 0;
  }

  let elapsed = now - clockInTime - (totalBreakMs || 0);
  // If on break, subtract the ongoing break time
  if (state === "On Break" && breakStartTime) {
    elapsed -= (now - breakStartTime);
  }
  return Math.max(0, elapsed);
}

/**
 * Compute total break duration in ms (completed breaks + ongoing break if applicable).
 */
export function computeTotalBreakMs(
  totalBreakMs: number,
  state: AttendanceState,
  breakStartTime: number | null,
  now: number,
): number {
  let total = totalBreakMs || 0;
  if (state === "On Break" && breakStartTime) {
    total += (now - breakStartTime);
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
    const res = await fetch(`/api/attendance/status?userId=${encodeURIComponent(userId)}`);
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
export async function recordAttendance(
  userId: string,
  record: AttendanceRecord,
  hoursWorked: string
): Promise<boolean> {
  const payload = {
    userId,
    state: record.state,
    clockInTime: record.clockInTime,
    breakStartTime: record.breakStartTime,
    totalBreakMs: record.totalBreakMs,
    hoursWorked,
  };

  // 1) Save to localStorage immediately so UI has instantaneous state
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(payload));
  } catch {
    // ignore
  }

  // 2) Broadcast on Supabase Realtime so admins viewing the board see it in < 100ms
  try {
    const channel = supabase.channel("attendance-realtime");
    channel.send({
      type: "broadcast",
      event: "attendance_update",
      payload: {
        userId,
        state: record.state,
        clockInTime: record.clockInTime,
        breakStartTime: record.breakStartTime,
        totalBreakMs: record.totalBreakMs,
        hoursWorked,
        timestamp: Date.now(),
      },
    });
  } catch (e) {
    console.warn("[Attendance Client] Realtime broadcast error:", e);
  }

  // 3) Persist to Supabase via server API
  try {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[Attendance Client] Server record failed:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Attendance Client] Server record network error:", err);
    return false;
  }
}

// 3. Fetch all staff members for the Live Attendance Board
export async function getAttendanceBoard(): Promise<{ staff: StaffPresenceMember[]; timestamp: number }> {
  try {
    const res = await fetch("/api/attendance/board");
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
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[Attendance Client] Failed to fetch attendance register:", err);
  }
  return null;
}
