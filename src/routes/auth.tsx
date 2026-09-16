import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  ShieldCheck,
  HelpCircle,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign In — Mavis Strategic Partners" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined" &&
      (localStorage.getItem("msp-theme") ?? localStorage.getItem("msp.theme")) === "dark",
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpType, setHelpType] = useState<"forgot" | "support">("forgot");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("msp-theme", darkMode ? "dark" : "light");
    localStorage.setItem("msp.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("msp.demoUser")) {
        navigate({ to: "/home" });
        return;
      }
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data?.session?.user) navigateForDepartment(data.session.user.id);
        })
        .catch(() => {});
    } catch {}
  }, [navigate]);

  async function navigateForDepartment(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("department, role_tier")
      .eq("id", userId)
      .maybeSingle();
    const isHR = profile?.department === "Human Resources";
    const isManager = profile?.role_tier === "manager" || profile?.role_tier === "root_admin";
    const destination = isHR ? "/host/hr" : isManager ? "/host" : "/home";
    const portal = isHR ? "hr" : isManager ? "manager" : "staff";
    localStorage.setItem("msp.selectedPortal", portal);
    await navigate({ to: destination as any });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const targetEmail = email.trim();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password || "password123",
      });

      if (error) {
        toast.error("Unable to sign in", {
          description: "Check your work email and password, then try again.",
          duration: 4000,
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.refetchQueries({ queryKey: ["profile"], type: "all" });
      toast.success("Welcome back", {
        description: "Your session is ready.",
        duration: 3000,
      });
      const { data: sessionData } = await supabase.auth.getUser();
      await navigateForDepartment(sessionData.user?.id ?? "");
    } catch {
      toast.error("Sign-in service unavailable", {
        description: "Please try again in a moment.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#3b1d4d] text-white dark:bg-[#21172f]">

      <div className="relative z-10 flex justify-end px-6 pt-6 sm:px-10">
        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-0.5 text-[11px] font-medium text-white/80 shadow-sm">
          <span className="px-2 py-1">Theme</span>
          <button
            type="button"
            onClick={() => setDarkMode(false)}
            className={`rounded-full px-3 py-1 transition ${
              !darkMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-white/10 hover:text-white"
            }`}
            aria-pressed={!darkMode}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setDarkMode(true)}
            className={`rounded-full px-3 py-1 transition ${
              darkMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-white/10 hover:text-white"
            }`}
            aria-pressed={darkMode}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Center: Corporate Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="space-y-6 rounded-lg border border-border bg-card p-8 shadow-md sm:p-9">
            {/* Header: Company Emblem & Title */}
            <div className="relative space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-transparent p-2">
                <img
                  src="/msp-logo.png"
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
                    placeholder="name@mavisstrategicpartners.co.za"
                    required
                    className="h-10.5 border-input bg-background pl-10 text-foreground placeholder:text-muted-foreground/50 transition focus-visible:border-primary focus-visible:ring-primary text-sm"
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
                    className="h-10.5 border-input bg-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 transition focus-visible:border-primary focus-visible:ring-primary text-sm"
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
                className="mx-auto mt-2 block h-10.5 w-3/5 max-w-[220px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

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
      <footer className="relative z-10 border-t border-white/15 px-6 py-4 text-center text-[11px] text-white/70">
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