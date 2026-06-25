alter table public.messages
  add column chat_id text;

create index messages_chat_id_idx on public.messages (chat_id);
