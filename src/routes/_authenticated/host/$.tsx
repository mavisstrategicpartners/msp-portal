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
    // Pages that have been rebuilt on the MSP design standard open at their own address, so the
    // older embedded copies (and their old layout) are never shown.
    const rebuilt: Record<string, string> = {
      "/host/hr": "/hr",
      "/host/hr/leave": "/hr/leave",
      "/host/hr/documents": "/hr/documents",
      "/host/hr/attendance": "/hr/attendance",
      "/host/hr/payroll": "/hr/payroll",
      "/host/hr/timesheets": "/hr/timesheets",
      "/host/hr/relations": "/hr/relations",
      "/host/hr/recruitment": "/hr/recruitment",
      "/host/hr/performance": "/hr/performance",
    };
    const target = rebuilt[location.pathname.replace(/\/$/, "")];
    if (target) throw redirect({ to: target as any, replace: true });
  },
  component: HostSplat,
});

function HostSplat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <HostPortalEmbedded key={pathname} initialPath={pathname} />;
}