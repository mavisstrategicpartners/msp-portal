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
      const { data: profile } = await supabase
        .from("profiles")
        .select("department")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.department === "Human Resources") return;
    } catch {}
    if (typeof window !== "undefined" && !["manager", "hr"].includes(localStorage.getItem("msp.selectedPortal") || "")) {
      throw redirect({ to: "/home" });
    }
  },
  component: () => <HostPortalEmbedded initialPath="/host" />,
});