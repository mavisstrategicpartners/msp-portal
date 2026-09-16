import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, AlertCircle, Info, HelpCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "primary" | "info";
  icon?: React.ReactNode;
}

export interface PromptOptions {
  title?: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
}

interface ModalContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  prompt: (options: PromptOptions | string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Global bridge for non-hook callers if ever needed
let globalConfirmBridge: ((options: ConfirmOptions | string) => Promise<boolean>) | null = null;
let globalPromptBridge: ((options: PromptOptions | string) => Promise<string | null>) | null = null;

export const confirmModal = (options: ConfirmOptions | string) => {
  if (globalConfirmBridge) {
    return globalConfirmBridge(options);
  }
  // Fallback if provider not yet mounted
  const msg = typeof options === "string" ? options : options.description || options.title || "";
  return Promise.resolve(typeof window !== "undefined" ? window.confirm(msg) : true);
};

export const promptModal = (options: PromptOptions | string) => {
  if (globalPromptBridge) {
    return globalPromptBridge(options);
  }
  const msg = typeof options === "string" ? options : options.description || options.title || "";
  const def = typeof options === "string" ? "" : options.defaultValue || "";
  return Promise.resolve(typeof window !== "undefined" ? window.prompt(msg, def) : null);
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  // Confirm state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  // Prompt state
  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    options: PromptOptions;
    value: string;
    error: string | null;
    resolve: (value: string | null) => void;
  } | null>(null);

  const promptInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const opts: ConfirmOptions =
      typeof options === "string" ? { description: options, title: "Confirm Action" } : options;

    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          title: opts.title || "Are you sure?",
          description: opts.description || "This action cannot be undone.",
          confirmText: opts.confirmText || (opts.variant === "destructive" ? "Delete" : "Confirm"),
          cancelText: opts.cancelText || "Cancel",
          variant: opts.variant || (opts.title?.toLowerCase().includes("delete") || opts.title?.toLowerCase().includes("remove") ? "destructive" : "primary"),
          icon: opts.icon,
        },
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions | string): Promise<string | null> => {
    const opts: PromptOptions =
      typeof options === "string" ? { title: options } : options;

    return new Promise<string | null>((resolve) => {
      setPromptState({
        isOpen: true,
        options: {
          title: opts.title || "Input Required",
          description: opts.description || "",
          defaultValue: opts.defaultValue || "",
          placeholder: opts.placeholder || "Enter value...",
          confirmText: opts.confirmText || "Submit",
          cancelText: opts.cancelText || "Cancel",
          required: opts.required ?? false,
          multiline: opts.multiline ?? false,
        },
        value: opts.defaultValue || "",
        error: null,
        resolve,
      });
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 50);
    });
  }, []);

  // Update bridges
  globalConfirmBridge = confirm;
  globalPromptBridge = prompt;

  const handleConfirmAction = () => {
    if (confirmState) {
      confirmState.resolve(true);
      setConfirmState(null);
    }
  };

  const handleConfirmCancel = () => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptState) return;

    if (promptState.options.required && !promptState.value.trim()) {
      setPromptState((prev) => (prev ? { ...prev, error: "This field is required" } : null));
      return;
    }

    promptState.resolve(promptState.value.trim());
    setPromptState(null);
  };

  const handlePromptCancel = () => {
    if (promptState) {
      promptState.resolve(null);
      setPromptState(null);
    }
  };

  const getVariantStyles = (variant?: ConfirmOptions["variant"]) => {
    switch (variant) {
      case "destructive":
        return {
          iconBg: "bg-destructive/10 text-destructive border-destructive/20",
          icon: <Trash2 className="h-5 w-5" />,
          actionClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: <AlertTriangle className="h-5 w-5" />,
          actionClass: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        };
      case "info":
        return {
          iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: <Info className="h-5 w-5" />,
          actionClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        };
      case "primary":
      default:
        return {
          iconBg: "bg-primary/10 text-primary border-primary/20",
          icon: <HelpCircle className="h-5 w-5" />,
          actionClass: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        };
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, prompt }}>
      {children}

      {/* Confirmation Dialog */}
      {confirmState && (
        <AlertDialog
          open={confirmState.isOpen}
          onOpenChange={(open) => {
            if (!open) handleConfirmCancel();
          }}
        >
          <AlertDialogContent className="sm:max-w-[440px] border border-border/80 bg-card/95 p-6 backdrop-blur-xl shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                  getVariantStyles(confirmState.options.variant).iconBg
                )}
              >
                {confirmState.options.icon || getVariantStyles(confirmState.options.variant).icon}
              </div>
              <div className="space-y-1.5 flex-1 pt-0.5">
                <AlertDialogTitle className="text-base font-semibold text-foreground tracking-tight">
                  {confirmState.options.title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  {confirmState.options.description}
                </AlertDialogDescription>
              </div>
            </div>

            <AlertDialogFooter className="mt-6 flex-row justify-end gap-2.5 sm:space-x-0">
              <AlertDialogCancel
                onClick={handleConfirmCancel}
                className="rounded-xl border-border/70 hover:bg-muted/60 text-sm font-medium transition-colors"
              >
                {confirmState.options.cancelText}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                className={cn(
                  "rounded-xl font-medium text-sm transition-all px-4 py-2",
                  getVariantStyles(confirmState.options.variant).actionClass
                )}
              >
                {confirmState.options.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Prompt Dialog */}
      {promptState && (
        <AlertDialog
          open={promptState.isOpen}
          onOpenChange={(open) => {
            if (!open) handlePromptCancel();
          }}
        >
          <AlertDialogContent className="sm:max-w-[480px] border border-border/80 bg-card/95 p-6 backdrop-blur-xl shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handlePromptSubmit}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 flex-1 pt-0.5">
                  <AlertDialogTitle className="text-base font-semibold text-foreground tracking-tight">
                    {promptState.options.title}
                  </AlertDialogTitle>
                  {promptState.options.description ? (
                    <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                      {promptState.options.description}
                    </AlertDialogDescription>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {promptState.options.multiline ? (
                  <textarea
                    ref={promptInputRef as any}
                    value={promptState.value}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev ? { ...prev, value: e.target.value, error: null } : null
                      )
                    }
                    placeholder={promptState.options.placeholder}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                ) : (
                  <input
                    ref={promptInputRef as any}
                    type="text"
                    value={promptState.value}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev ? { ...prev, value: e.target.value, error: null } : null
                      )
                    }
                    placeholder={promptState.options.placeholder}
                    className="w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                )}
                {promptState.error && (
                  <p className="text-xs font-medium text-destructive">{promptState.error}</p>
                )}
              </div>

              <AlertDialogFooter className="mt-6 flex-row justify-end gap-2.5 sm:space-x-0">
                <button
                  type="button"
                  onClick={handlePromptCancel}
                  className="rounded-xl border border-border/70 px-4 py-2 text-sm font-medium hover:bg-muted/60 text-foreground transition-colors"
                >
                  {promptState.options.cancelText}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                >
                  {promptState.options.confirmText}
                </button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ModalContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return confirmModal;
  }
  return ctx.confirm;
}

export function usePrompt() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return promptModal;
  }
  return ctx.prompt;
}
