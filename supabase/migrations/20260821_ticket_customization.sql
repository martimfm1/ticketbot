-- SILENTRA Ticket: per-server UI/UX customization
-- This migration intentionally uses a new version because 20260820 is already
-- present in the shared Supabase migration history.

alter table public.servers
  add column if not exists ticket_panel_config jsonb not null default '{}'::jsonb;

comment on column public.servers.ticket_panel_config is
  'Per-server SILENTRA Ticket panel, ticket and modal customization';

notify pgrst, 'reload schema';
