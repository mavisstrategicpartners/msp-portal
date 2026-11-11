import { createFileRoute } from "@tanstack/react-router";
import { HrDocumentRequestsPage } from "@/components/hr/HrDocumentRequests";

export const Route = createFileRoute("/_authenticated/hr/document-requests")({
  ssr: false,
  head: () => ({ meta: [{ title: "Document Requests — HR Workspace" }] }),
  // Access is enforced by the signed-in layout guard (HR workspace) and by the server API.
  component: HrDocumentRequestsPage,
});
