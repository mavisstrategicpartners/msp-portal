/**
 * /api/chat — Company Chat & Team Messaging.
 *
 * Conversations:
 *  - "General – Company Team" (kind company): every active employee, kept in sync automatically.
 *  - One group per department (kind department): that department's members and its appointed
 *    manager (Department Structure), kept in sync automatically.
 *  - Custom groups (kind group): created by managers, HR, the GM, the CEO or administrators;
 *    the creator owns the group and can add or remove people.
 *  - Private one-to-one conversations (kind direct): any employee with any active colleague.
 *
 * Access: only members of a conversation can read it, post in it or open its files. There is
 * no administrator, HR or CEO bypass for conversations they are not in. Everything is checked
 * here from the verified Supabase token; the database lets browsers read only conversations
 * they belong to (for real-time delivery) and never write.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateApiRequest, type ApiUser } from "@/lib/api-auth.server";
import { DEPARTMENTS } from "@/lib/departments";

const db = () => supabaseAdmin as any;
const BUCKET = "chat-files";
const MAX_BYTES = 25 * 1024 * 1024;
const EXT = ["pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "txt", "png", "jpg", "jpeg", "gif", "webp", "heic", "mp4", "mov", "mp3", "m4a", "wav", "zip"];
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const deptName = (key: string | null) => DEPARTMENTS.find((d) => d.key === key)?.name ?? key ?? "Department";
export const COMPANY_GROUP_NAME = "General – Company Team";

type Person = { id: string; name: string; email: string; job_title: string | null; avatar_url: string | null };

/** Who may create custom group chats. */
export function canCreateGroups(u: ApiUser) {
  const a = u.access;
  return a.isCEO || a.isAdmin || a.isGM || a.isHR || a.isManagerOrAbove || a.isDepartmentManager || (u.leadDepartments ?? []).length > 0;
}

async function activePeople(): Promise<Map<string, Person>> {
  const { data } = await db().from("profiles").select("id, full_name, email, job_title, avatar_url, is_active");
  return new Map(
    (data || [])
      .filter((p: any) => p.is_active !== false)
      .map((p: any) => [p.id, { id: p.id, name: p.full_name || p.email || "Colleague", email: p.email || "", job_title: p.job_title ?? null, avatar_url: p.avatar_url ?? null }]),
  );
}

let lastSync = 0;
/**
 * Keep the company and department groups' membership in line with the people directory and the
 * Department Structure. Removed people lose access to the group from then on; messages stay.
 */
export async function syncSystemGroups(force = false) {
  if (!force && Date.now() - lastSync < 60_000) return;
  lastSync = Date.now();
  const people = await activePeople();
  const [{ data: convs }, { data: members }, { data: deptMembers }, { data: deptLeads }] = await Promise.all([
    db().from("chat_conversations").select("*").in("kind", ["company", "department"]),
    db().from("chat_members").select("conversation_id, user_id, role"),
    db().from("department_members").select("user_id, department_key"),
    db().from("department_leads").select("user_id, department_key"),
  ]);
  const want = new Map<string, Set<string>>(); // key → user ids
  want.set("company", new Set(people.keys()));
  for (const r of [...(deptMembers || []), ...(deptLeads || [])]) {
    if (!people.has(r.user_id)) continue;
    const k = `dept:${r.department_key}`;
    if (!want.has(k)) want.set(k, new Set());
    want.get(k)!.add(r.user_id);
  }
  const leads = new Set((deptLeads || []).map((r: any) => `${r.department_key}:${r.user_id}`));
  let all = convs || [];
  for (const [k, users] of want) {
    if (users.size === 0) continue;
    const isCompany = k === "company";
    const deptKey = isCompany ? null : k.slice(5);
    let conv = all.find((c: any) => (isCompany ? c.kind === "company" : c.kind === "department" && c.department_key === deptKey));
    if (!conv) {
      const row = isCompany
        ? { kind: "company", name: COMPANY_GROUP_NAME, description: "Company-wide announcements and conversation for every MSP employee." }
        : { kind: "department", name: deptName(deptKey), department_key: deptKey, description: `Team chat for ${deptName(deptKey)}.` };
      const { data, error } = await db().from("chat_conversations").insert(row).select();
      if (error) continue; // created concurrently by another request; picked up next sync
      conv = Array.isArray(data) ? data[0] : data;
      all = [...all, conv];
    }
    const current = (members || []).filter((m: any) => m.conversation_id === conv.id);
    const have = new Set(current.map((m: any) => m.user_id));
    const add = [...users].filter((u) => !have.has(u)).map((u) => ({
      conversation_id: conv.id, user_id: u, role: !isCompany && leads.has(`${deptKey}:${u}`) ? "admin" : "member",
    }));
    if (add.length) await db().from("chat_members").insert(add);
    for (const m of current) if (!users.has(m.user_id)) await db().from("chat_members").delete().eq("conversation_id", conv.id).eq("user_id", m.user_id);
  }
}

async function membership(convId: string, userId: string) {
  const { data } = await db().from("chat_members").select("*").eq("conversation_id", convId).eq("user_id", userId).maybeSingle();
  return data || null;
}

function fileOk(fileName: string, size: number) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (!fileName) return "Missing file name.";
  if (!EXT.includes(ext)) return `This file type is not allowed (${ext || "none"}).`;
  if (size <= 0) return "The file is empty.";
  if (size > MAX_BYTES) return "Files can be at most 25 MB.";
  return null;
}
async function fileExists(path: string) {
  const dir = path.slice(0, path.lastIndexOf("/")), name = path.slice(path.lastIndexOf("/") + 1);
  const { data, error } = await db().storage.from(BUCKET).list(dir, { search: name, limit: 5 });
  return !error && Array.isArray(data) && data.some((o: any) => o.name === name);
}

function messageOut(m: any, people: Map<string, Person>) {
  return {
    id: m.id, conversation_id: m.conversation_id, sender_id: m.sender_id, kind: m.kind,
    sender_name: m.sender_id ? people.get(m.sender_id)?.name ?? "Former employee" : null,
    body: m.deleted_at ? null : m.body,
    attachments: m.deleted_at ? [] : (m.attachments || []).map((a: any, i: number) => ({ index: i, name: a.name, size: a.size, mimeType: a.mimeType })),
    reply_to: m.reply_to, created_at: m.created_at, edited_at: m.edited_at, deleted: Boolean(m.deleted_at),
  };
}

async function conversationList(user: ApiUser) {
  const people = await activePeople();
  const { data: mine } = await db().from("chat_members").select("*").eq("user_id", user.userId);
  const ids = (mine || []).map((m: any) => m.conversation_id);
  if (!ids.length) return [];
  const [{ data: convs }, { data: allMembers }, { data: msgs }] = await Promise.all([
    db().from("chat_conversations").select("*").in("id", ids),
    db().from("chat_members").select("conversation_id, user_id").in("conversation_id", ids),
    db().from("chat_messages").select("id, conversation_id, sender_id, body, attachments, kind, created_at, deleted_at").in("conversation_id", ids),
  ]);
  return (convs || [])
    .filter((c: any) => !c.is_archived)
    .map((c: any) => {
      const me = (mine || []).find((m: any) => m.conversation_id === c.id);
      const memberIds = (allMembers || []).filter((m: any) => m.conversation_id === c.id).map((m: any) => m.user_id);
      const cm = (msgs || []).filter((m: any) => m.conversation_id === c.id).sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)));
      const last = cm[0];
      const other = c.kind === "direct" ? memberIds.find((id: string) => id !== user.userId) ?? null : null;
      const otherPerson = other ? people.get(other) : null;
      const unread = cm.filter((m: any) => m.sender_id !== user.userId && !m.deleted_at && (!me?.last_read_at || m.created_at > me.last_read_at)).length;
      return {
        id: c.id, kind: c.kind,
        name: c.kind === "direct" ? otherPerson?.name ?? "Former employee" : c.name,
        description: c.description,
        department_key: c.department_key,
        other_user: otherPerson ? { id: otherPerson.id, name: otherPerson.name, job_title: otherPerson.job_title, avatar_url: otherPerson.avatar_url } : null,
        member_count: memberIds.length,
        my_role: me?.role ?? "member",
        muted: Boolean(me?.muted),
        unread,
        last_message: last
          ? { sender_name: last.sender_id === user.userId ? "You" : people.get(last.sender_id)?.name ?? "", preview: last.deleted_at ? "Message deleted" : last.body ? String(last.body).slice(0, 120) : (last.attachments || []).length ? "Attachment" : "", created_at: last.created_at }
          : null,
        last_activity: last?.created_at ?? c.created_at,
      };
    })
    .sort((a: any, b: any) => (a.kind === "company" ? -1 : b.kind === "company" ? 1 : String(b.last_activity).localeCompare(String(a.last_activity))));
}

export async function handleChatApi(request: Request): Promise<Response> {
  const u = new URL(request.url);
  const path = u.pathname.replace(/\/+$/, "");
  const method = request.method;
  const user = await authenticateApiRequest(request);
  if (!user) return json({ error: "Please sign in." }, 401);
  const body = method === "GET" || method === "DELETE" ? {} : await request.json().catch(() => ({}));

  try {
    await syncSystemGroups();

    if (path === "/api/chat/conversations" && method === "GET") {
      const list = await conversationList(user);
      return json({ conversations: list, unreadTotal: list.reduce((s: number, c: any) => s + (c.muted ? 0 : c.unread), 0), canCreateGroups: canCreateGroups(user) });
    }
    if (path === "/api/chat/unread" && method === "GET") {
      const list = await conversationList(user);
      return json({ unreadTotal: list.reduce((s: number, c: any) => s + (c.muted ? 0 : c.unread), 0) });
    }
    if (path === "/api/chat/directory" && method === "GET") {
      const people = await activePeople();
      return json({ people: [...people.values()].filter((p) => p.id !== user.userId).map(({ id, name, job_title, avatar_url }) => ({ id, name, job_title, avatar_url })).sort((a, b) => a.name.localeCompare(b.name)) });
    }

    // Start a private conversation, or create a custom group.
    if (path === "/api/chat/conversations" && method === "POST") {
      const people = await activePeople();
      if (body.kind === "direct") {
        const other = str(body.userId, 64);
        if (!other || other === user.userId || !people.has(other)) return json({ error: "Choose an active colleague." }, 400);
        const key = [user.userId, other].sort().join(":");
        const { data: existing } = await db().from("chat_conversations").select("*").eq("kind", "direct").eq("direct_key", key).maybeSingle();
        if (existing) return json({ id: existing.id, existing: true });
        const { data, error } = await db().from("chat_conversations").insert({ kind: "direct", direct_key: key, created_by: user.userId }).select();
        if (error) {
          const { data: again } = await db().from("chat_conversations").select("*").eq("kind", "direct").eq("direct_key", key).maybeSingle();
          if (again) return json({ id: again.id, existing: true });
          return json({ error: "Could not start the conversation." }, 500);
        }
        const conv = Array.isArray(data) ? data[0] : data;
        await db().from("chat_members").insert([{ conversation_id: conv.id, user_id: user.userId, role: "member" }, { conversation_id: conv.id, user_id: other, role: "member" }]);
        return json({ id: conv.id }, 201);
      }
      if (body.kind === "group") {
        if (!canCreateGroups(user)) return json({ error: "Only managers, HR and company leadership can create group chats." }, 403);
        const name = str(body.name, 120);
        if (name.length < 2) return json({ error: "Give the group a name." }, 400);
        const ids = [...new Set((Array.isArray(body.memberIds) ? body.memberIds : []).filter((id: any) => typeof id === "string" && people.has(id) && id !== user.userId))];
        if (ids.length === 0) return json({ error: "Add at least one colleague." }, 400);
        const { data, error } = await db().from("chat_conversations").insert({ kind: "group", name, description: str(body.description, 500) || null, created_by: user.userId }).select();
        if (error) return json({ error: "Could not create the group." }, 500);
        const conv = Array.isArray(data) ? data[0] : data;
        await db().from("chat_members").insert([{ conversation_id: conv.id, user_id: user.userId, role: "owner" }, ...ids.map((id) => ({ conversation_id: conv.id, user_id: id, role: "member" }))]);
        await db().from("chat_messages").insert({ conversation_id: conv.id, sender_id: user.userId, kind: "system", body: `${user.fullName || "A colleague"} created the group “${name}”.` });
        await db().from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conv.id);
        return json({ id: conv.id }, 201);
      }
      return json({ error: "Unknown conversation type." }, 400);
    }

    const cm = path.match(/^\/api\/chat\/conversations\/([0-9a-f-]{36})(?:\/(messages|read|upload-url|members|leave|mute))?$/);
    if (cm) {
      const convId = cm[1], action = cm[2];
      const me = await membership(convId, user.userId);
      if (!me) return json({ error: "Conversation not found." }, 404); // non-members learn nothing
      const { data: conv } = await db().from("chat_conversations").select("*").eq("id", convId).maybeSingle();
      if (!conv) return json({ error: "Conversation not found." }, 404);
      const people = await activePeople();

      if (!action && method === "GET") {
        const { data: mem } = await db().from("chat_members").select("*").eq("conversation_id", convId);
        const other = conv.kind === "direct" ? (mem || []).find((m: any) => m.user_id !== user.userId)?.user_id : null;
        return json({
          conversation: {
            id: conv.id, kind: conv.kind, description: conv.description, department_key: conv.department_key, created_at: conv.created_at,
            name: conv.kind === "direct" ? people.get(other)?.name ?? "Former employee" : conv.name,
            my_role: me.role, muted: me.muted,
            can_manage: conv.kind === "group" && ["owner", "admin"].includes(me.role),
            can_leave: conv.kind === "group",
          },
          members: (mem || []).map((m: any) => ({ user_id: m.user_id, role: m.role, name: people.get(m.user_id)?.name ?? "Former employee", job_title: people.get(m.user_id)?.job_title ?? null, avatar_url: people.get(m.user_id)?.avatar_url ?? null }))
            .sort((a: any, b: any) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : a.name.localeCompare(b.name))),
        });
      }

      if (action === "messages" && method === "GET") {
        const limit = Math.min(100, Math.max(1, Number(u.searchParams.get("limit")) || 50));
        const before = u.searchParams.get("before");
        const { data } = await db().from("chat_messages").select("*").eq("conversation_id", convId);
        let list = (data || []).sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)));
        if (before) list = list.filter((m: any) => m.created_at < before);
        const page = list.slice(0, limit);
        return json({ messages: page.reverse().map((m: any) => messageOut(m, people)), hasMore: list.length > limit, lastReadAt: me.last_read_at });
      }

      if (action === "messages" && method === "POST") {
        const text = typeof body.body === "string" ? body.body.replace(/\s+$/, "").slice(0, 8000) : "";
        const files = Array.isArray(body.attachments) ? body.attachments.slice(0, 10) : [];
        const attachments = [];
        for (const f of files) {
          const p = String(f?.path || "");
          if (!p.startsWith(`conversations/${convId}/${user.userId}/`) || p.includes("..")) return json({ error: "Invalid attachment." }, 400);
          if (!(await fileExists(p))) return json({ error: "An attachment did not finish uploading. Try again." }, 400);
          attachments.push({ path: p, name: str(f.name, 200) || p.split("/").pop(), size: Math.max(0, Number(f.size) || 0), mimeType: str(f.mimeType, 120) || "application/octet-stream" });
        }
        if (!text.trim() && attachments.length === 0) return json({ error: "Write a message or attach a file." }, 400);
        let replyTo = null;
        if (body.replyTo) {
          const { data: r } = await db().from("chat_messages").select("id, conversation_id").eq("id", String(body.replyTo)).maybeSingle();
          if (r && r.conversation_id === convId) replyTo = r.id;
        }
        const row = { conversation_id: convId, sender_id: user.userId, kind: "text", body: text.trim() ? text : null, attachments, reply_to: replyTo };
        const { data, error } = await db().from("chat_messages").insert(row).select();
        if (error) return json({ error: "The message could not be sent." }, 500);
        const msg = Array.isArray(data) ? data[0] : data;
        await Promise.all([
          db().from("chat_conversations").update({ last_message_at: msg.created_at, updated_at: msg.created_at }).eq("id", convId),
          db().from("chat_members").update({ last_read_at: msg.created_at }).eq("conversation_id", convId).eq("user_id", user.userId),
        ]);
        return json({ message: messageOut(msg, people) }, 201);
      }

      if (action === "read" && method === "POST") {
        await db().from("chat_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", convId).eq("user_id", user.userId);
        return json({ ok: true });
      }
      if (action === "mute" && method === "POST") {
        await db().from("chat_members").update({ muted: Boolean(body.muted) }).eq("conversation_id", convId).eq("user_id", user.userId);
        return json({ ok: true });
      }

      if (action === "upload-url" && method === "POST") {
        const fileName = str(body.fileName, 200), size = Number(body.size) || 0;
        const err = fileOk(fileName, size);
        if (err) return json({ error: err }, 400);
        const p = `conversations/${convId}/${user.userId}/${crypto.randomUUID()}-${fileName.replace(/[^\w.\-]+/g, "_").slice(-100)}`;
        const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(p);
        if (error || !data?.token) return json({ error: "Could not prepare the upload." }, 500);
        return json({ path: p, token: data.token, bucket: BUCKET });
      }

      if (action === "members" && method === "PATCH") {
        if (conv.kind !== "group") return json({ error: "Membership of company and department chats follows the Department Structure." }, 400);
        if (!["owner", "admin"].includes(me.role)) return json({ error: "Only the group's owner or admins can change members." }, 403);
        const add = (Array.isArray(body.add) ? body.add : []).filter((id: any) => typeof id === "string" && people.has(id));
        const remove = (Array.isArray(body.remove) ? body.remove : []).filter((id: any) => typeof id === "string" && id !== user.userId);
        const { data: mem } = await db().from("chat_members").select("user_id, role").eq("conversation_id", convId);
        const have = new Set((mem || []).map((m: any) => m.user_id));
        const toAdd = add.filter((id: string) => !have.has(id));
        if (toAdd.length) await db().from("chat_members").insert(toAdd.map((id: string) => ({ conversation_id: convId, user_id: id, role: "member" })));
        for (const id of remove) {
          if ((mem || []).find((m: any) => m.user_id === id)?.role === "owner") continue;
          await db().from("chat_members").delete().eq("conversation_id", convId).eq("user_id", id);
        }
        const names = (ids: string[]) => ids.map((id) => people.get(id)?.name ?? "a colleague").join(", ");
        const notes = [toAdd.length ? `${user.fullName} added ${names(toAdd)}.` : "", remove.length ? `${user.fullName} removed ${names(remove)}.` : ""].filter(Boolean);
        for (const n of notes) await db().from("chat_messages").insert({ conversation_id: convId, sender_id: user.userId, kind: "system", body: n });
        if (typeof body.name === "string" && str(body.name, 120).length >= 2) await db().from("chat_conversations").update({ name: str(body.name, 120), updated_at: new Date().toISOString() }).eq("id", convId);
        return json({ ok: true });
      }

      if (action === "leave" && method === "POST") {
        if (conv.kind !== "group") return json({ error: "You can't leave the company or department chats." }, 400);
        const { data: mem } = await db().from("chat_members").select("user_id, role").eq("conversation_id", convId);
        if (me.role === "owner") {
          const next = (mem || []).find((m: any) => m.user_id !== user.userId);
          if (next) await db().from("chat_members").update({ role: "owner" }).eq("conversation_id", convId).eq("user_id", next.user_id);
        }
        await db().from("chat_members").delete().eq("conversation_id", convId).eq("user_id", user.userId);
        await db().from("chat_messages").insert({ conversation_id: convId, sender_id: user.userId, kind: "system", body: `${user.fullName} left the group.` });
        return json({ ok: true });
      }
    }

    // Edit or delete one's own message.
    const mm = path.match(/^\/api\/chat\/messages\/([0-9a-f-]{36})(?:\/file\/(\d+))?$/);
    if (mm) {
      const { data: msg } = await db().from("chat_messages").select("*").eq("id", mm[1]).maybeSingle();
      if (!msg || !(await membership(msg.conversation_id, user.userId))) return json({ error: "Message not found." }, 404);
      if (mm[2] !== undefined && method === "GET") {
        const f = (msg.attachments || [])[Number(mm[2])];
        if (!f || msg.deleted_at) return json({ error: "File not found." }, 404);
        const download = u.searchParams.get("download") === "1";
        const { data, error } = await db().storage.from(BUCKET).createSignedUrl(f.path, 60 * 10, download ? { download: f.name } : undefined);
        if (error || !data?.signedUrl) return json({ error: "The file is not available." }, 404);
        return json({ url: data.signedUrl, name: f.name, mimeType: f.mimeType });
      }
      if (msg.sender_id !== user.userId || msg.kind !== "text") return json({ error: "You can only change your own messages." }, 403);
      if (msg.deleted_at) return json({ error: "This message was deleted." }, 400);
      if (method === "PATCH") {
        const text = typeof body.body === "string" ? body.body.trim().slice(0, 8000) : "";
        if (!text && !(msg.attachments || []).length) return json({ error: "A message can't be empty." }, 400);
        await db().from("chat_messages").update({ body: text || null, edited_at: new Date().toISOString() }).eq("id", msg.id);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        await db().from("chat_messages").update({ deleted_at: new Date().toISOString() }).eq("id", msg.id);
        // Remove the files too, so a deleted message's attachments can't be reached.
        const paths = (msg.attachments || []).map((a: any) => a.path).filter(Boolean);
        if (paths.length) await db().storage.from(BUCKET).remove(paths);
        return json({ ok: true });
      }
    }

    return json({ error: "Not found." }, 404);
  } catch (e) {
    console.error("[chat]", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}
