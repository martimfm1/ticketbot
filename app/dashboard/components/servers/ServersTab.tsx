import { Server, ShieldCheck } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

interface ServersTabProps {
  data: DashboardMetrics;
}

export function ServersTab({ data }: ServersTabProps) {
  const server = data.servers.current;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={Server}
          label="Servidores configurados"
          value={data.servers.total.toString()}
        />

        <InfoCard
          icon={ShieldCheck}
          label="Estado"
          value={server ? "Configurado" : "Não configurado"}
        />
      </div>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-200">
            Servidor atual
          </h2>
        </div>

        {!server ? (
          <div className="p-6 text-xs text-zinc-600">
            Este servidor ainda não está configurado.
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Detail label="Guild ID" value={server.guildId} />
            <Detail
              label="Idioma"
              value={server.language.toUpperCase()}
            />
            <Detail
              label="Categoria"
              value={server.ticketCategoryId || "Não definida"}
            />
            <Detail
              label="Role administrativa"
              value={server.adminRoleName || "Não definida"}
            />
            <Detail
              label="Canal de transcripts"
              value={server.transcriptChannelId || "Não definido"}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <Icon className="size-4 text-zinc-500" />

      <p className="mt-4 text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-xl font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 truncate font-mono text-xs text-zinc-300">
        {value}
      </p>
    </div>
  );
}