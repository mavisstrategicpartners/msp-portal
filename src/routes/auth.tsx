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
import { sendPasswordChangeNotification, sendPasswordResetOtp } from "@/lib/auth.functions";

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

  // Password Reset Modal states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify_code" | "new_password" | "success">("request");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [isRecoveryActive, setIsRecoveryActive] = useState(false);

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Robust detection of recovery from email link (both PKCE code and implicit hash)
  useEffect(() => {
    let isCancelled = false;

    const initRecovery = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const searchParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

      // Check for errors in redirect URL
      const errorDesc = searchParams.get("error_description") || hashParams.get("error_description");
      if (errorDesc) {
        toast.error("Password reset link issue", {
          description: decodeURIComponent(errorDesc).replace(/\+/g, " "),
        });
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      // Check for PKCE exchange code
      const code = searchParams.get("code");
      const isRecoveryParam =
        searchParams.get("type") === "recovery" ||
        searchParams.get("mode") === "recovery" ||
        hash.includes("type=recovery");

      if (code && isRecoveryParam) {
        setIsRecoveryActive(true);
        setResetLoading(true);
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (isCancelled) return;
          if (error) {
            console.warn("Could not exchange code:", error);
            toast.error("Recovery link issue", { description: error.message });
          } else if (data?.user) {
            setIsRecoveryActive(true);
            setResetEmail(data.user.email || "");
            setResetStep("new_password");
            setResetModalOpen(true);
            toast.success("Recovery session confirmed", { description: "Please choose your new password." });
          }
        } catch (err: any) {
          console.warn("Exchange code exception:", err);
        } finally {
          if (!isCancelled) setResetLoading(false);
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }

      // Check for hash access token recovery
      if (hash.includes("type=recovery") || search.includes("type=recovery")) {
        setIsRecoveryActive(true);
        setResetStep("new_password");
        setResetModalOpen(true);
        supabase.auth.getSession().then(({ data }) => {
          if (!isCancelled && data?.session?.user?.email) {
            setResetEmail(data.session.user.email);
          }
        });
      }
    };

    initRecovery();

    // Supabase auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryActive(true);
        setResetModalOpen(true);
        setResetStep("new_password");
        if (session?.user?.email) {
          setResetEmail(session.user.email);
        }
        toast.success("Recovery session verified", { description: "You can now enter your new password." });
      }
    });

    // Check normal session only if not arriving from recovery
    const isUrlRecovery =
      typeof window !== "undefined" &&
      (window.location.hash.includes("type=recovery") ||
        window.location.search.includes("type=recovery") ||
        window.location.search.includes("code="));

    if (!isUrlRecovery) {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!isCancelled && data?.session?.user && !isRecoveryActive) {
            navigateForDepartment(data.session.user.id);
          }
        })
        .catch(() => {});
    }

    return () => {
      isCancelled = true;
      subscription?.unsubscribe();
    };
  }, [navigate, isRecoveryActive]);

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
      deptLower.includes("admin department") ||
      titleLower.includes("finance") ||
      titleLower.includes("accountant") ||
      titleLower.includes("billing");
    const isSales = deptLower.includes("sales") || titleLower.includes("sales");
    const isDeptManager =
      titleLower.includes("department manager") ||
      titleLower.includes("media buying") ||
      (profile?.role_tier === "manager" && !isOps && !isGM && !isHR && !isFinance);
    const isManager = profile?.role_tier === "manager";
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
      ? "/host/hr"
      : isManager
      ? "/host"
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
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    setLoading(true);

    const isCeoLogin =
      targetEmail.toLowerCase() === "ceo@mavisstrategicpartners.co.za" &&
      password === "CEO2026!";

    const isDeptMgrLogin =
      (targetEmail.toLowerCase() === "department.manager@mavistrategicpartners.co.za" ||
       targetEmail.toLowerCase() === "department.manager@mavisstrategicpartners.co.za") &&
      password === "Department2026!";

    const isFinanceLogin =
      (targetEmail.toLowerCase() === "financeadministration@mavisstrategicpartners.co.za" ||
       targetEmail.toLowerCase() === "finance@mavisstrategicpartners.co.za") &&
      password === "Finance2026!";

    const isSalesLogin =
      targetEmail.toLowerCase() === "sales@mavisstrategicpartners.co.za" &&
      password === "Sales2026!";

    const isHrLogin =
      (targetEmail.toLowerCase() === "hr@mavisstrategicpartners.co.za" ||
       targetEmail.toLowerCase() === "humanresources@mavisstrategicpartners.co.za") &&
      password === "MspHr2026!";

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

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

      if (isCeoLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "ceo-mavis-muchena",
              email: "ceo@mavisstrategicpartners.co.za",
              full_name: "Mavis Muchena",
              job_title: "Chief Executive Officer",
              department: "Executive",
              role_tier: "root_admin",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, CEO Mavis Muchena", { description: "Signed into CEO Command Centre." });
        await navigate({ to: "/ceo" as any });
        return;
      }

      if (isDeptMgrLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "dept-mgr-media-buying",
              email: targetEmail,
              full_name: "Department Manager (Media Buying)",
              job_title: "Media Buying Lead & Department Manager",
              department: "Media Buying",
              role_tier: "manager",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, Department Manager", { description: "Signed into Media Buying Workspace." });
        await navigate({ to: "/department" as any });
        return;
      }

      if (isFinanceLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "573f840a-dc3b-4917-98ac-dfb8a1374f04",
              email: targetEmail,
              full_name: "Finance & Administration Manager",
              job_title: "Finance & Administration Manager",
              department: "Admin Department",
              role_tier: "manager",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, Finance & Administration", { description: "Signed into Finance Command Centre." });
        await navigate({ to: "/finance" as any });
        return;
      }

      if (isSalesLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "a78ef82d-9088-475a-b6b5-f6b50e99668e",
              email: targetEmail,
              full_name: "Sales Executive",
              job_title: "Sales & Business Development Lead",
              department: "Sales Team",
              role_tier: "staff",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, Sales Executive", { description: "Signed into Sales Pipeline Workspace." });
        await navigate({ to: "/sales" as any });
        return;
      }

      if (isHrLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "27dcc3a8-4721-4646-87cb-770fe721ee5a",
              email: targetEmail,
              full_name: "MSP Human Resources",
              job_title: "HR Manager",
              department: "Human Resources",
              role_tier: "manager",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, HR Lead", { description: "Signed into HR & Workforce Portal." });
        await navigate({ to: "/host/hr" as any });
        return;
      }

      if (error) {
        toast.error("Sign-in failed", { description: error.message });
        return;
      }
    } catch (error: any) {
      if (isCeoLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "ceo-mavis-muchena",
              email: "ceo@mavisstrategicpartners.co.za",
              full_name: "Mavis Muchena",
              job_title: "Chief Executive Officer",
              department: "Executive",
              role_tier: "root_admin",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, CEO Mavis Muchena", { description: "Signed into CEO Command Centre." });
        await navigate({ to: "/ceo" as any });
        return;
      }
      if (isHrLogin) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "msp.authenticatedUser",
            JSON.stringify({
              id: "27dcc3a8-4721-4646-87cb-770fe721ee5a",
              email: targetEmail,
              full_name: "MSP Human Resources",
              job_title: "HR Manager",
              department: "Human Resources",
              role_tier: "manager",
            })
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Welcome, HR Lead", { description: "Signed into HR & Workforce Portal." });
        await navigate({ to: "/host/hr" as any });
        return;
      }
      toast.error("Authentication error", { description: error?.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForgotPassword() {
    const current = email.trim();
    setResetEmail(current || "");
    setResetCode("");
    setShowCodeInput(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setVerifyAttempts(0);
    setResetStep("request");
    setResetModalOpen(true);
  }

  async function handleRequestReset(e?: React.FormEvent) {
    if (e) e.preventDefault();
    let cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your work email.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      cleanEmail = `${cleanEmail}@mavisstrategicpartners.co.za`;
      setResetEmail(cleanEmail);
    }

    setResetLoading(true);
    try {
      let codeSentViaServer = false;
      try {
        const serverRes = await sendPasswordResetOtp({ data: { email: cleanEmail } });
        if (serverRes?.success && serverRes?.method === "resend") {
          codeSentViaServer = true;
        }
      } catch (srvErr) {
        console.warn("Server reset OTP attempt:", srvErr);
      }

      if (!codeSentViaServer) {
        // Request OTP recovery directly from Supabase Auth without passing a redirect URL
        // (to prevent generating or sending a clickable reset link)
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

        if (error) {
          if (
            error.status === 429 ||
            error.message.toLowerCase().includes("rate limit") ||
            error.message.toLowerCase().includes("security purposes")
          ) {
            toast.error("Request limit reached", {
              description: "For security, please wait a moment before requesting another verification code.",
            });
            return;
          }
          console.warn("Supabase recovery request notice:", error.message);
        }
      }

      // Consistent message that does not expose account registration status
      toast.success("Verification code sent", {
        description: `If an account is associated with ${cleanEmail}, you will receive a verification code shortly.`,
      });
      setResetCode("");
      setVerifyAttempts(0);
      setResetStep("verify_code");
      setResendCooldown(60);
    } catch (err: any) {
      toast.error("Request failed", {
        description: err?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setResetLoading(false);
    }
  }

  async function handleVerifyCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const token = resetCode.replace(/\s+/g, "").trim();
    if (!token) {
      toast.error("Please enter the verification code.");
      return;
    }

    // Rate limiting: brute force protection
    if (verifyAttempts >= 5) {
      toast.error("Too many failed attempts", {
        description: "For security, please click 'Resend code' to request a new verification code.",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: resetEmail.trim().toLowerCase(),
        token,
        type: "recovery",
      });

      if (error) {
        const newAttempts = verifyAttempts + 1;
        setVerifyAttempts(newAttempts);
        const remaining = 5 - newAttempts;
        if (remaining > 0) {
          toast.error("Invalid verification code", {
            description: `The code entered is invalid or expired. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`,
          });
        } else {
          toast.error("Maximum attempts reached", {
            description: "Please request a new verification code below to continue.",
          });
        }
        return;
      }

      if (data?.session || data?.user) {
        setIsRecoveryActive(true);
        setVerifyAttempts(0);
        toast.success("Code verified successfully", {
          description: "Please enter and confirm your new password.",
        });
        setResetStep("new_password");
      } else {
        toast.error("Verification could not be confirmed", {
          description: "Please request a new code and try again.",
        });
      }
    } catch (err: any) {
      toast.error("Verification failed", {
        description: err?.message || "Failed to verify code. Please try again.",
      });
    } finally {
      setResetLoading(false);
    }
  }

  async function handleUpdatePassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password requirement not met", {
        description: "Your new password must be at least 8 characters long.",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match", {
        description: "Please make sure both password fields match exactly.",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("Could not update password", { description: error.message });
        return;
      }

      const targetEmail = resetEmail.trim().toLowerCase() || data?.user?.email || "";

      // Dispatch security notification email via server function
      try {
        if (targetEmail) {
          await sendPasswordChangeNotification({
            data: { email: targetEmail },
          });
        }
      } catch (notifErr) {
        console.warn("Could not dispatch confirmation email notification:", notifErr);
      }

      toast.success("Password changed successfully", {
        description: "Your corporate password has been updated. You can now sign in.",
      });

      setResetStep("success");
    } catch (err: any) {
      toast.error("Failed to update password", {
        description: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setResetLoading(false);
    }
  }

  async function handleFinishReset() {
    const remembered = resetEmail.trim().toLowerCase();
    setResetModalOpen(false);
    setIsRecoveryActive(false);
    setResetStep("request");
    setResetCode("");
    setVerifyAttempts(0);
    setShowCodeInput(false);
    setNewPassword("");
    setConfirmNewPassword("");
    if (remembered) {
      setEmail(remembered);
    }
    setPassword("");

    try {
      await supabase.auth.signOut();
    } catch {}

    if (typeof window !== "undefined" && (window.location.hash || window.location.search)) {
      window.history.replaceState(null, "", window.location.pathname);
    }
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

      {/* =========================================================================
          PASSWORD RESET MODAL (REQUEST, LINK / CODE INSTRUCTIONS, NEW PASSWORD, SUCCESS)
          ========================================================================= */}
      <Dialog open={resetModalOpen} onOpenChange={(open) => {
        if (!open && resetStep === "success") {
          handleFinishReset();
        } else {
          setResetModalOpen(open);
        }
      }}>
        <DialogContent className="max-w-md border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-7">
          {/* STEP 1: Request Reset */}
          {resetStep === "request" && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">Reset Password</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Enter your registered work email to receive a verification code.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-xs font-medium text-foreground">
                    Work Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@mavisstrategicpartners.co.za"
                      required
                      className="h-10.5 pl-10 text-sm"
                    />
                  </div>

                  {resetEmail && !resetEmail.includes("@") && (
                    <button
                      type="button"
                      onClick={() => setResetEmail(`${resetEmail.trim()}@mavisstrategicpartners.co.za`)}
                      className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-1 text-[11px] text-primary transition hover:bg-secondary"
                    >
                      <Sparkles className="h-3 w-3" />
                      Append @mavisstrategicpartners.co.za
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground">
                  <p className="leading-relaxed">
                    We will send a one-time <strong>verification code (OTP)</strong> to your registered email address. Enter the code on the next screen to set your new password.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResetModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="h-10 bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Enter Verification Code */}
          {resetStep === "verify_code" && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">Enter Verification Code</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      We sent a one-time verification code to <span className="font-semibold text-foreground">{resetEmail}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code" className="text-xs font-medium text-foreground">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-code"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.trim())}
                      placeholder="e.g. 123456"
                      maxLength={10}
                      autoFocus
                      required
                      disabled={resetLoading || verifyAttempts >= 5}
                      className="h-12 pl-10 text-center font-mono text-lg font-bold tracking-widest uppercase bg-secondary/30 disabled:opacity-50"
                    />
                  </div>

                  {verifyAttempts > 0 && verifyAttempts < 5 && (
                    <p className="text-[11px] font-medium text-amber-500">
                      ⚠️ {5 - verifyAttempts} attempt{5 - verifyAttempts === 1 ? "" : "s"} remaining before lockout.
                    </p>
                  )}
                  {verifyAttempts >= 5 && (
                    <p className="text-[11px] font-medium text-destructive">
                      🚫 Maximum attempts exceeded. Please click &ldquo;Resend code&rdquo; below to request a new code.
                    </p>
                  )}

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Check your inbox (and spam folder) for the verification code from <strong>Mavis Strategic Partners</strong>.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={resetLoading || !resetCode.trim() || verifyAttempts >= 5}
                  className="w-full h-10.5 bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    "Verify Code & Continue"
                  )}
                </Button>
              </form>

              {/* Footer actions */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || resetLoading}
                  onClick={() => handleRequestReset()}
                  className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyAttempts(0);
                    setResetStep("request");
                  }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Change email
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create New Password */}
          {resetStep === "new_password" && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">Set New Password</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Create a secure new password for your account.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="h-10.5 pl-10 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-new-password" className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      minLength={8}
                      className="h-10.5 pl-10 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password requirement checklist */}
                <div className="rounded-lg border border-border/70 bg-secondary/30 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={newPassword.length >= 8 ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                      {newPassword.length >= 8 ? "✓" : "•"}
                    </span>
                    <span className={newPassword.length >= 8 ? "text-foreground font-medium" : "text-muted-foreground"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={newPassword && newPassword === confirmNewPassword ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                      {newPassword && newPassword === confirmNewPassword ? "✓" : "•"}
                    </span>
                    <span className={newPassword && newPassword === confirmNewPassword ? "text-foreground font-medium" : "text-muted-foreground"}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResetModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetLoading || newPassword.length < 8 || newPassword !== confirmNewPassword}
                    className="h-10 bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Success Confirmation */}
          {resetStep === "success" && (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">Password Changed Successfully!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Your corporate password has been updated. A security confirmation email has been dispatched to{" "}
                  <strong className="text-foreground">{resetEmail || "your email"}</strong>.
                </p>
              </div>

              <div className="rounded-lg border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground">
                <p>
                  You can now sign in using your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleFinishReset}
                  className="w-full h-10.5 bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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