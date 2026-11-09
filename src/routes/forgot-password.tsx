import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completePasswordReset,
  requestPasswordResetCode,
  verifyPasswordResetCode,
} from "@/lib/password-reset.functions";
import { PASSWORD_REQUIREMENTS, normaliseEmail, passwordProblems } from "@/lib/password-rules";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  validateSearch: z.object({ email: z.string().optional(), link: z.string().optional() }),
  head: () => ({ meta: [{ title: "Reset Password — Mavis Strategic Partners" }] }),
  component: ForgotPasswordPage,
});

type Step = "email" | "code" | "password" | "done";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(search.email ?? "");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    search.link ? "That reset link is no longer used. Request a 6-digit code below instead." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const dark =
      (localStorage.getItem("msp-theme") ?? localStorage.getItem("msp.theme")) === "dark";
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // An error describes the last submission; clear it as soon as the user edits
  // (but keep any message present when the page first opens).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setError(null);
  }, [password, confirm, code]);

  const minutesLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 60_000)) : null;
  const codeExpired = expiresAt !== null && now >= expiresAt;

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setNotice(null);
    let value = normaliseEmail(email);
    if (value && !value.includes("@")) value = `${value}@mavisstrategicpartners.co.za`;
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid work email address.");
      return;
    }
    setEmail(value);
    setBusy(true);
    try {
      const res = await requestPasswordResetCode({ data: { email: value } });
      if (!res.ok) {
        setError(res.message);
        if (res.error === "rate_limited" && res.retryAfterSeconds && res.retryAfterSeconds <= 120) {
          setCooldown(res.retryAfterSeconds);
        }
        return;
      }
      setCode("");
      setCooldown(res.resendAfterSeconds);
      setExpiresAt(Date.now() + res.expiresInMinutes * 60_000);
      setNotice(
        `If an MSP account uses ${value}, we've emailed it a 6-digit code. Check your inbox and spam folder.`,
      );
      setStep("code");
    } catch {
      setError("We couldn't process the request. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function checkCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyPasswordResetCode({ data: { email, code: digits } });
      if (!res.ok) {
        setError(res.message);
        if (res.error !== "invalid_code") setCode("");
        return;
      }
      setResetToken(res.resetToken);
      setNotice(null);
      setStep("password");
    } catch {
      setError("We couldn't check the code. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) return setError("Enter a new password.");
    const problems = passwordProblems(password, email);
    if (problems.length) return setError(`Your password needs ${problems.join(", ")}.`);
    if (password !== confirm) return setError("The passwords do not match.");
    setBusy(true);
    try {
      const res = await completePasswordReset({
        data: { email, resetToken, password, confirmPassword: confirm },
      });
      if (!res.ok) {
        setError(res.message);
        if (res.error === "invalid_token") {
          setResetToken("");
          setStep("email");
        }
        return;
      }
      setPassword("");
      setConfirm("");
      setResetToken("");
      setStep("done");
    } catch {
      setError("We couldn't update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Step, [string, string]> = {
    email: [
      "Reset your password",
      "Enter the email address for your MSP account and we'll send you a verification code.",
    ],
    code: ["Enter verification code", `We sent a 6-digit code to ${email}.`],
    password: ["Create a new password", "Choose a strong password you haven't used before."],
    done: [
      "Password updated",
      "Your password has been changed and you've been signed out on all devices.",
    ],
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-[#3b1d4d] text-white dark:bg-[#21172f]">
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="space-y-6 rounded-lg border border-border bg-card p-8 text-card-foreground shadow-md sm:p-9">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                {step === "done" ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                ) : step === "password" ? (
                  <Lock className="h-6 w-6 text-primary" />
                ) : (
                  <KeyRound className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl font-bold tracking-tight text-foreground outline-none"
                >
                  {titles[step][0]}
                </h1>
                <p className="text-xs text-muted-foreground">{titles[step][1]}</p>
              </div>
              <StepDots step={step} />
            </div>

            {notice && step === "code" && (
              <p
                role="status"
                className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground"
              >
                {notice}
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            )}

            {step === "email" && (
              <form onSubmit={sendCode} className="space-y-4" noValidate>
                <Field label="Work email" htmlFor="fp-email" icon={<Mail className="h-4 w-4" />}>
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mavisstrategicpartners.co.za"
                    className="h-10.5 bg-background pl-10 text-sm"
                    disabled={busy}
                  />
                </Field>
                <SubmitButton
                  busy={busy}
                  busyText="Sending code..."
                  disabled={busy || cooldown > 0}
                >
                  {cooldown > 0 ? `Send code (${cooldown}s)` : "Send Verification Code"}
                </SubmitButton>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={checkCode} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-code" className="text-xs font-medium">
                    6-digit verification code
                  </Label>
                  <Input
                    id="fp-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    aria-describedby="fp-code-help"
                    className="h-12 bg-background text-center font-mono text-2xl tracking-[0.5em]"
                    disabled={busy}
                  />
                  <p id="fp-code-help" className="text-[11px] text-muted-foreground">
                    {codeExpired
                      ? "This code has expired. Request a new one below."
                      : minutesLeft !== null
                        ? `The code expires in about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}. You have 5 attempts.`
                        : "Codes expire after 10 minutes."}
                  </p>
                </div>
                <SubmitButton
                  busy={busy}
                  busyText="Verifying..."
                  disabled={busy || code.length !== 6 || codeExpired}
                >
                  Verify Code
                </SubmitButton>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                      setNotice(null);
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCode()}
                    disabled={busy || cooldown > 0}
                    className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={savePassword} className="space-y-4" noValidate>
                <PasswordField
                  id="fp-new"
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  shown={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                  disabled={busy}
                  autoFocus
                />
                <ul
                  className="grid grid-cols-2 gap-1 text-[11px]"
                  aria-label="Password requirements"
                >
                  {PASSWORD_REQUIREMENTS.map((r) => {
                    const met = r.test(password);
                    return (
                      <li
                        key={r.id}
                        className={
                          met
                            ? "flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                            : "flex items-center gap-1 text-muted-foreground"
                        }
                      >
                        {met ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        {r.label}
                        <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
                      </li>
                    );
                  })}
                </ul>
                <PasswordField
                  id="fp-confirm"
                  label="Confirm new password"
                  value={confirm}
                  onChange={setConfirm}
                  shown={showConfirm}
                  onToggle={() => setShowConfirm((s) => !s)}
                  disabled={busy}
                />
                {confirm && password !== confirm && (
                  <p className="text-[11px] text-destructive">The passwords do not match.</p>
                )}
                <SubmitButton busy={busy} busyText="Updating password..." disabled={busy}>
                  Reset Password
                </SubmitButton>
              </form>
            )}

            {step === "done" && (
              <div className="space-y-4">
                <p className="text-center text-xs text-muted-foreground">
                  You can now sign in with your new password. Your old password no longer works.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate({ to: "/auth" })}
                  className="mx-auto block h-10.5 w-3/5 max-w-[220px] bg-primary text-sm font-semibold"
                >
                  Return to Login
                </Button>
              </div>
            )}

            {step !== "done" && (
              <div className="text-center text-xs">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </div>
            )}
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Never share your verification code. MSP staff will never ask for it.
          </p>
        </div>
      </main>
      <footer className="relative z-10 border-t border-white/15 px-6 py-4 text-center text-[11px] text-white/70">
        <p>© {new Date().getFullYear()} Mavis Strategic Partners (Pty) Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["email", "code", "password", "done"];
  const idx = order.indexOf(step);
  return (
    <div
      className="flex items-center justify-center gap-1.5"
      aria-label={`Step ${Math.min(idx + 1, 3)} of 3`}
    >
      {order.slice(0, 3).map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${i <= idx ? "w-6 bg-primary" : "w-3 bg-muted"}`}
        />
      ))}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function PasswordField(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  shown: boolean;
  onToggle: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <Field label={props.label} htmlFor={props.id} icon={<Lock className="h-4 w-4" />}>
      <Input
        id={props.id}
        type={props.shown ? "text" : "password"}
        autoComplete="new-password"
        autoFocus={props.autoFocus}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-10.5 bg-background pl-10 pr-10 text-sm"
        disabled={props.disabled}
      />
      <button
        type="button"
        onClick={props.onToggle}
        aria-label={props.shown ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {props.shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </Field>
  );
}

function SubmitButton({
  busy,
  busyText,
  disabled,
  children,
}: {
  busy: boolean;
  busyText: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="mx-auto block h-10.5 w-full max-w-[260px] bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
    >
      {busy ? (
        <>
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          {busyText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
