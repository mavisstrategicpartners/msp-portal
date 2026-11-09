import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { guardRoute } from "@/lib/route-access";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Real Supabase session required; workspace pages also require the right role.
    const { user } = await guardRoute(location.pathname);
    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  useEffect(() => {
    const handlePageShow = async (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) window.location.replace("/auth");
      } catch {
        window.location.replace("/auth");
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}