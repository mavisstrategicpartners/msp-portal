import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Banknote, TrendingUp, ArrowLeft, AlertTriangle, BarChart3, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatZAR } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/gm/revenue")({
  head: () => ({ meta: [{ title: "Revenue Performance — GM Command Centre" }] }),
  component: RevenuePerformancePage,
});

function useRevenue() {
  return useQuery({
    queryKey: ["gm-revenue"],
    queryFn: async () => {
      // Try to fetch revenue records, invoices, or financial data
      const results: any = { invoices: [], revenue_targets: [], payments: [] };

      // Same source as the Finance module and the CEO view: agency-fee invoices
      // in finance_invoices (client ad spend is not MSP revenue). No revenue
      // targets are recorded in the portal yet.
      const { data: invoices, error: invErr } = await (supabase as any).from("finance_invoices").select("*");
      if (!invErr && invoices) {
        results.invoices = invoices.map((i: any) => ({ ...i, amount: Number(i.monthlyServiceFeeZar) || 0 }));
        results.payments = results.invoices.filter((i: any) => /paid/i.test(String(i.paymentStatus || "")));
      }

      return results;
    },
    staleTime: 30_000,
  });
}

function useClients() {
  return useQuery({
    queryKey: ["gm-revenue-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) return [];
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

function RevenuePerformancePage() {
  const { data: revenueData, isLoading } = useRevenue();
  const { data: clients = [] } = useClients();

  const invoices = revenueData?.invoices ?? [];
  const targets = revenueData?.revenue_targets ?? [];
  const payments = revenueData?.payments ?? [];

  // Calculate real totals
  const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || inv.total || 0), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const activeClients = clients.length;

  const hasTargets = targets.length > 0;
  const currentTarget = hasTargets ? targets[0] : null;
  const targetAmount = currentTarget?.target_amount || currentTarget?.amount || 0;
  const progressPct = targetAmount > 0 ? Math.min(Math.round((totalPaid / targetAmount) * 100), 100) : 0;

  const hasFinancialData = invoices.length > 0 || payments.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/gm" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to GM Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Revenue Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configured targets, actual revenue, department performance and revenue risks.
        </p>
      </div>

      {!hasFinancialData && !isLoading ? (
        <Card className="p-12 text-center border-border">
          <Banknote className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Revenue Data Not Configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Revenue targets, invoices and payment records have not been configured in the system.
            Once financial records are added, performance tracking will appear here automatically.
          </p>
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 max-w-md mx-auto">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />
              Missing: revenue_targets table, invoices table, or payments table.
              Contact the system administrator to configure financial data sources.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Revenue Target</span>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">
                {hasTargets ? formatZAR(targetAmount, { compact: true }) : "Not Configured"}
              </p>
              {hasTargets && <Progress value={progressPct} className="mt-2 h-1.5" />}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {hasTargets ? `${progressPct}% achieved` : "Set up revenue targets to track progress"}
              </p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Total Invoiced</span>
                <Banknote className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">
                {invoices.length > 0 ? formatZAR(totalInvoiced, { compact: true }) : "R0"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{invoices.length} invoices</p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Total Collected</span>
                <Coins className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {payments.length > 0 ? formatZAR(totalPaid, { compact: true }) : "R0"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{payments.length} payments recorded</p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Outstanding</span>
                <AlertTriangle className={`h-4 w-4 ${totalOutstanding > 0 ? "text-amber-500" : "text-emerald-500"}`} />
              </div>
              <p className={`text-2xl font-bold mt-2 ${totalOutstanding > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                {totalOutstanding > 0 ? formatZAR(totalOutstanding, { compact: true }) : "R0"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{activeClients} active clients</p>
            </Card>
          </div>

          {/* Invoice Table */}
          {invoices.length > 0 && (
            <Card className="p-5 border-border">
              <h3 className="text-base font-bold text-foreground mb-4">Recent Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-2.5">Invoice</th>
                      <th className="p-2.5">Client</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.slice(0, 20).map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="p-2.5 font-bold text-foreground">{inv.invoice_number || inv.id}</td>
                        <td className="p-2.5">{inv.client_name || inv.client_id || "—"}</td>
                        <td className="p-2.5 font-medium">{formatZAR(inv.amount || inv.total || 0)}</td>
                        <td className="p-2.5">{inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-ZA") : "—"}</td>
                        <td className="p-2.5">
                          <Badge variant="outline" className={`text-[10px] ${
                            inv.status === "paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : inv.status === "overdue" ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}>
                            {inv.status || "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
