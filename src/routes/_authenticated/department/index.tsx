import { createFileRoute } from "@tanstack/react-router";
import { DepartmentDashboard } from "@/components/department/DepartmentDashboard";

export const Route = createFileRoute("/_authenticated/department/")({
  head: () => ({ meta: [{ title: "Department Dashboard — MSP" }] }),
  component: DepartmentDashboard,
});
