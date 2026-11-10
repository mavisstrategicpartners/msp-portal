import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CeoDashboard } from "@/components/dashboards/CeoDashboard";

export const Route = createFileRoute("/_authenticated/ceo/")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({ meta: [{ title: "Executive Dashboard — MSP Portal" }] }),
  component: CeoIndexPage,
});

function CeoIndexPage() {
  const { tab } = Route.useSearch();
  return <CeoDashboard focus={tab} />;
}
