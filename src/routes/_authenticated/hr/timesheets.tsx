import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Timesheets from "@/host-portal/pages/HR/Timesheets.jsx";

export const Route = createFileRoute("/_authenticated/hr/timesheets")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Timesheets — HR Workspace" }],
  }),
  beforeLoad: async () => {
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
  component: TimesheetsPage,
});

function TimesheetsPage() {
  return (
    <HRPageWrapper path="/host/hr/timesheets">
      <Timesheets />
    </HRPageWrapper>
  );
}
