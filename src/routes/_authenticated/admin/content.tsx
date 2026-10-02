import { createFileRoute } from "@tanstack/react-router";
import { ContentEditor } from "@/components/ContentEditor";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Content Editor — MSP Portal" }] }),
  component: ContentEditor,
});