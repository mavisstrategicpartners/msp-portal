import { createFileRoute, Link } from "@tanstack/react-router";
import { RecordModule } from "@/components/department/RecordModule";
import { typeBySlug } from "@/lib/department-modules";

export const Route = createFileRoute("/_authenticated/work/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${typeBySlug(params.slug)?.label ?? "Department module"} — MSP` }] }),
  component: ModulePage,
});

function ModulePage() {
  const { slug } = Route.useParams();
  const type = typeBySlug(slug);
  if (!type)
    return (
      <div className="p-8 text-sm text-muted-foreground">
        This module does not exist. <Link to="/work" className="text-primary hover:underline">See all department modules</Link>.
      </div>
    );
  return <RecordModule key={type.key} type={type} />;
}
