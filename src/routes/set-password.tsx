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
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your account…
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Choose your own password</h1>
          <p className="text-sm text-muted-foreground">
            You signed in with a one-time password for <span className="font-medium text-foreground">{email}</span>.
            Set a private password to continue.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-1 pt-1">
            {PASSWORD_REQUIREMENTS.map((r) => {
              const ok = r.test(password);
              return (
                <li key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />} {r.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && <p className="text-xs text-rose-600">The passwords do not match.</p>}
        </div>

        {error && <p className="rounded-md bg-rose-500/10 p-2.5 text-xs text-rose-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={busy || problems.length > 0 || password !== confirm}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save password and continue
        </Button>
        <Button type="button" variant="ghost" className="w-full text-xs" onClick={signOut}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
        </Button>
      </form>
    </div>
  );
}
