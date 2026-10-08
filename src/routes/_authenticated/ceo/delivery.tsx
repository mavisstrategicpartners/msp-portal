import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, XCircle, Clock, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/delivery")({
  head: () => ({ meta: [{ title: "Delivery Health — CEO Command Centre" }] }),
  component: DeliveryHealthPage,
});

function DeliveryHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Health</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Due dates, blocked work, and QA verification.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Due Today</p>
          <p className="text-3xl font-bold text-foreground">8</p>
          <Badge variant="outline" className="mt-4 bg-amber-500/10 text-amber-600 border-amber-500/30">Amber &bull; Approval Backlog</Badge>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overdue Milestones</p>
          <p className="text-3xl font-bold text-rose-500">2</p>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Blocked Work</p>
          <p className="text-3xl font-bold text-amber-500">2</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold">Delivery Workflows</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 rounded-tl-md">Service Workflow</th>
                <th className="p-3">Task / Milestone</th>
                <th className="p-3">Status</th>
                <th className="p-3">QA Verified</th>
                <th className="p-3 rounded-tr-md">Task Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> Meta Ads (Client Alpha)</td>
                <td className="p-3 font-semibold">Live Campaign Launch</td>
                <td className="p-3"><Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-xs">Blocked - Overdue</Badge></td>
                <td className="p-3"><XCircle className="h-4 w-4 text-rose-500" /></td>
                <td className="p-3">Media Buying Lead</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500"></div> SEO (TechNova)</td>
                <td className="p-3 font-semibold">Audit Report</td>
                <td className="p-3"><Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">Pending QA Verification</Badge></td>
                <td className="p-3"><Clock className="h-4 w-4 text-amber-500" /></td>
                <td className="p-3">SEO Specialist</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> Web Dev (Apex Solar)</td>
                <td className="p-3 font-semibold">Wireframes Approval</td>
                <td className="p-3"><Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">Completed</Badge></td>
                <td className="p-3"><Check className="h-4 w-4 text-emerald-500" /></td>
                <td className="p-3">UX Designer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
