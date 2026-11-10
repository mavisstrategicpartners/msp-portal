import { createFileRoute } from "@tanstack/react-router";
import { DepartmentStructure } from "@/components/org/DepartmentStructure";

export const Route = createFileRoute("/_authenticated/admin/structure")({
  head: () => ({ meta: [{ title: "Department Structure — Administration" }] }),
  component: () => (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Department Structure</h1>
        <p className="text-sm text-muted-foreground">
          Departments, their managers and employees, as recorded in the portal. Task assignment follows this structure.
        </p>
      </div>
      <DepartmentStructure />
    </div>
  ),
});
