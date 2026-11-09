import { createFileRoute } from "@tanstack/react-router";
import { HRPageWrapper } from "@/components/HRPageWrapper";
import HRDocuments from "@/host-portal/pages/HR/Documents.jsx";

export const Route = createFileRoute("/_authenticated/hr/documents")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Employee Documents — HR Workspace" }],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <HRPageWrapper path="/host/hr/documents">
      <HRDocuments />
    </HRPageWrapper>
  );
}
