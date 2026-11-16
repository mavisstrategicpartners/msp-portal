import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FieldRow, Options, inputClass, textareaClass } from "@/components/sales-arena/ArenaUI";
import { arenaFetch, useArenaMe, useArenaMutation } from "@/lib/sales-arena-api";
import { ACTIVITY_RESULTS, ACTIVITY_TYPES, MAGNET_WORK_STATUSES, RECEIPT_TYPES, REPORT_TYPES, SERVICES, todayZA } from "@/lib/sales-arena-shared";

const nul = (v: any) => (v === "" || v === undefined ? null : v);
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  const z = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => z.find((p) => p.type === t)?.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}`;
};

function Shell({ open, onOpenChange, title, description, children, onSave, busy, saveLabel, disabled }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={busy || disabled}>{busy ? "Saving…" : saveLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Setter activity (one row per contact attempt) ─────────────────────────
export function ActivityForm({ open, onOpenChange, activity, preset }: { open: boolean; onOpenChange: (v: boolean) => void; activity?: any; preset?: any }) {
  const { data: me } = useArenaMe();
  const create = useArenaMutation("POST");
  const update = useArenaMutation("PATCH");
  const [f, setF] = useState<any>({});
  const [dateKnown, setDateKnown] = useState(true);
  useEffect(() => {
    if (!open) return;
    const a = activity ?? {};
    setDateKnown(activity ? Boolean(activity.activity_at) : true);
    setF({
      activity_at: toLocalInput(a.activity_at) || (activity ? "" : toLocalInput(new Date().toISOString())),
      activity_month: (a.activity_month || todayZA()).slice(0, 7),
      setter_id: a.setter_id ?? me?.salesperson?.id ?? "",
      deal_ref: a.deal_ref ?? preset?.deal_ref ?? "",
      company: a.company ?? preset?.company ?? "",
      activity_type: a.activity_type ?? "Call",
      result: a.result ?? "No answer",
      qualified: a.qualified ? "Yes" : "No",
      meeting_booked: a.meeting_booked ? "Yes" : "No",
      appointment_at: toLocalInput(a.appointment_at),
      closer_id: a.closer_id ?? preset?.closer_id ?? "",
      next_follow_up: a.next_follow_up ?? "",
      call_minutes: a.call_minutes ?? "",
      notes: a.notes ?? "",
    });
  }, [open, activity, preset, me]);
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.value }));
  const save = async () => {
    const body: any = {
      ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, nul(v)])),
      activity_at: dateKnown ? nul(f.activity_at) : null,
      activity_month: f.activity_month,
      qualified: f.qualified === "Yes",
      meeting_booked: f.meeting_booked === "Yes",
      appointment_at: f.meeting_booked === "Yes" ? nul(f.appointment_at) : null,
    };
    if (!me?.isCEO) delete body.setter_id;
    try {
      if (activity) await update.mutateAsync({ path: `/activities/${activity.id}`, body });
      else await create.mutateAsync({ path: "/activities", body });
      toast.success(activity ? "Activity updated" : "Contact attempt logged");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Shell open={open} onOpenChange={onOpenChange} busy={create.isPending || update.isPending} onSave={save} saveLabel={activity ? "Save" : "Log attempt"}
      title={activity ? "Edit contact attempt" : "Log a contact attempt"}
      description="One entry per call, WhatsApp or email. A repeat call is a new entry with the same lead ID. This is never recorded as income.">
      <FieldRow label="Exact date known?">
        <select className={inputClass} value={dateKnown ? "yes" : "no"} onChange={(e) => setDateKnown(e.target.value === "yes")}>
          <option value="yes">Yes</option>
          <option value="no">No — record the month only</option>
        </select>
      </FieldRow>
      {dateKnown ? (
        <FieldRow label="Date and time *">
          <input type="datetime-local" className={inputClass} value={f.activity_at || ""} onChange={set("activity_at")} />
        </FieldRow>
      ) : (
        <FieldRow label="Reporting month *" hint="The call counts in this month; daily charts need the exact date.">
          <input type="month" className={inputClass} value={f.activity_month || ""} onChange={set("activity_month")} />
        </FieldRow>
      )}
      {me?.isCEO && (
        <FieldRow label="Lead setter *">
          <select className={inputClass} value={f.setter_id} onChange={set("setter_id")}>
            <option value="">Choose…</option>
            {me.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FieldRow>
      )}
      <FieldRow label="Lead / CRM ID" hint="Use the same ID as the pipeline deal.">
        <input className={inputClass} value={f.deal_ref || ""} onChange={set("deal_ref")} />
      </FieldRow>
      <FieldRow label="Company / lead">
        <input className={inputClass} value={f.company || ""} onChange={set("company")} />
      </FieldRow>
      <FieldRow label="Activity *">
        <select className={inputClass} value={f.activity_type} onChange={set("activity_type")}><Options list={ACTIVITY_TYPES} placeholder={false} /></select>
      </FieldRow>
      <FieldRow label="Result *" hint="Use Connected only when a real conversation happened.">
        <select className={inputClass} value={f.result} onChange={set("result")}><Options list={ACTIVITY_RESULTS} placeholder={false} /></select>
      </FieldRow>
      <FieldRow label="Qualified?" hint="Need, fit, decision-maker, budget and timing confirmed.">
        <select className={inputClass} value={f.qualified} onChange={set("qualified")}><option>No</option><option>Yes</option></select>
      </FieldRow>
      <FieldRow label="Meeting booked?">
        <select className={inputClass} value={f.meeting_booked} onChange={set("meeting_booked")}><option>No</option><option>Yes</option></select>
      </FieldRow>
      {f.meeting_booked === "Yes" && (
        <FieldRow label="Appointment date and time">
          <input type="datetime-local" className={inputClass} value={f.appointment_at || ""} onChange={set("appointment_at")} />
        </FieldRow>
      )}
      <FieldRow label="Assigned closer">
        <select className={inputClass} value={f.closer_id} onChange={set("closer_id")}>
          <option value="">Not assigned</option>
          {me?.people.filter((p) => p.is_closer).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Next follow-up">
        <input type="date" className={inputClass} value={f.next_follow_up || ""} onChange={set("next_follow_up")} />
      </FieldRow>
      <FieldRow label="Call minutes">
        <input className={inputClass} value={f.call_minutes ?? ""} onChange={set("call_minutes")} inputMode="decimal" />
      </FieldRow>
      <FieldRow label="Next action / notes" className="sm:col-span-2">
        <textarea className={textareaClass} value={f.notes || ""} onChange={set("notes")} />
      </FieldRow>
    </Shell>
  );
}

// ── Payment received (one row per actual receipt) ─────────────────────────
export function PaymentForm({ open, onOpenChange, payment, preset }: { open: boolean; onOpenChange: (v: boolean) => void; payment?: any; preset?: any }) {
  const { data: me } = useArenaMe();
  const create = useArenaMutation("POST");
  const update = useArenaMutation("PATCH");
  const [f, setF] = useState<any>({});
  const [dateKnown, setDateKnown] = useState(true);
  const [dupWarn, setDupWarn] = useState<string | null>(null);
  const isCEO = Boolean(me?.isCEO);
  const dateOnly = Boolean(payment && !isCEO); // a salesperson may only add the receipt date
  useEffect(() => {
    if (!open) return;
    const p = payment ?? {};
    setDupWarn(null);
    setDateKnown(payment ? true : true);
    setF({
      receipt_date: p.receipt_date ?? (payment ? "" : todayZA()),
      revenue_month: String(p.revenue_month || todayZA()).slice(0, 7),
      salesperson_id: p.salesperson_id ?? preset?.salesperson_id ?? me?.salesperson?.id ?? "",
      client: p.client ?? preset?.client ?? "",
      service: p.service ?? preset?.service ?? "",
      deal_ref: p.deal_ref ?? preset?.deal_ref ?? "",
      invoice_ref: p.invoice_ref ?? "",
      amount: p.amount ?? "",
      receipt_type: p.receipt_type ?? "",
      payment_ref: p.payment_ref ?? "",
      notes: p.notes ?? "",
    });
  }, [open, payment, preset, me]);
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.value }));
  const save = async (confirmDuplicate = false) => {
    let body: any;
    if (dateOnly) body = { receipt_date: nul(f.receipt_date) };
    else {
      body = { ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, nul(v)])), receipt_date: dateKnown ? nul(f.receipt_date) : null, confirmDuplicate };
      if (!isCEO) delete body.salesperson_id;
    }
    try {
      if (payment) await update.mutateAsync({ path: `/payments/${payment.id}`, body });
      else await create.mutateAsync({ path: "/payments", body });
      toast.success(payment ? "Payment updated" : "Receipt recorded");
      onOpenChange(false);
    } catch (e: any) {
      if (e.status === 409 && /same client, amount and date/.test(e.message)) setDupWarn(e.message);
      else toast.error(e.message);
    }
  };
  return (
    <Shell open={open} onOpenChange={onOpenChange} busy={create.isPending || update.isPending} onSave={() => save(false)}
      saveLabel={payment ? (dateOnly ? "Add receipt date" : "Save") : "Record receipt"}
      title={payment ? (dateOnly ? "Add the receipt date" : "Edit payment") : "Record a payment received"}
      description="One entry per actual receipt: MSP fees only, excluding VAT and client advertising spend. Refunds are negative amounts. Never re-enter a deposit as part of a later payment.">
      {!payment && (
        <FieldRow label="Exact receipt date known?">
          <select className={inputClass} value={dateKnown ? "yes" : "no"} onChange={(e) => setDateKnown(e.target.value === "yes")}>
            <option value="yes">Yes</option>
            <option value="no">No — month confirmed only</option>
          </select>
        </FieldRow>
      )}
      {dateKnown || payment ? (
        <FieldRow label={dateOnly ? "Receipt date *" : "Receipt date"} hint={payment && !payment.receipt_date ? `Must be in ${String(payment.revenue_month).slice(0, 7)}.` : undefined}>
          <input type="date" className={inputClass} value={f.receipt_date || ""} max={todayZA()} onChange={set("receipt_date")} />
        </FieldRow>
      ) : (
        <FieldRow label="Revenue month *" hint="Counts in the month total; not in week or day figures until the date is added.">
          <input type="month" className={inputClass} value={f.revenue_month || ""} onChange={set("revenue_month")} />
        </FieldRow>
      )}
      {!dateOnly && (
        <>
          {isCEO && (
            <FieldRow label="Salesperson credited *" hint="Receipts belong to the closer, not the lead setter.">
              <select className={inputClass} value={f.salesperson_id} onChange={set("salesperson_id")}>
                <option value="">Choose…</option>
                {me?.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FieldRow>
          )}
          <FieldRow label="Client / company *">
            <input className={inputClass} value={f.client || ""} onChange={set("client")} />
          </FieldRow>
          <FieldRow label="MSP fee received (R) *" hint="Excluding VAT and ad spend. Refunds negative, e.g. -4950.">
            <input className={inputClass} value={f.amount ?? ""} onChange={set("amount")} inputMode="decimal" />
          </FieldRow>
          <FieldRow label="Receipt type">
            <select className={inputClass} value={f.receipt_type || ""} onChange={set("receipt_type")}><Options list={RECEIPT_TYPES} /></select>
          </FieldRow>
          <FieldRow label="Service">
            <select className={inputClass} value={f.service || ""} onChange={set("service")}><Options list={SERVICES} /></select>
          </FieldRow>
          <FieldRow label="Deal / CRM ID" hint="The same ID as the pipeline deal.">
            <input className={inputClass} value={f.deal_ref || ""} onChange={set("deal_ref")} />
          </FieldRow>
          <FieldRow label="Invoice reference">
            <input className={inputClass} value={f.invoice_ref || ""} onChange={set("invoice_ref")} />
          </FieldRow>
          <FieldRow label="Payment reference" hint="Unique bank / EFT reference. Prevents recording the same receipt twice.">
            <input className={inputClass} value={f.payment_ref || ""} onChange={set("payment_ref")} />
          </FieldRow>
          <FieldRow label="Notes" className="sm:col-span-2">
            <textarea className={textareaClass} value={f.notes || ""} onChange={set("notes")} />
          </FieldRow>
        </>
      )}
      {dupWarn && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200 sm:col-span-2">
          {dupWarn}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={() => save(true)}>This is a separate payment — record it</Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ── Lead magnet: competitor analysis / growth audit ───────────────────────
export function MagnetForm({ open, onOpenChange, magnet, preset }: { open: boolean; onOpenChange: (v: boolean) => void; magnet?: any; preset?: any }) {
  const { data: me } = useArenaMe();
  const create = useArenaMutation("POST");
  const update = useArenaMutation("PATCH");
  const [f, setF] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!open) return;
    const m = magnet ?? {};
    setFile(null);
    setF({
      deal_ref: m.deal_ref ?? preset?.deal_ref ?? "", company: m.company ?? preset?.company ?? "", report_type: m.report_type ?? "Competitor analysis",
      requested_date: m.requested_date ?? (magnet ? "" : todayZA()), sales_owner_id: m.sales_owner_id ?? preset?.sales_owner_id ?? (me?.isCEO ? "" : me?.salesperson?.id ?? ""),
      prepared_by_name: m.prepared_by_name ?? "", prepared_by_profile: m.prepared_by_profile ?? "", due_date: m.due_date ?? "", workflow_status: m.workflow_status ?? "Requested",
      completed_date: m.completed_date ?? "", report_link: m.report_link ?? "", sent_date: m.sent_date ?? "", discussed_date: m.discussed_date ?? "",
      next_follow_up: m.next_follow_up ?? "", next_action: m.next_action ?? "",
    });
    if (me?.isCEO)
      supabase.from("profiles").select("id, full_name, email, is_active").order("full_name").then(({ data }) =>
        setProfiles((data ?? []).filter((p: any) => p.is_active !== false).map((p: any) => ({ id: p.id, name: p.full_name || p.email }))),
      );
  }, [open, magnet, preset, me]);
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.value }));
  const hasReport = Boolean(f.report_link || file || magnet?.has_file);
  const canSend = Boolean(f.completed_date && hasReport);
  const save = async () => {
    const body: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, nul(v)]));
    if (!me?.isCEO) delete body.prepared_by_profile;
    try {
      let saved: any;
      if (magnet) {
        if (file) await attach(magnet.id);
        saved = await update.mutateAsync({ path: `/lead-magnets/${magnet.id}`, body });
      } else {
        const sentLater = { sent_date: body.sent_date, discussed_date: body.discussed_date };
        if (file) { body.sent_date = null; body.discussed_date = null; }
        saved = await create.mutateAsync({ path: "/lead-magnets", body });
        if (file) {
          await attach(saved.leadMagnet.id);
          if (sentLater.sent_date) await update.mutateAsync({ path: `/lead-magnets/${saved.leadMagnet.id}`, body: sentLater });
        }
      }
      toast.success(magnet ? "Report updated" : "Report request added");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  async function attach(id: string) {
    if (!file) return;
    setUploading(true);
    try {
      const slot = await arenaFetch<any>(`/lead-magnets/${id}/upload-url`, { method: "POST", body: { fileName: file.name, size: file.size } });
      const { error } = await supabase.storage.from(slot.bucket).uploadToSignedUrl(slot.path, slot.token, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (error) throw new Error("The upload failed. Try again.");
      await arenaFetch(`/lead-magnets/${id}`, { method: "PATCH", body: { report_file: { path: slot.path, name: file.name, size: file.size, mimeType: file.type } } });
    } finally {
      setUploading(false);
    }
  }
  const readOnlyOwner = !me?.isCEO && Boolean(magnet);
  return (
    <Shell open={open} onOpenChange={onOpenChange} busy={create.isPending || update.isPending || uploading} onSave={save} saveLabel={magnet ? "Save" : "Add report request"} disabled={!f.company?.trim()}
      title={magnet ? `${magnet.report_type}: ${magnet.company}` : "Request a competitor analysis or growth audit"}
      description="A status alone is not proof of completion: enter the actual completed date and the report link or file. Enter the sent date only after delivery, and the discussed date only after the conversation.">
      <FieldRow label="Company / prospect *"><input className={inputClass} value={f.company || ""} onChange={set("company")} /></FieldRow>
      <FieldRow label="Lead / CRM ID"><input className={inputClass} value={f.deal_ref || ""} onChange={set("deal_ref")} /></FieldRow>
      <FieldRow label="Report type *"><select className={inputClass} value={f.report_type} onChange={set("report_type")}><Options list={REPORT_TYPES} placeholder={false} /></select></FieldRow>
      <FieldRow label="Work status"><select className={inputClass} value={f.workflow_status} onChange={set("workflow_status")}><Options list={MAGNET_WORK_STATUSES} placeholder={false} /></select></FieldRow>
      <FieldRow label="Requested date"><input type="date" className={inputClass} value={f.requested_date || ""} onChange={set("requested_date")} /></FieldRow>
      <FieldRow label="Due date"><input type="date" className={inputClass} value={f.due_date || ""} onChange={set("due_date")} /></FieldRow>
      <FieldRow label="Sales owner">
        <select className={inputClass} value={f.sales_owner_id || ""} onChange={set("sales_owner_id")} disabled={readOnlyOwner}>
          <option value="">Not confirmed</option>
          {me?.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Prepared by"><input className={inputClass} value={f.prepared_by_name || ""} onChange={set("prepared_by_name")} /></FieldRow>
      {me?.isCEO && (
        <FieldRow label="Preparer's portal account" hint="Lets the preparer open and update this report only." className="sm:col-span-2">
          <select className={inputClass} value={f.prepared_by_profile || ""} onChange={set("prepared_by_profile")}>
            <option value="">No portal access</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FieldRow>
      )}
      <FieldRow label="Completed date" hint="Actual date the report was finished."><input type="date" className={inputClass} max={todayZA()} value={f.completed_date || ""} onChange={set("completed_date")} /></FieldRow>
      <FieldRow label="Report link"><input className={inputClass} value={f.report_link || ""} onChange={set("report_link")} placeholder="https://" /></FieldRow>
      <FieldRow label="Or upload the report" className="sm:col-span-2" hint={magnet?.file_name ? `Current file: ${magnet.file_name}` : "PDF, Word, PowerPoint, Excel or image, up to 25 MB. Stored privately."}>
        <input type="file" className="text-sm" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </FieldRow>
      <FieldRow label="Sent date" hint={canSend ? "Only after delivery is confirmed." : "Available once the completed date and report are recorded."}>
        <input type="date" className={inputClass} max={todayZA()} value={f.sent_date || ""} onChange={set("sent_date")} disabled={!canSend} />
      </FieldRow>
      <FieldRow label="Discussed date" hint="Only after the conversation with the prospect.">
        <input type="date" className={inputClass} max={todayZA()} value={f.discussed_date || ""} onChange={set("discussed_date")} disabled={!f.sent_date} />
      </FieldRow>
      <FieldRow label="Next follow-up"><input type="date" className={inputClass} value={f.next_follow_up || ""} onChange={set("next_follow_up")} /></FieldRow>
      <FieldRow label="Next action / notes" className="sm:col-span-2"><textarea className={textareaClass} value={f.next_action || ""} onChange={set("next_action")} /></FieldRow>
    </Shell>
  );
}

// ── Complete a pipeline follow-up and schedule the next ───────────────────
export function FollowUpDialog({ open, onOpenChange, deal }: { open: boolean; onOpenChange: (v: boolean) => void; deal: any }) {
  const update = useArenaMutation("PATCH");
  const [f, setF] = useState({ outcome: "", next_follow_up: "", next_action: "" });
  useEffect(() => { if (open) setF({ outcome: "", next_follow_up: "", next_action: deal?.next_action ?? "" }); }, [open, deal]);
  const save = async () => {
    try {
      await update.mutateAsync({ path: `/opportunities/${deal.id}`, body: { completeFollowUp: true, outcome: f.outcome || null, next_follow_up: f.next_follow_up || null, next_action: f.next_action || null } });
      toast.success("Follow-up completed");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Shell open={open} onOpenChange={onOpenChange} busy={update.isPending} onSave={save} saveLabel="Complete follow-up" title="Complete follow-up" description="Record what happened and schedule the next step. Kept in the deal's history.">
      <FieldRow label="Outcome" className="sm:col-span-2"><textarea className={textareaClass} value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })} /></FieldRow>
      <FieldRow label="Next follow-up"><input type="date" className={inputClass} value={f.next_follow_up} onChange={(e) => setF({ ...f, next_follow_up: e.target.value })} /></FieldRow>
      <FieldRow label="Next action"><input className={inputClass} value={f.next_action} onChange={(e) => setF({ ...f, next_action: e.target.value })} /></FieldRow>
    </Shell>
  );
}
