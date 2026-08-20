"use client";

import { Activity, RefreshCw, ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  guildId: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ title, guildId, refreshing, onRefresh }: DashboardHeaderProps) {
  return <header className="flex min-w-0 items-end justify-between gap-4 border-b border-white/6 pb-5 sm:pb-6">
    <div className="min-w-0"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/75"><Activity className="size-3.5" /> Control Center</div><h1 className="mt-2 truncate text-2xl font-semibold tracking-[-0.045em] text-white sm:text-3xl">{title}</h1><p className="mt-1 truncate text-xs text-zinc-600">Gestão do SILENTRA Ticket · {guildId || "Nenhum servidor selecionado"}</p></div>
    <div className="flex shrink-0 items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-[10px] font-medium text-emerald-300 sm:flex"><ShieldCheck className="size-3.5" /> Protected</div><button type="button" onClick={onRefresh} disabled={refreshing} className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50" title="Atualizar dashboard" aria-label="Atualizar dashboard"><RefreshCw className={["size-4", refreshing ? "animate-spin text-emerald-400" : ""].join(" ")} /></button></div>
  </header>;
}
