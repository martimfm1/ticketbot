"use client";

import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  guildId: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({
  title,
  guildId,
  refreshing,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-800/70 pb-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>

        <p className="mt-1 text-xs text-zinc-500">
          Gestão do SILENTRA Ticket
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-500 transition-colors hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Atualizar"
        >
          <RefreshCw
            className={[
              "size-4",
              refreshing ? "animate-spin text-emerald-400" : "",
            ].join(" ")}
          />
        </button>

        <span className="hidden rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[10px] text-zinc-500 sm:block">
          guild:{guildId}
        </span>
      </div>
    </header>
  );
}