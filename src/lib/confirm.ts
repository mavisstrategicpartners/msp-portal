/**
 * Professional confirmation dialog for important or destructive actions (never a toast, never
 * the browser's own confirm box). Resolves true only when the person presses the confirm button.
 *
 *   if (!(await confirmAction({ title: "Delete document?", description: "...", confirmText: "Delete", variant: "destructive" }))) return;
 */
import { confirmModal, type ConfirmOptions } from "@/components/ui/modal-context";

export type { ConfirmOptions };
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return confirmModal(options);
}
