import { createFileRoute } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/revenue")({
  head: () => ({ meta: [{ title: "Revenue Health — CEO Command Centre" }] }),
  component: RevenueHealthPage,
});

function RevenueHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue Health</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Cash collected, booked revenue, and overdue debt.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cash Collected</p>
          <p className="text-3xl font-bold text-foreground">R520k</p>
          <Badge variant="outline" className="mt-4 bg-primary/10 text-primary border-primary/30">Green &bull; Healthy Margin</Badge>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Booked Revenue</p>
          <p className="text-3xl font-bold text-foreground">R650k</p>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overdue Debt</p>
          <p className="text-3xl font-bold text-rose-500">R60k</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold">Invoice Records</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 rounded-tl-md">Client</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 rounded-tr-md">Escalation / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> Client Alpha</td>
                <td className="p-3 font-mono text-muted-foreground">INV-2026-089</td>
                <td className="p-3"><Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-xs">Overdue</Badge></td>
                <td className="p-3 font-bold">R60,000</td>
                <td className="p-3 text-rose-500">2026-09-30</td>
                <td className="p-3 font-medium text-rose-500">Finance Follow-up (Auto)</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> Apex Solar SA</td>
                <td className="p-3 font-mono text-muted-foreground">INV-2026-092</td>
                <td className="p-3"><Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">Paid</Badge></td>
                <td className="p-3 font-bold">R120,000</td>
                <td className="p-3 text-muted-foreground">2026-10-05</td>
                <td className="p-3 text-muted-foreground">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
