import type { DashboardMetrics } from "@/types/dashboard";

interface DashboardChartsProps {
  data: DashboardMetrics;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const totalTickets = data.tickets.total;
  const openPct = totalTickets > 0 ? (data.tickets.open / totalTickets) * 100 : 0;
  const closedPct = totalTickets > 0 ? (data.tickets.closed / totalTickets) * 100 : 0;

  const totalSuggestions = data.suggestions.total;
  const pendingPct = totalSuggestions > 0 ? (data.suggestions.pending / totalSuggestions) * 100 : 0;
  const approvedPct = totalSuggestions > 0 ? (data.suggestions.approved / totalSuggestions) * 100 : 0;
  const rejectedPct = totalSuggestions > 0 ? (data.suggestions.rejected / totalSuggestions) * 100 : 0;

  const recentByDay = buildDailySeries(data.tickets.recent, 7);
  const maxDaily = Math.max(...recentByDay.map((point) => point.value), 1);

  const resolutionRate = totalTickets > 0
    ? Math.round((data.tickets.closed / totalTickets) * 100)
    : 0;

  const approvalRate = totalSuggestions > 0
    ? Math.round((data.suggestions.approved / totalSuggestions) * 100)
    : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
      <ChartCard title="Ticket activity" description="Tickets opened over the last 7 days.">
        <div className="flex h-48 items-end gap-2 pt-5">
          {recentByDay.map((point) => {
            const height = point.value === 0 ? 4 : Math.max((point.value / maxDaily) * 100, 10);

            return (
              <div key={point.key} className="group flex h-full flex-1 flex-col justify-end gap-2">
                <div className="relative flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-zinc-700 transition-all duration-300 group-hover:bg-zinc-500"
                    style={{ height: `${height}%` }}
                    title={`${point.value} ticket${point.value === 1 ? "" : "s"}`}
                  />
                </div>
                <span className="text-center text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard title="Ticket health" description="Current open vs. closed balance.">
        <div className="flex items-center gap-5 pt-4">
          <RingChart percentage={resolutionRate} />
          <div className="min-w-0 flex-1 space-y-3">
            <LegendRow label="Closed" value={data.tickets.closed} percentage={closedPct} />
            <LegendRow label="Open" value={data.tickets.open} percentage={openPct} />
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Suggestions" description="Moderation status at a glance.">
        <div className="space-y-4 pt-5">
          <StackedBar
            segments={[
              { label: "Approved", value: approvedPct },
              { label: "Pending", value: pendingPct },
              { label: "Rejected", value: rejectedPct },
            ]}
          />
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Approved" value={data.suggestions.approved} />
            <MiniStat label="Pending" value={data.suggestions.pending} />
            <MiniStat label="Rejected" value={data.suggestions.rejected} />
          </div>
          <p className="text-[11px] text-zinc-600">
            Approval rate: <span className="text-zinc-400">{approvalRate}%</span>
          </p>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        <p className="mt-1 text-xs text-zinc-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function RingChart({ percentage }: { percentage: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-zinc-800" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-zinc-300 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-zinc-100">{percentage}%</span>
      </div>
    </div>
  );
}

function LegendRow({ label, value, percentage }: { label: string; value: number; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-500">{value} · {Math.round(percentage)}%</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-zinc-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

function StackedBar({ segments }: { segments: Array<{ label: string; value: number }> }) {
  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-zinc-800">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="h-full bg-zinc-500 first:bg-zinc-300 last:bg-zinc-700"
          style={{ width: `${Math.max(segment.value, 0)}%` }}
          title={`${segment.label}: ${Math.round(segment.value)}%`}
        />
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-2.5">
      <p className="text-[10px] text-zinc-600">{label}</p>
      <p className="mt-1 text-base font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function buildDailySeries(tickets: DashboardMetrics["tickets"]["recent"], days: number) {
  const now = new Date();
  const series: Array<{ key: string; label: string; value: number }> = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);

    const key = date.toISOString().slice(0, 10);
    const value = tickets.filter((ticket) => ticket.openedAt.slice(0, 10) === key).length;
    const label = date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);

    series.push({ key, label, value });
  }

  return series;
}
