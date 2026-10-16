import { createFileRoute } from "@tanstack/react-router";
import { SalesDashboard } from "@/components/dashboards/SalesDashboard";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "Sales Dashboard — MSP Portal" }] }),
  component: SalesDashboard,
});
