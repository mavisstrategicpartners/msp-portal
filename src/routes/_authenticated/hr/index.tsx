import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { HRStaffDashboard } from "@/components/dashboards/HRStaffDashboard";

export const Route = createFileRoute("/_authenticated/hr/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "HR Dashboard — MSP Portal" }],
  }),
  beforeLoad: async () => {
    // 1. Check local session storage if available
    if (typeof window !== "undefined") {
      const authUserStr = localStorage.getItem("msp.authenticatedUser");
      if (authUserStr) {
        try {
          const user = JSON.parse(authUserStr);
          const dept = (user?.department || "").toLowerCase();
          const title = (user?.job_title || "").toLowerCase();
          const isHR =
            dept.includes("human resources") ||
            dept.includes("hr") ||
            title.includes("hr") ||
            user?.role_tier === "root_admin";
          if (isHR) return;
        } catch {}
      }
    }

    // 2. Check Supabase auth
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw redirect({ to: "/auth" });

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("department, role_tier, job_title")
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
      const titleLower = (profile?.job_title || "").toLowerCase();
      const isHR =
        deptLower.includes("human resources") ||
        deptLower.includes("hr") ||
        titleLower.includes("hr");

      if (isHR || isAdmin) return;
    } catch (e: any) {
      if (e?.to) throw e;
    }

    throw redirect({ to: "/home" });
  },
  component: HRStaffDashboard,
});
