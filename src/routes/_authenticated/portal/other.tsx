import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/other")({
  head: () => ({ meta: [{ title: "Contractor Portal — MSP" }] }),
  component: OtherPortalPlaceholder,
});

function OtherPortalPlaceholder() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold">Contractor / Other Portal</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This portal has not been set up yet. Once its experience is added, it will appear here.
      </p>
    </div>
  );
}