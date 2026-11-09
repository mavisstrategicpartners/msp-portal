import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import HRPerformance from "@/host-portal/pages/HR/HRPerformance.jsx";

export const Route = createFileRoute("/_authenticated/hr/performance")({
  ssr: false,
  head: () => ({
    meta: [{ title: "HR Performance — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: PerformancePage,
});

function PerformancePage() {
  return (
    <HRPageWrapper path="/host/hr/performance">
      <HRPerformance />
    </HRPageWrapper>
  );
}
