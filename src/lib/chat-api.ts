import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/lib/notify";

export async function chatFetch<T = any>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" };
  const res = await fetch(`/api/chat${path}`, { method: init?.method ?? "GET", headers, body: init?.body === undefined ? undefined : JSON.stringify(init.body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data as T;
}

/** Unread total for the menu badge; refreshed by the realtime watcher and every minute. */
export function useChatUnread() {
  return useQuery({ queryKey: ["chat", "unread"], queryFn: () => chatFetch<{ unreadTotal: number }>("/unread"), refetchInterval: 60_000, staleTime: 10_000, retry: false });
}

/**
 * One subscription per signed-in session: any new or changed message in a conversation the user
 * belongs to (the database only delivers those) refreshes the chat queries.
 */
export function useChatRealtime(enabled: boolean, myId?: string | null) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    if (!enabled) return;
    let timer: any = null;
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(() => qc.invalidateQueries({ queryKey: ["chat"] }), 250);
    };
    const onChange = async (payload: any) => {
      bump();
      const m = payload?.new;
      if (payload?.eventType !== "INSERT" || !m || m.kind !== "text" || !myId || m.sender_id === myId) return;
      // Not while the person is already looking at that conversation.
      const here = typeof window !== "undefined" && window.location.pathname === "/chat" && new URLSearchParams(window.location.search).get("c") === m.conversation_id;
      if (here && !document.hidden) return;
      // Fresh list: gives the conversation name, mute setting and the sender of this message.
      const list: any = await qc.fetchQuery({ queryKey: ["chat", "conversations"], queryFn: () => chatFetch("/conversations"), staleTime: 0 }).catch(() => null);
      const conv = list?.conversations?.find((c: any) => c.id === m.conversation_id);
      if (!conv || conv.muted) return;
      const preview = m.body ? String(m.body).slice(0, 90) : "Sent an attachment";
      toast.info(conv.kind === "direct" ? `New message from ${conv.name}` : `New message in ${conv.name}`, {
        id: `chat-${m.conversation_id}`, // one notification per conversation, updated as messages arrive
        description: conv.kind === "direct" ? preview : `${conv.last_message?.sender_name && conv.last_message.sender_name !== "You" ? `${conv.last_message.sender_name}: ` : ""}${preview}`,
        action: { label: "Open", onClick: () => navigate({ to: "/chat" as any, search: { c: m.conversation_id } as any }) },
      });
    };
    const ch = supabase
      .channel("company-chat")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "chat_messages" }, onChange)
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [enabled, myId, qc, navigate]);
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86_400_000).toDateString() === d.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  if (yesterday) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}
export function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  if (new Date(now.getTime() - 86_400_000).toDateString() === d.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}
export const fileSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
