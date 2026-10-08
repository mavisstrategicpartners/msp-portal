import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboardContainer } from "@/components/dashboards/RoleDashboardContainer";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Operations & Performance Dashboard — MSP Portal" }] }),
  component: Home,
});

function Home() {
  return (
    <div className="space-y-6">
      <RoleDashboardContainer />
    </div>
  );
}