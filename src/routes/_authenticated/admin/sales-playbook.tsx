import { createFileRoute } from "@tanstack/react-router";
import { SalesPlaybookPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/sales-playbook")({
  head: () => ({ meta: [{ title: "Sales Playbook — MSP Portal" }] }),
  component: SalesPlaybookPage,
});