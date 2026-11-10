import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  ExecHeader,
  OverviewGate,
  SEV_ICON,
  UnreadDot,
  notificationLink,
  relTime,
  splitLink,
} from "@/components/executive/ExecutiveUI";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useStaffNotifications,
} from "@/lib/staff-tasks.service";
import type { StaffNotification } from "@/lib/staff-tasks.types";
import type { ExecutiveOverview } from "@/lib/executive.types";

export const Route = createFileRoute("/_authenticated/ceo/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Executive View" }] }),
  component: () => <OverviewGate>{(data) => <NotificationsPage data={data} />}</OverviewGate>,
});

const CATS = [
  { v: "all", l: "Everything" },
  { v: "tasks", l: "Tasks" },
  { v: "deliverables", l: "Deliverables" },
  { v: "clients", l: "Clients" },
  { v: "attendance", l: "Attendance" },
  { v: "leave", l: "Leave" },
  { v: "finance", l: "Finance" },
  { v: "people", l: "People" },
  { v: "follow-ups", l: "Follow-ups" },
  { v: "messages", l: "Messages to you" },
];

function categoryOf(n: StaffNotification) {
  if (n.type === "executive_alert") return n.category || "other";
  if (n.type === "executive_follow_up") return "follow-ups";
  return "messages";
}

function NotificationsPage({ data }: { data: ExecutiveOverview }) {
  const navigate = useNavigate();
  const [view, setView] = useState<"unread" | "all">("unread");
  const [cat, setCat] = useState("all");
  const q = useStaffNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const all = q.data?.notifications ?? [];
  const unreadCount = q.data?.unreadCount ?? 0;
  const activeGroups = useMemo(() => new Set(data.feed.map((f) => f.eventGroup)), [data.feed]);

  const list = useMemo(
    () =>
      all.filter((n) => (view === "unread" ? !n.read : true) && (cat === "all" || categoryOf(n) === cat)),
    [all, view, cat],
  );

  const setRead = (n: StaffNotification, read: boolean) =>
    markOne.mutate(
      { id: n.id, read },
      { onError: (e) => toast.error((e as Error).message || "Could not update the notification.") },
    );

  const open = (n: StaffNotification) => {
    if (!n.read) setRead(n, true);
    const link = notificationLink(n);
    if (link) {
      const { to, search } = splitLink(link);
      navigate({ to: to as any, search: search as any });
    }
  };

  return (
    <div className="space-y-6">
      <ExecHeader
        title="Notifications"
        subtitle="Company alerts that need executive attention, and messages addressed to you."
        source="alerts raised from tasks, deliverables, clients, attendance, leave, finance and follow-ups, saved with their read status on your account"
        data={data}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as "unread" | "all")}>
          <TabsList>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATS.map((c) => (
              <SelectItem key={c.v} value={c.v} className="text-xs">
                {c.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={!unreadCount || markAll.isPending}
          onClick={() =>
            markAll.mutate(undefined, {
              onError: (e) => toast.error((e as Error).message || "Could not mark notifications as read."),
            })
          }
        >
          <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all as read
        </Button>
      </div>

      {q.isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : q.error ? (
        <Empty>Notifications could not be loaded. {(q.error as Error).message}</Empty>
      ) : list.length ? (
        <div className="space-y-1.5">
          {list.map((n) => {
            const isAlert = n.type === "executive_alert";
            const resolved = isAlert && n.eventGroup ? !activeGroups.has(n.eventGroup) : false;
            const hasLink = Boolean(notificationLink(n));
            return (
              <div
                key={n.id}
                role={hasLink ? "button" : undefined}
                tabIndex={hasLink ? 0 : undefined}
                onClick={() => (hasLink ? open(n) : !n.read && setRead(n, true))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && hasLink) open(n);
                }}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                  hasLink ? "cursor-pointer hover:border-primary/40 hover:bg-muted/30" : ""
                } ${n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
              >
                {isAlert && n.severity ? SEV_ICON[n.severity] : <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug text-foreground ${n.read ? "font-medium" : "font-semibold"}`}>
                    {!n.read && <UnreadDot className="mr-1.5 align-middle" />}
                    {n.title}
                  </p>
                  {n.message && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-3">{n.message}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{relTime(n.createdAt)}</span>
                    {n.read && n.readAt && <span>· read {relTime(n.readAt)}</span>}
                    {resolved && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[9px]">
                        No longer active
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRead(n, !n.read);
                  }}
                  className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
                >
                  {n.read ? "Mark unread" : "Mark as read"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty>
          {view === "unread"
            ? "You're up to date — there are no unread notifications."
            : "No notifications in this category yet."}
        </Empty>
      )}
      <p className="text-[11px] text-muted-foreground">
        Opening an alert marks it as read and takes you to the record behind it. A situation raises a new alert only when
        something new happens (for example, another task becomes overdue); routine changes do not repeat it.
      </p>
    </div>
  );
}
