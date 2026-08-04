import { supabaseServer } from "@/lib/supabase";

export interface FullDashboardData {
  guildId: string;
  serverConfig: {
    guild_id: number;
    ticket_category_id: number | null;
    admin_role_name: string | null;
    transcript_channel_id: number | null;
    language: string | null;
  };
  securityConfig: any;
  overview: {
    openTickets: number;
    resolvedToday: number;
    pendingSuggestions: number;
    total24h: number;
    hourlyActivity: number[];
    recentTickets: Array<{
      id: string;
      subject: string;
      status: string;
      time: string;
      variant: "open" | "pending" | "resolved";
    }>;
  };
  transcripts: Array<{
    channel_id: string;
    user_id: string;
    subject: string;
    opened_at: string;
    closed_at: string;
  }>;
  infractions: Array<{
    user_id: string;
    strikes: number;
    last_infraction_type: string;
    last_infraction_at: number;
  }>;
  suggestions: Array<{
    message_id: string;
    author_id: string;
    suggestion_text: string;
    status: string;
    created_at: string;
  }>;
}

export async function getFullDashboardData(guildId: string): Promise<FullDashboardData> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Executa todas as consultas paralelas ao Supabase
  const [
    serverConfigRes,
    securityConfigRes,
    openTicketsRes,
    resolvedTodayRes,
    recentTicketsRes,
    activityRes,
    suggestionsRes,
    transcriptsRes,
    infractionsRes,
    allSuggestionsRes,
  ] = await Promise.all([
    supabaseServer.from("servers").select("*").eq("guild_id", guildId).maybeSingle(),
    supabaseServer.from("security_configs").select("*").eq("guild_id", guildId).maybeSingle(),
    supabaseServer.from("tickets").select("channel_id", { count: "exact", head: true }).eq("guild_id", guildId).eq("status", "open"),
    supabaseServer.from("tickets").select("channel_id", { count: "exact", head: true }).eq("guild_id", guildId).eq("status", "resolved").gte("closed_at", startOfDay),
    supabaseServer.from("tickets").select("channel_id, subject, status, opened_at").eq("guild_id", guildId).order("opened_at", { ascending: false }).limit(5),
    supabaseServer.from("tickets").select("opened_at").eq("guild_id", guildId).gte("opened_at", twentyFourHoursAgo),
    supabaseServer.from("suggestions").select("message_id", { count: "exact", head: true }).eq("guild_id", guildId).eq("status", "pending"),
    supabaseServer.from("tickets").select("*").eq("guild_id", guildId).eq("status", "resolved").order("closed_at", { ascending: false }).limit(20),
    supabaseServer.from("security_infractions").select("*").eq("guild_id", guildId).order("last_infraction_at", { ascending: false }).limit(20),
    supabaseServer.from("suggestions").select("*").eq("guild_id", guildId).order("created_at", { ascending: false }).limit(20),
  ]);

  // Gráfico de Atividade de 24h
  const activityBars = new Array(16).fill(0);
  if (activityRes.data) {
    activityRes.data.forEach((ticket) => {
      const openedTime = new Date(ticket.opened_at).getTime();
      const hoursAgo = (now.getTime() - openedTime) / (1000 * 60 * 60);
      const bucketIndex = Math.min(15, Math.floor((16 * (24 - hoursAgo)) / 24));
      if (bucketIndex >= 0 && bucketIndex < 16) activityBars[bucketIndex]++;
    });
  }

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const diffMin = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}m atrás`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${Math.floor(diffHours / 24)}d atrás`;
  };

  return {
    guildId,
    serverConfig: serverConfigRes.data || {
      guild_id: Number(guildId),
      ticket_category_id: null,
      admin_role_name: null,
      transcript_channel_id: null,
      language: "en",
    },
    securityConfig: securityConfigRes.data?.config || {},
    overview: {
      openTickets: openTicketsRes.count || 0,
      resolvedToday: resolvedTodayRes.count || 0,
      pendingSuggestions: suggestionsRes.count || 0,
      total24h: activityRes.data?.length || 0,
      hourlyActivity: activityBars,
      recentTickets: (recentTicketsRes.data || []).map((t) => ({
        id: `#${String(t.channel_id).slice(-4)}`,
        subject: t.subject || "Sem assunto",
        status: t.status === "resolved" ? "Resolved" : t.status === "pending" ? "Pending" : "Open",
        time: formatTimeAgo(t.opened_at),
        variant: (t.status as "open" | "pending" | "resolved") || "open",
      })),
    },
    transcripts: (transcriptsRes.data || []).map((t) => ({
      channel_id: String(t.channel_id),
      user_id: String(t.user_id),
      subject: t.subject || "Ticket Fechado",
      opened_at: t.opened_at,
      closed_at: t.closed_at,
    })),
    infractions: (infractionsRes.data || []).map((i) => ({
      user_id: String(i.user_id),
      strikes: i.strikes,
      last_infraction_type: i.last_infraction_type,
      last_infraction_at: i.last_infraction_at,
    })),
    suggestions: (allSuggestionsRes.data || []).map((s) => ({
      message_id: String(s.message_id),
      author_id: String(s.author_id),
      suggestion_text: s.suggestion_text,
      status: s.status,
      created_at: s.created_at,
    })),
  };
}