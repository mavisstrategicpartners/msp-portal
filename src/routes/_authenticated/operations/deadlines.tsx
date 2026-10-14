import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle,
  Building2, Calendar, FileText, ArrowRight, Edit, AlertCircle, ExternalLink,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateServiceDeadline,
  ServiceDeadlineItem,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/deadlines")({
  head: () => ({ meta: [{ title: "Service Deadlines — MSP Operations" }] }),
  component: ServiceDeadlinesPage,
});

export function ServiceDeadlinesPage() {
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState<ServiceDeadlineItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Deadline change dialog
  const [selectedItem, setSelectedItem] = useState<ServiceDeadlineItem | null>(null);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [newStatus, setNewStatus] = useState<ServiceDeadlineItem["status"]>("Work in Progress");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setDeadlines(data.deadlines);
    } catch (e: any) {
      toast.error("Failed to load deadlines", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenChangeModal = (item: ServiceDeadlineItem) => {
    setSelectedItem(item);
    setNewDate(item.currentDeadline);
    setNewStatus(item.status);
    setChangeReason("");
    setChangeModalOpen(true);
  };

  const handleSaveDeadlineChange = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      const updated = await mutateServiceDeadline(
        selectedItem.id,
        newDate,
        changeReason,
        newStatus
      );
      setDeadlines(updated);
      toast.success("Deadline & status updated", {
        description: `Deliverable '${selectedItem.deliverableName}' updated. Audit history logged.`,
      });
      setChangeModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to save changes", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = deadlines.filter((d) => {
    const matchSearch =
      search === "" ||
      d.deliverableName.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.accountablePerson.toLowerCase().includes(search.toLowerCase()) ||
      d.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchDept = departmentFilter === "all" || d.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Service Deadlines & Delivery Coordination
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative delivery commitments, planned vs approved deadlines, review verification statuses, and client commitment risks.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Commitments
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliverable, client, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background/50 border-white/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Submitted for Review">Submitted for Review</option>
            <option value="Rework Required">Rework Required</option>
            <option value="Accepted Completion">Accepted Completion</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT & SEO Department</option>
            <option value="Marketing">Marketing Team</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Deadlines Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No service deadlines match the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-3">Deliverable & Service</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Owner / Dept</th>
                    <th className="py-3 px-3">Original Deadline</th>
                    <th className="py-3 px-3">Current Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Risk</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => {
                    const isOverdue = item.currentDeadline < todayStr && item.status !== "Accepted Completion";
                    const isAccepted = item.status === "Accepted Completion";
                    const isSubmitted = item.status === "Submitted for Review";
                    const isBlocked = item.status === "Blocked";

                    return (
                      <tr key={item.id} className="hover:bg-muted/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground">{item.deliverableName}</div>
                          <div className="text-[11px] text-muted-foreground font-medium">{item.serviceName}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-semibold text-foreground">
                          {item.clientName}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-foreground font-medium">{item.accountablePerson}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">{item.department}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-muted-foreground font-medium">
                          {item.originalDeadline}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={isOverdue ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground font-medium"}>
                            {item.currentDeadline}
                          </span>
                          {item.approvedDeadlineChangesCount > 0 && (
                            <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold" title="Approved deadline extension count">
                              (+{item.approvedDeadlineChangesCount} rev)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            className={`text-[10px] font-semibold ${
                              isAccepted
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                                : isSubmitted
                                ? "bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40"
                                : isBlocked
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
                                : "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] border-border bg-muted/60 text-foreground font-medium">
                            {item.verificationStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                              item.commitmentRisk === "High"
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                                : item.commitmentRisk === "Moderate"
                                ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              item.commitmentRisk === "High" ? "bg-rose-500" : item.commitmentRisk === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            {item.commitmentRisk} Risk
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2.5 cursor-pointer"
                            onClick={() => handleOpenChangeModal(item)}
                          >
                            <Edit className="mr-1 h-3 w-3 text-muted-foreground" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deadline Change Dialog */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Manage Service Deliverable & Deadline</DialogTitle>
            <DialogDescription>
              {selectedItem?.deliverableName} ({selectedItem?.clientName})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Delivery Status</Label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Work in Progress">Work in Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Submitted for Review">Submitted for Review</option>
                <option value="Rework Required">Rework Required</option>
                <option value="Accepted Completion">Accepted Completion</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Current Deadline (Planned: {selectedItem?.originalDeadline})</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Approved Change Reason / Roadblock Notes</Label>
              <Input
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Document reason for adjustment to record in audit log..."
                className="mt-1.5 text-xs bg-background border-input text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setChangeModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveDeadlineChange} disabled={isSaving} className="bg-primary text-white">
              {isSaving ? "Saving..." : "Save Delivery Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
