import { createFileRoute } from "@tanstack/react-router";
import { FinanceAdminDashboard } from "@/components/dashboards/FinanceAdminDashboard";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance & Administration — MSP Portal" }] }),
  component: FinanceAdminDashboard,
});
