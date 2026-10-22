import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Returns today's start-of-day date object (00:00:00.000) specifically in Africa/Johannesburg (UTC+2)
 */
function getJohannesburgStartOfDay(): Date {
  const now = new Date();
  const jhbDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${jhbDateStr}T00:00:00.000+02:00`);
}

function formatJhbTime(dateOrMs: Date | number | null | undefined): string {
  if (!dateOrMs) return "—";
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateOrMs));
  } catch {
    return "—";
  }
}

export async function handleAttendanceApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 1. POST /api/attendance -> save attendance event (clock-in, break, clock-out)
    if (
      request.method === "POST" &&
      (pathname === "/api/attendance" || pathname === "/api/attendance/log")
    ) {
      const body = await request.json();
      const {
        userId,
        state,
        clockInTime,
        breakStartTime,
        totalBreakMs,
        clockOutTime,
        hoursWorked,
      } = body;

      if (!userId || !state) {
        return new Response(JSON.stringify({ error: "Missing userId or state" }), {
          status: 400,
          headers,
        });
      }

      const now = Date.now();
      // Ensure clock_in_time is never in the future (client system clock desync protection)
      let sanitizedClockIn = clockInTime || null;
      if (sanitizedClockIn && sanitizedClockIn > now + 60000) {
        sanitizedClockIn = now;
      }
      if (state === "Clocked In" && !sanitizedClockIn) {
        sanitizedClockIn = now;
      }

      let sanitizedBreakStart = breakStartTime || null;
      if (sanitizedBreakStart && sanitizedBreakStart > now + 60000) {
        sanitizedBreakStart = now;
      }

      const resolvedClockOut = state === "Clocked Out" ? (clockOutTime || now) : null;

      // Persist in audit_logs with service_role key (bypasses RLS)
      const actionKey = `attendance_${state.toLowerCase().replace(/\s+/g, "_")}`;
      const logDetails = {
        state,
        clock_in_time: sanitizedClockIn,
        break_start_time: sanitizedBreakStart,
        total_break_ms: totalBreakMs || 0,
        clock_out_time: resolvedClockOut,
        hours_worked: hoursWorked || "0h 0m",
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabaseAdmin as any)
        .from("audit_logs")
        .insert({
          actor_id: userId,
          action: actionKey,
          target_id: userId,
          details: logDetails,
        })
        .select()
        .single();

      if (error) {
        console.error("Attendance insert error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers,
        });
      }

      // If user clocked in, also update last_login_at on their profile
      if (state === "Clocked In") {
        await (supabaseAdmin as any)
          .from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", userId);
      }

      return new Response(
        JSON.stringify({ ok: true, data: logDetails }),
        { status: 200, headers }
      );
    }

    // 2. GET /api/attendance/status?userId=... -> get single user's active/latest attendance
    if (
      request.method === "GET" &&
      pathname.startsWith("/api/attendance/status")
    ) {
      const userId = url.searchParams.get("userId");
      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId" }), {
          status: 400,
          headers,
        });
      }

      // Query latest attendance event for this user from audit_logs
      const { data: logs, error } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("*")
        .eq("actor_id", userId)
        .like("action", "attendance_%")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers,
        });
      }

      const defaultRecord = {
        state: "Clocked Out",
        clockInTime: null,
        breakStartTime: null,
        totalBreakMs: 0,
        hoursWorked: "0h 0m",
      };

      if (!logs || logs.length === 0) {
        return new Response(JSON.stringify(defaultRecord), {
          status: 200,
          headers,
        });
      }

      const details = logs[0].details as any;
      const state = details?.state || "Clocked Out";
      const clockInTime = details?.clock_in_time || null;
      const breakStartTime = details?.break_start_time || null;
      const totalBreakMs = details?.total_break_ms || 0;

      // Check if this log was from today in Africa/Johannesburg timezone
      const startOfDay = getJohannesburgStartOfDay();
      const logDate = new Date(logs[0].created_at);
      const isToday = logDate.getTime() >= startOfDay.getTime();

      // If user is currently "Clocked In" or "On Break", their session stays alive
      // even if they signed out or if the clock-in began earlier!
      if (state === "Clocked Out" && !isToday) {
        return new Response(JSON.stringify(defaultRecord), {
          status: 200,
          headers,
        });
      }

      return new Response(
        JSON.stringify({
          state,
          clockInTime,
          breakStartTime,
          totalBreakMs,
          hoursWorked: details?.hours_worked || "0h 0m",
          logCreatedAt: logs[0].created_at,
        }),
        { status: 200, headers }
      );
    }

    // 3. GET /api/attendance/board -> live board of all active staff members
    if (
      request.method === "GET" &&
      (pathname === "/api/attendance/board" || pathname === "/api/attendance")
    ) {
      // Load all active company profiles
      const { data: profiles, error: pErr } = await (supabaseAdmin as any)
        .from("profiles")
        .select(
          "id, full_name, email, job_title, department, avatar_url, role_tier"
        )
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (pErr) {
        return new Response(JSON.stringify({ error: pErr.message }), {
          status: 500,
          headers,
        });
      }

      // Query today's attendance logs in Africa/Johannesburg (UTC+2)
      const startOfDay = getJohannesburgStartOfDay();

      const { data: logs, error: lErr } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("actor_id, details, created_at")
        .gte("created_at", startOfDay.toISOString())
        .like("action", "attendance_%")
        .order("created_at", { ascending: true });

      if (lErr) console.warn("Board logs query warning:", lErr);

      // Latest log map for today
      const statusMap = new Map<string, any>();
      (logs || []).forEach((log: any) => {
        if (log.actor_id) {
          statusMap.set(log.actor_id, {
            ...log.details,
            created_at: log.created_at,
          });
        }
      });

      const now = Date.now();
      const staff = (profiles || []).map((p: any) => {
        const live = statusMap.get(p.id);
        const state: "Clocked In" | "On Break" | "Clocked Out" =
          live?.state || "Clocked Out";
        let clockInTime = live?.clock_in_time || null;
        let breakStartTime = live?.break_start_time || null;
        const totalBreakMs = live?.total_break_ms || 0;
        const clockOutTime = live?.clock_out_time || null;

        // Sanitize future timestamp anomaly (e.g. client system clock desync)
        if (clockInTime && clockInTime > now) {
          const createdAtMs = live?.created_at ? new Date(live.created_at).getTime() : now;
          clockInTime = Math.min(now, createdAtMs);
        }
        if (breakStartTime && breakStartTime > now) {
          breakStartTime = now;
        }

        let timeStr = "—";
        let hoursWorkedStr = "0h 0m";
        let elapsedMinutes = 0;
        let breakDurationStr = "—";
        let liveBreakMs = 0;

        // Compute total break ms including any ongoing break
        let computedBreakMs = totalBreakMs;
        if (state === "On Break" && breakStartTime) {
          computedBreakMs += Math.max(0, now - breakStartTime);
          liveBreakMs = Math.max(0, now - breakStartTime);
        }

        if (clockInTime && state !== "Clocked Out") {
          // Format in Africa/Johannesburg timezone
          timeStr = formatJhbTime(clockInTime);

          // Net worked time = elapsed - all breaks (completed + ongoing)
          const elapsedMs = Math.max(0, now - clockInTime - computedBreakMs);
          elapsedMinutes = Math.floor(elapsedMs / 60000);
          const h = Math.floor(elapsedMinutes / 60);
          const m = elapsedMinutes % 60;
          hoursWorkedStr = `${h}h ${m}m`;

          // Format break duration
          if (computedBreakMs > 0) {
            const bMins = Math.max(0, Math.floor(computedBreakMs / 60000));
            const bH = Math.floor(bMins / 60);
            const bM = bMins % 60;
            breakDurationStr = bH > 0 ? `${bH}h ${bM}m` : `${bM}m`;
          } else {
            breakDurationStr = "0m";
          }
        } else if (state === "Clocked Out") {
          if (clockInTime) {
            timeStr = formatJhbTime(clockInTime);

            // If we have actual clock-out timestamp, calculate precisely: clockOut - clockIn - totalBreaks
            if (clockOutTime && clockOutTime > clockInTime) {
              const elapsedMs = Math.max(0, clockOutTime - clockInTime - totalBreakMs);
              elapsedMinutes = Math.floor(elapsedMs / 60000);
              const h = Math.floor(elapsedMinutes / 60);
              const m = elapsedMinutes % 60;
              hoursWorkedStr = `${h}h ${m}m`;
            } else if (live?.hours_worked && live.hours_worked !== "0h 0m") {
              hoursWorkedStr = live.hours_worked;
              const match = live.hours_worked.match(/(\d+)h\s*(\d+)m/);
              if (match) {
                elapsedMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
              }
            }
          } else {
            hoursWorkedStr = "0h 0m";
          }

          // Show completed break duration for clocked-out employees
          if (totalBreakMs > 0) {
            const bMins = Math.max(0, Math.floor(totalBreakMs / 60000));
            const bH = Math.floor(bMins / 60);
            const bM = bMins % 60;
            breakDurationStr = bH > 0 ? `${bH}h ${bM}m` : `${bM}m`;
          }
        }

        const tier = p.role_tier === "intern" ? "Intern" : "Permanent";
        const dept = (p.department || "General").replace(" Team", "");

        return {
          id: p.id,
          name: p.full_name || p.email.split("@")[0].replace(".", " "),
          email: p.email,
          role: p.job_title || "Staff Member",
          department: dept,
          tier,
          avatar: p.avatar_url,
          status: state,
          clockInTime,
          breakStartTime,
          totalBreakMs,
          clockOutTime,
          time: timeStr,
          hours: hoursWorkedStr,
          elapsedMinutes,
          breakDuration: breakDurationStr,
          liveBreakMs,
          currentProject: "MSP Operations",
        };
      });

      return new Response(JSON.stringify({ staff, now }), {
        status: 200,
        headers,
      });
    }

    // 4. GET /api/attendance/register?weekStart=... -> Monday to Friday Attendance Register
    if (
      request.method === "GET" &&
      pathname.startsWith("/api/attendance/register")
    ) {
      // Calculate Monday of the requested or current week
      let monday: Date;
      const paramStart = url.searchParams.get("weekStart");
      if (paramStart) {
        monday = new Date(paramStart + "T00:00:00");
      } else {
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
      }

      // Generate the 5 dates for Monday to Friday
      const weekDays: {
        dateStr: string;
        dayName: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
        formattedDate: string;
        dateObj: Date;
      }[] = [];

      const dayNames: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri")[] = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
      ];

      for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const formattedDate = d.toLocaleDateString("en-ZA", {
          day: "2-digit",
          month: "short",
        });
        weekDays.push({
          dateStr,
          dayName: dayNames[i],
          formattedDate,
          dateObj: d,
        });
      }

      const weekStartStr = weekDays[0].dateStr;
      const weekEndStr = weekDays[4].dateStr;
      const weekLabel = `${weekDays[0].formattedDate} ${monday.getFullYear()} – ${weekDays[4].formattedDate} ${weekDays[4].dateObj.getFullYear()}`;

      // 1) Fetch all active staff profiles
      const { data: profiles, error: pErr } = await (supabaseAdmin as any)
        .from("profiles")
        .select("id, full_name, email, job_title, department, avatar_url, role_tier")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (pErr) {
        return new Response(JSON.stringify({ error: pErr.message }), { status: 500, headers });
      }

      // 2) Fetch all approved leave requests overlapping this Monday-Friday
      const { data: approvedLeaves, error: lErr } = await (supabaseAdmin as any)
        .from("leave_requests")
        .select("user_id, start_date, end_date, reason, status")
        .eq("status", "approved")
        .lte("start_date", weekEndStr)
        .gte("end_date", weekStartStr);

      if (lErr) console.warn("Leave requests query warning:", lErr);

      // 3) Fetch all attendance audit_logs for the week
      const startIso = new Date(weekDays[0].dateObj).toISOString();
      const endFriday = new Date(weekDays[4].dateObj);
      endFriday.setHours(23, 59, 59, 999);
      const endIso = endFriday.toISOString();

      const { data: logs, error: aErr } = await (supabaseAdmin as any)
        .from("audit_logs")
        .select("actor_id, details, created_at, action")
        .gte("created_at", startIso)
        .lte("created_at", endIso)
        .like("action", "attendance_%")
        .order("created_at", { ascending: true });

      if (aErr) console.warn("Audit logs query warning:", aErr);

      // Build day records for each staff member
      const now = new Date();
      const todayDateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Johannesburg",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);

      let totalOverallHoursMins = 0;
      let totalLeaveCount = 0;
      let totalPossibleWorkDays = 0;
      let totalActualPresentDays = 0;

      const rows = (profiles || []).map((p: any) => {
        const userLogs = (logs || []).filter((l: any) => l.actor_id === p.id);
        const userLeaves = (approvedLeaves || []).filter((lv: any) => lv.user_id === p.id);

        let userTotalMinutes = 0;
        let daysPresent = 0;
        let daysLeave = 0;
        let daysAbsent = 0;

        const days = weekDays.map((wd) => {
          const dayDate = wd.dateStr;

          // A) Check for approved HR leave on this date
          const matchingLeave = userLeaves.find(
            (lv: any) => lv.start_date <= dayDate && lv.end_date >= dayDate
          );

          if (matchingLeave) {
            daysLeave++;
            totalLeaveCount++;
            return {
              dateStr: dayDate,
              dayName: wd.dayName,
              formattedDate: wd.formattedDate,
              status: "Approved Leave" as const,
              leaveReason: matchingLeave.reason || "Approved Leave",
            };
          }

          // B) Check for attendance logs on this date
          const dayLogs = userLogs.filter((l: any) => {
            const lDate = l.created_at.split("T")[0];
            return lDate === dayDate;
          });

          if (dayLogs.length > 0) {
            daysPresent++;
            totalActualPresentDays++;

            const firstClockIn = dayLogs.find((l: any) => l.action === "attendance_clocked_in") || dayLogs[0];
            const lastClockOut = [...dayLogs].reverse().find((l: any) => l.action === "attendance_clocked_out");
            const latestLog = dayLogs[dayLogs.length - 1];

            // Format times in Africa/Johannesburg timezone
            const clockInTimeStr = firstClockIn.details?.clock_in_time
              ? formatJhbTime(firstClockIn.details.clock_in_time)
              : formatJhbTime(new Date(firstClockIn.created_at).getTime());

            let clockOutTimeStr = "—";
            if (lastClockOut) {
              clockOutTimeStr = lastClockOut.details?.clock_out_time
                ? formatJhbTime(lastClockOut.details.clock_out_time)
                : formatJhbTime(new Date(lastClockOut.created_at).getTime());
            } else if (dayDate === todayDateStr && latestLog.details?.state !== "Clocked Out") {
              clockOutTimeStr = "In Progress";
            }

            // Calculate net hours worked: elapsed time minus break duration
            let dayMins = 0;
            const clockInMs = firstClockIn.details?.clock_in_time || new Date(firstClockIn.created_at).getTime();
            const totalBreakMsForDay = latestLog.details?.total_break_ms || 0;

            if (lastClockOut) {
              // Clocked out: use actual clock-out timestamp or created_at
              const clockOutMs = lastClockOut.details?.clock_out_time || new Date(lastClockOut.created_at).getTime();
              const netMs = Math.max(0, clockOutMs - clockInMs - totalBreakMsForDay);
              dayMins = Math.floor(netMs / 60000);
            } else if (dayDate === todayDateStr) {
              // Still working today: use current time
              const netMs = Math.max(0, Date.now() - clockInMs - totalBreakMsForDay);
              dayMins = Math.floor(netMs / 60000);
            } else if (latestLog.details?.hours_worked) {
              // Past day with no clock-out record: use stored hours as fallback
              const match = latestLog.details.hours_worked.match(/(\d+)h\s*(\d+)m/);
              if (match) {
                dayMins = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
              }
            }

            userTotalMinutes += dayMins;
            const h = Math.floor(dayMins / 60);
            const m = dayMins % 60;

            return {
              dateStr: dayDate,
              dayName: wd.dayName,
              formattedDate: wd.formattedDate,
              status: "Present" as const,
              clockInTime: clockInTimeStr,
              clockOutTime: clockOutTimeStr,
              hoursWorked: `${h}h ${m}m`,
            };
          }

          // C) If day is in the future
          if (dayDate > todayDateStr) {
            return {
              dateStr: dayDate,
              dayName: wd.dayName,
              formattedDate: wd.formattedDate,
              status: "Upcoming" as const,
            };
          }

          // D) Past or today weekday with no clock in and no approved leave
          daysAbsent++;
          return {
            dateStr: dayDate,
            dayName: wd.dayName,
            formattedDate: wd.formattedDate,
            status: "Did Not Clock In" as const,
            hoursWorked: "0h 0m",
          };
        });

        totalOverallHoursMins += userTotalMinutes;
        const totalPastDays = days.filter((d) => d.status !== "Upcoming").length;
        totalPossibleWorkDays += totalPastDays;

        const complianceRate = totalPastDays > 0 ? Math.round(((daysPresent + daysLeave) / totalPastDays) * 100) : 100;
        const totH = Math.floor(userTotalMinutes / 60);
        const totM = userTotalMinutes % 60;

        return {
          userId: p.id,
          name: p.full_name || p.email.split("@")[0].replace(".", " "),
          email: p.email,
          role: p.job_title || "Staff Member",
          department: (p.department || "General").replace(" Team", ""),
          tier: p.role_tier === "intern" ? "Intern" : "Permanent",
          days,
          daysPresent,
          daysLeave,
          daysAbsent,
          totalHoursWorked: `${totH}h ${totM}m`,
          complianceRate,
        };
      });

      const avgAttendanceRate =
        totalPossibleWorkDays > 0
          ? Math.round(((totalActualPresentDays + totalLeaveCount) / totalPossibleWorkDays) * 100)
          : 100;

      const grandH = Math.floor(totalOverallHoursMins / 60);
      const grandM = totalOverallHoursMins % 60;

      return new Response(
        JSON.stringify({
          weekStart: weekStartStr,
          weekEnd: weekEndStr,
          weekLabel,
          schedule: "Monday to Friday, 08:00 – 17:00 (SAST)",
          rows,
          stats: {
            totalStaff: profiles?.length || 0,
            avgAttendanceRate,
            totalHoursLogged: `${grandH}h ${grandM}m`,
            totalLeaveDays: totalLeaveCount,
          },
        }),
        { status: 200, headers }
      );
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers,
    });
  } catch (err: any) {
    console.error("Attendance API handler exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers }
    );
  }
}
