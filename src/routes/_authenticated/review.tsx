import { createFileRoute } from "@tanstack/react-router";
import { ReviewPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({ meta: [{ title: "Portal Review — MSP Portal" }] }),
  component: ReviewPage,
});