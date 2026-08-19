import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({ meta: [{ title: "Team Management — MSP Portal" }] }),
  component: TeamPage,
});