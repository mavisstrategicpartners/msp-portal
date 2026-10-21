import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      gap={12}
      icons={{
        success: (
          <div className="toast-badge toast-badge-success">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ),
        error: (
          <div className="toast-badge toast-badge-error">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        ),
        warning: (
          <div className="toast-badge toast-badge-warning">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8v5" />
              <circle cx="12" cy="17" r="1" fill="#ffffff" />
            </svg>
          </div>
        ),
        info: (
          <div className="toast-badge toast-badge-info">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="1" fill="#ffffff" />
              <path d="M12 12v4" />
            </svg>
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4",
            "group-[.toaster]:rounded-[20px] group-[.toaster]:px-5 group-[.toaster]:py-4",
            "group-[.toaster]:min-w-[320px] group-[.toaster]:max-w-[420px]",
            "group-[.toaster]:bg-white group-[.toaster]:text-slate-900",
            "group-[.toaster]:border group-[.toaster]:border-black/[0.06]",
            "group-[.toaster]:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.05)]",
            "dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-50",
            "dark:group-[.toaster]:border-white/[0.1]",
            "dark:group-[.toaster]:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.5)]",
            "group-[.toaster]:font-sans",
          ].join(" "),
          title: [
            "group-[.toast]:font-semibold",
            "group-[.toast]:text-[15px]",
            "group-[.toast]:leading-snug",
            "group-[.toast]:text-slate-900",
            "dark:group-[.toast]:text-slate-50",
          ].join(" "),
          description: [
            "group-[.toast]:text-[13px]",
            "group-[.toast]:leading-relaxed",
            "group-[.toast]:mt-0.5",
            "group-[.toast]:text-slate-500",
            "dark:group-[.toast]:text-slate-400",
          ].join(" "),
          closeButton: [
            "group-[.toast]:!bg-slate-100 group-[.toast]:!border-slate-200",
            "dark:group-[.toast]:!bg-slate-800 dark:group-[.toast]:!border-slate-700",
            "group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400",
            "group-[.toast]:!rounded-full",
          ].join(" "),
          actionButton: [
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            "group-[.toast]:rounded-xl group-[.toast]:font-medium group-[.toast]:text-xs",
            "group-[.toast]:px-3.5 group-[.toast]:py-2",
          ].join(" "),
          cancelButton: [
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
            "dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-300",
            "group-[.toast]:rounded-xl group-[.toast]:text-xs",
            "group-[.toast]:px-3.5 group-[.toast]:py-2",
          ].join(" "),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
