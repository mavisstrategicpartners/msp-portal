import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Check,
  XCircle,
  Eye,
  FileText,
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

interface OnboardingItem {
  id: string;
  clientName: string;
  package: string;
  accountManagerRole: string;
  stageOwnerRole: string;
  currentStage: string;
  workingHoursAge: number;
  totalElapsedDays: number;
  progress: number;
  isBreached: boolean;
  accessChecklist: {
    metaAds: "Verified" | "Missing" | "N/A";
    googleAds: "Verified" | "Missing" | "N/A";
    tikTokAds: "Verified" | "Missing" | "N/A";
    ga4Analytics: "Verified" | "Missing" | "N/A";
    metaPixel: "Verified" | "Missing" | "N/A";
    capiServer: "Verified" | "Missing" | "N/A";
    ghlCrm: "Verified" | "Missing" | "N/A";
    websiteHosting: "Verified" | "Missing" | "N/A";
  };
}

const SAMPLE_ONBOARDING: OnboardingItem[] = [
  {
    id: "onb-1",
    clientName: "Apex Solar SA",
    package: "Growth Engine (Paid Ads + CRM & AI)",
    accountManagerRole: "Relationship Manager",
    stageOwnerRole: "Technical Onboarding Specialist",
    currentStage: "Access & Assets Gate",
    workingHoursAge: 21, // Target: 18 working hours (breached by 3 hrs)
    totalElapsedDays: 5,
    progress: 45,
    isBreached: true,
    accessChecklist: {
      metaAds: "Missing",
      googleAds: "Missing",
      tikTokAds: "N/A",
      ga4Analytics: "Verified",
      metaPixel: "Missing",
      capiServer: "Missing",
      ghlCrm: "Verified",
      websiteHosting: "Verified",
    },
  },
  {
    id: "onb-2",
    clientName: "Vanguard Mining Supplies",
    package: "Custom Web & Lead Generation",
    accountManagerRole: "Relationship Manager",
    stageOwnerRole: "Web Project Lead",
    currentStage: "Strategy & Scope Accepted",
    workingHoursAge: 12, // Within 18 working hours SLA
    totalElapsedDays: 2,
    progress: 70,
    isBreached: false,
    accessChecklist: {
      metaAds: "Verified",
      googleAds: "N/A",
      tikTokAds: "N/A",
      ga4Analytics: "Verified",
      metaPixel: "Verified",
      capiServer: "Verified",
      ghlCrm: "Verified",
      websiteHosting: "Verified",
    },
  },
];

interface PendingVerification {
  id: string;
  client: string;
  deliverableTitle: string;
  service: string;
  submitterRole: string;
  reviewerRole: string;
  submittedAt: string;
  evidenceRef: string;
}

const SAMPLE_VERIFICATIONS: PendingVerification[] = [
  {
    id: "ver-1",
    client: "Apex Solar SA",
    deliverableTitle: "GHL WhatsApp Lead Ingestion & Webhook Journey",
    service: "CRM & AI Automation",
    submitterRole: "CRM Specialist",
    reviewerRole: "Operations Lead (Independent Reviewer)",
    submittedAt: "2026-10-07 16:30",
    evidenceRef: "https://app.gohighlevel.com/v2/location/apex-solar/workflows/w201",
  },
  {
    id: "ver-2",
    client: "Highveld Logistics",
    deliverableTitle: "Corporate Landing Page Mobile QA & Form Routing",
    service: "Websites & Software",
    submitterRole: "Frontend Developer",
    reviewerRole: "Operations Lead (Independent Reviewer)",
    submittedAt: "2026-10-08 08:15",
    evidenceRef: "https://staging.highveldlogistics.co.za/quote",
  },
];

export function OperationsDashboard() {
  const [verifications, setVerifications] = useState<PendingVerification[]>(SAMPLE_VERIFICATIONS);
  const [reworkModalItem, setReworkModalItem] = useState<PendingVerification | null>(null);
  const [reworkReason, setReworkReason] = useState("");

  const handleAccept = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
    toast.success("Deliverable QA verified and accepted as complete!");
  };

  const handleRework = () => {
    if (!reworkReason.trim()) {
      toast.error("Please provide a rework reason.");
      return;
    }
    if (reworkModalItem) {
      setVerifications((prev) => prev.filter((v) => v.id !== reworkModalItem.id));
      toast.warning(`Returned deliverable for rework: ${reworkReason}`);
      setReworkModalItem(null);
      setReworkReason("");
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Operations Summary KPIs ───────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Active Onboarding Workflows</span>
          <p className="text-2xl font-bold text-foreground mt-1">2 Clients</p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">1 Approaching 2-Day SLA Breach</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Campaigns Awaiting Launch</span>
          <p className="text-2xl font-bold text-foreground mt-1">2 Campaigns</p>
          <p className="text-[11px] text-muted-foreground mt-1">Target: &le;2 days from verified readiness</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">QA Verification Queue</span>
          <p className="text-2xl font-bold text-primary mt-1">{verifications.length} Deliverables</p>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting independent verification</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Active Delivery Blockers</span>
          <p className="text-2xl font-bold text-amber-500 mt-1">2 Blockers</p>
          <p className="text-[11px] text-muted-foreground mt-1">1 Client input pause, 1 Manager hold</p>
        </Card>
      </div>

      {/* ─── 2-Day Onboarding Pipeline (Section 6) ─────────────────────────── */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> 2-Day Client Onboarding Pipeline (18 Working Hours Target)
            </h3>
            <p className="text-xs text-muted-foreground">
              Intake to verified launch readiness. Access collection tracked with external pauses.
            </p>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
            2 Business Days SLA Policy
          </Badge>
        </div>

        <div className="space-y-4">
          {SAMPLE_ONBOARDING.map((onb) => (
            <div key={onb.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground">{onb.clientName}</h4>
                    {onb.isBreached && (
                      <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                        SLA Breached ({onb.workingHoursAge} hrs age)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Package: <strong>{onb.package}</strong> &bull; AM Role: <strong>{onb.accountManagerRole}</strong> &bull; Total Elapsed: <strong>{onb.totalElapsedDays} days</strong>
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => toast.success(`Readiness gate verified for ${onb.clientName}.`)}
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Verify Readiness Gate
                </Button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Current Stage: <strong className="text-foreground">{onb.currentStage}</strong></span>
                  <span>{onb.progress}% Complete</span>
                </div>
                <Progress value={onb.progress} className="h-2" />
              </div>

              {/* Access Collection Matrix */}
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground">Platform Access & Asset Checklist:</span>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(onb.accessChecklist).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span
                        className={`font-bold ${
                          val === "Verified"
                            ? "text-emerald-600"
                            : val === "Missing"
                            ? "text-rose-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Independent QA Verification Queue (Section 4) ─────────────────── */}
      <Card className="p-5 border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Independent QA Verification Queue</h3>
            <p className="text-xs text-muted-foreground">
              Review submitted deliverable evidence. A manager cannot verify their own deliverables.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {verifications.length} Deliverables Pending Review
          </Badge>
        </div>

        {verifications.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center">No pending verifications in the queue.</p>
        ) : (
          <div className="space-y-3">
            {verifications.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">{item.client}</span>
                    <Badge variant="secondary" className="text-[10px]">{item.service}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">{item.deliverableTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submitted by: <strong>{item.submitterRole}</strong> &bull; Reviewer: <strong>{item.reviewerRole}</strong>
                  </p>
                  <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded">
                    <strong>Evidence Ref:</strong> {item.evidenceRef}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-rose-600 hover:text-rose-700"
                    onClick={() => setReworkModalItem(item)}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Request Rework
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    onClick={() => handleAccept(item.id)}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Accept Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── Rework Modal ──────────────────────────────────────────────────── */}
      {reworkModalItem && (
        <Dialog open={Boolean(reworkModalItem)} onOpenChange={() => setReworkModalItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <XCircle className="h-5 w-5" /> Return Deliverable for Rework
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide specific QA correction instructions for {reworkModalItem.deliverableTitle}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <textarea
                className="w-full p-2 border border-border rounded-md text-xs bg-background h-24"
                placeholder="Specify what checklist item failed or needs correction..."
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setReworkModalItem(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleRework}>
                Return for Rework
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
