import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Recruitment from "@/host-portal/pages/HR/Recruitment.jsx";

export const Route = createFileRoute("/_authenticated/hr/recruitment")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Employee Recruitment — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: RecruitmentPage,
});

function RecruitmentPage() {
  return (
    <HRPageWrapper path="/host/hr/recruitment">
      <Recruitment />
    </HRPageWrapper>
  );
}
