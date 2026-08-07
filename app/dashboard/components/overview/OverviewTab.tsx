import {
  CheckCircle2,
  Clock3,
  Lightbulb,
  Ticket,
} from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";
import { MetricCard } from "./MetricsCard";
import { DashboardCharts } from "./DashboardCharts";

interface OverviewTabProps {
  data: DashboardMetrics;
  onModerateSuggestion: (
    messageId: string,
    status: "Approved" | "Rejected",
  ) => Promise<void>;
}

export function OverviewTab({ data, onModerateSuggestion }: OverviewTabProps) {
  const pending = data.suggestions.recent.filter(
    (suggestion) => suggestion.status.toLowerCase() === "pending",
  );

  const resolutionRate =
    data.tickets.total > 0
      ? Math.round((data.tickets.closed / data.tickets.total) * 100)
      : 0;

  const claimedTickets = data.tickets.recent.filter((ticket) => ticket.claimedBy).length;
  const claimRate =
    data.tickets.recent.length > 0
      ? Math.round((claimedTickets / data.tickets.recent.length) * 100)
      : 0;

  const oldestOpenTicket = data.tickets.recent
    .filter((ticket) => ticket.status.toLowerCase() === "open")
    .reduce<string | null>((oldest, ticket) => {
      if (!oldest) return ticket.openedAt;
      return ticket.openedAt < oldest ? ticket.openedAt : oldest;
    }, null);

  return (
    <div className="space-y-6" aria-labelledby="overview-heading">
      <h1 id="overview-heading" className="sr-only">
        Dashboard overview
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open tickets" value={data.tickets.open} icon={Ticket} />
        <MetricCard label="Closed tickets" value={data.tickets.closed} icon={CheckCircle2} />
        <MetricCard label="Total tickets" value={data.tickets.total} icon={Clock3} />
        <MetricCard label="Pending suggestions" value={data.suggestions.pending} icon={Lightbulb} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3" aria-label="Operational insights">
        <Insight label="Resolution rate" value={`${resolutionRate}%`} detail="of all tickets are closed" />
        <Insight label="Claim rate" value={`${claimRate}%`} detail="of recent tickets are assigned" />
        <Insight
          label="Oldest open ticket"
          value={oldestOpenTicket ? formatAge(oldestOpenTicket) : "—"}
          detail={oldestOpenTicket ? "since it was opened" : "no open tickets"}
        />
      </div>

      <DashboardCharts data={data} />

      <div className="grid gap-4 xl:grid-cols-2">
        <section
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40"
          aria-labelledby="recent-tickets-heading"
        >
          <div className="border-b border-zinc-800/70 px-5 py-4">
            <h2 id="recent-tickets-heading" className="text-sm font-semibold text-zinc-200">
              Recent tickets
            </h2>
            <p className="mt-1 text-xs text-zinc-600">The latest tickets recorded for this server.</p>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {data.tickets.recent.length === 0 ? (
              <EmptyState text="No tickets have been recorded yet." />
            ) : (
              data.tickets.recent.map((ticket) => (
                <div key={ticket.channelId} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {ticket.subject || "Untitled ticket"}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-zinc-600">#{ticket.channelId}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-zinc-800 px-2 py-1 text-[10px] capitalize text-zinc-500">
                    {ticket.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40"
          aria-labelledby="pending-suggestions-heading"
        >
          <div className="border-b border-zinc-800/70 px-5 py-4">
            <h2 id="pending-suggestions-heading" className="text-sm font-semibold text-zinc-200">
              Pending suggestions
            </h2>
            <p className="mt-1 text-xs text-zinc-600">Review and moderate suggestions directly from the dashboard.</p>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {pending.length === 0 ? (
              <EmptyState text="There are no pending suggestions." />
            ) : (
              pending.map((suggestion) => (
                <article key={suggestion.messageId} className="space-y-3 px-5 py-4">
                  <p className="text-sm leading-relaxed text-zinc-300">{suggestion.suggestionText}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-zinc-600">{suggestion.authorId}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onModerateSuggestion(suggestion.messageId, "Approved")}
                        className="min-h-9 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] text-emerald-400 transition-colors hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onModerateSuggestion(suggestion.messageId, "Rejected")}
                        className="min-h-9 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Insight({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-zinc-100">{value}</span>
        <span className="truncate text-[11px] text-zinc-600">{detail}</span>
      </div>
    </div>
  );
}

function formatAge(value: string) {
  const milliseconds = Math.max(Date.now() - new Date(value).getTime(), 0);
  const hours = Math.floor(milliseconds / 3_600_000);
  if (hours < 1) return "< 1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-xs text-zinc-600">{text}</p>
    </div>
  );
}
