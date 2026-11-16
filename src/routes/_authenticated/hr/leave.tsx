import { createFileRoute } from "@tanstack/react-router";
import { HrLeavePage } from "@/components/hr/HrLeave";

export const Route = createFileRoute("/_authenticated/hr/leave")({
  ssr: false,
  head: () => ({ meta: [{ title: "Leave Management — HR Workspace" }] }),
  // Access is enforced by the signed-in layout guard (HR workspace) and by the server API.
  component: HrLeavePage,
});
