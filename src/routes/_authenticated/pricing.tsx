import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({ meta: [{ title: "Pricing — MSP Portal" }] }),
  component: PricingPage,
});