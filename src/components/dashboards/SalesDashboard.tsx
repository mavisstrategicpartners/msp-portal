import { useState } from "react";
import { formatZAR } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  Target,
  Banknote,
  Calendar,
  Clock,
  Mail,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
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

interface LeadItem {
  id: string;
  businessName: string;
  contactPerson: string;
  stage: "New" | "Contacted" | "Qualified" | "Discovery" | "Proposal Sent" | "Follow-up" | "Won" | "Lost";
  leadQuality: "Hot" | "Warm" | "Cold";
  estimatedValue: number; // ZAR
  assignedSalesperson: string;
  followUpDate: string;
  proposalStatus: "Draft" | "Sent" | "Awaiting Signature" | "Accepted" | "Declined";
  notes: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    businessName: "Eskom Alternative Power Solutions",
    contactPerson: "Dumisani Khumalo",
    stage: "Proposal Sent",
    leadQuality: "Hot",
    estimatedValue: 48000,
    assignedSalesperson: "Sales Executive",
    followUpDate: "2026-10-14",
    proposalStatus: "Sent",
    notes: "Requires Meta performance ads + GHL WhatsApp CRM setup. Proposal sent yesterday.",
  },
  {
    id: "lead-2",
    businessName: "Pretoria Precision Engineering",
    contactPerson: "Johan van der Merwe",
    stage: "Discovery",
    leadQuality: "Warm",
    estimatedValue: 35000,
    assignedSalesperson: "Sales Executive",
    followUpDate: "2026-10-15",
    proposalStatus: "Draft",
    notes: "Discussed custom website redesign and Google Ads lead gen.",
  },
  {
    id: "lead-3",
    businessName: "Zambezi Logistics Group",
    contactPerson: "Farai Moyo",
    stage: "Won",
    leadQuality: "Hot",
    estimatedValue: 60000,
    assignedSalesperson: "Sales Executive",
    followUpDate: "2026-10-10",
    proposalStatus: "Accepted",
    notes: "Contract signed! Handed over to Operations for 2-day onboarding intake.",
  },
  {
    id: "lead-4",
    businessName: "Cape Coastal Hospitality",
    contactPerson: "Anika Patel",
    stage: "Contacted",
    leadQuality: "Warm",
    estimatedValue: 28000,
    assignedSalesperson: "Sales Executive",
    followUpDate: "2026-10-13",
    proposalStatus: "Draft",
    notes: "Inbound lead from Meta ads. Follow-up consultation scheduled.",
  },
];

export function SalesDashboard() {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");

  // New lead form state
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("30000");
  const [leadQuality, setLeadQuality] = useState<"Hot" | "Warm" | "Cold">("Hot");
  const [notes, setNotes] = useState("");

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim() || "Primary Contact",
      stage: "New",
      leadQuality,
      estimatedValue: Number(estimatedValue) || 30000,
      assignedSalesperson: "Sales Team",
      followUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      proposalStatus: "Draft",
      notes: notes.trim(),
    };

    setLeads((prev) => [newLead, ...prev]);
    toast.success("Lead created successfully!", {
      description: `${newLead.businessName} added to pipeline.`,
    });
    setAddLeadOpen(false);
    setBusinessName("");
    setContactPerson("");
    setNotes("");
  };

  const handleAdvanceStage = (id: string, newStage: LeadItem["stage"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l))
    );
    toast.success(`Lead moved to stage: ${newStage}`);
  };

  const totalPipelineValue = leads
    .filter((l) => l.stage !== "Lost")
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const wonLeads = leads.filter((l) => l.stage === "Won");
  const wonValue = wonLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const pendingProposals = leads.filter((l) => l.stage === "Proposal Sent").length;

  const filteredLeads = stageFilter === "all" ? leads : leads.filter((l) => l.stage === stageFilter);

  return (
    <div className="space-y-6">
      {/* ─── Sales Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Sales & Revenue Pipeline</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track qualified opportunities, proposal deadlines, and closed revenue.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setAddLeadOpen(true)}
            className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-secondary/40 border-border">
            CRM &bull; Sales
          </Badge>
        </div>
      </div>

      {/* ─── Pipeline KPI Summary ─────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Active Pipeline Value</span>
          <p className="text-2xl font-bold text-foreground mt-1">{formatZAR(totalPipelineValue)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{leads.length} active opportunities</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Monthly Closed Revenue</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatZAR(wonValue)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{wonLeads.length} won contracts</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Pending Proposals</span>
          <p className="text-2xl font-bold text-amber-500 mt-1">{pendingProposals}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting client decision</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Sales Conversion Rate</span>
          <p className="text-2xl font-bold text-primary mt-1">
            {leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Discovery to Closed-Won</p>
        </Card>
      </div>

      {/* ─── Opportunities Table ──────────────────────────────────────────── */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Active Deals & Opportunities</h3>
            <p className="text-xs text-muted-foreground">
              Manage client conversations, follow-up dates, and advance stages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Filter Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
            >
              <option value="all">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Discovery">Discovery</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition hover:border-primary/30"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{lead.businessName}</span>
                  <Badge
                    variant={
                      lead.leadQuality === "Hot"
                        ? "destructive"
                        : lead.leadQuality === "Warm"
                        ? "default"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {lead.leadQuality}
                  </Badge>
                  <Badge
                    variant={
                      lead.stage === "Won"
                        ? "default"
                        : lead.stage === "Lost"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-[10px]"
                  >
                    {lead.stage}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact: <span className="font-semibold text-foreground">{lead.contactPerson}</span> &bull; Follow-up:{" "}
                  <span className="font-medium">{lead.followUpDate}</span>
                </p>
                {lead.notes && (
                  <p className="text-[11px] text-muted-foreground italic">&quot;{lead.notes}&quot;</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-right">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Value</span>
                  <p className="text-sm font-bold text-foreground">{formatZAR(lead.estimatedValue)}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {lead.stage !== "Won" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdvanceStage(lead.id, "Won")}
                      className="h-8 text-xs font-semibold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      Mark Won
                    </Button>
                  )}
                  {lead.stage === "Discovery" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdvanceStage(lead.id, "Proposal Sent")}
                      className="h-8 text-xs font-semibold"
                    >
                      Send Proposal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Add Lead Modal ─────────────────────────────────────────────────── */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create New Opportunity</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a prospect to the CRM sales pipeline with estimated value and contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="biz-name" className="text-xs font-medium">
                Business / Company Name *
              </Label>
              <Input
                id="biz-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Solar SA"
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-person" className="text-xs font-medium">
                  Contact Person
                </Label>
                <Input
                  id="contact-person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Thabo Mthembu"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-val" className="text-xs font-medium">
                  Estimated Monthly Value (ZAR)
                </Label>
                <Input
                  id="lead-val"
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="30000"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Lead Quality</Label>
              <div className="flex gap-2">
                {(["Hot", "Warm", "Cold"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setLeadQuality(q)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold border transition ${
                      leadQuality === q
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-notes" className="text-xs font-medium">
                Services Needed & Discovery Notes
              </Label>
              <Textarea
                id="lead-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Client requires Meta ads and WhatsApp automation for Q4..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Save Opportunity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
