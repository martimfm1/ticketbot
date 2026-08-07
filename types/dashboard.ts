export interface DashboardServer {
  guildId: string;
  ticketCategoryId: string | null;
  adminRoleName: string | null;
  transcriptChannelId: string | null;
  language: string;
}

export interface DashboardTicket {
  channelId: string;
  guildId: string | null;
  userId: string;
  subject: string | null;
  status: string;
  openedAt: string;
  closedAt: string | null;
  claimedBy: string | null;
}

export interface DashboardSuggestion {
  messageId: string;
  guildId: string;
  authorId: string;
  suggestionText: string;
  status: string;
  createdAt: string;
  votes: {
    up: number;
    down: number;
  };
}

export interface DashboardMetrics {
  servers: {
    total: number;
    current: DashboardServer | null;
  };

  tickets: {
    total: number;
    open: number;
    closed: number;
    recent: DashboardTicket[];
  };

  suggestions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: DashboardSuggestion[];
  };
}