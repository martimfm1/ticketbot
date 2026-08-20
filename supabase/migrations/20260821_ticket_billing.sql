-- SILENTRA Ticket billing: tenant = Discord guild/server.
-- Mirrors the production billing model used by SILENTRA for Barbers while keeping
-- the ticket application's existing Supabase schema untouched.

create table if not exists public.server_billing_accounts (
  guild_id bigint primary key,
  billing_owner_user_id bigint,
  stripe_customer_id text not null unique,
  billing_email text,
  trial_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists server_billing_accounts_owner_idx
  on public.server_billing_accounts (billing_owner_user_id);

create table if not exists public.server_subscriptions (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null unique,
  billing_owner_user_id bigint not null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free','pro','enterprise')),
  plan_override text check (plan_override is null or plan_override in ('free','pro','enterprise')),
  status text not null default 'active',
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists server_subscriptions_owner_idx
  on public.server_subscriptions (billing_owner_user_id);
create index if not exists server_subscriptions_customer_idx
  on public.server_subscriptions (stripe_customer_id);

create table if not exists public.server_plan_assignments (
  guild_id bigint primary key,
  plan text not null check (plan in ('free','pro','enterprise')),
  expires_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  status text not null default 'processing' check (status in ('processing','processed','failed')),
  last_error text,
  attempts integer not null default 0,
  processing_started_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_status_idx
  on public.stripe_webhook_events (status, created_at);

create or replace function public.touch_server_billing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists server_billing_accounts_touch_updated_at on public.server_billing_accounts;
create trigger server_billing_accounts_touch_updated_at
before update on public.server_billing_accounts
for each row execute function public.touch_server_billing_updated_at();

drop trigger if exists server_subscriptions_touch_updated_at on public.server_subscriptions;
create trigger server_subscriptions_touch_updated_at
before update on public.server_subscriptions
for each row execute function public.touch_server_billing_updated_at();

drop trigger if exists server_plan_assignments_touch_updated_at on public.server_plan_assignments;
create trigger server_plan_assignments_touch_updated_at
before update on public.server_plan_assignments
for each row execute function public.touch_server_billing_updated_at();

create or replace function public.claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text,
  p_lease_seconds integer default 300
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  row_status text;
  updated_count integer;
begin
  insert into public.stripe_webhook_events (event_id, event_type, status, attempts, processing_started_at)
  values (p_event_id, p_event_type, 'processing', 1, now())
  on conflict (event_id) do nothing;

  select status into row_status
  from public.stripe_webhook_events
  where event_id = p_event_id
  for update;

  if row_status = 'processed' then return 'processed'; end if;

  update public.stripe_webhook_events
  set status = 'processing', attempts = attempts + 1, processing_started_at = now(), last_error = null
  where event_id = p_event_id
    and (
      status = 'failed'
      or status = 'processing' and processing_started_at < now() - make_interval(secs => p_lease_seconds)
    );

  get diagnostics updated_count = row_count;
  if updated_count = 0 then return 'processing'; end if;
  return 'claimed';
end;
$$;

create or replace function public.complete_stripe_webhook_event(p_event_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stripe_webhook_events
  set status = 'processed', processed_at = now(), last_error = null
  where event_id = p_event_id;
  return found;
end;
$$;

create or replace function public.fail_stripe_webhook_event(p_event_id text, p_error text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stripe_webhook_events
  set status = 'failed', last_error = left(coalesce(p_error, 'UNKNOWN'), 4000)
  where event_id = p_event_id;
  return found;
end;
$$;

alter table public.server_billing_accounts enable row level security;
alter table public.server_subscriptions enable row level security;
alter table public.server_plan_assignments enable row level security;
alter table public.stripe_webhook_events enable row level security;

notify pgrst, 'reload schema';
