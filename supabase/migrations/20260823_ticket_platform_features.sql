-- SILENTRA Ticket platform features.
-- Billing remains tenant-aware: guild_id is the primary tenant key.

-- Expand billing plan checks without rewriting existing subscription rows.
alter table public.server_subscriptions drop constraint if exists server_subscriptions_plan_check;
alter table public.server_subscriptions
  add constraint server_subscriptions_plan_check
  check (plan in ('free','pro','business','enterprise'));

alter table public.server_subscriptions drop constraint if exists server_subscriptions_plan_override_check;
alter table public.server_subscriptions
  add constraint server_subscriptions_plan_override_check
  check (plan_override is null or plan_override in ('free','pro','business','enterprise'));

alter table public.server_plan_assignments drop constraint if exists server_plan_assignments_plan_check;
alter table public.server_plan_assignments
  add constraint server_plan_assignments_plan_check
  check (plan in ('free','pro','business','enterprise'));

-- Flexible ticket intake forms.
create table if not exists public.ticket_forms (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  name text not null,
  description text,
  category_id bigint,
  support_role_id bigint,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ticket_forms_guild_idx on public.ticket_forms (guild_id, sort_order);

create table if not exists public.ticket_form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.ticket_forms(id) on delete cascade,
  field_key text not null,
  label text not null,
  placeholder text,
  field_type text not null check (field_type in ('short_text','long_text','number','email','choice','checkbox')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ticket_form_fields_form_idx on public.ticket_form_fields (form_id, sort_order);

-- Teams, routing and reusable tags.
create table if not exists public.ticket_teams (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  name text not null,
  description text,
  role_id bigint,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ticket_teams_guild_idx on public.ticket_teams (guild_id, active);

create table if not exists public.ticket_tags (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (guild_id, name)
);

create table if not exists public.ticket_tag_links (
  ticket_id uuid not null,
  tag_id uuid not null references public.ticket_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (ticket_id, tag_id)
);

-- Saved replies and internal staff notes.
create table if not exists public.ticket_canned_responses (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  title text not null,
  body text not null,
  category text,
  created_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_internal_notes (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  channel_id bigint not null,
  author_id bigint not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists ticket_internal_notes_channel_idx on public.ticket_internal_notes (guild_id, channel_id, created_at desc);

-- Automation / flow builder.
create table if not exists public.ticket_automations (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  name text not null,
  enabled boolean not null default true,
  trigger_type text not null,
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  created_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ticket_automations_guild_idx on public.ticket_automations (guild_id, enabled);

-- SLA and escalation policies.
create table if not exists public.ticket_sla_policies (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  name text not null,
  priority text not null default 'normal',
  first_response_minutes integer not null,
  resolution_minutes integer not null,
  warning_minutes integer,
  escalation_role_id bigint,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge base for grounded support answers.
create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  title text not null,
  slug text not null,
  content text not null,
  source_url text,
  published boolean not null default true,
  created_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guild_id, slug)
);
create index if not exists knowledge_articles_guild_idx on public.knowledge_articles (guild_id, published);

-- CSAT and quality signals.
create table if not exists public.ticket_csat (
  id uuid primary key default gen_random_uuid(),
  guild_id bigint not null,
  channel_id bigint not null,
  user_id bigint not null,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists ticket_csat_guild_idx on public.ticket_csat (guild_id, created_at desc);

-- Public audit trail for configuration and support actions.
create table if not exists public.ticket_audit_logs (
  id bigint generated by default as identity primary key,
  guild_id bigint not null,
  actor_id bigint,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ticket_audit_logs_guild_idx on public.ticket_audit_logs (guild_id, created_at desc);

-- Optional per-guild feature flags for staged rollouts.
alter table public.servers
  add column if not exists feature_flags jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
