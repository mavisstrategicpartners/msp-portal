import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user };
      }
    } catch (err) {
      console.warn("Supabase auth check error:", err);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("msp.demoUser");
    }

    throw redirect({ to: "/auth", replace: true });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  useEffect(() => {
    const handlePageShow = async (event: PageTransitionEvent) => {
      if (event.persisted) {
        try {
          const { data } = await supabase.auth.getUser();
          if (!data?.user) {
            window.location.replace("/auth");
          }
        } catch {
          window.location.replace("/auth");
        }
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