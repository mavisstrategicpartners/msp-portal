import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
        hoursWorked,
      } = body;

      if (!userId || !state) {
        return new Response(JSON.stringify({ error: "Missing userId or state" }), {
          status: 400,
          headers,
        });
      }

      // Persist in audit_logs with service_role key (bypasses RLS)
      const actionKey = `attendance_${state.toLowerCase().replace(/\s+/g, "_")}`;
      const logDetails = {
        state,
        clock_in_time: clockInTime || null,
        break_start_time: breakStartTime || null,
        total_break_ms: totalBreakMs || 0,
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

      // Check if this log was from today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
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

      // Query today's attendance logs
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

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

      // For any user who didn't clock in TODAY, check if they had an unclosed "Clocked In" or "On Break" session
      // (ensuring: "even if they signout from the system without clocking out thier time should contiue calculating")
      const missingUserIds = (profiles || [])
        .map((p: any) => p.id)
        .filter((id: string) => !statusMap.has(id));

      if (missingUserIds.length > 0) {
        const { data: pastLogs } = await (supabaseAdmin as any)
          .from("audit_logs")
          .select("actor_id, details, created_at")
          .in("actor_id", missingUserIds)
          .like("action", "attendance_%")
          .order("created_at", { ascending: false });

        (pastLogs || []).forEach((log: any) => {
          if (log.actor_id && !statusMap.has(log.actor_id)) {
            if (
              log.details?.state === "Clocked In" ||
              log.details?.state === "On Break"
            ) {
              statusMap.set(log.actor_id, {
                ...log.details,
                created_at: log.created_at,
              });
            }
          }
        });
      }

      const now = Date.now();
      const staff = (profiles || []).map((p: any) => {
        const live = statusMap.get(p.id);
        const state: "Clocked In" | "On Break" | "Clocked Out" =
          live?.state || "Clocked Out";
        const clockInTime = live?.clock_in_time || null;
        const breakStartTime = live?.break_start_time || null;
        const totalBreakMs = live?.total_break_ms || 0;

        let timeStr = "—";
        let hoursWorkedStr = "0h 0m";
        let elapsedMinutes = 0;

        if (clockInTime && state !== "Clocked Out") {
          timeStr = new Date(clockInTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          let elapsedMs = now - clockInTime - totalBreakMs;
          if (state === "On Break" && breakStartTime) {
            elapsedMs -= now - breakStartTime;
          }
          elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
          const h = Math.floor(elapsedMinutes / 60);
          const m = elapsedMinutes % 60;
          hoursWorkedStr = `${h}h ${m}m`;
        } else if (state === "Clocked Out" && live?.hours_worked) {
          hoursWorkedStr = live.hours_worked;
          if (clockInTime) {
            timeStr = new Date(clockInTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
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
          time: timeStr,
          hours: hoursWorkedStr,
          elapsedMinutes,
          currentProject: "MSP Operations",
        };
      });

      return new Response(JSON.stringify({ staff, now }), {
        status: 200,
        headers,
      });
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
