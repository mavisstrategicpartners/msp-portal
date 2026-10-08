import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const authUserStr = localStorage.getItem("msp.authenticatedUser");
      if (authUserStr) {
        try {
          const user = JSON.parse(authUserStr);
          if (user?.id) {
            return { user };
          }
        } catch (e) {}
      }
    }

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
        if (typeof window !== "undefined") {
          const authUserStr = localStorage.getItem("msp.authenticatedUser");
          if (authUserStr) {
            try {
              const user = JSON.parse(authUserStr);
              if (user?.id) return;
            } catch (e) {}
          }
        }
        
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