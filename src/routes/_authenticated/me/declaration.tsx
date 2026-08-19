import { createFileRoute } from "@tanstack/react-router";
import { DeclarationPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/me/declaration")({
  head: () => ({ meta: [{ title: "HR Documents — MSP Portal" }] }),
  component: DeclarationPage,
});