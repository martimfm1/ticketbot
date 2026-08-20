"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, BookOpen, Gauge, Layers3, Plus, ShieldAlert, Tags, Users, Workflow, X } from "lucide-react";

const MODULES = [
  { key: "forms", label: "Ticket Forms", icon: Layers3, description: "Formulários estruturados para recolher contexto antes de abrir o ticket." },
  { key: "teams", label: "Teams", icon: Users, description: "Departamentos e routing por equipa." },
  { key: "tags", label: "Tags", icon: Tags, description: "Classificação rápida e analytics por assunto." },
  { key: "canned-responses", label: "Canned Responses", icon: BookOpen, description: "Respostas rápidas reutilizáveis para a equipa." },
  { key: "automations", label: "Automations", icon: Workflow, description: "Triggers, conditions e ações para o fluxo de suporte." },
  { key: "sla", label: "SLA", icon: Gauge, description: "Tempos de resposta, resolução e escalations." },
  { key: "knowledge", label: "Knowledge Base", icon: BookOpen, description: "Conteúdo de suporte para staff e futuras respostas AI." },
  { key: "csat", label: "CSAT", icon: ShieldAlert, description: "Feedback de satisfação e qualidade do suporte." },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

type Props = { guildId: string };

function displayName(item: Record<string, unknown>) {
  return String(item.name ?? item.title ?? item.label ?? item.score ?? "Item");
}

export function PlatformTab({ guildId }: Props) {
  const [active, setActive] = useState<ModuleKey>("forms");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const module = useMemo(() => MODULES.find((entry) => entry.key === active)!, [active]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/platform/${active}?guildId=${encodeURIComponent(guildId)}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error === "FEATURE_LOCKED" ? `Disponível no plano ${body.upgradeTo}.` : body.error || "Não foi possível carregar este módulo.");
      setItems(Array.isArray(body.items) ? body.items : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o módulo.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [guildId, active]);

  async function createItem() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { guildId, name: name.trim() };
      if (active === "knowledge") payload.content = "";
      if (active === "canned-responses") payload.body = "";
      if (active === "automations") {
        payload.trigger_type = "ticket.created";
        payload.conditions = [];
        payload.actions = [];
      }
      if (active === "sla") {
        payload.priority = "normal";
        payload.first_response_minutes = 15;
        payload.resolution_minutes = 60;
      }
      const response = await fetch(`/api/platform/${active}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error === "FEATURE_LOCKED" ? `Disponível no plano ${body.upgradeTo}.` : body.error || "Não foi possível criar.");
      setName("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar.");
    } finally {
      setCreating(false);
    }
  }

  async function removeItem(id: string) {
    try {
      const response = await fetch(`/api/platform/${active}?guildId=${encodeURIComponent(guildId)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível eliminar.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível eliminar.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/8 bg-zinc-950/70 p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">Support Platform</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Constrói o teu sistema de suporte.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Forms, teams, routing, automations, SLA, knowledge e qualidade num único workspace.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400"><Bot className="size-4 text-emerald-300" /> AI-ready</div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-1 rounded-2xl border border-white/8 bg-zinc-950/60 p-2">
          {MODULES.map((entry) => { const Icon = entry.icon; const selected = entry.key === active; return <button key={entry.key} type="button" onClick={() => setActive(entry.key)} className={["flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs transition", selected ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"].join(" ")}><Icon className="size-4 shrink-0" /><span className="min-w-0 truncate">{entry.label}</span></button>; })}
        </aside>

        <section className="min-w-0 rounded-2xl border border-white/8 bg-zinc-950/60 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><h3 className="text-lg font-semibold text-white">{module.label}</h3><p className="mt-1 text-sm text-zinc-500">{module.description}</p></div>
            <div className="flex w-full gap-2 sm:w-auto"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={`Novo ${module.label.toLowerCase()}`} className="min-h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-emerald-400/30 sm:w-64" /><button type="button" disabled={creating || !name.trim()} onClick={() => void createItem()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-zinc-950 disabled:opacity-40"><Plus className="size-3.5" /> Criar</button></div>
          </div>

          {error ? <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-3 py-2 text-xs text-red-300">{error}</div> : null}
          {loading ? <div className="mt-8 grid gap-2 sm:grid-cols-2"><div className="h-20 animate-pulse rounded-xl bg-white/[0.03]" /><div className="h-20 animate-pulse rounded-xl bg-white/[0.03]" /></div> : null}
          {!loading && !error && items.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-white/8 p-8 text-center text-sm text-zinc-600">Ainda não tens itens neste módulo.</div> : null}
          {!loading && items.length > 0 ? <div className="mt-5 grid gap-2 sm:grid-cols-2">{items.map((item) => { const id = String(item.id); return <article key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-200">{displayName(item)}</p><p className="mt-1 truncate font-mono text-[9px] text-zinc-700">{id}</p></div><button type="button" onClick={() => void removeItem(id)} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-400/10 hover:text-red-300" aria-label="Eliminar"><X className="size-4" /></button></article>; })}</div> : null}
        </section>
      </div>
    </div>
  );
}
