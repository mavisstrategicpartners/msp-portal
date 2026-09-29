import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const logAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        state: z.enum(["Clocked In", "On Break", "Clocked Out"]),
        clockInTime: z.number().nullable().optional(),
        breakStartTime: z.number().nullable().optional(),
        totalBreakMs: z.number().optional(),
        hoursWorked: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Persist real attendance event in Supabase audit_logs
    const { error: logErr } = await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: context.userId,
      action: `attendance_${data.state.toLowerCase().replace(/\s+/g, "_")}`,
      details: {
        state: data.state,
        clock_in_time: data.clockInTime,
        break_start_time: data.breakStartTime,
        total_break_ms: data.totalBreakMs,
        hours_worked: data.hoursWorked,
        updated_at: new Date().toISOString(),
      },
    });

    if (logErr) {
      console.warn("Failed to write attendance log to Supabase:", logErr);
    }

    if (data.state === "Clocked In") {
      await (supabaseAdmin as any)
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", context.userId);
    }

    return { success: true };
  });

export const getStaffAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch all real company profiles from Supabase
    const { data: profiles, error: pErr } = await (supabaseAdmin as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (pErr) throw pErr;

    // Fetch today's attendance logs from Supabase
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: logs, error: lErr } = await (supabaseAdmin as any)
      .from("audit_logs")
      .select("*")
      .gte("created_at", startOfDay.toISOString())
      .like("action", "attendance_%")
      .order("created_at", { ascending: true });

    if (lErr) console.warn("Failed to query attendance audit logs:", lErr);

    const userStatusMap = new Map<string, any>();
    (logs || []).forEach((log: any) => {
      if (log.actor_id) {
        userStatusMap.set(log.actor_id, log.details);
      }
    });

    return (profiles || []).map((p: any) => {
      const live = userStatusMap.get(p.id);
      return {
        id: p.id,
        name: p.full_name || p.email.split("@")[0].replace(".", " "),
        email: p.email,
        role: p.job_title || "Staff Member",
        department: p.department || "General",
        status: live?.state || "Clocked Out",
        time: live?.clock_in_time
          ? new Date(live.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-",
        hours: live?.hours_worked || "0h 0m",
        avatar: p.avatar_url,
      };
    });
  });

export const getMyAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: logs, error } = await (supabaseAdmin as any)
      .from("audit_logs")
      .select("*")
      .eq("actor_id", context.userId)
      .gte("created_at", startOfDay.toISOString())
      .like("action", "attendance_%")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !logs || logs.length === 0) {
      return null;
    }

    return logs[0].details;
  });
