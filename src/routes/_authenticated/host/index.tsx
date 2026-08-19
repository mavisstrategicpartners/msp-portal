import { createFileRoute, redirect } from "@tanstack/react-router";
import { HostPortalEmbedded } from "@/host-portal/EmbeddedApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/host/")({
  ssr: false,
  head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { data: isManager } = await supabase.rpc("is_manager_or_above" as any, {
      _user_id: data.user.id,
    });
    if (!isManager) throw redirect({ to: "/home" });
  },
  component: () => <HostPortalEmbedded initialPath="/host" />,
});