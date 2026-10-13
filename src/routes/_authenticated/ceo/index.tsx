import { createFileRoute } from "@tanstack/react-router";
import { CeoDashboard } from "@/components/dashboards/CeoDashboard";

export const Route = createFileRoute("/_authenticated/ceo/")({
  head: () => ({ meta: [{ title: "CEO Command Centre — Executive Dashboard" }] }),
  component: CeoIndexPage,
});

function CeoIndexPage() {
  return (
    <div className="space-y-6">
      <CeoDashboard />
    </div>
  );
}
