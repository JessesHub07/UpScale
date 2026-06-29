create table public.scheduled_broadcasts (
  id uuid not null default gen_random_uuid(),
  stages text[] not null,
  min_score integer not null default 0,
  urgent_only boolean not null default false,
  search text,
  channel text not null default 'telegram',
  message text not null,
  send_at timestamp with time zone not null,
  status text not null default 'pending',
  sent_count integer,
  failed_count integer,
  created_at timestamp with time zone not null default now(),
  constraint scheduled_broadcasts_pkey primary key (id)
) TABLESPACE pg_default;
