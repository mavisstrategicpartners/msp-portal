import { createFileRoute } from "@tanstack/react-router";
import { RoadmapPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Client Roadmap — MSP Portal" }] }),
  component: RoadmapPage,
});