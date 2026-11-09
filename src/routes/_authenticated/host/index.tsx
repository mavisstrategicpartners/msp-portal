import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/host/")({
  ssr: false,
  beforeLoad: () => {
    // /host only exists for the HR suite; the layout guard sends non-HR users away.
    throw redirect({ to: "/host/hr" as any });
  },
  component: () => null,
});