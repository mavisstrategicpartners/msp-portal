import { createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { HostPortalEmbedded } from "@/host-portal/EmbeddedApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/host/$")({
  ssr: false,
  head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
  beforeLoad: async ({ location }) => {
    // Only HR sub-routes (/host/hr/*) are supported; Host Operations is removed
    if (!location.pathname.startsWith("/host/hr")) {
      throw redirect({ to: "/home" });
    }

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw redirect({ to: "/auth" });

      const [{ data: isManager }, { data: profile }, { data: roles }] = await Promise.all([
        Promise.resolve(supabase.rpc("is_manager_or_above" as any, { _user_id: data.user.id })).catch(() => ({ data: false })),
        supabase.from("profiles").select("department, role_tier").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", data.user.id),
      ]);

      const isAdmin = roles?.some((r: any) => r.role === "admin") || profile?.role_tier === "root_admin";
      const deptLower = (profile?.department || "").toLowerCase();
      const isHR = deptLower.includes("human resources") || deptLower.includes("hr") || isAdmin;
      const isManagerOrAbove = isManager || profile?.role_tier === "manager" || isAdmin;

      if (isManagerOrAbove || isHR) return;
    } catch (e: any) {
      if (e?.to) throw e;
    }

    throw redirect({ to: "/home" });
  },
  component: HostSplat,
});

function HostSplat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <HostPortalEmbedded key={pathname} initialPath={pathname} />;
}