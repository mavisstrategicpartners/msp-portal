import { createFileRoute } from "@tanstack/react-router";
import { CeoDashboard } from "@/components/dashboards/CeoDashboard";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ceo")({
  head: () => ({ meta: [{ title: "CEO Command Centre — MSP Portal" }] }),
  component: CeoPage,
});

function CeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">CEO Command Centre</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Executive oversight, escalations, and automated health views.
            </p>
          </div>
        </div>
      </div>
      <CeoDashboard />
    </div>
  );
}
