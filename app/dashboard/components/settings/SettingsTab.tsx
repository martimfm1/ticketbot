import { Settings, ShieldCheck } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

export function SettingsTab({ data, onOpenPanelSettings }: { data: DashboardMetrics; onOpenPanelSettings: () => void }) {
  const server = data.servers.current;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40" aria-labelledby="general-settings-heading">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 id="general-settings-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Settings className="size-4 text-zinc-500" aria-hidden="true" /> General
          </h2>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Setting label="Language" value={server?.language === "pt" ? "Portuguese" : "English"} />
          <Setting label="Admin role" value={server?.adminRoleName || "Not configured"} />
          <Setting label="Ticket category" value={server?.ticketCategoryId ? "Configured" : "Not configured"} />
          <Setting label="Transcript channel" value={server?.transcriptChannelId ? "Configured" : "Not configured"} />
        </div>

        <div className="border-t border-zinc-800/70 p-5">
          <button
            type="button"
            onClick={onOpenPanelSettings}
            className="min-h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
          >
            Edit ticket settings
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40" aria-labelledby="security-heading">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 id="security-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <ShieldCheck className="size-4 text-zinc-500" aria-hidden="true" /> Security
          </h2>
        </div>
        <div className="p-5">
          <p className="text-xs leading-relaxed text-zinc-600">
            Advanced security controls are managed through the server security configuration.
          </p>
        </div>
      </section>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-2 truncate text-xs text-zinc-300">{value}</p>
    </div>
  );
}
