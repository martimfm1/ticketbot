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
  user: {
    id: string;
    name: string;
    image: string | null;
  };

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

export default function DashboardView({
  user,
  initialData,
}: DashboardViewProps) {
  /*
   * --------------------------------------------------------------------------
   * State
   * --------------------------------------------------------------------------
   */

  const [activeTab, setActiveTab] =
    useState("Overview");

  const [
    toasts,
    setToasts,
  ] = useState<Toast[]>([]);

  const [guilds, setGuilds] = useState<
    DashboardGuild[]
  >([]);

  const [
    guildId,
    setGuildId,
  ] = useState(
    initialData.servers.current?.guildId ?? "",
  );

  const [
    loadingGuilds,
    setLoadingGuilds,
  ] = useState(true);

  /*
   * --------------------------------------------------------------------------
   * Dashboard data
   * --------------------------------------------------------------------------
   */

  const {
    data,
    loading,
    refresh,
  } = useDashboard({
    guildId,
    initialData,
  });

  /*
   * --------------------------------------------------------------------------
   * Load Discord guilds
   * --------------------------------------------------------------------------
   *
   * This request is made only once.
   *
   * Changing the selected guild does NOT reload this list.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadGuilds() {
      try {
        setLoadingGuilds(true);

        const response = await fetch(
          "/api/dashboard/servers",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load guilds: ${response.status}`,
          );
        }

        const result = await response.json();

        if (cancelled) {
          return;
        }

        const availableGuilds: DashboardGuild[] =
          Array.isArray(result.guilds)
            ? result.guilds
            : [];

        setGuilds(availableGuilds);

        /*
         * Preserve the currently selected guild if
         * it is still available.
         *
         * Otherwise select the first available guild.
         */

        setGuildId((currentGuildId) => {
          const currentExists =
            currentGuildId &&
            availableGuilds.some(
              (guild) =>
                guild.id === currentGuildId,
            );

          if (currentExists) {
            return currentGuildId;
          }

          return availableGuilds[0]?.id ?? "";
        });
      } catch (error) {
        console.error(
          "[DashboardView] Failed to load guilds",
          error,
        );

        if (!cancelled) {
          setGuilds([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGuilds(false);
        }
      }
    }

    void loadGuilds();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Guild change
   * --------------------------------------------------------------------------
   */

  const handleGuildChange = useCallback(
    (nextGuildId: string) => {
      if (!nextGuildId) {
        return;
      }

      if (nextGuildId === guildId) {
        return;
      }

      /*
       * Change the selected server.
       *
       * useDashboard will automatically request:
       *
       * /api/dashboard/metrics?guildId=<nextGuildId>
       */

      setGuildId(nextGuildId);

      /*
       * Always return to Overview when switching
       * between completely different Discord servers.
       */

      setActiveTab("Overview");
    },
    [guildId],
  );

  /*
   * --------------------------------------------------------------------------
   * Toast system
   * --------------------------------------------------------------------------
   */

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" = "success",
    ) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          type,
          message,
        },
      ]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) => toast.id !== id,
          ),
        );
      }, 4000);
    },
    [],
  );

  /*
   * --------------------------------------------------------------------------
   * Suggestion moderation
   * --------------------------------------------------------------------------
   */

  async function handleModerateSuggestion(
    messageId: string,
    status: "Approved" | "Rejected",
  ) {
    try {
      const response = await fetch(
        "/api/suggestions",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message_id: messageId,
            status,
            guild_id: guildId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update suggestion: ${response.status}`,
        );
      }

      await refresh();

      addToast(
        status === "Approved"
          ? "Sugestão aprovada."
          : "Sugestão rejeitada.",
      );
    } catch (error) {
      console.error(
        "[DashboardView] Failed to moderate suggestion",
        error,
      );

      addToast(
        "Não foi possível atualizar a sugestão.",
        "error",
      );
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Navigation
   * --------------------------------------------------------------------------
   */

  const handleNavigate = useCallback(
    (tab: string) => {
      setActiveTab(tab);
    },
    [],
  );

  /*
   * --------------------------------------------------------------------------
   * Render active tab
   * --------------------------------------------------------------------------
   */

  function renderTab() {
    switch (activeTab) {
      case "Overview":
        return (
          <OverviewTab
            data={data}
            onModerateSuggestion={
              handleModerateSuggestion
            }
          />
        );

      case "Servers":
        return <ServersTab data={data} />;

      case "Ticket Panels":
        return (
          <TicketPanelsTab
            data={data}
            onSaved={refresh}
            onToast={addToast}
          />
        );

      case "Categories":
        return (
          <CategoriesTab
            data={data}
            onEdit={() =>
              setActiveTab("Ticket Panels")
            }
          />
        );

      case "Staff":
        return <StaffTab data={data} />;

      case "Transcripts":
        return <TranscriptsTab data={data} />;

      case "Analytics":
        return <AnalyticsTab data={data} />;

      case "Settings":
        return (
          <SettingsTab
            data={data}
            onOpenPanelSettings={() =>
              setActiveTab("Ticket Panels")
            }
          />
        );

      default:
        return null;
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Current guild
   * --------------------------------------------------------------------------
   */

  const currentGuild =
    guilds.find(
      (guild) => guild.id === guildId,
    ) ?? null;

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* ------------------------------------------------------------------ */}
      {/* Toasts                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              className={[
                "rounded-xl border px-4 py-3 text-xs shadow-xl backdrop-blur-xl",
                toast.type === "success"
                  ? "border-emerald-500/20 bg-zinc-900/95 text-emerald-400"
                  : "border-red-500/20 bg-zinc-900/95 text-red-400",
              ].join(" ")}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Sidebar                                                            */}
      {/* ------------------------------------------------------------------ */}

      <DashboardSidebar
        activeTab={activeTab}
        guildId={guildId}
        guilds={guilds}
        user={user}
        onNavigate={handleNavigate}
        onGuildChange={handleGuildChange}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                                */}
      {/* ------------------------------------------------------------------ */}

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <DashboardHeader
            title={activeTab}
            guildId={guildId}
            refreshing={
              loading || loadingGuilds
            }
            onRefresh={refresh}
          />

          {/* Optional selected server context */}
          {currentGuild && (
            <div className="sr-only">
              {currentGuild.name}
            </div>
          )}

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${guildId}-${activeTab}`}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
