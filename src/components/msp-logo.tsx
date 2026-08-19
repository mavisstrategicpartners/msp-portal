import { cn } from "@/lib/utils";
import logoAsset from "@/assets/msp-logo.png.asset.json";

export function MspLogo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
        <img src={logoAsset.url} alt="Mavis Strategic Partners" className="h-full w-full object-contain" />
      </div>
      {showWord && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">MSP</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">Mavis Strategic Partners</span>
        </div>
      )}
    </div>
  );
}
