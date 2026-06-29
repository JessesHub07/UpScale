create table public.templates (
  id uuid not null default gen_random_uuid(),
  name text not null,
  category text not null default 'marketing',
  content text not null,
  status text not null default 'draft',
  created_at timestamp with time zone not null default now(),
  constraint templates_pkey primary key (id)
) TABLESPACE pg_default;
