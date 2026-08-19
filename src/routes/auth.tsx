import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock, Moon, Sun, Sparkles } from "lucide-react";
import logoAsset from "@/assets/msp-logo.png.asset.json";

type Role = "staff" | "manager" | "admin" | "contractor";
const ROLES: { id: Role; label: string }[] = [
  { id: "staff", label: "Staff" },
  { id: "manager", label: "Manager" },
  { id: "admin", label: "Admin" },
  { id: "contractor", label: "Contractor / Other" },
];

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — MSP Portal" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Default is navy (dark). User can toggle to light/white.
  const [navy, setNavy] = useState(true);
  const [role, setRole] = useState<Role>("staff");

  // Auth page defaults to light (white). Toggling flips the global `dark`
  // class on <html> so every token — background, foreground text, borders —
  // adapts consistently instead of leaving white text on a white page.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", navy);
    root.style.colorScheme = navy ? "dark" : "light";
    return () => {
      // Restore dark default when leaving the auth screen.
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    };
  }, [navy]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      try { localStorage.setItem("msp.selectedPortal", role); } catch {}
      const dest =
        role === "manager" ? "/host"
        : role === "admin" ? "/portal/admin"
        : role === "contractor" ? "/portal/other"
        : "/home";
      navigate({ to: dest });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <button
          type="button"
          onClick={() => setNavy((v) => !v)}
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-card"
          aria-label="Toggle background color"
        >
          {navy ? <><Sun className="h-3.5 w-3.5" /> Light</> : <><Moon className="h-3.5 w-3.5" /> Navy</>}
        </button>

        <div className="relative w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-[0_0_20px_-6px_var(--color-primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              All&nbsp;In&nbsp;One Portal
            </div>
            <img
              src={logoAsset.url}
              alt="Mavis Strategic Partners"
              className="h-56 w-56 rounded-2xl object-contain shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] sm:h-64 sm:w-64"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Ops · HR · Host Employer · Client Delivery — one login.
            </p>
          </div>

          <Card className="glass overflow-hidden border-border/60 p-0 shadow-[var(--shadow-soft)]">
            <div className="bg-primary px-6 py-3">
              <h2 className="text-base font-semibold tracking-tight text-primary-foreground">
                Registered Users: Login Credentials
              </h2>
            </div>

            <div className="px-6 pb-6 pt-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {ROLES.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground">
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={role === r.id}
                      onChange={() => setRole(r.id)}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    {r.label}
                  </label>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Work Email:</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password:</Label>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                  <p className="text-xs text-muted-foreground">(Minimum 8 characters. Provided by your admin.)</p>
                </div>

                <div className="border-t border-border pt-4" />

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={loading} size="sm">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Login <ArrowRight className="ml-1 h-3.5 w-3.5" /></>}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Contact your admin at info@msp.co.za to reset your password.")}>
                    Forgot Password
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Sign in first, then update your password from Profile → Security.")}>
                    Change Password
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Access is invite-only. Ask an admin to provision your account.")}>
                    Request Access
                  </Button>
                </div>
                <Button type="button" variant="link" size="sm" className="h-auto px-0 text-xs" onClick={() => toast.info("Contact info@msp.co.za to recover your work email.")}>
                  Forgot Work Email
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Invite-only · Accounts are provisioned by an admin
              </div>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">© Mavis Strategic Partners</p>
        </div>
      </div>
    </div>
  );
}