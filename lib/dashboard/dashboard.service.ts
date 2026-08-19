import { supabaseServer } from "@/lib/supabase";
import type {
  DashboardMetrics,
  DashboardServer,
  DashboardTicket,
  DashboardSuggestion,
} from "@/types/dashboard";

const DISCORD_SNOWFLAKE_REGEX = /^\d{17,20}$/;

function toId(value: number | string | bigint | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function validateGuildId(guildId: string): void {
  if (!DISCORD_SNOWFLAKE_REGEX.test(guildId)) throw new Error("Invalid Discord guild ID");
}

export async function getDashboardMetrics(guildId: string): Promise<DashboardMetrics> {
  validateGuildId(guildId);

  const [{ data: server, error: serverError }, { count: serverCount, error: serverCountError }, { data: tickets, error: ticketsError }, { data: suggestions, error: suggestionsError }] = await Promise.all([
    supabaseServer
      .from("servers")
      .select("guild_id, ticket_category_id, admin_role_name, admin_role_id, ticket_role_id, transcript_channel_id, language")
      .eq("guild_id", guildId)
      .maybeSingle(),
    supabaseServer.from("servers").select("guild_id", { count: "exact", head: true }),
    supabaseServer
      .from("tickets")
      .select("channel_id, guild_id, user_id, subject, status, opened_at, closed_at, claimed_by, priority, assigned_to, claimed_at, last_activity_at, closed_by, resolution_note, updated_at")
      .eq("guild_id", guildId)
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .order("opened_at", { ascending: false })
      .limit(200),
    supabaseServer
      .from("suggestions")
      .select("message_id, guild_id, author_id, suggestion_text, status, created_at")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (serverError) throw new Error("Failed to fetch server");
  if (serverCountError) throw new Error("Failed to count servers");
  if (ticketsError) throw new Error("Failed to fetch tickets");
  if (suggestionsError) throw new Error("Failed to fetch suggestions");

  const allTickets = tickets ?? [];
  const openTickets = allTickets.filter((ticket) => ticket.status?.toLowerCase() === "open").length;
  const pendingTickets = allTickets.filter((ticket) => ticket.status?.toLowerCase() === "pending").length;
  const closedTickets = allTickets.filter((ticket) => ticket.status?.toLowerCase() === "closed").length;

  const priorities = {
    low: allTickets.filter((ticket) => (ticket.priority ?? "normal").toLowerCase() === "low").length,
    normal: allTickets.filter((ticket) => (ticket.priority ?? "normal").toLowerCase() === "normal").length,
    high: allTickets.filter((ticket) => (ticket.priority ?? "normal").toLowerCase() === "high").length,
    urgent: allTickets.filter((ticket) => (ticket.priority ?? "normal").toLowerCase() === "urgent").length,
  };

  const recentTickets: DashboardTicket[] = allTickets.slice(0, 20).map((ticket) => ({
    channelId: toId(ticket.channel_id)!,
    guildId: toId(ticket.guild_id),
    userId: toId(ticket.user_id)!,
    subject: ticket.subject,
    status: ticket.status ?? "open",
    priority: ticket.priority ?? "normal",
    openedAt: ticket.opened_at,
    closedAt: ticket.closed_at,
    claimedBy: toId(ticket.claimed_by),
    assignedTo: toId(ticket.assigned_to),
    claimedAt: ticket.claimed_at,
    lastActivityAt: ticket.last_activity_at,
    closedBy: toId(ticket.closed_by),
    resolutionNote: ticket.resolution_note,
    updatedAt: ticket.updated_at,
  }));

  const allSuggestions = suggestions ?? [];
  const suggestionIds = allSuggestions.map((suggestion) => suggestion.message_id);

  let votes: Array<{ message_id: number; user_id: number; vote_type: number }> = [];
  if (suggestionIds.length > 0) {
    const { data: voteData, error: votesError } = await supabaseServer
      .from("suggestion_votes")
      .select("message_id, user_id, vote_type")
      .in("message_id", suggestionIds);
    if (votesError) throw new Error("Failed to fetch suggestion votes");
    votes = voteData ?? [];
  }

  const recentSuggestions: DashboardSuggestion[] = allSuggestions.slice(0, 10).map((suggestion) => {
    const suggestionVotes = votes.filter((vote) => vote.message_id === suggestion.message_id);
    return {
      messageId: toId(suggestion.message_id)!,
      guildId: toId(suggestion.guild_id)!,
      authorId: toId(suggestion.author_id)!,
      suggestionText: suggestion.suggestion_text,
      status: suggestion.status,
      createdAt: suggestion.created_at,
      votes: {
        up: suggestionVotes.filter((vote) => vote.vote_type > 0).length,
        down: suggestionVotes.filter((vote) => vote.vote_type < 0).length,
      },
    };
  });

  const currentServer: DashboardServer | null = server
    ? {
        // Always preserve the exact Snowflake supplied by Discord/URL.
        // Do not round it through a Postgres bigint -> JS number conversion.
        guildId,
        ticketCategoryId: toId(server.ticket_category_id),
        adminRoleName: server.admin_role_name,
        adminRoleId: toId(server.admin_role_id),
        ticketRoleId: toId(server.ticket_role_id),
        transcriptChannelId: toId(server.transcript_channel_id),
        language: server.language ?? "en",
      }
    : null;

  return {
    servers: { total: serverCount ?? 0, current: currentServer },
    tickets: {
      total: allTickets.length,
      open: openTickets,
      pending: pendingTickets,
      closed: closedTickets,
      priorities,
      recent: recentTickets,
    },
    suggestions: {
      total: allSuggestions.length,
      pending: allSuggestions.filter((s) => s.status.toLowerCase() === "pending").length,
      approved: allSuggestions.filter((s) => s.status.toLowerCase() === "approved").length,
      rejected: allSuggestions.filter((s) => s.status.toLowerCase() === "rejected").length,
      recent: recentSuggestions,
    },
  };
}
