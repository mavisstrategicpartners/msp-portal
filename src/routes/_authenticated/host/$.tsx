import { createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { HostPortalEmbedded } from "@/host-portal/EmbeddedApp";

export const Route = createFileRoute("/_authenticated/host/$")({
  ssr: false,
  head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
  beforeLoad: async ({ location }) => {
    // Only HR sub-routes (/host/hr/*) are supported; Host Operations is removed.
    // Role access (HR + admins) is enforced by the signed-in layout guard.
    if (!location.pathname.startsWith("/host/hr")) {
      throw redirect({ to: "/home" });
    }
  },
  component: HostSplat,
});

function HostSplat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <HostPortalEmbedded key={pathname} initialPath={pathname} />;
}