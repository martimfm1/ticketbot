import {
  Settings,
  ShieldCheck,
} from "lucide-react";

import type { DashboardMetrics } from "@/types/dashboard";

export function SettingsTab({
  data,
  onOpenPanelSettings,
}: {
  data: DashboardMetrics;
  onOpenPanelSettings: () => void;
}) {
  const server = data.servers.current;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Settings className="size-4 text-zinc-500" />
            General
          </h2>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Setting
            label="Language"
            value={
              server?.language === "pt"
                ? "Português"
                : "English"
            }
          />

          <Setting
            label="Admin Role"
            value={
              server?.adminRoleName ||
              "Not configured"
            }
          />

          <Setting
            label="Ticket Category"
            value={
              server?.ticketCategoryId
                ? "Configured"
                : "Not configured"
            }
          />

          <Setting
            label="Transcript Channel"
            value={
              server?.transcriptChannelId
                ? "Configured"
                : "Not configured"
            }
          />
        </div>

        <div className="border-t border-zinc-800/70 p-5">
          <button
            type="button"
            onClick={onOpenPanelSettings}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            Editar configuração
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <ShieldCheck className="size-4 text-zinc-500" />
            Security
          </h2>
        </div>

        <div className="p-5">
          <p className="text-xs leading-relaxed text-zinc-600">
            As configurações avançadas de
            segurança são geridas através da
            configuração de segurança do servidor.
          </p>
        </div>
      </section>
    </div>
  );
}

function Setting({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 truncate text-xs text-zinc-300">
        {value}
      </p>
    </div>
  );
}