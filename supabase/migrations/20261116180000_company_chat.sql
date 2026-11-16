-- Company Chat & Team Messaging.
--   chat_conversations: group chats (company-wide, one per department, custom groups) and
--                       private one-to-one conversations.
--   chat_members:       who belongs to each conversation, their role and read position.
--   chat_messages:      messages (soft-deleted, never hard-deleted by users) with attachment
--                       metadata; files live in the private "chat-files" bucket.
-- All writes go through the server API (/api/chat), which checks membership and validates input.
-- Browsers may READ only conversations they are a member of (needed for real-time delivery);
-- there is no administrator bypass: admins, HR and the CEO see a private conversation only if
-- they are in it.

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('company', 'department', 'group', 'direct')),
  name text check (name is null or length(btrim(name)) between 1 and 120),
  description text,
  department_key text,
  direct_key text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  is_archived boolean not null default false,
  check (kind <> 'department' or department_key is not null),
  check (kind <> 'direct' or direct_key is not null)
);
create unique index if not exists chat_conversations_company_uniq on public.chat_conversations (kind) where kind = 'company';
create unique index if not exists chat_conversations_dept_uniq on public.chat_conversations (department_key) where kind = 'department';
create unique index if not exists chat_conversations_direct_uniq on public.chat_conversations (direct_key) where kind = 'direct';

create table if not exists public.chat_members (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  muted boolean not null default false,
  primary key (conversation_id, user_id)
);
create index if not exists chat_members_user_idx on public.chat_members (user_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  kind text not null default 'text' check (kind in ('text', 'system')),
  body text check (body is null or length(body) <= 8000),
  attachments jsonb not null default '[]'::jsonb,
  reply_to uuid references public.chat_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  check (kind = 'system' or deleted_at is not null or (body is not null and length(btrim(body)) > 0) or jsonb_array_length(attachments) > 0)
);
create index if not exists chat_messages_conv_idx on public.chat_messages (conversation_id, created_at desc);

-- Membership test used by the read policies (security definer avoids policy recursion).
create or replace function public.is_chat_member(conv uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_members m where m.conversation_id = conv and m.user_id = auth.uid());
$$;
revoke all on function public.is_chat_member(uuid) from public;
grant execute on function public.is_chat_member(uuid) to authenticated;

alter table public.chat_conversations enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_messages enable row level security;
revoke all on public.chat_conversations, public.chat_members, public.chat_messages from anon;
revoke insert, update, delete, truncate on public.chat_conversations, public.chat_members, public.chat_messages from authenticated;
grant select on public.chat_conversations, public.chat_members, public.chat_messages to authenticated;

drop policy if exists chat_conversations_member_read on public.chat_conversations;
create policy chat_conversations_member_read on public.chat_conversations
  for select to authenticated using (public.is_chat_member(id));
drop policy if exists chat_members_member_read on public.chat_members;
create policy chat_members_member_read on public.chat_members
  for select to authenticated using (public.is_chat_member(conversation_id));
drop policy if exists chat_messages_member_read on public.chat_messages;
create policy chat_messages_member_read on public.chat_messages
  for select to authenticated using (public.is_chat_member(conversation_id));

-- Real-time delivery of new and changed messages (still filtered by the policy above).
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-files', 'chat-files', false, 26214400)
on conflict (id) do nothing;
