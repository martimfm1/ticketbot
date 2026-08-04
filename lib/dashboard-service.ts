import { supabaseServer } from "@/lib/supabase";
import { FullDashboardData } from "@/types/dashboard";

export async function getFullDashboardData(guildId: string): Promise<FullDashboardData> {
  // Mantém o ID SEMPRE como string para evitar perda de precisão em IDs de 19 dígitos
  const safeGuildId = String(guildId).trim();

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
    supabaseServer.from("servers").select("*").eq("guild_id", safeGuildId).maybeSingle(),
    supabaseServer.from("security_configs").select("*").eq("guild_id", safeGuildId).maybeSingle(),
    supabaseServer.from("tickets").select("channel_id", { count: "exact", head: true }).eq("guild_id", safeGuildId).ilike("status", "open"),
    supabaseServer.from("tickets").select("channel_id", { count: "exact", head: true }).eq("guild_id", safeGuildId).ilike("status", "resolved").gte("closed_at", startOfDay),
    supabaseServer.from("tickets").select("channel_id, subject, status, opened_at").eq("guild_id", safeGuildId).order("opened_at", { ascending: false }).limit(5),
    supabaseServer.from("tickets").select("opened_at").eq("guild_id", safeGuildId).gte("opened_at", twentyFourHoursAgo),
    supabaseServer.from("suggestions").select("message_id", { count: "exact", head: true }).eq("guild_id", safeGuildId).ilike("status", "pending"),
    supabaseServer.from("tickets").select("*").eq("guild_id", safeGuildId).ilike("status", "resolved").order("closed_at", { ascending: false }).limit(20),
    supabaseServer.from("security_infractions").select("*").eq("guild_id", safeGuildId).order("last_infraction_at", { ascending: false }).limit(20),
    supabaseServer.from("suggestions").select("*").eq("guild_id", safeGuildId).order("created_at", { ascending: false }).limit(20),
  ]);

  // Log de erros no terminal (Server Logs) para fácil depuração
  if (serverConfigRes.error) console.error("[Supabase Error: servers]", serverConfigRes.error.message);
  if (recentTicketsRes.error) console.error("[Supabase Error: tickets]", recentTicketsRes.error.message);
  if (suggestionsRes.error) console.error("[Supabase Error: suggestions]", suggestionsRes.error.message);

  // Processa o gráfico de atividade das últimas 24 horas
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
    guildId: safeGuildId,
    serverConfig: {
      guild_id: safeGuildId as any,
      ticket_category_id: serverConfigRes.data?.ticket_category_id || null,
      admin_role_name: serverConfigRes.data?.admin_role_name || null,
      transcript_channel_id: serverConfigRes.data?.transcript_channel_id || null,
      language: serverConfigRes.data?.language || "en",
    },
    securityConfig: securityConfigRes.data?.config || {},
    overview: {
      openTickets: openTicketsRes.count || 0,
      resolvedToday: resolvedTodayRes.count || 0,
      pendingSuggestions: suggestionsRes.count || 0,
      total24h: activityRes.data?.length || 0,
      hourlyActivity: activityBars,
      recentTickets: (recentTicketsRes.data || []).map((t) => {
        const statusLower = (t.status || "").toLowerCase();
        return {
          id: `#${String(t.channel_id).slice(-4)}`,
          subject: t.subject || "Sem assunto",
          status: statusLower === "resolved" ? "Resolved" : statusLower === "pending" ? "Pending" : "Open",
          time: formatTimeAgo(t.opened_at),
          variant: (statusLower === "resolved" ? "resolved" : statusLower === "pending" ? "pending" : "open") as any,
        };
      }),
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
      status: (s.status || "pending").toLowerCase() as any,
      created_at: s.created_at,
    })),
  };
}