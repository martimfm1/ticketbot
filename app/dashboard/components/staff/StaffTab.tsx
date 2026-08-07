import { Users } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

export function StaffTab({
  data,
}: {
  data: DashboardMetrics;
}) {
  const role =
    data.servers.current?.adminRoleName;

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
      <div className="border-b border-zinc-800/70 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Users className="size-4 text-zinc-500" />
          Staff Configuration
        </h2>

        <p className="mt-1 text-xs text-zinc-600">
          Role responsável pela gestão dos tickets.
        </p>
      </div>

      <div className="p-5">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Admin Role
          </p>

          <p className="mt-2 text-sm text-zinc-300">
            {role || "Não configurada"}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-zinc-600">
          A lista de membros da role é obtida pelo Discord e não é
          armazenada na base de dados do SILENTRA.
        </p>
      </div>
    </section>
  );
}