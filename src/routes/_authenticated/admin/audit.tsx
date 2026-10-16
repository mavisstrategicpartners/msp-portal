import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { resolveSystemRole } from "@/lib/use-profile";
import { AuditPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — MSP Portal" }] }),
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        throw redirect({ to: "/auth" });
      }

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("department, role_tier, email, job_title")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id),
      ]);

      const systemRole = resolveSystemRole(profile, data.user.email, roles ?? []);
      const isSuperOrAdmin =
        systemRole === "admin" ||
        systemRole === "ceo" ||
        profile?.role_tier === "root_admin" ||
        roles?.some((r: any) => r.role === "admin");

      // Strictly reject Finance & Administration Manager and non-authorized roles
      if (systemRole === "finance_admin") {
        throw redirect({ to: "/finance" });
      }

      if (!isSuperOrAdmin) {
        throw redirect({ to: "/home" });
      }
    } catch (e: any) {
      if (e?.to) throw e;
      throw redirect({ to: "/home" });
    }
  },
  component: AuditPage,
});