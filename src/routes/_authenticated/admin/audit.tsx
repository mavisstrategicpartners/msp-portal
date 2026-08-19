import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — MSP Portal" }] }),
  component: AuditPage,
});