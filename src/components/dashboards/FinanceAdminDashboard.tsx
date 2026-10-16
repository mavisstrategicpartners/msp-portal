import { useState } from "react";
import { formatZAR } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ClientInvoice {
  id: string;
  client: string;
  package: string;
  monthlyServiceFeeZar: number;
  clientMediaSpendZar: number;
  paymentStatus: "Paid & Verified" | "Awaiting Payment" | "Overdue";
  invoiceNumber: string;
  dueDate: string;
}

// Load invoices from Supabase. The table may be empty for a fresh environment.
// The useSupabaseTable hook returns [data, updateData, loading].
import { useSupabaseTable } from "@/lib/useSupabaseTable";

const [invoices, setInvoices, loading] = useSupabaseTable<ClientInvoice>("finance_invoices", []);


export function FinanceAdminDashboard() {
  // invoices, setInvoices, loading are provided by the hook above
  const handleVerifyPayment = (id: string) => {
    // Update the invoice status locally and persist via Supabase
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, paymentStatus: "Paid & Verified" } : inv
      )
    );
    toast.success("Payment verified! Onboarding intake clock is now unlocked.");
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading invoices…</div>;
  }

  return (
    <div className="space-y-6">
      {/* ─── Financial Boundary & Revenue Metrics ───────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Booked Monthly Revenue</span>
          <p className="text-2xl font-bold text-foreground mt-1">{formatZAR(650000)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Total contract value</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Invoiced Agency Fees</span>
          <p className="text-2xl font-bold text-foreground mt-1">{formatZAR(580000)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Excludes client direct ad spend</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Verified Cash Collected</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatZAR(520000)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">89.6% collection rate</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Overdue Receivables</span>
          <p className="text-2xl font-bold text-rose-500 mt-1">{formatZAR(60000)}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">1 invoice awaiting follow-up</p>
        </Card>
      </div>

      {/* ─── Payment Verification Gate & Separation Table ──────────────────── */}
      <Card className="p-5 border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Client Invoicing & Payment Verification Gate</h3>
            <p className="text-xs text-muted-foreground">
              Financial Boundary Rule: Separate service fees from client media spend. Verified payments trigger the Onboarding clock.
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Payment Gate Enforced
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5">Invoice #</th>
                <th className="p-2.5">Client & Package</th>
                <th className="p-2.5">Monthly Agency Fee</th>
                <th className="p-2.5">Client Media Spend</th>
                <th className="p-2.5">Due Date</th>
                <th className="p-2.5">Payment Status</th>
                <th className="p-2.5 text-right">Verification Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="p-2.5 font-mono text-muted-foreground">{inv.invoiceNumber}</td>
                  <td className="p-2.5 font-bold text-foreground">
                    {inv.client}
                    <div className="text-[11px] font-normal text-muted-foreground">{inv.package}</div>
                  </td>
                  <td className="p-2.5 font-bold text-foreground">
                    {formatZAR(inv.monthlyServiceFeeZar)}
                  </td>
                  <td className="p-2.5 text-muted-foreground">
                    {formatZAR(inv.clientMediaSpendZar)}
                  </td>
                  <td className="p-2.5 font-mono text-muted-foreground">{inv.dueDate}</td>
                  <td className="p-2.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        inv.paymentStatus === "Paid & Verified"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}
                    >
                      {inv.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-right">
                    {inv.paymentStatus === "Awaiting Payment" ? (
                      <Button
                        size="sm"
                        className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleVerifyPayment(inv.id)}
                      >
                        <Check className="mr-1 h-3 w-3" /> Verify Payment
                      </Button>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-[11px]">Verified & Unlocked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
