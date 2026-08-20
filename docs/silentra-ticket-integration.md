# SILENTRA Ticket integration

The dashboard and `SILENTRA-BOTS` share the same Supabase project.

## Required environment

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
DISCORD_BOT_TOKEN=...
```

`DISCORD_BOT_TOKEN` is used only on the Next.js server to validate configured staff roles through Discord's guild member API. It must never be exposed to the browser.

## Shared tables

The migration at `supabase/migrations/20260819_silentra_ticket_dashboard.sql` adds:

- lifecycle/assignment fields to `tickets`
- `ticket_messages` for live dashboard history
- `ticket_events` for dashboard -> Discord commands
- timestamps and realtime publication entries

Run the migration against the same Supabase project used by the bot.

## Runtime flow

```text
Discord user
    -> SILENTRA Ticket
    -> Supabase tickets / ticket_messages
    -> Dashboard

Dashboard action
    -> /api/dashboard/tickets
    -> Supabase ticket_events
    -> SILENTRA Ticket polls events every 5s
    -> Discord channel/action
```

Tickets are now kept in Supabase after being closed. The Discord channel can be deleted while the ticket history remains available in the dashboard.
