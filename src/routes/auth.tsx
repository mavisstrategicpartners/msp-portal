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
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("msp.rememberedEmail") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined" &&
      (localStorage.getItem("msp-theme") ?? localStorage.getItem("msp.theme")) === "dark",
  );

  // Corporate IT Support Modal state
  const [supportOpen, setSupportOpen] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("msp.rememberedPassword");
      localStorage.removeItem("msp.demoUser");
    }
  }, []);

  useEffect(() => {
    // When the user is logged out on the auth page, trap back navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("msp-theme", darkMode ? "dark" : "light");
    localStorage.setItem("msp.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Old Supabase reset links (emailed before the code-based flow) land here:
  // send them to the Forgot Password page. Otherwise, a signed-in visitor goes
  // straight to their dashboard.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { hash, search } = window.location;
    const isRecoveryLink =
      hash.includes("type=recovery") || search.includes("type=recovery") || search.includes("mode=recovery");
    if (isRecoveryLink) {
      supabase.auth.signOut().catch(() => {});
      navigate({ to: "/forgot-password", search: { link: "expired" }, replace: true });
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data?.session?.user) navigateForDepartment(data.session.user.id);
      })
      .catch(() => {});
  }, [navigate]);

  async function navigateForDepartment(userId: string) {
    let profile: { department?: string | null; role_tier?: string | null; job_title?: string | null } | null = null;
    try {
      const profileResult = await supabase
        .from("profiles")
        .select("department, role_tier, job_title")
        .eq("id", userId)
        .maybeSingle();
      if (profileResult.error) {
        throw profileResult.error;
      }
      profile = profileResult.data;
    } catch (error) {
      console.warn("Profile lookup failed; navigating to home.", error);
      await navigate({ to: "/home" });
      return;
    }
    const isCeo = profile?.department === "Executive" || profile?.job_title === "Chief Executive Officer";
    const isHR = profile?.department === "Human Resources";
    const deptLower = (profile?.department || "").toLowerCase();
    const titleLower = (profile?.job_title || "").toLowerCase();
    const isOps =
      deptLower.includes("operations") ||
      deptLower.includes("client relationship") ||
      titleLower.includes("operations") ||
      titleLower.includes("relationship manager");
    const isGM = titleLower.includes("general manager") || deptLower.includes("general manager");
    const isFinance =
      deptLower.includes("finance") ||
      deptLower.includes("accounting") ||
      (deptLower.includes("admin department") && (titleLower.includes("finance") || profile?.role_tier === "manager")) ||
      titleLower.includes("finance") ||
      titleLower.includes("accountant") ||
      titleLower.includes("billing");
    const isSales = deptLower.includes("sales") || titleLower.includes("sales");
    // Specialist titles that contain "manager" but are staff-level roles
    const specialistManagerTitles = [
      "seo manager",
      "social media manager",
      "content manager",
      "community manager",
      "campaign manager",
    ];
    const isSpecialistTitle = specialistManagerTitles.some(
      (s) => titleLower === s || titleLower.startsWith(s)
    );
    const isDeptManager =
      !isSpecialistTitle &&
      (titleLower.includes("department manager") ||
       titleLower.includes("media buying") ||
       (profile?.role_tier === "manager" && !isOps && !isGM && !isHR && !isFinance));
    const destination = isCeo
      ? "/ceo"
      : isGM
      ? "/gm"
      : isOps
      ? "/operations"
      : isFinance
      ? "/finance"
      : isSales
      ? "/sales"
      : isDeptManager
      ? "/department"
      : isHR
      ? "/hr"
      : "/home";
    await navigate({ to: destination as any });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Please enter your work email.");
      return;
    }
    const lowerEmail = targetEmail.toLowerCase();
    const isCompanyDomain =
      lowerEmail.endsWith("@mavisstrateegicpartners.co.za") ||
      lowerEmail.endsWith("@mavisstrategicpartners.co.za");
    if (!isCompanyDomain) {
      toast.error("Invalid Company Domain", {
        description: "Please enter your official MSP company email address (@mavisstrateegicpartners.co.za).",
      });
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    setLoading(true);

    const cleanPassword = password.trim();

    try {
      // First attempt with clean (trimmed) password, then fallback to raw password if different
      let signInResult = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: cleanPassword,
      });

      if (signInResult.error && cleanPassword !== password) {
        signInResult = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });
      }

      const { data: signInData, error } = signInResult;

      if (signInData?.user) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("msp.authenticatedUser");
          localStorage.setItem("msp.rememberedEmail", targetEmail);
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome back", { description: "Signed in successfully." });
        await navigateForDepartment(signInData.user.id);
        return;
      }

      if (error) {
        toast.error("Sign-in failed", { description: error.message });
        return;
      }
    } catch (error: any) {
      toast.error("Authentication error", { description: error?.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForgotPassword() {
    const current = email.trim();
    navigate({ to: "/forgot-password", search: current ? { email: current } : {} });
  }


  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#3b1d4d] text-white dark:bg-[#21172f]">
      {/* Top right theme switcher */}
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
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
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

            <form onSubmit={onSubmit} className="space-y-4">
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
                    className="h-10.5 border-input bg-background pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition focus-visible:border-primary focus-visible:ring-primary"
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
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-medium text-primary transition hover:underline"
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
                    className="h-10.5 border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition focus-visible:border-primary focus-visible:ring-primary"
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
                <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={(e) => {
                      if (e.target.checked) localStorage.setItem("msp.rememberMe", "true");
                      else localStorage.removeItem("msp.rememberMe");
                    }}
                    className="h-3.5 w-3.5 rounded border-border text-primary accent-primary focus:ring-primary"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSupportOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground"
                >
                  <HelpCircle className="h-3 w-3" /> IT Help Desk
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="mx-auto mt-2 block h-10.5 w-3/5 max-w-[220px] bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Need assistance?{" "}
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="font-medium text-primary hover:underline"
              >
                Contact IT Support
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-5 space-y-1 text-center text-[11px] text-muted-foreground">
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
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md border-border bg-card text-card-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Building2 className="h-4 w-4 text-primary" /> Corporate IT Support
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mavis Strategic Partners Internal IT & Directory Services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-2.5">
              <p className="text-muted-foreground leading-relaxed">
                If you require new access provisioning, two-factor authentication reset, or system assistance, contact the help desk:
              </p>
              <div className="space-y-1.5 rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IT Helpdesk:</span>
                  <strong className="text-foreground">info@mavisstrategicpartners.co.za</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="text-foreground">mavisstrategicpartners.co.za</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support Hours:</span>
                  <span className="text-foreground">08:00 – 17:00 SAST (Mon – Fri)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border/50 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSupportOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}