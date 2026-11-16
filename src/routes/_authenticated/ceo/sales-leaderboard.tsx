import { createFileRoute, redirect } from "@tanstack/react-router";

/** The leaderboard now lives on the CEO Sales Arena dashboard (same CEO-only rule). */
export const Route = createFileRoute("/_authenticated/ceo/sales-leaderboard")({
  beforeLoad: () => {
    throw redirect({ to: "/ceo/sales-arena" as any, replace: true });
  },
});
