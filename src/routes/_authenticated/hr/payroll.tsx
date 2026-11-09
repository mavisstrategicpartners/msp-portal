import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Payroll from "@/host-portal/pages/HR/Payroll.jsx";

export const Route = createFileRoute("/_authenticated/hr/payroll")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Payroll Platform — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: PayrollPage,
});

function PayrollPage() {
  return (
    <HRPageWrapper path="/host/hr/payroll">
      <Payroll />
    </HRPageWrapper>
  );
}
