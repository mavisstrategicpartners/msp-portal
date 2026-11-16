import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldRow, Options, inputClass, textareaClass } from "@/components/sales-arena/ArenaUI";
import { useArenaMe, useArenaMutation } from "@/lib/sales-arena-api";
import { INDUSTRIES, LEAD_SOURCES, SERVICES, STAGES } from "@/lib/sales-arena-shared";

const EMPTY = {
  deal_ref: "", received_date: "", salesperson_id: "", company: "", contact_name: "", phone: "", email: "", industry: "", service: "", lead_source: "",
  stage: "New", quoted_fee: "", signed_value: "", expected_close: "", next_follow_up: "", next_action: "", lost_reason: "", ghl_url: "",
  setter_id: "", contacted_by: "", contact_date: "", website: "", location: "", notes: "",
};

/** Create or edit a pipeline opportunity. Quoted fee, signed value and cash are separate figures. */
export function DealForm({ open, onOpenChange, deal, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; deal?: any; onSaved?: (d: any) => void }) {
  const { data: me } = useArenaMe();
  const [f, setF] = useState<any>(EMPTY);
  const create = useArenaMutation("POST");
  const update = useArenaMutation("PATCH");
  useEffect(() => {
    if (!open) return;
    if (deal) setF(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, deal[k] ?? ""])));
    else setF({ ...EMPTY, salesperson_id: me?.isCEO ? "" : me?.salesperson?.id ?? "" });
  }, [open, deal, me]);
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.value }));
  const nul = (v: string) => (v === "" ? null : v);
  const isCEO = Boolean(me?.isCEO);
  const isSetter = Boolean(me?.salesperson?.is_setter);
  const canAssign = isCEO || (!deal && isSetter);

  const save = async () => {
    const body: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, nul(String(v ?? ""))]));
    if (!isCEO) delete body.deal_ref;
    if (!deal && !isCEO && isSetter && body.salesperson_id && body.salesperson_id !== me?.salesperson?.id) body.setter_id = me?.salesperson?.id;
    try {
      const r: any = deal
        ? await update.mutateAsync({ path: `/opportunities/${deal.id}`, body })
        : await create.mutateAsync({ path: "/opportunities", body });
      toast.success(deal ? "Deal updated" : `Lead ${r.opportunity?.deal_ref ?? ""} added`);
      onSaved?.(r.opportunity);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const busy = create.isPending || update.isPending;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{deal ? `Edit ${deal.deal_ref}` : "Add lead"}</DialogTitle>
          <DialogDescription>
            Won means signed. Cash is recorded separately on the Payments page, against the same deal ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldRow label="Company *">
            <input className={inputClass} value={f.company} onChange={set("company")} />
          </FieldRow>
          <FieldRow label="Deal / CRM ID" hint={isCEO ? "Leave blank for the next MSP-LOCAL number, or enter the GoHighLevel ID." : "Assigned automatically; the CEO can replace it with the GoHighLevel ID."}>
            <input className={inputClass} value={f.deal_ref} onChange={set("deal_ref")} disabled={!isCEO} placeholder={deal ? "" : "Automatic"} />
          </FieldRow>
          <FieldRow label="Contact name">
            <input className={inputClass} value={f.contact_name} onChange={set("contact_name")} />
          </FieldRow>
          <FieldRow label="Date received" hint="Leave blank if not known.">
            <input type="date" className={inputClass} value={f.received_date} onChange={set("received_date")} />
          </FieldRow>
          <FieldRow label="Phone">
            <input className={inputClass} value={f.phone} onChange={set("phone")} inputMode="tel" />
          </FieldRow>
          <FieldRow label="Email">
            <input type="email" className={inputClass} value={f.email} onChange={set("email")} />
          </FieldRow>
          <FieldRow label="Salesperson (closer)">
            <select className={inputClass} value={f.salesperson_id} onChange={set("salesperson_id")} disabled={!canAssign}>
              <option value="">Not assigned</option>
              {me?.people.filter((p) => p.is_closer).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Lead setter">
            <select className={inputClass} value={f.setter_id} onChange={set("setter_id")} disabled={!isCEO}>
              <option value="">Not recorded</option>
              {me?.people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Industry">
            <select className={inputClass} value={f.industry} onChange={set("industry")}>
              <Options list={INDUSTRIES} />
            </select>
          </FieldRow>
          <FieldRow label="Service">
            <select className={inputClass} value={f.service} onChange={set("service")}>
              <Options list={SERVICES} />
            </select>
          </FieldRow>
          <FieldRow label="Lead source">
            <select className={inputClass} value={f.lead_source} onChange={set("lead_source")}>
              <Options list={LEAD_SOURCES} />
            </select>
          </FieldRow>
          <FieldRow label="Pipeline stage">
            <select className={inputClass} value={f.stage} onChange={set("stage")}>
              <Options list={STAGES} placeholder={false} />
            </select>
          </FieldRow>
          <FieldRow label="Quoted MSP fee (R)" hint="Monthly fee quoted, excluding VAT and ad spend.">
            <input className={inputClass} value={f.quoted_fee} onChange={set("quoted_fee")} inputMode="decimal" />
          </FieldRow>
          <FieldRow label="Signed contract value (R)" hint="Only once signed. This is not cash received.">
            <input className={inputClass} value={f.signed_value} onChange={set("signed_value")} inputMode="decimal" />
          </FieldRow>
          <FieldRow label="Expected close">
            <input type="date" className={inputClass} value={f.expected_close} onChange={set("expected_close")} />
          </FieldRow>
          <FieldRow label="Next follow-up">
            <input type="date" className={inputClass} value={f.next_follow_up} onChange={set("next_follow_up")} />
          </FieldRow>
          <FieldRow label="Next action" className="sm:col-span-2">
            <input className={inputClass} value={f.next_action} onChange={set("next_action")} />
          </FieldRow>
          {f.stage === "Lost" && (
            <FieldRow label="Lost reason *" className="sm:col-span-2">
              <input className={inputClass} value={f.lost_reason} onChange={set("lost_reason")} />
            </FieldRow>
          )}
          <FieldRow label="Contacted by">
            <input className={inputClass} value={f.contacted_by} onChange={set("contacted_by")} />
          </FieldRow>
          <FieldRow label="Contact date" hint="Actual date only; leave blank if not known.">
            <input type="date" className={inputClass} value={f.contact_date} onChange={set("contact_date")} />
          </FieldRow>
          <FieldRow label="Website">
            <input className={inputClass} value={f.website} onChange={set("website")} />
          </FieldRow>
          <FieldRow label="Location">
            <input className={inputClass} value={f.location} onChange={set("location")} />
          </FieldRow>
          <FieldRow label="GoHighLevel opportunity URL" className="sm:col-span-2" hint="Optional link to the opportunity in GoHighLevel. The portal does not sync with GoHighLevel.">
            <input className={inputClass} value={f.ghl_url} onChange={set("ghl_url")} placeholder="https://" />
          </FieldRow>
          <FieldRow label="Lead notes" className="sm:col-span-2">
            <textarea className={textareaClass} value={f.notes} onChange={set("notes")} />
          </FieldRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy || !f.company.trim()}>{busy ? "Saving…" : deal ? "Save changes" : "Add lead"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
