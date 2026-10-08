import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  Building2,
  CheckSquare,
  Users,
  AlertTriangle,
  Flame,
  Eye,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileBarChart2,
  Check,
  XCircle,
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

interface CeoActionItem {
  id: string;
  client: string;
  service: string;
  overdueMilestone: string;
  originalDue: string;
  currentDue: string;
  workingHoursLate: number;
  currentBlocker: string;
  taskOwnerRole: string;
  managerRole: string;
  delayCategory: string;
  nextAction: string;
  escalationRecipientRole: string;
  clientElapsedTimeHrs: number;
  internalServiceTimeHrs: number;
  stageTimeHrs: number;
}

const SAMPLE_ACTION_QUEUE: CeoActionItem[] = [
  {
    id: "act-1",
    client: "Client Alpha",
    service: "Paid Ads (Meta Performance)",
    overdueMilestone: "Live Campaign Launch",
    originalDue: "2026-10-06 17:00",
    currentDue: "2026-10-07 12:00",
    workingHoursLate: 9,
    currentBlocker: "Budget approval pending with department manager",
    taskOwnerRole: "Media Buying Specialist",
    managerRole: "Media Buying Lead",
    delayCategory: "Manager approval",
    nextAction: "Operations to obtain manager budget sign-off by 12:00 today",
    escalationRecipientRole: "Operations Lead & CEO",
    clientElapsedTimeHrs: 45,
    internalServiceTimeHrs: 27,
    stageTimeHrs: 13,
  },
  {
    id: "act-2",
    client: "Apex Solar SA",
    service: "CRM & AI Automation",
    overdueMilestone: "GHL WhatsApp Qualification Journey",
    originalDue: "2026-10-07 17:00",
    currentDue: "2026-10-08 17:00",
    workingHoursLate: 4,
    currentBlocker: "Awaiting client delegate link for Meta Business Manager",
    taskOwnerRole: "CRM & Automation Specialist",
    managerRole: "Tech Delivery Lead",
    delayCategory: "Client input or approval",
    nextAction: "Account manager follow-up scheduled with client point of contact",
    escalationRecipientRole: "Operations Lead",
    clientElapsedTimeHrs: 32,
    internalServiceTimeHrs: 18,
    stageTimeHrs: 8,
  },
];

export function CeoDashboard() {
  const [selectedItem, setSelectedItem] = useState<CeoActionItem | null>(null);

  return (
    <div className="space-y-6">
      {/* ─── Executive Priority Alert ──────────────────────────────────────── */}
      <Card className="border-rose-500/40 bg-rose-500/[0.06] p-4 text-foreground">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-rose-500/20 p-2 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  CEO Priority Intervention
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  Action Required
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold">
                Client Alpha | Meta campaign launch | <span className="underline decoration-rose-500 font-bold">9 working hours late</span> | Media buyer submitted on time | Budget approval pending with manager
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <strong className="text-foreground font-medium">Reviewed Delay:</strong> Manager approval delay &bull;{" "}
                <strong className="text-foreground font-medium">Next Action:</strong> Operations to obtain approval by 12:00 today &bull;{" "}
                <strong className="text-foreground font-medium">Promise:</strong> Original client promise retained.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 text-xs"
            onClick={() => setSelectedItem(SAMPLE_ACTION_QUEUE[0])}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Open Timeline & Evidence
          </Button>
        </div>
      </Card>

      {/* ─── The Five Health Views (Section 2) ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            The Five Executive Health Views
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Policy: A department cannot be green if a critical delivery is overdue
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {/* 1. Sales Health */}
          <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Sales Health</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R185k <span className="text-xs font-normal text-muted-foreground">Verified Won</span>
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>New Leads:</span> <strong className="text-foreground">14</strong></div>
                <div className="flex justify-between"><span>Unanswered Leads:</span> <strong className="text-rose-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Overdue Follow-ups:</span> <strong className="text-amber-500 font-bold">2</strong></div>
                <div className="flex justify-between"><span>Consultations Held:</span> <strong className="text-foreground">8</strong></div>
                <div className="flex justify-between"><span>Proposals Sent:</span> <strong className="text-foreground">5</strong></div>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]">
              Green &bull; On Target
            </Badge>
          </Card>

          {/* 2. Revenue Health */}
          <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Revenue Health</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R520k <span className="text-xs font-normal text-muted-foreground">Cash Collected</span>
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Booked Revenue:</span> <strong className="text-foreground">R650k</strong></div>
                <div className="flex justify-between"><span>Invoiced Amounts:</span> <strong className="text-foreground">R580k</strong></div>
                <div className="flex justify-between"><span>Overdue Debt:</span> <strong className="text-rose-500 font-bold">R60k</strong></div>
                <div className="flex justify-between"><span>Recurring Revenue:</span> <strong className="text-foreground">R420k/mo</strong></div>
                <div className="flex justify-between"><span>Cost Margin:</span> <strong className="text-foreground">68%</strong></div>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-primary/10 text-primary border-primary/30 text-[11px]">
              Green &bull; Healthy Margin
            </Badge>
          </Card>

          {/* 3. Client Health */}
          <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Client Health</span>
              <Building2 className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> <span className="text-xs font-bold">12 Green</span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block ml-1" /> <span className="text-xs font-bold">3 Amber</span>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block ml-1" /> <span className="text-xs font-bold">1 Red</span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Onboarding Late:</span> <strong className="text-rose-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Awaiting Launch:</span> <strong className="text-foreground">2</strong></div>
                <div className="flex justify-between"><span>Unresolved Complaints:</span> <strong className="text-emerald-600 font-semibold">0</strong></div>
                <div className="flex justify-between"><span>Missed Check-ins:</span> <strong className="text-amber-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Renewal Risks:</span> <strong className="text-amber-500 font-bold">1</strong></div>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-rose-500/10 text-rose-600 border-rose-500/30 text-[11px]">
              Red &bull; Client Alpha Breach
            </Badge>
          </Card>

          {/* 4. Delivery Health */}
          <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4. Delivery Health</span>
              <CheckSquare className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                8 <span className="text-xs font-normal text-muted-foreground">Due Today</span>
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Overdue Milestones:</span> <strong className="text-rose-500 font-bold">2</strong></div>
                <div className="flex justify-between"><span>Blocked Work:</span> <strong className="text-amber-500 font-bold">2</strong></div>
                <div className="flex justify-between"><span>Approval Backlog:</span> <strong className="text-rose-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Awaiting Ad Launch:</span> <strong className="text-foreground">2</strong></div>
                <div className="flex justify-between"><span>Overdue Websites:</span> <strong className="text-emerald-600 font-semibold">0</strong></div>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px]">
              Amber &bull; Approval Backlog
            </Badge>
          </Card>

          {/* 5. Team Health */}
          <Card className="p-4 space-y-3 hover:border-primary/40 transition-all border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">5. Team Health</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                94% <span className="text-xs font-normal text-muted-foreground">On-Time Rate</span>
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Active Workload:</span> <strong className="text-foreground">42 tasks</strong></div>
                <div className="flex justify-between"><span>Stale Updates:</span> <strong className="text-amber-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Pending QA Verification:</span> <strong className="text-foreground">3</strong></div>
                <div className="flex justify-between"><span>Manager Overdue Approvals:</span> <strong className="text-rose-500 font-bold">1</strong></div>
                <div className="flex justify-between"><span>Unresolved Blockers:</span> <strong className="text-foreground">2</strong></div>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-primary/10 text-primary border-primary/30 text-[11px]">
              Green &bull; 94% Delivery
            </Badge>
          </Card>
        </div>
      </div>

      {/* ─── CEO Action Queue (Section 2) ──────────────────────────────────── */}
      <Card className="p-5 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> CEO Executive Action Queue
            </h3>
            <p className="text-xs text-muted-foreground">
              Shows what is delayed, working hours late, confirmed blocker category, and the assigned escalation recipient.
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
            {SAMPLE_ACTION_QUEUE.length} Overdue Milestones Requiring Intervention
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5">Client & Service</th>
                <th className="p-2.5">Overdue Milestone</th>
                <th className="p-2.5">Due Date</th>
                <th className="p-2.5">Working Hrs Late</th>
                <th className="p-2.5">Current Blocker</th>
                <th className="p-2.5">Owner Role</th>
                <th className="p-2.5">Manager Role</th>
                <th className="p-2.5">Delay Category</th>
                <th className="p-2.5">Next Action</th>
                <th className="p-2.5">Escalation Recipient</th>
                <th className="p-2.5 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_ACTION_QUEUE.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-2.5 font-bold text-foreground">
                    {item.client}
                    <div className="text-[11px] font-normal text-muted-foreground">{item.service}</div>
                  </td>
                  <td className="p-2.5 font-medium">{item.overdueMilestone}</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{item.originalDue}</td>
                  <td className="p-2.5">
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {item.workingHoursLate} hrs late
                    </span>
                  </td>
                  <td className="p-2.5 max-w-[180px] truncate text-muted-foreground" title={item.currentBlocker}>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{item.currentBlocker}</span>
                  </td>
                  <td className="p-2.5 font-medium">{item.taskOwnerRole}</td>
                  <td className="p-2.5 text-muted-foreground">{item.managerRole}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className="text-[10px] bg-muted">
                      {item.delayCategory}
                    </Badge>
                  </td>
                  <td className="p-2.5 max-w-[200px] truncate" title={item.nextAction}>
                    {item.nextAction}
                  </td>
                  <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">
                    {item.escalationRecipientRole}
                  </td>
                  <td className="p-2.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItem(item)}
                      className="h-7 text-[11px]"
                    >
                      <Eye className="mr-1 h-3 w-3" /> Timeline
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Timeline Detail Modal ─────────────────────────────────────────── */}
      {selectedItem && (
        <Dialog open={Boolean(selectedItem)} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Delivery Clocks & Delay Attribution
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedItem.client} &bull; {selectedItem.service}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Gross Client Age</span>
                  <strong className="text-sm font-bold">{selectedItem.clientElapsedTimeHrs} Hours</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Internal Service Time</span>
                  <strong className="text-sm font-bold text-primary">{selectedItem.internalServiceTimeHrs} Working Hrs</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Stage Time Held</span>
                  <strong className="text-sm font-bold text-rose-500">{selectedItem.stageTimeHrs} Working Hrs</strong>
                </div>
              </div>

              <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                <p><strong>Delay Category:</strong> {selectedItem.delayCategory}</p>
                <p><strong>Blocker:</strong> {selectedItem.currentBlocker}</p>
                <p><strong>Accountable Manager:</strong> {selectedItem.managerRole}</p>
                <p><strong>Next Action:</strong> {selectedItem.nextAction}</p>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
