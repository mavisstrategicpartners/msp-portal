import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users,
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
  ShieldCheck,
  Zap,
  Mail,
  Award,
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

export const Route = createFileRoute("/_authenticated/ceo/team")({
  head: () => ({ meta: [{ title: "Team Health — CEO Command Centre" }] }),
  component: TeamHealthPage,
});

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  activeTasks: number;
  capacityPct: number;
  onTimeRate: number;
  overdueItems: number;
  hoursLogged: number;
  status: "optimal" | "high_load" | "bottleneck";
  recentDeliverable: string;
  notes: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1",
    name: "Thabiso Mokoena",
    role: "Media Buying Lead",
    department: "Media Buying",
    activeTasks: 14,
    capacityPct: 96,
    onTimeRate: 85,
    overdueItems: 1,
    hoursLogged: 38,
    status: "bottleneck",
    recentDeliverable: "Client Alpha Ad Budget Sign-off",
    notes: "Overdue manager approval has stalled Client Alpha campaign launch.",
  },
  {
    id: "tm-2",
    name: "Emma Watson",
    role: "Senior CRM & AI Specialist",
    department: "Tech Delivery",
    activeTasks: 8,
    capacityPct: 75,
    onTimeRate: 100,
    overdueItems: 0,
    hoursLogged: 36,
    status: "optimal",
    recentDeliverable: "Vanguard Logistics GHL AI Receptionist",
    notes: "Operating at 100% on-time milestone delivery; zero customer complaints.",
  },
  {
    id: "tm-3",
    name: "Siya Nkosi",
    role: "Media Buying Specialist",
    department: "Media Buying",
    activeTasks: 9,
    capacityPct: 90,
    onTimeRate: 92,
    overdueItems: 0,
    hoursLogged: 39,
    status: "optimal",
    recentDeliverable: "Silverline Properties Negative Keywords Architecture",
    notes: "Ad copy and creative targeting delivered on schedule.",
  },
  {
    id: "tm-4",
    name: "Lesego Molefe",
    role: "CRM & Automation Dev",
    department: "Tech Delivery",
    activeTasks: 11,
    capacityPct: 92,
    onTimeRate: 94,
    overdueItems: 1,
    hoursLogged: 40,
    status: "high_load",
    recentDeliverable: "Apex Solar GHL WhatsApp Journey",
    notes: "Capacity stretched; awaiting client delegate token for WhatsApp API.",
  },
  {
    id: "tm-5",
    name: "Naledi Khumalo",
    role: "Lead Web Designer",
    department: "Web Design",
    activeTasks: 7,
    capacityPct: 82,
    onTimeRate: 92,
    overdueItems: 0,
    hoursLogged: 37,
    status: "optimal",
    recentDeliverable: "BrightPath Education Homepage Wireframe v3",
    notes: "Completed 3 revision cycles; delivering with formal scope notice.",
  },
  {
    id: "tm-6",
    name: "Sarah Jenkins",
    role: "Senior Account Director",
    department: "Client Strategy",
    activeTasks: 12,
    capacityPct: 88,
    onTimeRate: 98,
    overdueItems: 0,
    hoursLogged: 41,
    status: "optimal",
    recentDeliverable: "TechNova Onboarding Pack & SLA Welcome",
    notes: "Successfully closed TechNova R140k contract and completed onboarding.",
  },
  {
    id: "tm-7",
    name: "David Cole",
    role: "Client Success Manager",
    department: "Client Success",
    activeTasks: 15,
    capacityPct: 94,
    onTimeRate: 91,
    overdueItems: 1,
    hoursLogged: 39,
    status: "high_load",
    recentDeliverable: "Nexus Retail Q4 Executive Check-in",
    notes: "14-day touchpoint overdue with Nexus Retail; recovery call scheduled.",
  },
];

const DEPARTMENT_CAPACITY = [
  { department: "Media Buying", load: 94, target: 85 },
  { department: "Tech Delivery", load: 86, target: 85 },
  { department: "Web Design", load: 82, target: 85 },
  { department: "Client Strategy", load: 88, target: 85 },
  { department: "Client Success", load: 92, target: 85 },
];

const ON_TIME_RANKINGS = [
  { name: "Emma Watson", rate: 100 },
  { name: "Sarah Jenkins", rate: 98 },
  { name: "Lesego Molefe", rate: 94 },
  { name: "Siya Nkosi", rate: 92 },
  { name: "Naledi Khumalo", rate: 92 },
  { name: "David Cole", rate: 91 },
  { name: "Thabiso Mokoena", rate: 85 },
];

function TeamHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filteredMembers = TEAM_MEMBERS.filter((tm) => {
    const matchesSearch =
      tm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tm.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tm.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tm.notes.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (deptFilter === "all") return true;
    return tm.department === deptFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/ceo" className="hover:text-foreground inline-flex items-center gap-1 font-medium text-[#3b1d4d] dark:text-primary">
          <ArrowLeft className="h-3 w-3" /> Executive Command Centre
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Team Health & Capacity</span>
      </div>

      {/* ─── Executive Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <Users className="h-3.5 w-3.5" /> Workforce Telemetry
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                Capacity: 88.0% (Optimal)
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Team Health & Capacity Allocation
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time monitoring of workforce capacity utilization, on-time delivery rates, managerial response bottlenecks, and individual performance scorecards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Team capacity logs re-calculated across all active projects.")}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-sync Capacity
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Workforce performance register exported to CSV.")}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Scorecards CSV
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Average On-Time Rate</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Above Benchmark
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">94.0%</span>
            <span className="text-xs text-muted-foreground">Target: 90%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +1.8% MoM
            </span>
            <span className="text-muted-foreground">Top: Emma Watson (100%)</span>
          </div>
          <Progress value={94} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Capacity Utilization</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
              Optimal Load
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">88.0%</span>
            <span className="text-xs text-muted-foreground">Workforce Avg</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Balanced
            </span>
            <span className="text-muted-foreground">42 Active Tasks</span>
          </div>
          <Progress value={88} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Manager Overdue Approvals</span>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">
              Bottleneck
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">1 Item</span>
            <span className="text-xs text-muted-foreground">Media Buying</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" /> 18h Overdue
            </span>
            <span className="text-muted-foreground">Thabiso Mokoena</span>
          </div>
          <Progress value={20} className="mt-2.5 h-1.5 bg-muted [&>div]:bg-rose-500" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Team Specialists</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Full Roster
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">17 Members</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <Award className="h-3 w-3" /> 5 Dept Leads
            </span>
            <span className="text-muted-foreground">12 Specialists</span>
          </div>
          <Progress value={90} className="mt-2.5 h-1.5 bg-muted" />
        </Card>
      </div>

      {/* ─── Team Charts Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Department Capacity (2 Cols) */}
        <Card className="border-border p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Department Capacity Utilization vs 85% Target (%)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Current workload allocation by departmental division.</p>
            </div>
            <Badge variant="outline" className="text-xs">October 2026 MTD</Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_CAPACITY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="load" name="Actual Load" fill="#3b1d4d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Cap" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Individual On-Time SLA Ranking (1 Col) */}
        <Card className="border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Specialist On-Time Rate</h3>
              <Badge variant="outline" className="text-xs">Top Ranking</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Individual deliverable SLA compliance.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ON_TIME_RANKINGS} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="rate" fill="#3b1d4d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-muted/40 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-foreground">Workforce Insights:</span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Emma Watson and Sarah Jenkins maintaining 98–100% on-time delivery. Media Buying team capacity is operating at peak load (94%).
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Team Members Scorecard Table ─────────────────────────────────── */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Workforce Scorecards & Performance Directory
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed delivery metrics, active task counts, and workload utilization for every lead and specialist.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter name, role, dept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background w-full sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setDeptFilter("all")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    deptFilter === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({TEAM_MEMBERS.length})
                </button>
                <button
                  onClick={() => setDeptFilter("Media Buying")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    deptFilter === "Media Buying" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Media
                </button>
                <button
                  onClick={() => setDeptFilter("Tech Delivery")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    deptFilter === "Tech Delivery" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tech
                </button>
                <button
                  onClick={() => setDeptFilter("Client Strategy")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    deptFilter === "Client Strategy" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Strategy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Specialist & Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Active Load</th>
                <th className="p-3.5 text-center">Capacity %</th>
                <th className="p-3.5 text-center">On-Time SLA</th>
                <th className="p-3.5 text-center">Overdue</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((tm) => (
                <tr
                  key={tm.id}
                  onClick={() => setSelectedMember(tm)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <strong className="text-sm text-foreground block">{tm.name}</strong>
                    <span className="text-muted-foreground text-[11px]">{tm.role}</span>
                  </td>
                  <td className="p-3.5 font-medium text-foreground">{tm.department}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-foreground">
                    {tm.activeTasks} tasks
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        tm.capacityPct > 90
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      }`}
                    >
                      {tm.capacityPct}% Capacity
                    </Badge>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-xs">
                    <span className={tm.onTimeRate < 90 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                      {tm.onTimeRate}%
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {tm.overdueItems > 0 ? (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">
                        {tm.overdueItems} Overdue
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-mono">0</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(tm);
                      }}
                    >
                      Inspect <ChevronRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Member Detail Inspection Modal ────────────────────────────────── */}
      {selectedMember && (
        <Dialog open={Boolean(selectedMember)} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Users className="h-5 w-5 text-[#3b1d4d] dark:text-primary" />
                Workforce Scorecard — {selectedMember.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedMember.role} · {selectedMember.department}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">On-Time Delivery Rate</span>
                  <strong className="text-lg font-bold text-foreground">
                    {selectedMember.onTimeRate}%
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Capacity Load</span>
                  <strong className="text-lg font-bold text-[#3b1d4d] dark:text-primary">
                    {selectedMember.capacityPct}% ({selectedMember.activeTasks} tasks)
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Overdue Approvals/Tasks</span>
                  <span className={`font-bold ${selectedMember.overdueItems > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {selectedMember.overdueItems} items
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Hours Logged This Week</span>
                  <span className="text-foreground font-semibold">{selectedMember.hoursLogged} hrs</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Recent Deliverable Focus:</span>
                <p className="text-foreground leading-relaxed">{selectedMember.recentDeliverable}</p>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Managerial Performance Notes:</span>
                <p className="text-muted-foreground leading-relaxed">{selectedMember.notes}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedMember.overdueItems > 0 && (
                <Button
                  size="sm"
                  className="bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs h-8 gap-1.5"
                  onClick={() => {
                    toast.success(`Priority resolution reminder sent to ${selectedMember.name}.`);
                    setSelectedMember(null);
                  }}
                >
                  <Mail className="h-3.5 w-3.5" /> Dispatch Priority Reminder
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedMember(null)}
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
