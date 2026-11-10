import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Layers } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";
import { DEDICATED_WORKSPACES, RECORD_TYPES } from "@/lib/department-modules";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/_authenticated/work/")({
  head: () => ({ meta: [{ title: "Department modules — MSP" }] }),
  component: ModulesDirectory,
});

/** Every department's management modules. Company-wide roles see all; others see their own. */
function ModulesDirectory() {
  const { data } = useProfile();
  const companyWide = Boolean(data?.isAdmin || data?.isCEO || data?.systemRole === "general_manager");
  const mine = new Set<string>([...(data?.leadDepartments ?? []), ...(data?.departmentKey ? [data.departmentKey] : [])]);
  const depts = DEPARTMENTS.filter((d) => companyWide || mine.has(d.key));
  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Department modules</h1>
        <p className="text-sm text-muted-foreground">
          The tools each department uses to run its work, alongside tasks. Records are kept per department and start empty.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {depts.map((d) => {
          const types = RECORD_TYPES.filter((t) => t.department === d.key);
          const dedicated = DEDICATED_WORKSPACES[d.key] ?? [];
          return (
            <section key={d.key} className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">{d.name}</h2>
              <ul className="mt-2 space-y-1.5">
                {types.map((t) => (
                  <li key={t.key}>
                    <Link to={`/work/${t.slug}` as any} className="flex items-start gap-2 text-xs hover:text-primary">
                      <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="font-medium text-foreground">{t.label}</span>
                        <span className="block text-[11px] text-muted-foreground">{t.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                {dedicated.map((w) => (
                  <li key={w.to}>
                    <Link to={w.to as any} className="flex items-center gap-2 text-xs hover:text-primary">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-foreground">{w.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {!depts.length && <p className="text-sm text-muted-foreground">You are not placed in a department yet.</p>}
      <p className="text-xs text-muted-foreground">
        Anyone at MSP can log an IT problem on <Link to={"/work/it-support" as any} className="text-primary hover:underline">IT Support Requests</Link>.
      </p>
    </div>
  );
}
