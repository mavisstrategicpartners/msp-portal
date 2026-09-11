import { cn } from "@/lib/utils";

export function MspLogo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-transparent p-1">
        <img src="/msp-logo.png" alt="Mavis Strategic Partners" className="h-full w-full object-contain" />
      </div>
      {showWord && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-white">MSP</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">Mavis Strategic Partners</span>
        </div>
      )}
    </div>
  );
}
