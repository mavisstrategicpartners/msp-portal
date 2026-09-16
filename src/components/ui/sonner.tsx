import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      gap={10}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            // Layout
            "group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
            // Shape & size
            "group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5",
            "group-[.toaster]:min-w-[300px] group-[.toaster]:max-w-[400px]",
            // Colours – light
            "group-[.toaster]:bg-white group-[.toaster]:text-slate-900",
            "group-[.toaster]:border group-[.toaster]:border-slate-100",
            // Elevation — matches the reference image's clean drop shadow
            "group-[.toaster]:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07),0_16px_40px_-8px_rgba(0,0,0,0.12)]",
            // Dark mode
            "dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-50",
            "dark:group-[.toaster]:border-slate-700/60",
            "dark:group-[.toaster]:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4),0_16px_40px_-8px_rgba(0,0,0,0.5)]",
            // Font
            "group-[.toaster]:font-sans",
          ].join(" "),
          title: [
            "group-[.toast]:font-semibold",
            "group-[.toast]:text-[13.5px]",
            "group-[.toast]:leading-snug",
            "group-[.toast]:text-slate-900",
            "dark:group-[.toast]:text-slate-50",
          ].join(" "),
          description: [
            "group-[.toast]:text-[12px]",
            "group-[.toast]:leading-relaxed",
            "group-[.toast]:mt-0.5",
            "group-[.toast]:text-slate-500",
            "dark:group-[.toast]:text-slate-400",
          ].join(" "),
          // Close button
          closeButton: [
            "group-[.toast]:!bg-slate-100 group-[.toast]:!border-slate-200",
            "dark:group-[.toast]:!bg-slate-800 dark:group-[.toast]:!border-slate-700",
            "group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400",
            "group-[.toast]:!rounded-full",
          ].join(" "),
          actionButton: [
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            "group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs",
            "group-[.toast]:px-3 group-[.toast]:py-1.5",
          ].join(" "),
          cancelButton: [
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
            "dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-300",
            "group-[.toast]:rounded-lg group-[.toast]:text-xs",
            "group-[.toast]:px-3 group-[.toast]:py-1.5",
          ].join(" "),
          // Type-specific left-border accent
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-emerald-500",
          error:   "group-[.toaster]:border-l-4 group-[.toaster]:border-l-rose-500",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500",
          info:    "group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
