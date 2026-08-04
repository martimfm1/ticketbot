export type TicketVariant = "open" | "pending" | "resolved";

export interface TicketSummary {
  id: string;
  subject: string;
  status: string;
  time: string;
  variant: TicketVariant;
}

export interface TranscriptItem {
  channel_id: string;
  user_id: string;
  subject: string;
  opened_at: string;
  closed_at: string;
}

export interface InfractionItem {
  user_id: string;
  strikes: number;
  last_infraction_type: string;
  last_infraction_at: number;
}

export interface SuggestionItem {
  message_id: string;
  author_id: string;
  suggestion_text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface ServerConfig {
  guild_id: number;
  ticket_category_id: number | null;
  admin_role_name: string | null;
  transcript_channel_id: number | null;
  language: string;
}

export interface FullDashboardData {
  guildId: string;
  serverConfig: ServerConfig;
  securityConfig: {
    anti_spam?: boolean;
    max_tickets_per_user?: number;
  };
  overview: {
    openTickets: number;
    resolvedToday: number;
    pendingSuggestions: number;
    total24h: number;
    hourlyActivity: number[];
    recentTickets: TicketSummary[];
  };
  transcripts: TranscriptItem[];
  infractions: InfractionItem[];
  suggestions: SuggestionItem[];
}