import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, ExecHeader, FeedList, OverviewGate, relTime } from "@/components/executive/ExecutiveUI";
import { useMarkAllNotificationsRead, useStaffNotifications } from "@/lib/staff-tasks.service";
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
];

function NotificationsPage({ data }: { data: ExecutiveOverview }) {
  const [cat, setCat] = useState("all");
  const feed = useMemo(() => (cat === "all" ? data.feed : data.feed.filter((f) => f.category === cat)), [data.feed, cat]);
  const mine = useStaffNotifications();
  const markAll = useMarkAllNotificationsRead();
  const personal = mine.data?.notifications ?? [];
  return (
    <div className="space-y-6">
      <ExecHeader
        title="Notifications"
        subtitle="Company events that need executive attention, and messages addressed to you."
        source="the executive feed (tasks, evidence, clients, attendance, leave, finance, follow-ups) and your portal notifications"
        data={data}
      />
      <Tabs defaultValue="company" className="space-y-3">
        <TabsList>
          <TabsTrigger value="company">Company events ({data.feed.length})</TabsTrigger>
          <TabsTrigger value="mine">Addressed to you ({mine.data?.unreadCount ?? 0} unread)</TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="space-y-3">
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
          <FeedList items={feed} empty="No events in this category." />
          <p className="text-[11px] text-muted-foreground">
            Routine activity is grouped (for example, many late onboardings appear as one item) so only events needing
            attention are listed.
          </p>
        </TabsContent>
        <TabsContent value="mine" className="space-y-2">
          {personal.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Mark all as read
            </Button>
          )}
          {mine.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : personal.length ? (
            personal.map((n) => (
              <Card key={n.id} className={`p-3 text-xs ${n.read ? "" : "border-primary/40"}`}>
                <p className="font-semibold text-foreground">{n.title}</p>
                <p className="text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{relTime(n.createdAt)}</p>
              </Card>
            ))
          ) : (
            <Empty>No messages have been addressed to you.</Empty>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
