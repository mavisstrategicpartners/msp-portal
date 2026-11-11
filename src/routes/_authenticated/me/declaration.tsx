import { createFileRoute } from "@tanstack/react-router";
import { MyHrDocumentsPage } from "@/components/hr/MyHrDocuments";

// "My HR Documents": only the documents HR has requested from this employee.
export const Route = createFileRoute("/_authenticated/me/declaration")({
  head: () => ({ meta: [{ title: "My HR Documents — MSP Portal" }] }),
  component: MyHrDocumentsPage,
});
