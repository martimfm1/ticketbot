import { supabaseServer } from "@/lib/supabase";
import type {
  DashboardMetrics,
  DashboardServer,
  DashboardTicket,
  DashboardSuggestion,
} from "@/types/dashboard";

const DISCORD_SNOWFLAKE_REGEX = /^\d{17,20}$/;

function toId(
  value: number | string | bigint | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function validateGuildId(guildId: string): void {
  if (!DISCORD_SNOWFLAKE_REGEX.test(guildId)) {
    throw new Error("Invalid Discord guild ID");
  }
}

/**
 * Fetches all dashboard metrics for a Discord server.
 *
 * This service is server-only and must never be imported
 * into client components.
 */
export async function getDashboardMetrics(
  guildId: string,
): Promise<DashboardMetrics> {
  validateGuildId(guildId);

  /*
   * ============================================================
   * SERVER
   * ============================================================
   */

  const { data: server, error: serverError } = await supabaseServer
    .from("servers")
    .select(
      `
        guild_id,
        ticket_category_id,
        admin_role_name,
        transcript_channel_id,
        language
      `,
    )
    .eq("guild_id", guildId)
    .maybeSingle();

  if (serverError) {
    console.error("[dashboard.service] Failed to fetch server", serverError);

    throw new Error("Failed to fetch server");
  }

  /*
   * ============================================================
   * SERVER COUNT
   * ============================================================
   */

  const { count: serverCount, error: serverCountError } = await supabaseServer
    .from("servers")
    .select("guild_id", {
      count: "exact",
      head: true,
    });

  if (serverCountError) {
    console.error(
      "[dashboard.service] Failed to count servers",
      serverCountError,
    );

    throw new Error("Failed to count servers");
  }

  /*
   * ============================================================
   * TICKETS
   * ============================================================
   */

  const { data: tickets, error: ticketsError } = await supabaseServer
    .from("tickets")
    .select(
      `
        channel_id,
        guild_id,
        user_id,
        subject,
        status,
        opened_at,
        closed_at,
        claimed_by
      `,
    )
    .eq("guild_id", guildId)
    .order("opened_at", {
      ascending: false,
    })
    .limit(100);

  if (ticketsError) {
    console.error("[dashboard.service] Failed to fetch tickets", ticketsError);

    throw new Error("Failed to fetch tickets");
  }

  const allTickets = tickets ?? [];

  /*
   * ============================================================
   * TICKET METRICS
   * ============================================================
   */

  const openTickets = allTickets.filter(
    (ticket) => ticket.status.toLowerCase() === "open",
  ).length;

  const closedTickets = allTickets.filter(
    (ticket) => ticket.status.toLowerCase() === "closed",
  ).length;

  /*
   * ============================================================
   * RECENT TICKETS
   * ============================================================
   */

  const recentTickets: DashboardTicket[] = allTickets
    .slice(0, 10)
    .map((ticket) => ({
      channelId: toId(ticket.channel_id)!,

      guildId: toId(ticket.guild_id),

      userId: toId(ticket.user_id)!,

      subject: ticket.subject,

      status: ticket.status,

      openedAt: ticket.opened_at,

      closedAt: ticket.closed_at,

      claimedBy: toId(ticket.claimed_by),
    }));

  /*
   * ============================================================
   * SUGGESTIONS
   * ============================================================
   */

  const { data: suggestions, error: suggestionsError } = await supabaseServer
    .from("suggestions")
    .select(
      `
        message_id,
        guild_id,
        author_id,
        suggestion_text,
        status,
        created_at
      `,
    )
    .eq("guild_id", guildId)
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (suggestionsError) {
    console.error(
      "[dashboard.service] Failed to fetch suggestions",
      suggestionsError,
    );

    throw new Error("Failed to fetch suggestions");
  }

  const allSuggestions = suggestions ?? [];

  /*
   * ============================================================
   * SUGGESTION VOTES
   * ============================================================
   */

  const suggestionIds = allSuggestions.map(
    (suggestion) => suggestion.message_id,
  );

  let votes: Array<{
    message_id: number;
    user_id: number;
    vote_type: number;
  }> = [];

  if (suggestionIds.length > 0) {
    const { data: voteData, error: votesError } = await supabaseServer
      .from("suggestion_votes")
      .select(
        `
          message_id,
          user_id,
          vote_type
        `,
      )
      .in("message_id", suggestionIds);

    if (votesError) {
      console.error("[dashboard.service] Failed to fetch votes", votesError);

      throw new Error("Failed to fetch suggestion votes");
    }

    votes = voteData ?? [];
  }

  /*
   * ============================================================
   * SUGGESTION METRICS
   * ============================================================
   */

  const pendingSuggestions = allSuggestions.filter(
    (suggestion) => suggestion.status.toLowerCase() === "pending",
  ).length;

  const approvedSuggestions = allSuggestions.filter(
    (suggestion) => suggestion.status.toLowerCase() === "approved",
  ).length;

  const rejectedSuggestions = allSuggestions.filter(
    (suggestion) => suggestion.status.toLowerCase() === "rejected",
  ).length;

  /*
   * ============================================================
   * RECENT SUGGESTIONS
   * ============================================================
   */

  const recentSuggestions: DashboardSuggestion[] = allSuggestions
    .slice(0, 10)
    .map((suggestion) => {
      const suggestionVotes = votes.filter(
        (vote) => vote.message_id === suggestion.message_id,
      );

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

  /*
   * ============================================================
   * CURRENT SERVER
   * ============================================================
   */

  const currentServer: DashboardServer | null = server
    ? {
        guildId: toId(server.guild_id)!,

        ticketCategoryId: toId(server.ticket_category_id),

        adminRoleName: server.admin_role_name,

        transcriptChannelId: toId(server.transcript_channel_id),

        language: server.language ?? "en",
      }
    : null;

  /*
   * ============================================================
   * FINAL RESPONSE
   * ============================================================
   */

  return {
    servers: {
      total: serverCount ?? 0,

      current: currentServer,
    },

    tickets: {
      total: allTickets.length,

      open: openTickets,

      closed: closedTickets,

      recent: recentTickets,
    },

    suggestions: {
      total: allSuggestions.length,

      pending: pendingSuggestions,

      approved: approvedSuggestions,

      rejected: rejectedSuggestions,

      recent: recentSuggestions,
    },
  };
}
