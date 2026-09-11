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
      const demoUser = localStorage.getItem("msp.demoUser");
      if (demoUser) {
        try {
          return { user: JSON.parse(demoUser) };
        } catch {}
      }
    }

    throw redirect({ to: "/auth" });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  // The embedded Host / HR portal owns its own sidebar + top bar,
  // so render it edge-to-edge without the MSP shell wrapper.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/host") || pathname.startsWith("/hr")) {
    return <Outlet />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}