/**
 * Evidence submission viewer + review.
 *
 * Opens one submission (by id), shows who submitted what and when, previews
 * every attached file inside the dashboard (images, PDFs, Office documents,
 * text, video) with open / download links, and — for an authorised reviewer —
 * Approve / Request corrections / Reject with comments.
 * File links are short-lived signed URLs issued by the server on each open.
 */
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  History,
  Link2,
  Loader2,
  RotateCcw,
  XCircle,
  File as FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvidenceDetail, useReviewEvidence } from "@/lib/staff-tasks.service";
import type { EvidenceFile, EvidenceReviewStatus } from "@/lib/staff-tasks.types";

type Props = {
  evidenceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed?: (status: EvidenceReviewStatus) => void;
};

const STATUS_STYLE: Record<string, string> = {
  "Submitted for Review":
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  Approved:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Changes Requested":
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
  Rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  Draft: "bg-muted text-muted-foreground",
};

function kindOf(f: EvidenceFile): "image" | "pdf" | "office" | "text" | "video" | "other" {
  const t = (f.mimeType || "").toLowerCase();
  const n = f.name.toLowerCase();
  if (t.startsWith("image/")) return "image";
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("text/") || n.endsWith(".csv") || n.endsWith(".txt")) return "text";
  if (
    /(msword|wordprocessingml|ms-excel|spreadsheetml|ms-powerpoint|presentationml)/.test(t) ||
    /\.(docx?|xlsx?|pptx?)$/.test(n)
  )
    return "office";
  return "other";
}

function FileKindIcon({ f, className }: { f: EvidenceFile; className?: string }) {
  const k = kindOf(f);
  if (k === "image") return <FileImage className={className} />;
  if (k === "video") return <FileVideo className={className} />;
  if (k === "office" && /sheet|excel|\.xlsx?$/i.test(f.mimeType + f.name))
    return <FileSpreadsheet className={className} />;
  if (k === "other") return <FileIcon className={className} />;
  return <FileText className={className} />;
}

function size(bytes: number) {
  if (!bytes) return "";
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function FilePreview({ f }: { f: EvidenceFile }) {
  if (!f.available || !f.url) {
    return (
      <div
        role="alert"
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-6 text-center text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
      >
        <AlertTriangle className="h-6 w-6" />
        <p className="font-semibold">This file can't be opened</p>
        <p className="max-w-sm">{f.unavailableReason || "The file is not available."}</p>
      </div>
    );
  }
  const k = kindOf(f);
  const frame = "h-[60vh] min-h-[320px] w-full rounded-md border border-border bg-white";
  if (k === "image")
    return (
      <div className="flex max-h-[60vh] min-h-[260px] items-center justify-center overflow-auto rounded-md border border-border bg-muted/30 p-2">
        <img src={f.url} alt={f.name} className="max-h-[58vh] max-w-full object-contain" />
      </div>
    );
  if (k === "pdf") return <iframe title={f.name} src={f.url} className={frame} />;
  if (k === "video")
    return (
      <video
        src={f.url}
        controls
        className="max-h-[60vh] w-full rounded-md border border-border bg-black"
      />
    );
  if (k === "text") return <iframe title={f.name} src={f.url} className={frame} />;
  if (k === "office")
    return (
      <iframe
        title={f.name}
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(f.url)}`}
        className={frame}
      />
    );
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
      <FileIcon className="h-6 w-6" />
      <p>No in-browser preview for this file type. Use Download to open it.</p>
    </div>
  );
}

export function EvidenceReviewDialog({ evidenceId, open, onOpenChange, onReviewed }: Props) {
  const { data: ev, isLoading, error, refetch } = useEvidenceDetail(open ? evidenceId : null);
  const review = useReviewEvidence();
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setSelected(0);
    setComment("");
  }, [evidenceId, open]);

  const files = ev?.uploadedFiles ?? [];
  const current = files[selected];

  async function decide(status: EvidenceReviewStatus) {
    if (!ev) return;
    if (status !== "Approved" && !comment.trim()) {
      toast.error("Add a comment explaining what needs to change.");
      return;
    }
    try {
      await review.mutateAsync({ evidenceId: ev.id, status, reviewerFeedback: comment.trim() });
      toast.success(
        status === "Approved"
          ? `Approved. ${ev.submittingStaffName} has been notified.`
          : status === "Rejected"
            ? `Rejected. ${ev.submittingStaffName} has been notified.`
            : `Corrections requested. ${ev.submittingStaffName} has been notified.`,
      );
      onReviewed?.(status);
      await refetch();
    } catch (e: any) {
      toast.error("Could not save the review", { description: e?.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6 text-base font-bold">
            {ev?.taskTitle || "Evidence submission"}
            {ev && (
              <Badge variant="outline" className={STATUS_STYLE[ev.status] || ""}>
                {ev.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {ev ? `Submission #${ev.submissionNumber}` : "Loading submission…"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading evidence…
          </div>
        )}
        {error && !isLoading && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {(error as Error).message}
          </div>
        )}

        {ev && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Submitted by</dt>
                <dd className="font-semibold text-foreground">{ev.submittingStaffName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-semibold text-foreground">
                  {ev.submittingStaffDepartment || ev.taskDepartment || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Task department</dt>
                <dd className="font-semibold text-foreground">{ev.taskDepartment || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="font-semibold text-foreground">
                  {new Date(ev.submittedAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            <section className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm text-foreground">
                {ev.writtenExplanation || (
                  <span className="text-muted-foreground">No description provided.</span>
                )}
              </p>
            </section>

            {ev.deliverableLinks?.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ev.deliverableLinks.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-xs text-primary hover:underline"
                    >
                      <Link2 className="h-3 w-3" /> {l.title || l.url}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence files ({files.length})
              </h3>
              {files.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No files were attached to this submission.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <ul
                    className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible"
                    aria-label="Attached files"
                  >
                    {files.map((f, i) => (
                      <li key={i} className="min-w-[180px] md:min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelected(i)}
                          aria-current={i === selected}
                          className={`flex w-full items-start gap-2 rounded-md border p-2 text-left text-xs transition ${i === selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                        >
                          <FileKindIcon
                            f={f}
                            className={`mt-0.5 h-4 w-4 shrink-0 ${f.available ? "text-primary" : "text-amber-600"}`}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {f.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {size(f.size)}
                              {!f.available && " · not available"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {current && (
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {current.name}
                        </p>
                        {current.available && current.url && (
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                              <a href={current.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open
                              </a>
                            </Button>
                            <Button asChild size="sm" className="h-8 text-xs">
                              <a href={current.downloadUrl || current.url} download={current.name}>
                                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                      <FilePreview f={current} />
                    </div>
                  )}
                </div>
              )}
            </section>

            {ev.reviewedAt && (
              <section className="rounded-md border border-border bg-muted/30 p-3 text-xs">
                <p className="font-semibold text-foreground">
                  {ev.status} by {ev.reviewedByName} · {new Date(ev.reviewedAt).toLocaleString()}
                </p>
                {ev.reviewerFeedback && (
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {ev.reviewerFeedback}
                  </p>
                )}
              </section>
            )}

            {ev.canReview && (
              <section className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <Label htmlFor="evidence-review-comment" className="text-xs font-semibold">
                  Review comments{" "}
                  <span className="font-normal text-muted-foreground">
                    (required to request corrections or reject)
                  </span>
                </Label>
                <Textarea
                  id="evidence-review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you check? What needs to change?"
                  className="min-h-[80px] text-sm"
                  disabled={review.isPending}
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={review.isPending}
                    onClick={() => decide("Rejected")}
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:text-red-300"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={review.isPending}
                    onClick={() => decide("Changes Requested")}
                    className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:text-amber-300"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Request corrections
                  </Button>
                  <Button
                    size="sm"
                    disabled={review.isPending}
                    onClick={() => decide("Approved")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {review.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                </div>
              </section>
            )}

            {ev.history?.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" /> Earlier submissions
                </h3>
                <ul className="space-y-1 text-xs">
                  {ev.history.map((h) => (
                    <li
                      key={h.id}
                      className="flex flex-wrap items-center gap-2 rounded border border-border px-2 py-1.5"
                    >
                      <span className="font-medium">#{h.submissionNumber}</span>
                      <span className="text-muted-foreground">
                        {new Date(h.submittedAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_STYLE[h.status] || ""}`}
                      >
                        {h.status}
                      </Badge>
                      {h.reviewerFeedback && (
                        <span className="truncate text-muted-foreground">
                          “{h.reviewerFeedback}”
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
