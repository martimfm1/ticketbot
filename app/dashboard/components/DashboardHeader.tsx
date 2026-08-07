"use client";

import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  guildId: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ title, guildId, refreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-800/70 pb-5">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        <p className="mt-1 text-xs text-zinc-500">SILENTRA Ticket management</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? "Refreshing dashboard" : "Refresh dashboard"}
          aria-busy={refreshing}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-500 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={["size-4", refreshing ? "animate-spin text-emerald-400" : ""].join(" ")} aria-hidden="true" />
        </button>

        {guildId && (
          <span className="hidden max-w-[280px] truncate rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[10px] text-zinc-500 sm:block" title={guildId}>
            guild:{guildId}
          </span>
        )}
      </div>
    </header>
  );
}
