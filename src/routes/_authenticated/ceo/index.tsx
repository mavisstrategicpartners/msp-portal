import { createFileRoute } from "@tanstack/react-router";
import { CeoDashboard } from "@/components/dashboards/CeoDashboard";
import { Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/")({
  head: () => ({ meta: [{ title: "CEO Command Centre — Executive Dashboard" }] }),
  component: CeoIndexPage,
});

function CeoIndexPage() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-5 rounded-xl border border-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{greeting}, CEO</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{dateStr}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 flex items-center gap-1.5 py-1.5 px-3">
          <Zap className="h-3 w-3" /> Command Centre · Live
        </Badge>
      </div>
      <CeoDashboard />
    </div>
  );
}
