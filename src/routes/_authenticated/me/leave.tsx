import { createFileRoute } from "@tanstack/react-router";
import { MyLeavePage } from "@/components/hr/MyLeave";

export const Route = createFileRoute("/_authenticated/me/leave")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Leave — MSP Portal" }] }),
  component: MyLeavePage,
});
