import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  CheckSquare,
  Users,
  AlertTriangle,
  Clock,
  Check,
  XCircle,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { DepartmentKey } from "./types";

interface DeptTask {
  id: string;
  client: string;
  title: string;
  assigneeRole: string;
  priority: "Urgent" | "High" | "Medium";
  status: "In progress" | "Submitted for review" | "Blocked" | "Rework" | "Accepted complete";
  dueDate: string;
  workingHoursLate: number;
  blockReason?: string;
  evidenceRequirement: string;
}

const SAMPLE_DEPT_TASKS: Record<string, DeptTask[]> = {};

export function DepartmentManagerDashboard() {
  const [selectedDept, setSelectedDept] = useState<string>("Media Buying");
  const tasks = SAMPLE_DEPT_TASKS[selectedDept] || [];

  return (
    <div className="space-y-6">
      {/* ─── Department Selector Banner ────────────────────────────────────── */}
      <Card className="p-4 border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Department Management</span>
          <h3 className="text-lg font-bold text-foreground">{selectedDept} Operations</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Department:</span>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="h-8 text-xs w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Media Buying",
                "Websites & Software",
                "CRM & AI Automation",
                "Strategy & Growth",
                "SEO",
                "Creative Content",
              ].map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ─── Department Workload Metrics ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Active Department Tasks</span>
          <p className="text-2xl font-bold text-foreground mt-1">{tasks.length}</p>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Pending Manager QA</span>
          <p className="text-2xl font-bold text-primary mt-1">
            {tasks.filter((t) => t.status === "Submitted for review").length}
          </p>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Blocked Deliverables</span>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {tasks.filter((t) => t.status === "Blocked").length}
          </p>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Overdue Items</span>
          <p className="text-2xl font-bold text-rose-500 mt-1">
            {tasks.filter((t) => t.workingHoursLate > 0).length}
          </p>
        </Card>
      </div>

      {/* ─── Department Task Board ─────────────────────────────────────────── */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Assigned Deliverables & QA Approvals</h3>
            <p className="text-xs text-muted-foreground">
              Review team progress, approve evidence submissions, or unblock team members.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {tasks.length} Tracked Tasks
          </Badge>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border rounded-xl">
              <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-foreground">No tasks have been assigned yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Tasks assigned to employees will appear here.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">No upcoming deadlines.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">{task.client}</span>
                    <Badge
                      variant={
                        task.status === "Blocked"
                          ? "destructive"
                          : task.status === "Submitted for review"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">{task.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assignee Role: <strong>{task.assigneeRole}</strong> &bull; Due: <strong>{task.dueDate}</strong>
                  </p>

                  {task.blockReason && (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded">
                      <strong>Blocker:</strong> {task.blockReason}
                    </p>
                  )}

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    <strong>Evidence Required:</strong> {task.evidenceRequirement}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status === "Submitted for review" ? (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      onClick={() => toast.success(`Approved deliverable: ${task.title}`)}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve Deliverable
                    </Button>
                  ) : task.status === "Blocked" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-amber-600"
                      onClick={() => toast.info("Reviewing blocker details with Operations.")}
                    >
                      Resolve Blocker
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => toast.info(`Viewing details for ${task.title}`)}
                    >
                      Details
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
