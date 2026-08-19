import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — MSP" }] }),
  component: AdminPortalPlaceholder,
});

function AdminPortalPlaceholder() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold">Admin Portal</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This portal has not been set up yet. Once the Admin experience is added, it will appear here.
      </p>
    </div>
  );
}