import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Leave from "@/host-portal/pages/HR/Leave.jsx";

export const Route = createFileRoute("/_authenticated/hr/leave")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Leave Management — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: LeavePage,
});

function LeavePage() {
  return (
    <HRPageWrapper path="/host/hr/leave">
      <Leave />
    </HRPageWrapper>
  );
}
