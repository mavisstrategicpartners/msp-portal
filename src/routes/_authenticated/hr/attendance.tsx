import { createFileRoute } from "@tanstack/react-router";
import { AdminAttendanceCommandCenter } from "@/routes/_authenticated/admin/attendance";

export const Route = createFileRoute("/_authenticated/hr/attendance")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Staff Presence — HR Workspace" },
    ],
  }),
  // Access is enforced by the signed-in layout guard (src/lib/route-access.ts).
  component: AdminAttendanceCommandCenter,
});
