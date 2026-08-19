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

  const initialGuildIdRef = useRef(guildId);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!guildId) {
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;

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
        let message = "Failed to load dashboard data";

        try {
          const body = await response.json();
          if (body && typeof body.error === "string") {
            message = body.error;
          }
        } catch {
          // Ignore invalid JSON response.
        }

        throw new Error(`${message} (${response.status})`);
      }

      const nextData =
        (await response.json()) as DashboardMetrics;

      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(nextData);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
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
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [guildId]);

  useEffect(() => {
    if (!guildId) {
      return;
    }

    if (
      initialGuildIdRef.current === guildId &&
      initialData.servers.current?.guildId === guildId
    ) {
      return;
    }

    void refresh();
  }, [guildId, refresh, initialData]);

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
        pending: 0,
        closed: 0,
        priorities: {
          low: 0,
          normal: 0,
          high: 0,
          urgent: 0,
        },
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
