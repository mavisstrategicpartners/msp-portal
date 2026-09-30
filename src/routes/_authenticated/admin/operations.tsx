import { createFileRoute } from "@tanstack/react-router";
import { OperationsControlCenter } from "@/components/operations/OperationsControlCenter";

export const Route = createFileRoute("/_authenticated/admin/operations")({
  head: () => ({ meta: [{ title: "Operations Control Centre — MSP Operations" }] }),
  component: OperationsControlCenter,
});
