import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/clients")({
  head: () => ({ meta: [{ title: "Client Health — CEO Command Centre" }] }),
  component: ClientHealthPage,
});

function ClientHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Health</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Client satisfaction, onboarding risks, and account health.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-border shadow-sm flex flex-col justify-center items-center gap-3">
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-500">12</p>
              <p className="text-xs uppercase font-semibold text-muted-foreground mt-1">Green</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">3</p>
              <p className="text-xs uppercase font-semibold text-muted-foreground mt-1">Amber</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-500">1</p>
              <p className="text-xs uppercase font-semibold text-muted-foreground mt-1">Red</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30">Red &bull; Client Alpha Breach</Badge>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Onboarding Late</p>
          <p className="text-3xl font-bold text-rose-500">1</p>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Renewal Risks</p>
          <p className="text-3xl font-bold text-amber-500">1</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold">Client Records</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 rounded-tl-md">Client</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Factor</th>
                <th className="p-3">Latest CRM Feedback</th>
                <th className="p-3 rounded-tr-md">Account Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> Client Alpha</td>
                <td className="p-3"><Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-xs">Red (At Risk)</Badge></td>
                <td className="p-3 font-bold text-rose-500">Delivery Delay Breach</td>
                <td className="p-3 text-muted-foreground italic">"Where is the launch?"</td>
                <td className="p-3">Sarah Jenkins</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500"></div> Nexus Retail</td>
                <td className="p-3"><Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">Amber (Warning)</Badge></td>
                <td className="p-3 font-bold text-amber-500">Missed Check-in</td>
                <td className="p-3 text-muted-foreground italic">No contact for 14 days</td>
                <td className="p-3">David Cole</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> Apex Solar SA</td>
                <td className="p-3"><Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">Green (Healthy)</Badge></td>
                <td className="p-3 font-bold text-emerald-500">None</td>
                <td className="p-3 text-muted-foreground italic">"Happy with the CRM so far"</td>
                <td className="p-3">Sarah Jenkins</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
