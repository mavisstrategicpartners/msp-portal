import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — MSP Portal" }] }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: AuditPage,
});