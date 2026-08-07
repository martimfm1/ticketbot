"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { DashboardMetrics } from "@/types/dashboard";

interface UseDashboardOptions {
  guildId: string;
  initialData: DashboardMetrics;
}

interface UseDashboardResult {
  data: DashboardMetrics;
  setData: React.Dispatch<
    React.SetStateAction<DashboardMetrics>
  >;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard({
  guildId,
  initialData,
}: UseDashboardOptions): UseDashboardResult {
  const [data, setData] =
    useState<DashboardMetrics>(initialData);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Prevents the initial server-rendered data from
   * being overwritten unnecessarily.
   */
  const initialGuildIdRef =
    useRef(guildId);

  /*
   * Keep track of the latest request so an old
   * response cannot overwrite a newer guild.
   */
  const requestIdRef =
    useRef(0);

  const refresh = useCallback(async () => {
    if (!guildId) {
      setError(null);
      return;
    }

    const requestId =
      ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/metrics?guildId=${encodeURIComponent(
          guildId,
        )}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        let message =
          "Failed to load dashboard data";

        try {
          const body = await response.json();

          if (
            body &&
            typeof body.error === "string"
          ) {
            message = body.error;
          }
        } catch {
          // Ignore invalid JSON response.
        }

        throw new Error(
          `${message} (${response.status})`,
        );
      }

      const nextData =
        (await response.json()) as DashboardMetrics;

      /*
       * Ignore stale responses.
       */
      if (
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setData(nextData);
    } catch (err) {
      /*
       * Ignore errors from stale requests.
       */
      if (
        requestId !== requestIdRef.current
      ) {
        return;
      }

      console.error(
        "[useDashboard] Failed to load dashboard",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os dados.",
      );
    } finally {
      if (
        requestId === requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  }, [guildId]);

  /*
   * Load dashboard data whenever the selected
   * Discord server changes.
   *
   * The first render keeps the server-side
   * initialData when it belongs to the same guild.
   */
  useEffect(() => {
    if (!guildId) {
      return;
    }

    /*
     * If the initial data already belongs to this
     * guild, keep it and don't make an unnecessary
     * request on the first render.
     */
    if (
      initialGuildIdRef.current === guildId &&
      initialData.servers.current?.guildId ===
        guildId
    ) {
      return;
    }

    void refresh();
  }, [
    guildId,
    refresh,
    initialData,
  ]);

  /*
   * When the guild changes, immediately clear
   * stale server-specific data while the new
   * server is loading.
   */
  useEffect(() => {
    if (
      !guildId ||
      initialGuildIdRef.current === guildId
    ) {
      return;
    }

    setData((current) => ({
      ...current,

      servers: {
        ...current.servers,
        current: null,
      },

      tickets: {
        total: 0,
        open: 0,
        closed: 0,
        recent: [],
      },

      suggestions: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: [],
      },
    }));
  }, [guildId]);

  return {
    data,
    setData,
    loading,
    error,
    refresh,
  };
}

