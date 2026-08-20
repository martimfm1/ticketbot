"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import type { DashboardMetrics } from "@/types/dashboard";
import { useDashboard } from "@/hooks/dashboard/useDashboard";

import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { BillingTab } from "./components/billing/BillingTab";
import { OverviewTab } from "./components/overview/OverviewTab";
import { ServersTab } from "./components/servers/ServersTab";
import { TicketPanelsTab } from "./components/panels/TicketPanelsTab";
import { CategoriesTab } from "./components/categories/CategoriesTab";
import { StaffTab } from "./components/staff/StaffTab";
import { TranscriptsTab } from "./components/transcripts/TranscriptsTab";
import { AnalyticsTab } from "./components/analytics/AnalyticsTab";
import { SettingsTab } from "./components/settings/SettingsTab";
import { TicketsTab } from "./components/tickets/TicketsTab";

interface DashboardViewProps {
  user: { id: string; name: string; image: string | null };
  initialData: DashboardMetrics;
}

interface DashboardGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function DashboardView({ user, initialData }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [guilds, setGuilds] = useState<DashboardGuild[]>([]);
  const [guildId, setGuildId] = useState(initialData.server.current?.guildId ?? "");
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [guildError, setGuildError] = useState<string | null>(null);

  const { data, loading, error: dashboardError, refresh } = useDashboard({ guildId, initialData });

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && ["Overview", "Inbox", "Servers", "Ticket Panels", "Categories", "Staff", "Transcripts", "Analytics", "Billing", "Settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadGuilds() {
      try {
        setLoadingGuilds(true);
        setGuildError(null);
        const response = await fetch("/api/dashboard/servers", { cache: "no-store", headers: { Accept: "application/json" } });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : `Failed to load guilds (${response.status})`);
        if (cancelled) return;
        const availableGuilds: DashboardGuild[] = Array.isArray(result?.guilds) ? result.guilds : [];
        setGuilds(availableGuilds);
        setGuildId((current) => current && availableGuilds.some((guild) => guild.id === current) ? current : availableGuilds[0]?.id ?? "");
        if (availableGuilds.length === 0) setGuildError("Nenhum servidor elegível foi encontrado. A conta precisa de Administrator ou Manage Server no Discord.");
      } catch (error) {
        console.error("[DashboardView] Failed to load guilds", error);
        if (!cancelled) {
          setGuilds([]);
          setGuildError(error instanceof Error ? error.message : "Não foi possível carregar os servidores do Discord.");
        }
      } finally {
        if (!cancelled) setLoadingGuilds(false);
      }
    }
    void loadGuilds();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeTab !== "Inbox" || !guildId) return;
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [activeTab, guildId, refresh]);

  const handleGuildChange = useCallback((nextGuildId: string) => {
    if (!nextGuildId || nextGuildId === guildId) return;
    setGuildId(nextGuildId);
    setActiveTab("Overview");
  }, [guildId]);

  const navigate = useCallback((tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000);
  }, []);

  async function handleModerateSuggestion(messageId: string, status: "Approved" | "Rejected") {
    try {
      const response = await fetch("/api/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId, status, guild_id: guildId }),
      });
      if (!response.ok) throw new Error(`Failed to update suggestion: ${response.status}`);
      await refresh();
      addToast(status === "Approved" ? "Sugestão aprovada." : "Sugestão rejeitada.");
    } catch (error) {
      console.error("[DashboardView] Failed to moderate suggestion", error);
      addToast("Não foi possível atualizar a sugestão.", "error");
    }
  }

  function renderTab() {
    switch (activeTab) {
      case "Overview": return <OverviewTab data={data} onModerateSuggestion={handleModerateSuggestion} />;
      case "Inbox": return <TicketsTab data={data} guildId={guildId} onRefresh={refresh} onToast={addToast} />;
      case "Servers": return <ServersTab data={data} />;
      case "Ticket Panels": return <TicketPanelsTab data={data} guildId={guildId} onSaved={refresh} onToast={addToast} />;
      case "Categories": return <CategoriesTab data={data} onEdit={() => navigate("Ticket Panels")} />;
      case "Staff": return <StaffTab data={data} />;
      case "Transcripts": return <TranscriptsTab data={data} />;
      case "Analytics": return <AnalyticsTab data={data} />;
      case "Billing": return <BillingTab data={data} />;
      case "Settings": return <SettingsTab data={data} onOpenPanelSettings={() => navigate("Ticket Panels")} />;
      default: return null;
    }
  }

  const visibleError = guildError ?? dashboardError;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-300/20">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.07),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_28%)]" />
      <div className="pointer-events-none fixed right-3 top-20 z-[100] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2 sm:right-5 sm:top-5 sm:w-[calc(100vw-2.5rem)]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }} className={["rounded-2xl border px-4 py-3 text-xs shadow-2xl backdrop-blur-xl", toast.type === "success" ? "border-emerald-400/15 bg-zinc-900/95 text-emerald-300" : "border-red-400/15 bg-zinc-900/95 text-red-300"].join(" ")}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative flex min-h-screen">
        <DashboardSidebar activeTab={activeTab} guildId={guildId} guilds={guilds} user={user} onNavigate={navigate} onGuildChange={handleGuildChange} />
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1700px] px-3 pb-24 pt-16 sm:px-5 sm:pt-20 lg:px-8 lg:pb-8 lg:pt-6">
            <DashboardHeader title={activeTab} guildId={guildId} refreshing={loading || loadingGuilds} onRefresh={refresh} />
            {visibleError && <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300"><p className="font-medium">Não foi possível carregar os dados.</p><p className="mt-1 text-xs text-red-300/70">{visibleError}</p></div>}
            <div className="mt-5 sm:mt-7">
              <AnimatePresence mode="wait">
                <motion.div key={`${guildId}-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
