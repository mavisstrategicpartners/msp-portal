/**
 * Executive follow-ups assigned to the signed-in employee. Shown at the top of
 * their dashboard only when the CEO has asked them to act on something.
 */
import { MessageSquareWarning } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFollowUps } from "@/lib/executive.service";
import { FollowUpList } from "@/components/executive/ExecutiveUI";

export function MyFollowUps({ enabled = true }: { enabled?: boolean }) {
  const { data } = useFollowUps(enabled);
  const open = (data || []).filter((f) => f.status !== "Resolved");
  if (!open.length) return null;
  return (
    <Card className="p-4 space-y-3 border-amber-500/40 bg-amber-500/5">
      <div className="flex items-center gap-2">
        <MessageSquareWarning className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-foreground">
          Follow-ups requested by the CEO ({open.length})
        </p>
      </div>
      <FollowUpList followUps={open} mode="assignee" />
    </Card>
  );
}
