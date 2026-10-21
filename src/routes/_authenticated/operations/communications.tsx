import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, Search, RefreshCw, PlusCircle, Building2, Calendar,
  User, AlertTriangle, Phone, Mail, Video, Clock, CheckCircle2,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  mutateAddCommunication,
  ClientCommunicationRecord,
  RealClient,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/operations/communications")({
  head: () => ({ meta: [{ title: "Client Communications — MSP Operations" }] }),
  component: ClientCommunicationsPage,
});

export function ClientCommunicationsPage() {
  const [loading, setLoading] = useState(true);
  const [communications, setCommunications] = useState<ClientCommunicationRecord[]>([]);
  const [clients, setClients] = useState<RealClient[]>([]);
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");

  // Log communication modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [channel, setChannel] = useState<ClientCommunicationRecord["channel"]>("Video Conference");
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split("T")[0]);
  const [responsibleEmployee, setResponsibleEmployee] = useState("Operations & Relationship Manager");
  const [summary, setSummary] = useState("");
  const [outstandingQuestions, setOutstandingQuestions] = useState("");
  const [promisedFollowUp, setPromisedFollowUp] = useState("");
  const [nextCommDate, setNextCommDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]
  );
  const [hasComplaint, setHasComplaint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setCommunications(data.communications);
      setClients(data.realClients);
      if (data.realClients.length > 0 && !selectedClientId) {
        setSelectedClientId(data.realClients[0].id);
      }
    } catch (e: any) {
      toast.error("Failed to load communications", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCommunication = async () => {
    if (!summary.trim()) {
      toast.error("Please provide summary notes for the interaction.");
      return;
    }
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) {
      toast.error("Please select a valid client.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await mutateAddCommunication({
        clientId: client.id,
        clientName: client.name,
        interactionDate,
        channel,
        responsibleEmployee,
        summary: summary.trim(),
        outstandingQuestions: outstandingQuestions.trim(),
        promisedFollowUp: promisedFollowUp.trim(),
        nextCommunicationDate: nextCommDate,
        hasUnresolvedComplaint: hasComplaint,
        isIntegrationSent: false, // Clearly manual record of interaction that occurred
      });
      setCommunications(updated);
      toast.success("Client interaction recorded", {
        description: `Logged in ${client.name} timeline.`,
      });
      setSummary("");
      setOutstandingQuestions("");
      setPromisedFollowUp("");
      setHasComplaint(false);
      setLogModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to record communication", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = communications.filter((c) => {
    const matchSearch =
      search === "" ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase()) ||
      c.responsibleEmployee.toLowerCase().includes(search.toLowerCase());
    const matchClient = clientFilter === "all" || c.clientId === clientFilter;
    return matchSearch && matchClient;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Client Communication Timeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative client interaction records, promised follow-up actions, and unresolved relationship concerns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="bg-primary text-white" onClick={() => setLogModalOpen(true)}>
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Record Interaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, questions, or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background border-input text-foreground"
          />
        </div>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            No communication records match the filter criteria.
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition">
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <CardTitle className="text-sm font-bold text-foreground">
                      {item.clientName}
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 font-medium px-2.5 py-0.5 rounded-full shadow-none">
                      {item.channel}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] rounded-full px-2.5 py-0.5 border-border bg-muted/60 text-foreground font-medium shadow-none">
                      {item.isIntegrationSent ? "Sent via Integration" : "Manually Recorded Interaction"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.interactionDate}
                    {item.hasUnresolvedComplaint && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                        Unresolved Issue
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-xs text-muted-foreground font-medium">
                  Responsible: {item.responsibleEmployee}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-1 text-xs">
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-foreground leading-relaxed">
                  {item.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.outstandingQuestions && (
                    <div className="rounded border border-amber-300 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-amber-950 dark:text-amber-200">
                      <strong className="text-amber-950 dark:text-amber-300 block mb-0.5 font-bold">Outstanding Question:</strong>
                      <span className="text-foreground">{item.outstandingQuestions}</span>
                    </div>
                  )}
                  {item.promisedFollowUp && (
                    <div className="rounded border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 p-2.5 text-purple-950 dark:text-purple-200">
                      <strong className="text-purple-950 dark:text-purple-200 block mb-0.5 font-bold">Promised Follow-Up:</strong>
                      <span className="text-foreground">{item.promisedFollowUp}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                  <span>Next Scheduled Touchpoint: <strong className="text-foreground font-semibold">{item.nextCommunicationDate}</strong></span>
                  <span className="text-[10px]">Audit timestamp: {new Date(item.recordedAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Record Communication Modal */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Client Communication</DialogTitle>
            <DialogDescription>
              Document an interaction that actually occurred to maintain authoritative relationship history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Client Account</Label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Channel</Label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Video Conference">Video Conference</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Meeting">Meeting (In Person)</option>
                  <option value="Written Correspondence">Written Correspondence</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Date of Interaction</Label>
                <Input
                  type="date"
                  value={interactionDate}
                  onChange={(e) => setInteractionDate(e.target.value)}
                  className="mt-1.5 text-xs bg-background"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Interaction Notes & Summary</Label>
              <Textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key items discussed, decisions made, feedback received..."
                className="mt-1.5 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Outstanding Client Questions</Label>
              <Input
                value={outstandingQuestions}
                onChange={(e) => setOutstandingQuestions(e.target.value)}
                placeholder="Any unanswered questions or data client requested..."
                className="mt-1.5 text-xs bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Promised Follow-Up Action</Label>
                <Input
                  value={promisedFollowUp}
                  onChange={(e) => setPromisedFollowUp(e.target.value)}
                  placeholder="Action promised to client..."
                  className="mt-1.5 text-xs bg-background"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Next Communication Target</Label>
                <Input
                  type="date"
                  value={nextCommDate}
                  onChange={(e) => setNextCommDate(e.target.value)}
                  className="mt-1.5 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="complaintCheckbox"
                checked={hasComplaint}
                onChange={(e) => setHasComplaint(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 text-primary"
              />
              <label htmlFor="complaintCheckbox" className="text-xs text-foreground cursor-pointer">
                Flag this interaction as containing an unresolved client complaint or escalation
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLogModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateCommunication} disabled={isSubmitting} className="bg-primary text-white">
              {isSubmitting ? "Saving..." : "Record Interaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
