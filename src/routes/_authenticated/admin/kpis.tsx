import { createFileRoute } from "@tanstack/react-router";
import { KpisPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/kpis")({
  head: () => ({ meta: [{ title: "KPI Dashboards — MSP Portal" }] }),
  component: KpisPage,
});