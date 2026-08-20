export interface TicketCustomization {
  panelTitle: string;
  panelDescription: string;
  panelFooter: string;
  panelColor: string;
  panelButtonLabel: string;
  panelButtonEmoji: string;
  panelButtonStyle: "secondary" | "primary" | "success" | "danger";
  ticketTitle: string;
  ticketDescription: string;
  ticketFooter: string;
  ticketColor: string;
  welcomeMessage: string;
  modalTitle: string;
  modalSubjectLabel: string;
  modalSubjectPlaceholder: string;
  channelPrefix: string;
  mentionSupport: boolean;
  allowUserAttachments: boolean;
}

export interface DashboardServer {
  guildId: string;
  ticketCategoryId: string | null;
  adminRoleName: string | null;
  adminRoleId: string | null;
  ticketRoleId: string | null;
  transcriptChannelId: string | null;
  language: string;
  ticketCustomization: TicketCustomization;
}

export interface DashboardTicket {
  channelId: string;
  guildId: string | null;
  userId: string;
  subject: string | null;
  status: string;
  priority: string;
  openedAt: string;
  closedAt: string | null;
  claimedBy: string | null;
  assignedTo: string | null;
  claimedAt: string | null;
  lastActivityAt: string | null;
  closedBy: string | null;
  resolutionNote: string | null;
  updatedAt: string | null;
}

export interface DashboardTicketMessage {
  id: string;
  channelId: string;
  messageId: string;
  authorId: string;
  authorName: string | null;
  content: string | null;
  createdAt: string;
  editedAt: string | null;
  attachmentCount: number;
  metadata: Record<string, unknown>;
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
    pending: number;
    closed: number;
    priorities: {
      low: number;
      normal: number;
      high: number;
      urgent: number;
    };
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
