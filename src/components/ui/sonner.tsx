import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:py-3.5 group-[.toaster]:px-4 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:mt-0.5",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-950 dark:group-[.toaster]:text-emerald-100",
          error: "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-rose-950 dark:group-[.toaster]:text-rose-100",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:text-amber-950 dark:group-[.toaster]:text-amber-100",
          info: "group-[.toaster]:border-primary/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
