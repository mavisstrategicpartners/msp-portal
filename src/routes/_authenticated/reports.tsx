import { createFileRoute } from "@tanstack/react-router";
import { MonthlyReportsPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Monthly Reports — MSP Portal" }] }),
  component: MonthlyReportsPage,
});