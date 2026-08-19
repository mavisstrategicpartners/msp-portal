import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/portal-pages";

export const Route = createFileRoute("/_authenticated/me/profile")({
  head: () => ({ meta: [{ title: "My Profile — MSP Portal" }] }),
  component: ProfilePage,
});