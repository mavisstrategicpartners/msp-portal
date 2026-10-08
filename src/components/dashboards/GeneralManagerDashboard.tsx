import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Briefcase,
  Layers,
  CheckSquare,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface DepartmentScore {
  department: string;
  targetDeliverables: number;
  actualDelivered: number;
  capacityUtilizationPct: number;
  openBlockers: number;
  status: "On Target" | "At Risk" | "Critical";
}

const DEPARTMENTS_DATA: DepartmentScore[] = [
  { department: "Media Buying", targetDeliverables: 15, actualDelivered: 14, capacityUtilizationPct: 88, openBlockers: 1, status: "At Risk" },
  { department: "Websites & Software", targetDeliverables: 10, actualDelivered: 10, capacityUtilizationPct: 75, openBlockers: 0, status: "On Target" },
  { department: "CRM & AI Automation", targetDeliverables: 12, actualDelivered: 11, capacityUtilizationPct: 82, openBlockers: 1, status: "On Target" },
  { department: "Creative & Content", targetDeliverables: 25, actualDelivered: 24, capacityUtilizationPct: 90, openBlockers: 0, status: "On Target" },
  { department: "SEO & Reporting", targetDeliverables: 8, actualDelivered: 8, capacityUtilizationPct: 65, openBlockers: 0, status: "On Target" },
  { department: "Sales Execution", targetDeliverables: 20, actualDelivered: 18, capacityUtilizationPct: 85, openBlockers: 0, status: "On Target" },
];

export function GeneralManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* ─── Top Execution & Capacity Summary ──────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Overall Execution Rate</span>
            <CheckSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">92.4%</p>
          <Progress value={92.4} className="mt-2 h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1.5">85 of 92 planned deliverables completed</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Company Capacity Load</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">81%</p>
          <Progress value={81} className="mt-2 h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1.5">Healthy workload across 12 specialists</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Revenue Target vs Actual</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">R520k / R600k</p>
          <Progress value={86.6} className="mt-2 h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1.5">86.6% of monthly revenue goal collected</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Cross-Team Dependencies</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">2 Blocked Handoffs</p>
          <p className="text-[11px] text-muted-foreground mt-3">Creative &rarr; Media Buying awaiting approval</p>
        </Card>
      </div>

      {/* ─── Departmental Target vs Actual Comparison Matrix ───────────────── */}
      <Card className="p-5 border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Department Performance & Delivery Scorecard</h3>
            <p className="text-xs text-muted-foreground">Weekly tracking of deliverables, capacity, and active blockers by department.</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Generated weekly snapshot report.")}>
            Generate Snapshot
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Target Work</th>
                <th className="p-2.5">Actual Delivered</th>
                <th className="p-2.5">Capacity Utilization</th>
                <th className="p-2.5">Active Blockers</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DEPARTMENTS_DATA.map((dept) => (
                <tr key={dept.department} className="hover:bg-muted/30">
                  <td className="p-2.5 font-bold text-foreground">{dept.department}</td>
                  <td className="p-2.5 font-medium">{dept.targetDeliverables} items</td>
                  <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{dept.actualDelivered} items</td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8">{dept.capacityUtilizationPct}%</span>
                      <Progress value={dept.capacityUtilizationPct} className="w-20 h-1.5" />
                    </div>
                  </td>
                  <td className="p-2.5">
                    {dept.openBlockers > 0 ? (
                      <span className="font-bold text-amber-600">{dept.openBlockers} Blocker</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        dept.status === "On Target"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}
                    >
                      {dept.status}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => toast.info(`Viewing ${dept.department} workload details.`)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Cross-Department Handoff Chain (Section 12) ───────────────────── */}
      <Card className="p-5 border-border">
        <h3 className="text-base font-bold text-foreground mb-1">Cross-Department Service Handoff Pipeline</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Tracking prerequisite readiness from Sales to Launch to identify cross-functional bottlenecks.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-center text-xs">
          {[
            { stage: "1. Sales Handover", status: "Active", time: "4 Working Hrs SLA", state: "Pass" },
            { stage: "2. Client Intake", status: "Active", time: "18 Working Hrs SLA", state: "Pass" },
            { stage: "3. Strategy & Copy", status: "Active", time: "2 Business Days", state: "Pass" },
            { stage: "4. Creative & Build", status: "Bottleneck", time: "Manager Approval Hold", state: "Delayed" },
            { stage: "5. QA Verification", status: "Queued", time: "Independent Check", state: "Pending" },
            { stage: "6. Live Campaign Launch", status: "Target", time: "2 Business Days", state: "Upcoming" },
          ].map((s) => (
            <div key={s.stage} className={`p-3 rounded-lg border ${s.state === "Delayed" ? "border-rose-500/40 bg-rose-500/[0.05]" : "border-border bg-card"}`}>
              <span className="font-bold block text-foreground">{s.stage}</span>
              <p className="text-[11px] text-muted-foreground mt-1">{s.time}</p>
              <Badge
                variant="outline"
                className={`mt-2 text-[10px] ${
                  s.state === "Delayed"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                    : s.state === "Pass"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.state}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
