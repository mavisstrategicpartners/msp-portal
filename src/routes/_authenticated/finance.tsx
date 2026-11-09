import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { resolveSystemRole } from "@/lib/use-profile";
import { FinanceAdminDashboard } from "@/components/dashboards/FinanceAdminDashboard";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance & Administration — MSP Portal" }] }),
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        throw redirect({ to: "/auth" });
      }

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, department, job_title, role_tier, is_active, onboarding_completed, phone, avatar_url")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id),
      ]);

      const systemRole = resolveSystemRole(profile as any, data.user.email, roles ?? []);

      // Only finance_admin, ceo, admin (root), and general_manager may access /finance
      const isAuthorized =
        systemRole === "finance_admin" ||
        systemRole === "ceo" ||
        systemRole === "admin" ||
        systemRole === "general_manager" ||
        profile?.role_tier === "root_admin";

      if (!isAuthorized) {
        throw redirect({ to: "/home" });
      }
    } catch (e: any) {
      // Re-throw redirect errors, catch everything else as unauthorized
      if (e?.to) throw e;
      throw redirect({ to: "/home" });
    }
  },
  component: FinanceAdminDashboard,
});
