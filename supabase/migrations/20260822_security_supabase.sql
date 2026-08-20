-- SILENTRA Security: Supabase-only persistence.
-- Safe for the shared database: every DDL statement is idempotent.

create table if not exists public.security_configs (
  guild_id bigint primary key,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.security_infractions (
  guild_id bigint not null,
  user_id bigint not null,
  window_start bigint not null default extract(epoch from now())::bigint,
  strikes integer not null default 0,
  last_infraction_at bigint not null default extract(epoch from now())::bigint,
  last_infraction_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create index if not exists security_infractions_last_infraction_idx
  on public.security_infractions (guild_id, last_infraction_at desc);

create or replace function public.touch_security_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists security_configs_touch_updated_at on public.security_configs;
create trigger security_configs_touch_updated_at
before update on public.security_configs
for each row execute function public.touch_security_updated_at();

drop trigger if exists security_infractions_touch_updated_at on public.security_infractions;
create trigger security_infractions_touch_updated_at
before update on public.security_infractions
for each row execute function public.touch_security_updated_at();

notify pgrst, 'reload schema';
