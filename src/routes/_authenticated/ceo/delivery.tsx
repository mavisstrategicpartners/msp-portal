import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Layers,
  XCircle,
  Timer,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/ceo/delivery")({
  head: () => ({ meta: [{ title: "Delivery Health — CEO Command Centre" }] }),
  component: DeliveryHealthPage,
});

interface DeliveryWorkflow {
  id: string;
  client: string;
  service: string;
  milestone: string;
  department: string;
  taskOwner: string;
  deadline: string;
  hoursLate: number;
  qaVerified: boolean;
  status: "completed" | "on_track" | "pending_qa" | "blocked_overdue";
  blockerDetail: string;
  nextStep: string;
}

const DELIVERY_WORKFLOWS: DeliveryWorkflow[] = [];

const THROUGHPUT_DATA = [
  { day: "Mon", Completed: 0, Delayed: 0 },
  { day: "Tue", Completed: 0, Delayed: 0 },
  { day: "Wed", Completed: 0, Delayed: 0 },
  { day: "Thu (Today)", Completed: 0, Delayed: 0 },
  { day: "Fri (Proj)", Completed: 0, Delayed: 0 },
];

const DEPARTMENT_SLA_DATA = [
  { department: "Media Buying", sla: 100 },
  { department: "Tech Delivery", sla: 100 },
  { department: "Web Design", sla: 100 },
  { department: "SEO & Copy", sla: 100 },
  { department: "Operations", sla: 100 },
];

function DeliveryHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<DeliveryWorkflow | null>(null);

  const filteredWorkflows = DELIVERY_WORKFLOWS.filter((wf) => {
    const matchesSearch =
      wf.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wf.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wf.taskOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wf.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return wf.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/ceo" className="hover:text-foreground inline-flex items-center gap-1 font-medium text-[#3b1d4d] dark:text-primary">
          <ArrowLeft className="h-3 w-3" /> Executive Command Centre
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Delivery Health & SLAs</span>
      </div>

      {/* ─── Executive Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <CheckSquare className="h-3.5 w-3.5" /> Operations Telemetry
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                SLA Compliance: 100.0%
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Delivery Health & Milestone SLAs
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time monitoring of client deliverable deadlines, quality assurance verification, and operational bottleneck resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Task deadlines re-calculated across all active projects.")}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-sync Milestones
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Delivery SLA log exported to CSV.")}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export SLA Log
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">On-Time SLA</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Nominal
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">100.0%</span>
            <span className="text-xs text-muted-foreground">Target: 95%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> 100% On-Time SLA
            </span>
            <span className="text-muted-foreground">0 Overdue</span>
          </div>
          <Progress value={100} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Due Today</span>
            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
              0 Deliverables
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">0 Tasks</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" /> 0 Delivered
            </span>
            <span className="text-muted-foreground">0 On Track · 0 At Risk</span>
          </div>
          <Progress value={0} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Overdue Milestones</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Clear
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">0 Items</span>
            <span className="text-xs text-muted-foreground">Late</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> 0h Late
            </span>
            <span className="text-muted-foreground">No Overdue Tasks</span>
          </div>
          <Progress value={0} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">QA Verification Queue</span>
            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
              Empty
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">0 Items</span>
            <span className="text-xs text-muted-foreground">Pending Review</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" /> Avg 0.0h TAT
            </span>
            <span className="text-muted-foreground">No Items Pending</span>
          </div>
          <Progress value={0} className="mt-2.5 h-1.5 bg-muted" />
        </Card>
      </div>

      {/* ─── Delivery Charts Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Throughput (2 Cols) */}
        <Card className="border-border p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Weekly Deliverable Throughput (Completed vs Delayed)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily volume of client milestone submissions.</p>
            </div>
            <Badge variant="outline" className="text-xs">Week 41 (Oct 2026)</Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={THROUGHPUT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Completed" fill="#3b1d4d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Delayed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: SLA by Department (1 Col) */}
        <Card className="border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Department SLA Compliance</h3>
              <Badge variant="outline" className="text-xs">Benchmark: 95%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Real-time delivery SLA compliance by division.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_SLA_DATA} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="sla" fill="#3b1d4d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">System Status:</span>
            <p className="text-foreground text-[11px] leading-relaxed">
              All departments operating at 100% SLA. No overdue deliverables or operational bottlenecks reported.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Interactive Delivery Workflows Table ─────────────────────────── */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Live Service Delivery Workflows
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every service deliverable with SLA deadline, QA audit status, and assigned owner.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter client, milestone, owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background w-full sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({DELIVERY_WORKFLOWS.length})
                </button>
                <button
                  onClick={() => setStatusFilter("blocked_overdue")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "blocked_overdue" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Blocked
                </button>
                <button
                  onClick={() => setStatusFilter("pending_qa")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "pending_qa" ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  QA Pending
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    statusFilter === "completed" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Client & Service</th>
                <th className="p-3.5">Milestone / Deliverable</th>
                <th className="p-3.5">Department & Owner</th>
                <th className="p-3.5">SLA Deadline</th>
                <th className="p-3.5 text-center">QA Audit</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#3b1d4d] dark:text-primary" />
                    <p className="font-semibold text-foreground text-sm">No tasks have been assigned yet.</p>
                    <p className="mt-1">Tasks assigned to employees will appear here. No upcoming deadlines.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((wf) => (
                  <tr
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5">
                      <strong className="text-sm text-foreground block">{wf.client}</strong>
                      <span className="text-muted-foreground text-[11px]">{wf.service}</span>
                    </td>
                    <td className="p-3.5 font-medium text-foreground max-w-[220px]">
                      {wf.milestone}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">{wf.taskOwner}</span>
                      <span className="block text-[10px] text-muted-foreground">{wf.department}</span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={wf.status === "blocked_overdue" ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground font-medium"}>
                        {wf.deadline}
                      </span>
                      {wf.hoursLate > 0 && (
                        <span className="block text-[10px] text-rose-500">({wf.hoursLate}h late)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {wf.qaVerified ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                          <Check className="mr-1 h-3 w-3 inline" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                          <Clock className="mr-1 h-3 w-3 inline" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          wf.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : wf.status === "blocked_overdue"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : wf.status === "pending_qa"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {wf.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkflow(wf);
                        }}
                      >
                        Inspect <ChevronRight className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Workflow Inspection Modal ─────────────────────────────────────── */}
      {selectedWorkflow && (
        <Dialog open={Boolean(selectedWorkflow)} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <CheckSquare className="h-5 w-5 text-[#3b1d4d] dark:text-primary" />
                Deliverable SLA Audit — {selectedWorkflow.milestone}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedWorkflow.client} · {selectedWorkflow.service}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Task Owner</span>
                  <strong className="text-sm font-bold text-foreground">
                    {selectedWorkflow.taskOwner}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Department</span>
                  <span className="text-foreground font-semibold">{selectedWorkflow.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Deadline</span>
                  <span className="text-foreground font-semibold">{selectedWorkflow.deadline}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">QA Verified</span>
                  <span className="text-foreground font-semibold">
                    {selectedWorkflow.qaVerified ? "Yes (Passed audit)" : "No (Pending sign-off)"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Current Operational Blocker:</span>
                <p className="text-muted-foreground leading-relaxed">{selectedWorkflow.blockerDetail}</p>
              </div>

              <div className="rounded-lg border border-[#3b1d4d]/30 bg-[#3b1d4d]/5 dark:border-primary/30 dark:bg-primary/5 p-3 space-y-1">
                <span className="font-semibold text-[#3b1d4d] dark:text-primary">Next Action Directive:</span>
                <p className="text-foreground leading-relaxed">{selectedWorkflow.nextStep}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedWorkflow.status === "blocked_overdue" && (
                <Button
                  size="sm"
                  className="bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs h-8 gap-1.5"
                  onClick={() => {
                    toast.success(`Executive override instruction sent for ${selectedWorkflow.milestone}.`);
                    setSelectedWorkflow(null);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve Override Directive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedWorkflow(null)}
              >
                Close View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
