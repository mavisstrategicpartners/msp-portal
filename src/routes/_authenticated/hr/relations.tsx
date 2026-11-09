import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import Relations from "@/host-portal/pages/HR/Relations.jsx";

export const Route = createFileRoute("/_authenticated/hr/relations")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Employee Relations — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: RelationsPage,
});

function RelationsPage() {
  return (
    <HRPageWrapper path="/host/hr/relations">
      <Relations />
    </HRPageWrapper>
  );
}
