import { createFileRoute } from "@tanstack/react-router";
import { GlossaryPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/glossary")({
  head: () => ({ meta: [{ title: "Glossary — MSP Portal" }] }),
  component: GlossaryPage,
});