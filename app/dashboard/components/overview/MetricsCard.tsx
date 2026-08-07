import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  description?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">
            {value.toLocaleString()}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-zinc-600">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
          <Icon className="size-4 text-zinc-500" />
        </div>
      </div>
    </div>
  );
}