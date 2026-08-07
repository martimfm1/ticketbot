import { Users } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

export function StaffTab({ data }: { data: DashboardMetrics }) {
  const role = data.servers.current?.adminRoleName;

  return (
    <section
      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40"
      aria-labelledby="staff-heading"
    >
      <div className="border-b border-zinc-800/70 px-5 py-4">
        <h2 id="staff-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Users className="size-4 text-zinc-500" aria-hidden="true" />
          Staff configuration
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          Role responsible for managing support tickets.
        </p>
      </div>

      <div className="p-5">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Admin role</p>
          <p className="mt-2 text-sm text-zinc-300">{role || "Not configured"}</p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-zinc-600">
          Staff membership is retrieved from Discord and is not stored in the SILENTRA database.
        </p>
      </div>
    </section>
  );
}
