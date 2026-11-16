import { createFileRoute } from "@tanstack/react-router";
import { DepartmentStructure } from "@/components/org/DepartmentStructure";

export const Route = createFileRoute("/_authenticated/ceo/structure")({
  head: () => ({ meta: [{ title: "Department Structure — CEO Executive Dashboard" }] }),
  component: () => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Organisation</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Department Structure</h1>
        <p className="text-sm text-muted-foreground">
          Departments, their managers and employees, as recorded in the portal. Task assignment follows this structure.
        </p>
      </div>
      <DepartmentStructure />
    </div>
  ),
});
