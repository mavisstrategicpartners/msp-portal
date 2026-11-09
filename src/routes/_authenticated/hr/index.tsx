import { createFileRoute } from "@tanstack/react-router";
import { HRStaffDashboard } from "@/components/dashboards/HRStaffDashboard";

export const Route = createFileRoute("/_authenticated/hr/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "HR Dashboard — MSP Portal" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: HRStaffDashboard,
});
