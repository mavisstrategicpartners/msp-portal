import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Timesheets from "@/host-portal/pages/HR/Timesheets.jsx";

export const Route = createFileRoute("/_authenticated/hr/timesheets")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Timesheets — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: TimesheetsPage,
});

function TimesheetsPage() {
  return (
    <HRPageWrapper path="/host/hr/timesheets">
      <Timesheets />
    </HRPageWrapper>
  );
}
