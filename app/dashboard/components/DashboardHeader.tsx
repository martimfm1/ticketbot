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
    <header className="flex min-w-0 items-center justify-between gap-3 border-b border-zinc-800/70 pb-4 pt-16 sm:gap-4 sm:pb-5 sm:pt-0 lg:pt-0">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">{title}</h1>
        <p className="mt-1 truncate text-[11px] text-zinc-500 sm:text-xs">Gestão do SILENTRA Ticket</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex size-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:size-10 sm:rounded-lg"
          title="Atualizar"
          aria-label="Atualizar dashboard"
        >
          <RefreshCw className={["size-4", refreshing ? "animate-spin text-emerald-400" : ""].join(" ")} />
        </button>

        <span className="hidden max-w-[240px] truncate rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[10px] text-zinc-500 md:block">
          guild:{guildId}
        </span>
      </div>
    </header>
  );
}
