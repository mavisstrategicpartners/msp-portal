import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ceo/team")({
  head: () => ({ meta: [{ title: "Team Health — CEO Command Centre" }] }),
  component: TeamHealthPage,
});

function TeamHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Health</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Active workload, performance, and on-time delivery rates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">On-Time Rate</p>
          <p className="text-3xl font-bold text-foreground">94%</p>
          <Badge variant="outline" className="mt-4 bg-primary/10 text-primary border-primary/30">Green &bull; 94% Delivery</Badge>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Active Workload</p>
          <p className="text-3xl font-bold text-foreground">42</p>
        </Card>
        <Card className="p-5 border-border shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Manager Overdue Approvals</p>
          <p className="text-3xl font-bold text-rose-500">1</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold">Team Members</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 rounded-tl-md">Team Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Active Workload</th>
                <th className="p-3">On-Time Delivery Rate</th>
                <th className="p-3 rounded-tr-md">Overdue Approvals/Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> John Smith</td>
                <td className="p-3 text-muted-foreground">Media Buying Lead</td>
                <td className="p-3 font-bold">14 tasks (High)</td>
                <td className="p-3 font-bold text-amber-500">85%</td>
                <td className="p-3 font-bold text-rose-500">1 Overdue Manager Approval</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> Emma Watson</td>
                <td className="p-3 text-muted-foreground">CRM Specialist</td>
                <td className="p-3 font-bold">8 tasks (Optimal)</td>
                <td className="p-3 font-bold text-emerald-500">100%</td>
                <td className="p-3 text-emerald-500">0</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-3 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500"></div> Liam Brown</td>
                <td className="p-3 text-muted-foreground">Account Manager</td>
                <td className="p-3 font-bold">12 clients</td>
                <td className="p-3 font-bold text-amber-500">92%</td>
                <td className="p-3 font-bold text-amber-500">1 Missed Check-in</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
