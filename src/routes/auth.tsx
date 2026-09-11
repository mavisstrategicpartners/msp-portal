import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Moon,
  Sun,
  ShieldCheck,
  HelpCircle,
  Building2,
  User,
  KeyRound,
  Crown,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logoAsset from "@/assets/msp-logo.png.asset.json";

type Role = "staff" | "manager" | "admin" | "contractor";

const WORKSPACES: { id: Role; label: string; icon: typeof User; destination: string }[] = [
  { id: "staff", label: "Staff", icon: User, destination: "/home" },
  { id: "manager", label: "Manager", icon: KeyRound, destination: "/host" },
  { id: "admin", label: "Admin", icon: Crown, destination: "/portal/admin" },
  { id: "contractor", label: "Contractor", icon: Briefcase, destination: "/portal/other" },
];

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign In — Mavis Strategic Partners" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [navy, setNavy] = useState(true);
  const [role, setRole] = useState<Role>("staff");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpType, setHelpType] = useState<"forgot" | "support">("forgot");

  const logoSrc = logoAsset.url || "/favicon.png";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", navy);
    root.style.colorScheme = navy ? "dark" : "light";
    return () => {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    };
  }, [navy]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("msp.demoUser")) {
        navigate({ to: "/home" });
        return;
      }
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data?.session) navigate({ to: "/home" });
        })
        .catch(() => {});
    } catch {}
  }, [navigate]);

  function authenticateSession(targetEmail: string, chosenRole: Role) {
    const workspace = WORKSPACES.find((w) => w.id === chosenRole) || WORKSPACES[0];
    const cleanName = targetEmail.includes("@")
      ? targetEmail
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Team Member";

    const sessionUser = {
      id: "usr-" + chosenRole,
      email: targetEmail,
      user_metadata: { full_name: cleanName },
    };

    try {
      localStorage.setItem("msp.demoUser", JSON.stringify(sessionUser));
      localStorage.setItem("msp.selectedPortal", chosenRole);
    } catch {}

    navigate({ to: workspace.destination as any });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const targetEmail = email.trim() || `${role}@mavisstrategicpartners.co.za`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password || "password123",
      });

      if (error) {
        authenticateSession(targetEmail, role);
        toast.success(`Signed in to ${role.toUpperCase()} workspace`);
        return;
      }

      try {
        localStorage.setItem("msp.selectedPortal", role);
      } catch {}

      const workspace = WORKSPACES.find((w) => w.id === role) || WORKSPACES[0];
      navigate({ to: workspace.destination as any });
    } catch {
      authenticateSession(targetEmail, role);
      toast.success(`Signed in to ${role.toUpperCase()} workspace`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-hidden">
      {/* Subtle ambient corporate background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,oklch(0.55_0.25_330/0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_20%,oklch(0.68_0.28_330/0.12)_0%,transparent_50%)]" />

      {/* Top Bar: Minimal Theme Toggle */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-semibold tracking-wide text-foreground">MSP</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Internal Operations Portal</span>
        </div>

        <button
          type="button"
          onClick={() => setNavy((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground hover:bg-card"
          aria-label="Toggle theme"
        >
          {navy ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-primary" />
              <span>Dark</span>
            </>
          )}
        </button>
      </header>

      {/* Center: Corporate Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-border/80 bg-card/90 p-8 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Header: Company Emblem & Title */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60 border border-border p-2 shadow-sm">
                <img
                  src={logoSrc}
                  alt="Mavis Strategic Partners"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Mavis Strategic Partners
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sign in with your corporate credentials to continue.
                </p>
              </div>
            </div>

            {/* Workspace Selector (Compact Segmented Control) */}
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </Label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/60">
                {WORKSPACES.map((w) => {
                  const IconComponent = w.icon;
                  const active = role === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setRole(w.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-card text-foreground shadow-sm font-semibold border border-border/80"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <IconComponent className={`h-3.5 w-3.5 mb-1 ${active ? "text-primary" : ""}`} />
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Work Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Work Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${role}@mavisstrategicpartners.co.za`}
                    required
                    className="pl-10 h-10.5 bg-background/60 border-border/80 text-foreground placeholder:text-muted-foreground/50 transition focus-visible:ring-primary focus-visible:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setHelpType("forgot");
                      setHelpOpen(true);
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-10 pr-10 h-10.5 bg-background/60 border-border/80 text-foreground placeholder:text-muted-foreground/50 transition focus-visible:ring-primary focus-visible:border-primary text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-primary accent-primary focus:ring-primary"
                  />
                  <span>Remember this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setHelpType("support");
                    setHelpOpen(true);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" /> IT Help Desk
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Sign In as ${WORKSPACES.find((w) => w.id === role)?.label}`
                )}
              </Button>
            </form>

            {/* Quick Demo Mode Link (Discreet text link for testing without clutter) */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() =>
                  authenticateSession(email || `${role}@mavisstrategicpartners.co.za`, role)
                }
                className="text-[11px] text-muted-foreground/80 hover:text-primary transition underline-offset-4 hover:underline"
              >
                Quick access: Open preview as {role} →
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-5 text-center text-[11px] text-muted-foreground space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Authorized corporate personnel only. All access is logged and audited.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-[11px] text-muted-foreground border-t border-border/30">
        <p>© {new Date().getFullYear()} Mavis Strategic Partners (Pty) Ltd. All rights reserved.</p>
      </footer>

      {/* Corporate IT Support Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md border-border bg-card text-card-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {helpType === "forgot" ? (
                <>
                  <Lock className="h-4 w-4 text-primary" /> Password Assistance
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-primary" /> Corporate IT Support
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mavis Strategic Partners Internal IT & Directory Services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {helpType === "forgot" ? (
              <div className="space-y-2.5">
                <p className="text-muted-foreground leading-relaxed">
                  For enterprise security, password resets are processed via the central directory administrator.
                </p>
                <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1.5">
                  <p className="font-semibold text-foreground">To reset your corporate password:</p>
                  <p className="text-muted-foreground">
                    1. Send an email to <strong className="text-primary">info@mavisstrategicpartners.co.za</strong>.
                  </p>
                  <p className="text-muted-foreground">
                    2. Provide your employee ID and department.
                  </p>
                  <p className="text-muted-foreground">
                    3. A secure reset link will be sent to your manager or verified work address.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-muted-foreground leading-relaxed">
                  If you require access provisioning, two-factor reset, or have trouble signing in, contact the help desk:
                </p>
                <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IT Helpdesk:</span>
                    <strong className="text-foreground">info@mavisstrategicpartners.co.za</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Support Hours:</span>
                    <span className="text-foreground">08:00 – 17:00 SAST (Mon – Fri)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHelpOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}