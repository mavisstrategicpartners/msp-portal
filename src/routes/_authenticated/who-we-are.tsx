import { createFileRoute } from "@tanstack/react-router";
import { WhoWeArePage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/who-we-are")({
  head: () => ({ meta: [{ title: "Who We Are — MSP Portal" }] }),
  component: WhoWeArePage,
});