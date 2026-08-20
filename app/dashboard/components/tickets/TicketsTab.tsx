"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleDot, Clock3, RotateCcw, UserRound, X } from "lucide-react";

import type { DashboardMetrics, DashboardTicket, DashboardTicketMessage } from "@/types/dashboard";

interface TicketsTabProps {
  data: DashboardMetrics;
  guildId: string;
  onRefresh: () => Promise<void>;
  onToast: (message: string, type?: "success" | "error") => void;
}

const priorityOrder = ["urgent", "high", "normal", "low"];

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function TicketsTab({ data, guildId, onRefresh, onToast }: TicketsTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState<DashboardTicket | null>(null);
  const [messages, setMessages] = useState<DashboardTicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const visibleTickets = useMemo(() => {
    return data.tickets.recent.filter((ticket) => {
      const statusOk = statusFilter === "all" || ticket.status.toLowerCase() === statusFilter;
      const priorityOk = priorityFilter === "all" || ticket.priority.toLowerCase() === priorityFilter;
      return statusOk && priorityOk;
    });
  }, [data.tickets.recent, statusFilter, priorityFilter]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingMessages(true);

    void fetch(
      `/api/dashboard/tickets/${encodeURIComponent(selected.channelId)}/messages?guildId=${encodeURIComponent(guildId)}`,
      { cache: "no-store" },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`Messages request failed: ${response.status}`);
        return response.json() as Promise<{ messages?: DashboardTicketMessage[] }>;
      })
      .then((result) => {
        if (!cancelled) setMessages(Array.isArray(result.messages) ? result.messages : []);
      })
      .catch((error) => {
        console.error("[TicketsTab] failed to load messages", error);
        if (!cancelled) onToast("Não foi possível carregar o histórico do ticket.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected, guildId, onToast]);

  async function action(actionName: string, body: Record<string, unknown> = {}) {
    if (!selected) return;
    setBusyAction(actionName);
    try {
      const response = await fetch("/api/dashboard/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, channelId: selected.channelId, action: actionName, ...body }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? `Action failed: ${response.status}`);

      const nextTicket = result?.ticket as DashboardTicket | undefined;
      if (nextTicket) setSelected(nextTicket);
      await onRefresh();
      onToast("Ticket atualizado.");
    } catch (error) {
      console.error("[TicketsTab] ticket action failed", error);
      onToast(error instanceof Error ? error.message : "Não foi possível atualizar o ticket.", "error");
    } finally {
      setBusyAction(null);
    }
  }

  const statCards = [
    ["Open", data.tickets.open],
    ["Pending", data.tickets.pending],
    ["Urgent", data.tickets.priorities.urgent],
    ["Closed", data.tickets.closed],
  ] as const;

  return (
    <div className="space-y-4 pb-4 sm:space-y-6">
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {statCards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 sm:p-4">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600 sm:text-[10px]">{label}</p>
            <p className="mt-1.5 text-xl font-semibold text-zinc-100 sm:mt-2 sm:text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="flex flex-col gap-3 border-b border-zinc-800/70 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none sm:gap-2 sm:pb-0">
            {[
              ["all", "All"],
              ["open", "Open"],
              ["pending", "Pending"],
              ["closed", "Closed"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-xs ${statusFilter === value ? "border-zinc-700 bg-zinc-800 text-white" : "border-zinc-800 text-zinc-500 hover:text-zinc-200"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="min-h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 outline-none sm:ml-auto sm:w-auto"
            aria-label="Filtrar por prioridade"
          >
            <option value="all">All priorities</option>
            {priorityOrder.map((priority) => (
              <option key={priority} value={priority}>{statusLabel(priority)}</option>
            ))}
          </select>
        </div>

        <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className={`${selected ? "hidden lg:block" : "block"} border-b border-zinc-800/70 lg:border-b-0 lg:border-r`}>
            <div className="max-h-[min(65vh,720px)] overflow-y-auto lg:max-h-[560px]">
              {visibleTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-600">No tickets match these filters.</div>
              ) : (
                visibleTickets.map((ticket) => (
                  <button
                    key={`${ticket.guildId}-${ticket.channelId}`}
                    type="button"
                    onClick={() => setSelected(ticket)}
                    className={`min-h-[88px] w-full border-b border-zinc-800/60 px-3 py-4 text-left transition-colors active:bg-zinc-900 sm:px-4 ${selected?.channelId === ticket.channelId ? "bg-zinc-900" : "hover:bg-zinc-900/80"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">{ticket.subject || "No subject"}</p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-600">#{ticket.channelId}</p>
                      </div>
                      <span className="rounded-full border border-zinc-800 px-2 py-1 text-[9px] uppercase tracking-wide text-zinc-500">{ticket.priority}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-600">
                      <span className="inline-flex items-center gap-1"><CircleDot className="size-3" />{statusLabel(ticket.status)}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{new Date(ticket.lastActivityAt ?? ticket.openedAt).toLocaleString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={`${selected ? "block" : "hidden lg:block"} min-w-0`}>
            {!selected ? (
              <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
                <div>
                  <UserRound className="mx-auto size-8 text-zinc-700" />
                  <p className="mt-3 text-sm text-zinc-500">Select a ticket to view the conversation.</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] flex-col lg:min-h-[560px]">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-800/70 bg-zinc-950/95 p-3 backdrop-blur-xl sm:p-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button type="button" onClick={() => setSelected(null)} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 lg:hidden" aria-label="Voltar à lista de tickets">
                      <ArrowLeft className="size-4" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-zinc-100">{selected.subject || "No subject"}</h2>
                      <p className="mt-1 truncate font-mono text-[10px] text-zinc-600">#{selected.channelId} · {selected.userId}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="hidden size-10 shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-900 hover:text-zinc-200 lg:flex" aria-label="Close details">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto border-b border-zinc-800/70 p-3 scrollbar-none sm:flex-wrap sm:p-4">
                  <button disabled={Boolean(busyAction)} onClick={() => action("claim")} className="min-h-10 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:text-white disabled:opacity-50">Claim</button>
                  <button disabled={Boolean(busyAction)} onClick={() => action("unclaim")} className="min-h-10 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:text-white disabled:opacity-50">Unclaim</button>
                  <button disabled={Boolean(busyAction)} onClick={() => action("close")} className="min-h-10 shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Close</button>
                  <button disabled={Boolean(busyAction)} onClick={() => action("reopen")} className="min-h-10 shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50">Reopen</button>
                  <button disabled={Boolean(busyAction)} onClick={() => action("priority", { priority: "urgent" })} className="min-h-10 shrink-0 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50">Urgent</button>
                  <button disabled={Boolean(busyAction)} onClick={() => action("priority", { priority: "normal" })} className="min-h-10 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:text-white disabled:opacity-50">Normal</button>
                  {selected.claimedBy && <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-[10px] text-zinc-600"><CheckCircle2 className="size-3" />Assigned {selected.claimedBy}</span>}
                </div>

                <div className="min-h-[380px] flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
                  {loadingMessages ? (
                    <div className="animate-pulse space-y-3" aria-label="A carregar conversa">
                      <div className="h-20 rounded-xl bg-zinc-900/70" />
                      <div className="ml-8 h-16 rounded-xl bg-zinc-900/70" />
                      <div className="h-24 rounded-xl bg-zinc-900/70" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">No persisted messages yet.</div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.messageId} className="rounded-xl border border-zinc-800/70 bg-zinc-950/70 p-3.5 sm:p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate text-xs font-medium text-zinc-300">{message.authorName || message.authorId}</p>
                          <p className="shrink-0 text-[10px] text-zinc-600">{new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">{message.content || "[attachment]"}</p>
                        {message.attachmentCount > 0 && <p className="mt-2 text-[10px] text-zinc-600">{message.attachmentCount} attachment(s)</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
