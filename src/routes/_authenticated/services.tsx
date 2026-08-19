import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({ meta: [{ title: "Services — MSP Portal" }] }),
  component: ServicesPage,
});