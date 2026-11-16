/**
 * Full-page layout for account screens (choose a password, reset a password).
 * The MSP brand colour fills the whole viewport behind a centred, balanced form card,
 * matching the sign-in page.
 */
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthScreen({ children, topRight }: { children: ReactNode; topRight?: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#3b1d4d] text-white dark:bg-[#1c1428]">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <img src="/msp-logo.png" alt="" className="h-8 w-8 object-contain" onError={(e) => ((e.target as HTMLElement).style.display = "none")} />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Mavis Strategic Partners</p>
            <p className="text-[11px] text-white/60">Company portal</p>
          </div>
        </div>
        {topRight}
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:pb-16">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
      <footer className="relative z-10 flex items-center justify-center gap-1.5 px-4 pb-6 text-[11px] text-white/55">
        <ShieldCheck className="h-3.5 w-3.5" /> Secure connection · © {new Date().getFullYear()} Mavis Strategic Partners
      </footer>
    </div>
  );
}

/** The white form card used on every account screen. */
export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-black/5 bg-card p-6 text-card-foreground shadow-2xl shadow-black/20 sm:p-8">{children}</div>;
}
