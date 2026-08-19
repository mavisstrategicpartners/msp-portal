import { createFileRoute } from "@tanstack/react-router";
import { DepartmentsPage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({ meta: [{ title: "Departments — MSP Portal" }] }),
  component: DepartmentsPage,
});
