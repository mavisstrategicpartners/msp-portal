import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  ArrowLeft, BellOff, Bell, FileText, Hash, LogOut, MessageSquarePlus, MoreHorizontal, Paperclip, Pencil, Reply, Search, Send, Trash2, Users, X,
  Building2, Globe2, UserRound, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { chatFetch, dayLabel, fileSize, initials, timeLabel } from "@/lib/chat-api";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";

/**
 * Company Chat: the company group, department groups, custom groups and private messages.
 * Everything is fetched from /api/chat, which only returns conversations the user belongs to.
 */
export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Company Chat — MSP Portal" }] }),
  validateSearch: z.object({ c: z.string().optional() }),
  component: ChatPage,
});

type Conv = {
  id: string; kind: "company" | "department" | "group" | "direct"; name: string; description: string | null; member_count: number; my_role: string;
  muted: boolean; unread: number; last_message: { sender_name: string; preview: string; created_at: string } | null; last_activity: string;
  other_user: { id: string; name: string; job_title: string | null; avatar_url: string | null } | null;
};
type Msg = {
  id: string; conversation_id: string; sender_id: string | null; sender_name: string | null; kind: "text" | "system"; body: string | null;
  attachments: { index: number; name: string; size: number; mimeType: string }[]; reply_to: string | null; created_at: string; edited_at: string | null; deleted: boolean;
};

const KIND_ICON = { company: Globe2, department: Building2, group: Hash, direct: UserRound } as const;

function Avatar({ name, url, kind, size = 36 }: { name: string; url?: string | null; kind?: Conv["kind"]; size?: number }) {
  const Icon = kind && kind !== "direct" ? KIND_ICON[kind] : null;
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary" style={{ width: size, height: size }}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : Icon ? <Icon className="h-4 w-4" /> : initials(name)}
    </span>
  );
}

function ChatPage() {
  const { c: selected } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [newDm, setNewDm] = useState(false);
  const [newGroup, setNewGroup] = useState(false);
  const { data, isLoading, error } = useQuery({ queryKey: ["chat", "conversations"], queryFn: () => chatFetch<{ conversations: Conv[]; canCreateGroups: boolean }>("/conversations"), refetchInterval: 30_000 });
  const convs = data?.conversations ?? [];
  const open = (id: string | undefined) => navigate({ search: { c: id } as any, replace: !id });
  const filtered = q.trim() ? convs.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())) : convs;
  const current = convs.find((c) => c.id === selected);
  const started = async (id: string) => {
    await qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    open(id);
  };

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-4rem)] overflow-hidden border-border bg-card sm:-mx-6 lg:mx-0 lg:my-0 lg:h-[calc(100dvh-8rem)] lg:rounded-lg lg:border">
      {/* Conversation list */}
      <aside className={cn("flex w-full flex-col border-border md:w-80 md:shrink-0 md:border-r", selected && "hidden md:flex")}>
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h1 className="text-base font-semibold text-foreground">Company Chat</h1>
            <p className="text-xs text-muted-foreground">Team, department and private conversations</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" aria-label="New conversation"><MessageSquarePlus className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setNewDm(true)}><UserRound className="mr-2 h-4 w-4" /> New private message</DropdownMenuItem>
              {data?.canCreateGroups && <DropdownMenuItem onClick={() => setNewGroup(true)}><Users className="mr-2 h-4 w-4" /> New group chat</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="border-b border-border px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{(error as Error).message}</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{q ? "No conversations match." : "No conversations yet."}</p>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => open(c.id)}
                    className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50", selected === c.id && "bg-muted")}
                  >
                    <Avatar name={c.name} url={c.other_user?.avatar_url} kind={c.kind} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-sm", c.unread ? "font-semibold text-foreground" : "font-medium text-foreground")}>{c.name}</span>
                        {c.last_message && <span className="shrink-0 text-[11px] text-muted-foreground">{timeLabel(c.last_message.created_at)}</span>}
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-xs", c.unread ? "text-foreground" : "text-muted-foreground")}>
                          {c.last_message ? `${c.kind !== "direct" && c.last_message.sender_name ? `${c.last_message.sender_name}: ` : c.last_message.sender_name === "You" ? "You: " : ""}${c.last_message.preview}` : c.kind === "direct" ? c.other_user?.job_title ?? "" : `${c.member_count} ${c.member_count === 1 ? "member" : "members"}`}
                        </span>
                        {c.muted ? <BellOff className="h-3 w-3 shrink-0 text-muted-foreground" /> : c.unread > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{c.unread > 99 ? "99+" : c.unread}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className={cn("min-w-0 flex-1 flex-col", selected ? "flex" : "hidden md:flex")}>
        {selected ? (
          <Thread key={selected} convId={selected} summary={current} onBack={() => open(undefined)} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquarePlus className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">Select a conversation</p>
            <p className="max-w-sm text-xs text-muted-foreground">Chat with the whole company in General, with your department, or privately with a colleague.</p>
          </div>
        )}
      </section>

      <NewDirectDialog open={newDm} onOpenChange={setNewDm} onStarted={started} />
      <NewGroupDialog open={newGroup} onOpenChange={setNewGroup} onStarted={started} />
    </div>
  );
}

function Thread({ convId, summary, onBack }: { convId: string; summary?: Conv; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const myId = profile?.user?.id;
  const [older, setOlder] = useState<Msg[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [info, setInfo] = useState(false);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [editing, setEditing] = useState<Msg | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const detail = useQuery({ queryKey: ["chat", "conv", convId], queryFn: () => chatFetch<any>(`/conversations/${convId}`), retry: false });
  const latest = useQuery({ queryKey: ["chat", "messages", convId], queryFn: () => chatFetch<{ messages: Msg[]; hasMore: boolean; lastReadAt: string | null }>(`/conversations/${convId}/messages?limit=50`), refetchInterval: 20_000, retry: false });

  // Merge older pages with the live latest page (by id).
  const messages = useMemo(() => {
    const map = new Map<string, Msg>();
    for (const m of [...older, ...(latest.data?.messages ?? [])]) map.set(m.id, m);
    return [...map.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [older, latest.data]);
  const moreAvailable = hasMoreOlder ?? latest.data?.hasMore ?? false;

  // Mark as read when opened and whenever new messages arrive while open.
  const newestId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (!newestId || document.hidden) return;
    chatFetch(`/conversations/${convId}/read`, { method: "POST" }).then(() => {
      qc.invalidateQueries({ queryKey: ["chat", "unread"] });
      qc.setQueryData(["chat", "conversations"], (d: any) => (d ? { ...d, conversations: d.conversations.map((c: Conv) => (c.id === convId ? { ...c, unread: 0 } : c)) } : d));
    }).catch(() => {});
  }, [convId, newestId, qc]);

  // Live updates for this conversation.
  useEffect(() => {
    const ch = supabase
      .channel(`chat-${convId}`)
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${convId}` }, () => {
        qc.invalidateQueries({ queryKey: ["chat", "messages", convId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [convId, qc]);

  // Keep the view pinned to the newest message unless the reader scrolled up.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const loadOlder = async () => {
    if (!messages[0]) return;
    setLoadingOlder(true);
    const el = scroller.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const r = await chatFetch<{ messages: Msg[]; hasMore: boolean }>(`/conversations/${convId}/messages?limit=50&before=${encodeURIComponent(messages[0].created_at)}`);
      atBottom.current = false;
      setOlder((o) => [...r.messages, ...o]);
      setHasMoreOlder(r.hasMore);
      requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prevHeight; });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingOlder(false);
    }
  };

  const conv = detail.data?.conversation;
  const notFound = (detail.error as any)?.status === 404 || (latest.error as any)?.status === 404;
  const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);
  const lastRead = latest.data?.lastReadAt;
  const firstUnread = lastRead ? messages.find((m) => m.created_at > lastRead && m.sender_id !== myId && m.kind === "text")?.id : null;

  const remove = async (m: Msg) => {
    if (!confirm("Delete this message for everyone?")) return;
    try {
      await chatFetch(`/messages/${m.id}`, { method: "DELETE" });
      setOlder((o) => o.map((x) => (x.id === m.id ? { ...x, deleted: true, body: null, attachments: [] } : x)));
      qc.invalidateQueries({ queryKey: ["chat"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (notFound)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">Conversation not available</p>
        <p className="text-xs text-muted-foreground">It doesn't exist or you are not a member.</p>
        <Button size="sm" variant="outline" onClick={onBack}>Back to conversations</Button>
      </div>
    );

  const title = conv?.name ?? summary?.name ?? "";
  const subtitle = conv?.kind === "direct"
    ? detail.data?.members?.find((m: any) => m.user_id !== myId)?.job_title ?? "Private conversation"
    : `${detail.data?.members?.length ?? summary?.member_count ?? ""} ${(detail.data?.members?.length ?? summary?.member_count) === 1 ? "member" : "members"}${conv?.kind === "department" ? " · department chat" : conv?.kind === "company" ? " · everyone at MSP" : ""}`;

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <Button size="icon" variant="ghost" className="md:hidden" onClick={onBack} aria-label="Back to conversations"><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar name={title} kind={conv?.kind ?? summary?.kind} url={summary?.other_user?.avatar_url} />
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setInfo(true)}>
          <div className="truncate text-sm font-semibold text-foreground">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        </button>
        <Button size="icon" variant="ghost" onClick={() => setInfo(true)} aria-label="Conversation details"><Users className="h-4 w-4" /></Button>
      </header>

      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {moreAvailable && (
          <div className="mb-4 text-center">
            <Button size="sm" variant="outline" onClick={loadOlder} disabled={loadingOlder}>{loadingOlder ? "Loading…" : "Load earlier messages"}</Button>
          </div>
        )}
        {latest.isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
            const grouped = !newDay && prev && prev.sender_id === m.sender_id && prev.kind === "text" && m.kind === "text" && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60_000;
            return (
              <div key={m.id}>
                {newDay && (
                  <div className="my-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> {dayLabel(m.created_at)} <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                {firstUnread === m.id && (
                  <div className="my-3 flex items-center gap-3 text-[11px] font-medium text-primary">
                    <span className="h-px flex-1 bg-primary/40" /> New messages <span className="h-px flex-1 bg-primary/40" />
                  </div>
                )}
                {m.kind === "system" ? (
                  <p className="my-2 text-center text-xs text-muted-foreground">{m.body}</p>
                ) : (
                  <MessageBubble m={m} mine={m.sender_id === myId} grouped={Boolean(grouped)} showName={conv?.kind !== "direct"} replied={m.reply_to ? byId.get(m.reply_to) : undefined}
                    onReply={() => setReplyTo(m)} onEdit={() => setEditing(m)} onDelete={() => remove(m)} />
                )}
              </div>
            );
          })
        )}
      </div>

      <Composer
        convId={convId}
        replyTo={replyTo}
        editing={editing}
        onCancel={() => { setReplyTo(null); setEditing(null); }}
        onSent={() => {
          atBottom.current = true;
          setReplyTo(null);
          setEditing(null);
          qc.invalidateQueries({ queryKey: ["chat"] });
        }}
      />

      <InfoDialog open={info} onOpenChange={setInfo} convId={convId} data={detail.data} myId={myId} onLeft={onBack} />
    </>
  );
}

function MessageBubble({ m, mine, grouped, showName, replied, onReply, onEdit, onDelete }: { m: Msg; mine: boolean; grouped: boolean; showName: boolean; replied?: Msg; onReply: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={cn("group flex gap-2", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-3")}>
      {!mine && <span className="w-8 shrink-0">{!grouped && <Avatar name={m.sender_name ?? "?"} size={32} />}</span>}
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        {!grouped && !mine && showName && <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{m.sender_name}</span>}
        <div className="flex items-center gap-1">
          {mine && !m.deleted && <BubbleMenu mine onReply={onReply} onEdit={onEdit} onDelete={onDelete} hasText={Boolean(m.body)} />}
          <div className={cn("rounded-2xl px-3 py-2 text-sm", m.deleted ? "border border-dashed border-border bg-transparent italic text-muted-foreground" : mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
            {replied && !m.deleted && (
              <div className={cn("mb-1.5 border-l-2 pl-2 text-xs", mine ? "border-primary-foreground/50 text-primary-foreground/80" : "border-primary/50 text-muted-foreground")}>
                <span className="font-medium">{replied.sender_name}</span>: {replied.deleted ? "Message deleted" : (replied.body ?? "Attachment").slice(0, 120)}
              </div>
            )}
            {m.deleted ? "This message was deleted" : (
              <>
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                {m.attachments.length > 0 && (
                  <div className={cn("grid gap-1.5", m.body && "mt-2")}>
                    {m.attachments.map((a) => <Attachment key={a.index} messageId={m.id} a={a} mine={mine} />)}
                  </div>
                )}
              </>
            )}
          </div>
          {!mine && !m.deleted && <BubbleMenu onReply={onReply} />}
        </div>
        <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
          {new Date(m.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}{m.edited_at && !m.deleted ? " · edited" : ""}
        </span>
      </div>
    </div>
  );
}

function BubbleMenu({ mine, onReply, onEdit, onDelete, hasText }: { mine?: boolean; onReply: () => void; onEdit?: () => void; onDelete?: () => void; hasText?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Message options" className="rounded p-1 text-muted-foreground opacity-100 hover:bg-muted sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={mine ? "end" : "start"}>
        <DropdownMenuItem onClick={onReply}><Reply className="mr-2 h-4 w-4" /> Reply</DropdownMenuItem>
        {mine && hasText && <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
        {mine && <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Attachment({ messageId, a, mine }: { messageId: string; a: Msg["attachments"][number]; mine: boolean }) {
  const isImage = a.mimeType?.startsWith("image/");
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (!isImage) return;
    chatFetch<{ url: string }>(`/messages/${messageId}/file/${a.index}`).then((r) => setThumb(r.url)).catch(() => {});
  }, [isImage, messageId, a.index]);
  const openFile = async (download = false) => {
    try {
      const r = await chatFetch<{ url: string }>(`/messages/${messageId}/file/${a.index}${download ? "?download=1" : ""}`);
      window.open(r.url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  if (isImage && thumb)
    return (
      <button type="button" onClick={() => openFile()} className="overflow-hidden rounded-lg">
        <img src={thumb} alt={a.name} className="max-h-60 max-w-full object-contain" />
      </button>
    );
  return (
    <button type="button" onClick={() => openFile(true)} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs", mine ? "bg-primary-foreground/15" : "bg-background")}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate font-medium">{a.name}</span>
        <span className={cn("block", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{fileSize(a.size)}</span>
      </span>
    </button>
  );
}

function Composer({ convId, replyTo, editing, onCancel, onSent }: { convId: string; replyTo: Msg | null; editing: Msg | null; onCancel: () => void; onSent: () => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) setText(editing.body ?? "");
    if (editing || replyTo) ta.current?.focus();
  }, [editing, replyTo]);
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [text]);

  const send = async () => {
    const body = text.trim();
    if (busy || (!body && files.length === 0)) return;
    setBusy(true);
    try {
      if (editing) {
        await chatFetch(`/messages/${editing.id}`, { method: "PATCH", body: { body } });
      } else {
        const attachments = [];
        for (const f of files) {
          const slot = await chatFetch<any>(`/conversations/${convId}/upload-url`, { method: "POST", body: { fileName: f.name, size: f.size } });
          const { error } = await supabase.storage.from(slot.bucket).uploadToSignedUrl(slot.path, slot.token, f, { contentType: f.type || "application/octet-stream", upsert: false });
          if (error) throw new Error(`Could not upload ${f.name}.`);
          attachments.push({ path: slot.path, name: f.name, size: f.size, mimeType: f.type });
        }
        await chatFetch(`/conversations/${convId}/messages`, { method: "POST", body: { body, attachments, replyTo: replyTo?.id } });
      }
      setText("");
      setFiles([]);
      onSent();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      ta.current?.focus();
    }
  };

  return (
    <div className="border-t border-border p-3">
      {(replyTo || editing) && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
          <span className="truncate text-muted-foreground">
            {editing ? "Editing message" : <>Replying to <span className="font-medium text-foreground">{replyTo?.sender_name}</span>: {(replyTo?.body ?? "Attachment").slice(0, 80)}</>}
          </span>
          <button type="button" onClick={() => { onCancel(); setText(""); }} aria-label="Cancel"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs">
              <FileText className="h-3.5 w-3.5" /> <span className="max-w-[160px] truncate">{f.name}</span> <span className="text-muted-foreground">{fileSize(f.size)}</span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        {!editing && (
          <>
            <input ref={fileInput} type="file" multiple hidden onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              const tooBig = picked.find((f) => f.size > 25 * 1024 * 1024);
              if (tooBig) toast.error(`${tooBig.name} is larger than 25 MB.`);
              setFiles((cur) => [...cur, ...picked.filter((f) => f.size <= 25 * 1024 * 1024)].slice(0, 10));
              e.target.value = "";
            }} />
            <Button type="button" size="icon" variant="ghost" onClick={() => fileInput.current?.click()} aria-label="Attach files" disabled={busy}><Paperclip className="h-4 w-4" /></Button>
          </>
        )}
        <textarea
          ref={ta}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent as any).isComposing) {
              e.preventDefault();
              send();
            }
            if (e.key === "Escape" && (editing || replyTo)) onCancel();
          }}
          placeholder="Write a message"
          title="Enter to send · Shift+Enter for a new line"
          className="max-h-40 min-h-[40px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <Button type="button" size="icon" onClick={send} disabled={busy || (!text.trim() && files.length === 0)} aria-label={editing ? "Save" : "Send"}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function PeoplePicker({ selected, onToggle, single }: { selected: string[]; onToggle: (id: string) => void; single?: boolean }) {
  const [q, setQ] = useState("");
  const { data } = useQuery({ queryKey: ["chat", "directory"], queryFn: () => chatFetch<{ people: { id: string; name: string; job_title: string | null; avatar_url: string | null }[] }>("/directory"), staleTime: 60_000 });
  const people = (data?.people ?? []).filter((p) => !q.trim() || `${p.name} ${p.job_title ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="grid gap-2">
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleagues" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
      <ul className="max-h-72 overflow-y-auto rounded-md border border-border">
        {people.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onToggle(p.id)} className={cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50", selected.includes(p.id) && "bg-primary/10")}>
              <Avatar name={p.name} url={p.avatar_url} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.job_title ?? ""}</span>
              </span>
              {!single && selected.includes(p.id) && <span className="text-xs font-medium text-primary">Added</span>}
            </button>
          </li>
        ))}
        {people.length === 0 && <li className="p-4 text-center text-xs text-muted-foreground">No colleagues match.</li>}
      </ul>
    </div>
  );
}

function NewDirectDialog({ open, onOpenChange, onStarted }: { open: boolean; onOpenChange: (v: boolean) => void; onStarted: (id: string) => void }) {
  const start = async (userId: string) => {
    try {
      const r = await chatFetch<{ id: string }>("/conversations", { method: "POST", body: { kind: "direct", userId } });
      onOpenChange(false);
      onStarted(r.id);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New private message</DialogTitle>
          <DialogDescription>Only you and the colleague you choose can read this conversation.</DialogDescription>
        </DialogHeader>
        {open && <PeoplePicker selected={[]} single onToggle={start} />}
      </DialogContent>
    </Dialog>
  );
}

function NewGroupDialog({ open, onOpenChange, onStarted }: { open: boolean; onOpenChange: (v: boolean) => void; onStarted: (id: string) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setName(""); setDesc(""); setIds([]); } }, [open]);
  const create = async () => {
    setBusy(true);
    try {
      const r = await chatFetch<{ id: string }>("/conversations", { method: "POST", body: { kind: "group", name, description: desc, memberIds: ids } });
      onOpenChange(false);
      onStarted(r.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New group chat</DialogTitle>
          <DialogDescription>For a project or team. Only the people you add can read it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
          {open && <PeoplePicker selected={ids} onToggle={(id) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy || name.trim().length < 2 || ids.length === 0}>{busy ? "Creating…" : `Create group (${ids.length + 1})`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoDialog({ open, onOpenChange, convId, data, myId, onLeft }: { open: boolean; onOpenChange: (v: boolean) => void; convId: string; data: any; myId?: string; onLeft: () => void }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState<string[] | null>(null);
  const conv = data?.conversation;
  const members: any[] = data?.members ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["chat"] });
  const patch = async (body: any) => {
    try {
      await chatFetch(`/conversations/${convId}/members`, { method: "PATCH", body });
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const leave = async () => {
    if (!confirm("Leave this group? You will no longer see its messages.")) return;
    try {
      await chatFetch(`/conversations/${convId}/leave`, { method: "POST" });
      onOpenChange(false);
      refresh();
      onLeft();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const mute = async () => {
    await chatFetch(`/conversations/${convId}/mute`, { method: "POST", body: { muted: !conv?.muted } }).catch(() => {});
    refresh();
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setAdding(null); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{conv?.name}</DialogTitle>
          <DialogDescription>
            {conv?.kind === "company" ? "Every active MSP employee is a member. Membership updates automatically."
              : conv?.kind === "department" ? "Members follow the Department Structure and update automatically."
              : conv?.kind === "direct" ? "A private conversation between two people."
              : conv?.description || "A group chat. Only members can read it."}
          </DialogDescription>
        </DialogHeader>
        {adding ? (
          <>
            <PeoplePicker selected={adding} onToggle={(id) => setAdding((s) => (s!.includes(id) ? s!.filter((x) => x !== id) : [...s!, id]))} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdding(null)}>Back</Button>
              <Button disabled={!adding.length} onClick={async () => { await patch({ add: adding.filter((id) => !members.some((m) => m.user_id === id)) }); setAdding(null); }}>Add {adding.length}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={mute}>{conv?.muted ? <><Bell className="mr-1.5 h-3.5 w-3.5" /> Unmute</> : <><BellOff className="mr-1.5 h-3.5 w-3.5" /> Mute</>}</Button>
              {conv?.can_manage && <Button size="sm" variant="outline" onClick={() => setAdding([])}><Users className="mr-1.5 h-3.5 w-3.5" /> Add people</Button>}
              {conv?.can_leave && <Button size="sm" variant="outline" onClick={leave}><LogOut className="mr-1.5 h-3.5 w-3.5" /> Leave group</Button>}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{members.length} members</p>
            <ul className="divide-y divide-border rounded-md border border-border">
              {members.map((m) => (
                <li key={m.user_id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <Avatar name={m.name} url={m.avatar_url} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{m.name}{m.user_id === myId ? " (you)" : ""}</span>
                    <span className="block truncate text-xs text-muted-foreground">{m.job_title ?? ""}</span>
                  </span>
                  {m.role !== "member" && <span className="text-xs text-muted-foreground">{m.role === "owner" ? "Owner" : "Admin"}</span>}
                  {conv?.can_manage && m.role !== "owner" && m.user_id !== myId && (
                    <button type="button" className="text-xs text-destructive hover:underline" onClick={() => patch({ remove: [m.user_id] })}>Remove</button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
