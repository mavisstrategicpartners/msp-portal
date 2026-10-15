import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminAttendanceCommandCenter } from "@/routes/_authenticated/admin/attendance";

export const Route = createFileRoute("/_authenticated/hr/attendance")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Staff Presence — HR Workspace" },
    ],
  }),
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw redirect({ to: "/auth" });

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("department, role_tier")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id),
      ]);

      const isAdmin =
        roles?.some((r: any) => r.role === "admin") ||
        profile?.role_tier === "root_admin";
      const deptLower = (profile?.department || "").toLowerCase();
      const isHR =
        deptLower.includes("human resources") || deptLower.includes("hr");

      if (isHR || isAdmin) return;
    } catch (e: any) {
      if (e?.to) throw e;
    }

    throw redirect({ to: "/home" });
  },
  component: AdminAttendanceCommandCenter,
});
