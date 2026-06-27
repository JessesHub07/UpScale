alter table public.leads
  add column input_tokens integer default 0,
  add column output_tokens integer default 0;
