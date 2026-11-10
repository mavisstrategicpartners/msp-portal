/**
 * The CEO's notification bell: company-wide alerts and messages addressed to the CEO, in a dropdown.
 * Read/unread status is stored on the server (portal notification ledger); every change here updates
 * the badge, the dashboard and the Notifications page at once.
 */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SEV_ICON, UnreadDot, notificationLink, relTime, splitLink } from "@/components/executive/ExecutiveUI";
import { useExecutiveOverview } from "@/lib/executive.service";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useStaffNotifications,
} from "@/lib/staff-tasks.service";
import type { StaffNotification } from "@/lib/staff-tasks.types";

export function CeoNotificationBell() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"unread" | "all">("unread");
  const navigate = useNavigate();
  // Keeps company alerts current on every page (including inspected workspaces); shares the dashboard's cache.
  useExecutiveOverview();
  const q = useStaffNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const all = q.data?.notifications ?? [];
  const unread = q.data?.unreadCount ?? 0;
  const list = useMemo(() => (view === "unread" ? all.filter((n) => !n.read) : all).slice(0, 50), [all, view]);

  const setRead = (n: StaffNotification, read: boolean) =>
    markOne.mutate(
      { id: n.id, read },
      { onError: (e) => toast.error((e as Error).message || "Could not update the notification.") },
    );

  const openItem = (n: StaffNotification) => {
    if (!n.read) setRead(n, true);
    const link = notificationLink(n);
    if (link) {
      const { to, search } = splitLink(link);
      setOpen(false);
      navigate({ to: to as any, search: search as any });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative inline-flex"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications, none unread"}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[380px] max-w-[calc(100vw-1.5rem)] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unread ? `${unread} unread` : "You're up to date"}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px] font-semibold text-primary"
            disabled={!unread || markAll.isPending}
            onClick={() =>
              markAll.mutate(undefined, {
                onError: (e) => toast.error((e as Error).message || "Could not mark notifications as read."),
              })
            }
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all as read
          </Button>
        </div>
        <div className="flex gap-1 border-b border-border px-3 py-1.5">
          {(["unread", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "unread" ? `Unread (${unread})` : `All (${all.length})`}
            </button>
          ))}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {q.isLoading ? (
            <p className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </p>
          ) : q.error ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Notifications could not be loaded.</p>
          ) : list.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {view === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => openItem(n)}
                onKeyDown={(e) => e.key === "Enter" && openItem(n)}
                className={`group flex cursor-pointer items-start gap-2.5 border-b border-border/60 px-3 py-2.5 last:border-0 transition hover:bg-muted/40 ${
                  n.read ? "" : "bg-primary/5"
                }`}
              >
                <span className="mt-0.5">
                  {n.type === "executive_alert" && n.severity ? (
                    SEV_ICON[n.severity]
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug text-foreground ${n.read ? "font-medium" : "font-semibold"}`}>
                    {n.title}
                  </p>
                  {n.message && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.message}</p>}
                  <p className="mt-1 text-[10px] text-muted-foreground">{relTime(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {!n.read && <UnreadDot />}
                  {!n.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      aria-label="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRead(n, true);
                      }}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-center">
          <Link
            to="/ceo/notifications"
            onClick={() => setOpen(false)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
