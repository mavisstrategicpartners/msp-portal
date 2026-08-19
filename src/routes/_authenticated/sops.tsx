import { createFileRoute } from "@tanstack/react-router";
import { SopsPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/sops")({
  head: () => ({ meta: [{ title: "SOP Library — MSP Portal" }] }),
  component: SopsPage,
});