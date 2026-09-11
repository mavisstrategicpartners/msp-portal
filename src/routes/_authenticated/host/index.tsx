import { createFileRoute, redirect } from "@tanstack/react-router";
import { HostPortalEmbedded } from "@/host-portal/EmbeddedApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/host/")({
  ssr: false,
  head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const selected = localStorage.getItem("msp.selectedPortal");
      if (selected === "manager" || selected === "admin") return;
    }
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      const { data: isManager } = await supabase.rpc("is_manager_or_above" as any, {
        _user_id: data.user.id,
      });
      if (isManager) return;
    } catch {}
    if (typeof window !== "undefined" && localStorage.getItem("msp.selectedPortal") !== "manager") {
      throw redirect({ to: "/home" });
    }
  },
  component: () => <HostPortalEmbedded initialPath="/host" />,
});