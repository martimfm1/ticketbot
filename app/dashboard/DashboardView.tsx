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
  const [guildId, setGuildId] = useState(initialData.servers.current?.guildId ?? "");
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [guildError, setGuildError] = useState<string | null>(null);

  const { data, loading, error, refresh } = useDashboard({ guildId, initialData });

  const loadGuilds = useCallback(async () => {
    try {
      setLoadingGuilds(true);
      setGuildError(null);
      const response = await fetch("/api/dashboard/servers", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) {
        let message = `Failed to load servers (${response.status})`;
        if (contentType.includes("application/json")) {
          const body = await response.json();
          if (typeof body?.error === "string") message = body.error;
        }
        throw new Error(message);
      }

      if (!contentType.includes("application/json")) {
        throw new Error("The servers API returned an invalid response.");
      }

      const result: unknown = await response.json();
      const availableGuilds =
        typeof result === "object" && result !== null && "guilds" in result && Array.isArray(result.guilds)
          ? result.guilds.filter(
              (guild): guild is DashboardGuild =>
                typeof guild === "object" &&
                guild !== null &&
                typeof (guild as DashboardGuild).id === "string" &&
                typeof (guild as DashboardGuild).name === "string",
            )
          : [];

      setGuilds(availableGuilds);
      setGuildId((currentGuildId) => {
        const currentExists = currentGuildId && availableGuilds.some((guild) => guild.id === currentGuildId);
        return currentExists ? currentGuildId : availableGuilds[0]?.id ?? "";
      });
    } catch (loadError) {
      console.error("[DashboardView] Failed to load guilds", loadError);
      setGuilds([]);
      setGuildError(loadError instanceof Error ? loadError.message : "Failed to load servers.");
    } finally {
      setLoadingGuilds(false);
    }
  }, []);

  useEffect(() => {
    void loadGuilds();
  }, [loadGuilds]);

  useEffect(() => {
    if (!guildId) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);

    const handleFocus = () => void refresh();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [guildId, refresh]);

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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ message_id: messageId, status, guild_id: guildId }),
      });
      if (!response.ok) throw new Error(`Failed to update suggestion: ${response.status}`);
      await refresh();
      addToast(status === "Approved" ? "Suggestion approved." : "Suggestion rejected.");
    } catch (moderationError) {
      console.error("[DashboardView] Failed to moderate suggestion", moderationError);
      addToast("The suggestion could not be updated.", "error");
    }
  }

  const handleNavigate = useCallback((tab: string) => setActiveTab(tab), []);

  function renderTab() {
    switch (activeTab) {
      case "Overview": return <OverviewTab data={data} onModerateSuggestion={handleModerateSuggestion} />;
      case "Servers": return <ServersTab data={data} />;
      case "Ticket Panels": return <TicketPanelsTab data={data} onSaved={refresh} onToast={addToast} />;
      case "Categories": return <CategoriesTab data={data} onEdit={() => setActiveTab("Ticket Panels")} />;
      case "Staff": return <StaffTab data={data} />;
      case "Transcripts": return <TranscriptsTab data={data} />;
      case "Analytics": return <AnalyticsTab data={data} />;
      case "Settings": return <SettingsTab data={data} onOpenPanelSettings={() => setActiveTab("Ticket Panels")} />;
      default: return null;
    }
  }

  const currentGuild = guilds.find((guild) => guild.id === guildId) ?? null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 lg:pl-64">
      <a href="#dashboard-main" className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 shadow-xl transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">Skip to main content</a>
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite" aria-atomic="true">
        <AnimatePresence>{toasts.map((toast) => <motion.div key={toast.id} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }} className={["rounded-xl border px-4 py-3 text-xs shadow-xl backdrop-blur-xl", toast.type === "success" ? "border-emerald-500/20 bg-zinc-900/95 text-emerald-400" : "border-red-500/20 bg-zinc-900/95 text-red-400"].join(" ")}>{toast.message}</motion.div>)}</AnimatePresence>
      </div>
      <DashboardSidebar activeTab={activeTab} guildId={guildId} guilds={guilds} user={user} onNavigate={handleNavigate} onGuildChange={handleGuildChange} />
      <main id="dashboard-main" tabIndex={-1} className="min-w-0 overflow-x-hidden focus:outline-none">
        <div className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <DashboardHeader title={activeTab} guildId={guildId} refreshing={loading || loadingGuilds} onRefresh={() => { void loadGuilds(); void refresh(); }} />
          {currentGuild && <p className="sr-only">Selected server: {currentGuild.name}</p>}
          {guildError && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300" role="alert"><span>{guildError}</span><button type="button" onClick={() => void loadGuilds()} className="min-h-9 rounded-lg border border-red-500/20 px-3 py-2 font-medium text-red-200 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70">Retry servers</button></div>}
          {error && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300" role="alert"><span>{error}</span><button type="button" onClick={() => void refresh()} className="min-h-9 rounded-lg border border-red-500/20 px-3 py-2 font-medium text-red-200 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70">Retry</button></div>}
          <div className="mt-6"><AnimatePresence mode="wait"><motion.div key={`${guildId}-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{renderTab()}</motion.div></AnimatePresence></div>
        </div>
      </main>
    </div>
  );
}
