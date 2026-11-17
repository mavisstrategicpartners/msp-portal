/**
 * The portal's single notification service. Every module imports `toast` from here (not from
 * "sonner" directly), so all portals share one look, one set of timings and the same rules:
 *
 *  - Success / information: close automatically after a few seconds.
 *  - Warnings and errors: stay long enough to read, with a close button.
 *  - `important: true`: stays until the person closes it (for anything that needs action).
 *  - The same notification is never stacked twice: identical title + text reuse one toast.
 *  - A success raised while data is still being written to the database waits for the write and
 *    becomes an error if the server rejected it (see pending-writes.ts), so "Saved" is only shown
 *    once the server has actually saved.
 *  - Long one-line messages are split into a short title and a description.
 *
 * Confirmation of destructive actions is NOT done with toasts: use confirmAction() from
 * "@/lib/confirm" (a proper dialog with Cancel and Confirm).
 */
import { toast as sonner, type ExternalToast } from "sonner";
import type { ReactNode } from "react";
import { pendingWrites } from "@/lib/pending-writes";

type Kind = "success" | "error" | "warning" | "info" | "message" | "loading";
export type NotifyOptions = ExternalToast & { important?: boolean };

const DURATION: Record<Kind, number> = {
  success: 4000,
  info: 5000,
  message: 5000,
  warning: 8000,
  error: 9000,
  loading: Number.POSITIVE_INFINITY,
};
const FALLBACK_TITLE: Record<Kind, string> = {
  success: "Done",
  error: "Something went wrong",
  warning: "Please check",
  info: "For your information",
  message: "Notice",
  loading: "Working…",
};

function textOf(v: unknown) {
  return typeof v === "string" ? v : "";
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `n${(h >>> 0).toString(36)}`;
}

function normalise(kind: Kind, title: ReactNode, opts: NotifyOptions = {}): [ReactNode, ExternalToast] {
  const { important, ...rest } = opts;
  let t = title;
  let description = rest.description;
  // "Something long went wrong because of x, y and z." → short title + readable description.
  if (!description && typeof t === "string" && t.length > 70) {
    description = t;
    t = FALLBACK_TITLE[kind];
  }
  if (typeof t === "string" && !t.trim()) t = FALLBACK_TITLE[kind];
  const id = rest.id ?? hash(`${kind}|${textOf(t)}|${textOf(description)}`);
  return [
    t,
    {
      ...rest,
      id,
      description,
      duration: important ? Number.POSITIVE_INFINITY : rest.duration ?? DURATION[kind],
      closeButton: rest.closeButton ?? true,
    },
  ];
}

function show(kind: Kind, title: ReactNode, opts?: NotifyOptions) {
  const [t, o] = normalise(kind, title, opts);
  switch (kind) {
    case "success":
      return sonner.success(t, o);
    case "error":
      return sonner.error(t, o);
    case "warning":
      return sonner.warning(t, o);
    case "info":
      return sonner.info(t, o);
    case "loading":
      return sonner.loading(t, o);
    default:
      return sonner(t, o);
  }
}

/** Success, but only once any database writes in progress have succeeded. */
function success(title: ReactNode, opts?: NotifyOptions) {
  if (!pendingWrites.active()) return show("success", title, opts);
  const [, o] = normalise("success", title, opts);
  const id = o.id!;
  sonner.loading("Saving changes…", { id, duration: Number.POSITIVE_INFINITY, closeButton: false });
  pendingWrites.settled().then((r) => {
    if (r.ok) return show("success", title, { ...opts, id });
    // Same wording (and so the same de-duplication key) as the table hook's own error.
    sonner.dismiss(id);
    show("error", "Changes could not be saved", {
      description: r.error ? `The server rejected the change: ${r.error}` : "The server did not confirm the change. Please try again.",
    });
  });
  return id;
}

type ToastFn = ((title: ReactNode, opts?: NotifyOptions) => string | number) & {
  success: (title: ReactNode, opts?: NotifyOptions) => string | number;
  error: (title: ReactNode, opts?: NotifyOptions) => string | number;
  warning: (title: ReactNode, opts?: NotifyOptions) => string | number;
  info: (title: ReactNode, opts?: NotifyOptions) => string | number;
  message: (title: ReactNode, opts?: NotifyOptions) => string | number;
  loading: (title: ReactNode, opts?: NotifyOptions) => string | number;
  promise: typeof sonner.promise;
  dismiss: typeof sonner.dismiss;
  custom: typeof sonner.custom;
};

export const toast: ToastFn = Object.assign((title: ReactNode, opts?: NotifyOptions) => show("message", title, opts), {
  success,
  error: (t: ReactNode, o?: NotifyOptions) => show("error", t, o),
  warning: (t: ReactNode, o?: NotifyOptions) => show("warning", t, o),
  info: (t: ReactNode, o?: NotifyOptions) => show("info", t, o),
  message: (t: ReactNode, o?: NotifyOptions) => show("message", t, o),
  loading: (t: ReactNode, o?: NotifyOptions) => show("loading", t, o),
  promise: sonner.promise,
  dismiss: sonner.dismiss,
  custom: sonner.custom,
});

/**
 * Run an action with a progress notification: "Uploading document…" → success or error.
 * Success is shown only if the action resolved; the error shows the server's message.
 */
export async function withProgress<T>(
  label: string,
  action: () => Promise<T>,
  done: { success: string; description?: string; error?: string },
): Promise<T> {
  const id = hash(`progress|${label}|${Date.now()}`);
  sonner.loading(label, { id, duration: Number.POSITIVE_INFINITY });
  try {
    const r = await action();
    show("success", done.success, { id, description: done.description });
    return r;
  } catch (e: any) {
    show("error", done.error ?? "That didn't work", { id, description: e?.message || "Please try again." });
    throw e;
  }
}

/**
 * Show "Uploading <file>…" while an upload runs, then remove it. The caller keeps its own
 * success/error handling, so nothing claims success before the server has confirmed it.
 */
export async function uploading<T>(fileName: string | undefined, action: () => Promise<T>): Promise<T> {
  const id = hash(`upload|${fileName}|${Date.now()}|${Math.random()}`);
  const name = fileName && fileName.length > 48 ? `${fileName.slice(0, 45)}…` : fileName;
  sonner.loading(name ? `Uploading ${name}…` : "Uploading document…", { id, duration: Number.POSITIVE_INFINITY });
  try {
    return await action();
  } finally {
    sonner.dismiss(id);
  }
}

// ── Messages that must survive a full page load (e.g. after signing out) ────
const FLASH_KEY = "msp.flash";
export function flash(kind: "success" | "info" | "warning" | "error", title: string, description?: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ kind, title, description, at: Date.now() }));
  } catch {}
}
export function showFlash() {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FLASH_KEY);
    const f = JSON.parse(raw);
    if (Date.now() - f.at > 60_000) return;
    show(f.kind, f.title, { description: f.description });
  } catch {}
}

/** The fixed wording for authentication events. */
export const authNotices = {
  signedIn: () => toast.success("Welcome back!", { description: "You have successfully signed in." }),
  signedOut: () => flash("success", "Signed out successfully", "You have safely signed out of your account."),
  passwordUpdated: () => toast.success("Password updated", { description: "Your password has been changed successfully." }),
  // Same wording whether the account exists or not, so nobody can probe for accounts.
  signInFailed: () => toast.error("Sign-in unsuccessful", { description: "The email or password you entered is incorrect. Please try again." }),
  signInUnavailable: () => toast.error("Sign-in unavailable", { description: "We couldn't reach the sign-in service. Check your connection and try again." }),
};
