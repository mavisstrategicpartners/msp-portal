import { createFileRoute } from "@tanstack/react-router";
import { EmployeeFoldersPage } from "@/components/hr/EmployeeFolders";

export const Route = createFileRoute("/_authenticated/hr/documents")({
  ssr: false,
  head: () => ({ meta: [{ title: "Employee Folders — HR Workspace" }] }),
  // Access is enforced by the signed-in layout guard (HR workspace) and by the server API.
  component: EmployeeFoldersPage,
});
