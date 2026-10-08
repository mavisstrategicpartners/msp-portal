import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/sales")({
  head: () => ({ meta: [{ title: "Sales Health — CEO Command Centre" }] }),
  component: SalesHealthPage,
});

function SalesHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Health</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sales pipeline, verified wins, and lead management.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Verified Won</p>
          <p className="text-3xl font-bold text-foreground">R185k</p>
          <Badge variant="outline" className="mt-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Green &bull; On Target</Badge>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">New Leads</p>
          <p className="text-3xl font-bold text-foreground">14</p>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Consultations</p>
          <p className="text-3xl font-bold text-foreground">8</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold">Pipeline & Records</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 rounded-tl-md">Lead / Client</th>
                <th className="p-3">Status</th>
                <th className="p-3">Value</th>
                <th className="p-3">Last Contact</th>
                <th className="p-3 rounded-tr-md">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500"></div> Omega Corp</td>
                <td className="p-3"><Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">Overdue Follow-up</Badge></td>
                <td className="p-3 font-bold">R45,000</td>
                <td className="p-3 text-muted-foreground">3 days ago</td>
                <td className="p-3">Call to discuss proposal</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> TechNova</td>
                <td className="p-3"><Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">Won</Badge></td>
                <td className="p-3 font-bold">R140,000</td>
                <td className="p-3 text-muted-foreground">Today</td>
                <td className="p-3">Handover to Operations</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> Global Logistics</td>
                <td className="p-3"><Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-xs">Unanswered</Badge></td>
                <td className="p-3 font-bold text-muted-foreground">Unknown</td>
                <td className="p-3 text-muted-foreground">Never</td>
                <td className="p-3 text-rose-500 font-medium">Initial Contact Required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
