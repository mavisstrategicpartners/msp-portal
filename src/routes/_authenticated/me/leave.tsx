import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/me/leave")({
  head: () => ({ meta: [{ title: "Leave Requests — MSP Portal" }] }),
  component: LeavePage,
});