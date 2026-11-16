import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Circle, Eye, EyeOff, KeyRound, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { completePasswordChange } from "@/lib/account.functions";
import { PASSWORD_REQUIREMENTS, passwordProblems } from "@/lib/password-rules";
import { clearAccessCache } from "@/lib/route-access";
import { AuthCard, AuthScreen } from "@/components/layout/auth-screen";

/**
 * First sign-in with a one-time password: the employee must choose their own
 * password before the rest of the portal opens.
 */
export const Route = createFileRoute("/set-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Choose Your Password — Mavis Strategic Partners" }] }),
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return navigate({ to: "/auth", replace: true });
      if (!(user.app_metadata as any)?.must_change_password) return navigate({ to: "/home", replace: true });
      setEmail(user.email ?? "");
    });
  }, [navigate]);

  const problems = passwordProblems(password, email ?? "");
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (problems.length) return setError(`Your password needs ${problems.join(", ")}.`);
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    try {
      await completePasswordChange({ data: { newPassword: password } });
      // Fetch a fresh token so the cleared flag takes effect immediately.
      await supabase.auth.refreshSession();
      clearAccessCache();
      navigate({ to: "/home", replace: true });
    } catch (err: any) {
      setError(err?.message || "Your password could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAccessCache();
    navigate({ to: "/auth", replace: true });
  };

  if (email === null)
    return (
      <AuthScreen>
        <AuthCard>
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your account…
          </p>
        </AuthCard>
      </AuthScreen>
    );

  const metCount = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  const ready = problems.length === 0 && password === confirm && confirm.length > 0;

  return (
    <AuthScreen>
      <AuthCard>
        <form onSubmit={submit} className="space-y-6" noValidate>
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Create your password</h1>
            <p className="text-sm text-muted-foreground">
              You signed in with a one-time password. Choose a private password to continue to the portal.
            </p>
            <p className="inline-flex max-w-full items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">
              <span className="truncate">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <PasswordInput id="new-password" label="New password" value={password} onChange={setPassword} shown={show} onToggle={() => setShow((v) => !v)} autoFocus describedBy="password-rules" />

            <div id="password-rules" className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Password requirements</span>
                <span className="text-muted-foreground">{metCount} of {PASSWORD_REQUIREMENTS.length} met</span>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PASSWORD_REQUIREMENTS.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                      {r.label}
                      <span className="sr-only">{ok ? "(met)" : "(not met)"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-1.5">
              <PasswordInput id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm} shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} invalid={mismatch} />
              {mismatch ? (
                <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">The passwords do not match.</p>
              ) : confirm.length > 0 && confirm === password ? (
                <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</p>
              ) : null}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Button type="submit" className="h-10 w-full" disabled={busy || !ready}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save password and continue
            </Button>
            <Button type="button" variant="ghost" className="h-9 w-full text-xs text-muted-foreground" onClick={signOut} disabled={busy}>
              <LogOut className="h-3.5 w-3.5" /> Cancel and sign out
            </Button>
          </div>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  shown,
  onToggle,
  autoFocus,
  invalid,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  shown: boolean;
  onToggle: () => void;
  autoFocus?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 pr-10 ${invalid ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={shown}
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
