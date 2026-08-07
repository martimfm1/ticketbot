import {
  CheckCircle2,
  Lightbulb,
  Ticket,
} from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

export function AnalyticsTab({
  data,
}: {
  data: DashboardMetrics;
}) {
  const resolutionRate =
    data.tickets.total > 0
      ? Math.round(
          (data.tickets.closed / data.tickets.total) * 100,
        )
      : 0;

  const suggestionApprovalRate =
    data.suggestions.total > 0
      ? Math.round(
          (data.suggestions.approved /
            data.suggestions.total) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          icon={Ticket}
          label="Total Tickets"
          value={data.tickets.total}
        />

        <AnalyticsCard
          icon={CheckCircle2}
          label="Resolution Rate"
          value={`${resolutionRate}%`}
        />

        <AnalyticsCard
          icon={Lightbulb}
          label="Suggestions"
          value={data.suggestions.total}
        />

        <AnalyticsCard
          icon={CheckCircle2}
          label="Suggestion Approval"
          value={`${suggestionApprovalRate}%`}
        />
      </div>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-zinc-200">
          Ticket Distribution
        </h2>

        <div className="mt-6 space-y-4">
          <Progress
            label="Open"
            value={data.tickets.open}
            total={data.tickets.total}
          />

          <Progress
            label="Closed"
            value={data.tickets.closed}
            total={data.tickets.total}
          />
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ticket;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <Icon className="size-4 text-zinc-500" />

      <p className="mt-4 text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function Progress({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>

        <span className="font-mono text-zinc-600">
          {value} · {percentage}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-300 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}