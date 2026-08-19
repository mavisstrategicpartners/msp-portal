import { createFileRoute } from "@tanstack/react-router";
import { ToolsPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "Tools — MSP Portal" }] }),
  component: ToolsPage,
});