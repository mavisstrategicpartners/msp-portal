import { createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { HostPortalEmbedded } from "@/host-portal/EmbeddedApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/host/$")({
  ssr: false,
  head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw redirect({ to: "/auth" });

      const [{ data: isManager }, { data: profile }, { data: roles }] = await Promise.all([
        supabase.rpc("is_manager_or_above" as any, { _user_id: data.user.id }).catch(() => ({ data: false })),
        supabase.from("profiles").select("department, role_tier").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", data.user.id),
      ]);

      const isAdmin = roles?.some((r) => r.role === "admin") || profile?.role_tier === "root_admin";
      const isHR = profile?.department === "Human Resources";
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
  // Use full pathname from router state for a reliable, unique key on every navigation
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Strip the /host/ prefix to get the internal path for the embedded MemoryRouter
  const internal = pathname.replace(/^\/host\/?/, "");
  // HR paths go to /hr/*, everything else goes to /host/*
  const initialPath = internal.startsWith("hr") ? "/" + internal : "/host/" + (internal || "");
  // key={pathname} guarantees React unmounts and remounts the MemoryRouter on every click
  return <HostPortalEmbedded key={pathname} initialPath={initialPath} />;
}