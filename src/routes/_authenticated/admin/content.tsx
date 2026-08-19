import { createFileRoute } from "@tanstack/react-router";
import { ContentEditorPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Content Editor — MSP Portal" }] }),
  component: ContentEditorPage,
});