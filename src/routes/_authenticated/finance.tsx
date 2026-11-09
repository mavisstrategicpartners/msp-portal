import { createFileRoute } from "@tanstack/react-router";
import { FinanceAdminDashboard } from "@/components/dashboards/FinanceAdminDashboard";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance & Administration — MSP Portal" }] }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: FinanceAdminDashboard,
});
