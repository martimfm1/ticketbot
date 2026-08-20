-- SILENTRA Ticket: per-server UI/UX customization
alter table public.servers
  add column if not exists ticket_panel_config jsonb not null default '{}'::jsonb;

comment on column public.servers.ticket_panel_config is
  'Per-server SILENTRA Ticket panel, ticket and modal customization';

notify pgrst, 'reload schema';
