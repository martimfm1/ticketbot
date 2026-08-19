"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import type { DashboardMetrics } from "@/types/dashboard";
import { useDashboard } from "@/hooks/dashboard/useDashboard";

import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
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
  const [guildId, setGuildId] = useState("");
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [guildError, setGuildError] = useState<string | null>(null);

  const { data, loading, error: dashboardError, refresh } = useDashboard({
    guildId,
    initialData,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadGuilds() {
      try {
        setLoadingGuilds(true);
        setGuildError(null);

        const response = await fetch("/api/dashboard/servers", {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const result = await response.json().catch(() => null);

        console.info("[DashboardView] /api/dashboard/servers", {
          status: response.status,
          guildCount: Array.isArray(result?.guilds) ? result.guilds.length : 0,
        });

        if (!response.ok) {
          throw new Error(
            typeof result?.error === "string"
              ? result.error
              : `Failed to load guilds (${response.status})`,
          );
        }

        if (cancelled) return;

        const availableGuilds: DashboardGuild[] = Array.isArray(result?.guilds)
          ? result.guilds
          : [];

        setGuilds(availableGuilds);
        setGuildId((currentGuildId) => {
          const currentExists = currentGuildId && availableGuilds.some((guild) => guild.id === currentGuildId);
          return currentExists ? currentGuildId : availableGuilds[0]?.id ?? "";
        });

        if (availableGuilds.length === 0) {
          setGuildError(
            "Nenhum servidor elegível foi encontrado. A conta precisa de Administrator ou Manage Server no Discord.",
          );
        }
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
    return () => {
      cancelled = true;
    };
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
      case "Categories": return <CategoriesTab data={data} onEdit={() => setActiveTab("Ticket Panels")} />;
      case "Staff": return <StaffTab data={data} />;
      case "Transcripts": return <TranscriptsTab data={data} />;
      case "Analytics": return <AnalyticsTab data={data} />;
      case "Settings": return <SettingsTab data={data} onOpenPanelSettings={() => setActiveTab("Ticket Panels")} />;
      default: return null;
    }
  }

  const currentGuild = guilds.find((guild) => guild.id === guildId) ?? null;
  const visibleError = guildError ?? dashboardError;

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={["rounded-xl border px-4 py-3 text-xs shadow-xl backdrop-blur-xl", toast.type === "success" ? "border-emerald-500/20 bg-zinc-900/95 text-emerald-400" : "border-red-500/20 bg-zinc-900/95 text-red-400"].join(" ")}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <DashboardSidebar activeTab={activeTab} guildId={guildId} guilds={guilds} user={user} onNavigate={setActiveTab} onGuildChange={handleGuildChange} />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <DashboardHeader title={activeTab} guildId={guildId} refreshing={loading || loadingGuilds} onRefresh={refresh} />
          {visibleError && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              <p className="font-medium">Não foi possível carregar os dados.</p>
              <p className="mt-1 text-xs text-red-300/70">{visibleError}</p>
            </div>
          )}
          {currentGuild && <div className="sr-only">{currentGuild.name}</div>}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div key={`${guildId}-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
