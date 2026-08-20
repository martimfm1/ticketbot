"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Loader2, ShieldCheck, Sparkles, Zap, Crown } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

interface Price { plan: "pro" | "business" | "enterprise"; interval: "monthly" | "yearly"; priceId: string; unitAmount: number; currency: string; }
interface BillingPlan { id: "free" | "pro" | "business" | "enterprise"; name: string; tagline: string; description: string; highlighted?: boolean; features: string[]; prices: Array<Price | { interval: "monthly"; unitAmount: 0; currency: string; priceId: null }>; }
interface BillingResponse { plans: BillingPlan[]; }
interface SubscriptionResponse { plan: "free" | "pro" | "business" | "enterprise"; subscription: { status: string; trial_end: string | null; current_period_end: string | null; cancel_at_period_end: boolean } | null; }

function formatPrice(amount: number, currency: string) { return new Intl.NumberFormat("pt-PT", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount / 100); }

export function BillingTab({ data }: { data: DashboardMetrics }) {
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const guildId = data.server.current?.guildId ?? "";

  const load = async () => {
    if (!guildId) return;
    setLoading(true);
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/billing/plans", { cache: "no-store" }),
        fetch(`/api/billing/subscription?guildId=${encodeURIComponent(guildId)}`, { cache: "no-store" }),
      ]);
      const plansBody = await plansResponse.json().catch(() => ({}));
      const subscriptionBody = await subscriptionResponse.json().catch(() => ({}));
      if (!plansResponse.ok) throw new Error(plansBody.error || "Não foi possível carregar os planos.");
      if (!subscriptionResponse.ok) throw new Error(subscriptionBody.error || "Não foi possível carregar a subscrição.");
      setBilling(plansBody as BillingResponse);
      setSubscription(subscriptionBody as SubscriptionResponse);
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar o billing."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [guildId]);
  const currentPlan = subscription?.plan ?? "free";
  const currentStatus = subscription?.subscription?.status;
  const activePlan = useMemo(() => billing?.plans.find((plan) => plan.id === currentPlan), [billing, currentPlan]);

  function startCheckout(priceId: string) { setBusy(priceId); window.location.assign(`/checkout?guildId=${encodeURIComponent(guildId)}&priceId=${encodeURIComponent(priceId)}`); }

  async function portal() {
    setBusy("portal");
    try {
      const response = await fetch("/api/billing/customer-portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Não foi possível abrir o billing portal.");
      window.location.assign(body.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível abrir o billing portal."); setBusy(null); }
  }

  async function cancel() {
    if (!window.confirm("Queres mesmo cancelar a subscrição no fim do período atual?")) return;
    setBusy("cancel");
    try {
      const response = await fetch("/api/billing/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Não foi possível cancelar a subscrição.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível cancelar a subscrição."); }
    finally { setBusy(null); }
  }

  if (loading) return <div className="flex min-h-[420px] items-center justify-center text-zinc-500"><Loader2 className="mr-2 size-4 animate-spin" /> A carregar billing…</div>;

  const iconForPlan = (id: BillingPlan["id"]) => id === "enterprise" ? <Crown className="size-4" /> : id === "business" ? <ShieldCheck className="size-4" /> : id === "pro" ? <Zap className="size-4" /> : <Sparkles className="size-4" />;

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300"><Sparkles className="size-3.5" /> SILENTRA Billing</div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">Escolhe o nível de suporte que a tua comunidade precisa.</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Começa com o Launch e desbloqueia operações, automação e AI à medida que o teu suporte cresce.</p></div><div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:min-w-64"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Plano atual</p><p className="mt-2 text-xl font-semibold text-white">{activePlan?.name ?? "Launch"}</p><p className="mt-1 text-xs text-zinc-500">{currentStatus ? currentStatus.replaceAll("_", " ") : "Sem subscrição paga"}</p></div></div>
    </section>

    {error ? <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">{error}</div> : null}

    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {billing?.plans.map((plan) => {
        const selected = currentPlan === plan.id;
        return <article key={plan.id} className={["relative flex min-h-[560px] flex-col rounded-[1.5rem] border p-5 sm:p-6", plan.highlighted ? "border-emerald-400/30 bg-emerald-400/[0.035] shadow-[0_20px_70px_rgba(52,211,153,0.05)]" : "border-white/8 bg-zinc-900/40"].join(" ")}>{plan.highlighted ? <div className="absolute right-5 top-5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-300">Mais popular</div> : null}<div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-300">{iconForPlan(plan.id)}</div><div><h2 className="text-base font-semibold text-white">{plan.name}</h2><p className="text-[11px] text-zinc-600">{plan.tagline}</p></div></div><p className="mt-4 text-sm leading-6 text-zinc-500">{plan.description}</p><div className="mt-5 flex-1 space-y-3">{plan.features.map((feature) => <div key={feature} className="flex gap-2 text-sm text-zinc-300"><Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />{feature}</div>)}</div><div className="mt-7 space-y-2">{plan.prices.map((price) => { const priceId = price.priceId; const amount = price.unitAmount; const label = price.interval === "yearly" ? "anual" : "mensal"; return <button key={`${plan.id}-${price.interval}`} type="button" disabled={!priceId || selected || Boolean(busy)} onClick={() => priceId && startCheckout(priceId)} className={["flex min-h-11 w-full items-center justify-between rounded-xl border px-4 text-sm transition", selected ? "cursor-default border-white/8 bg-white/[0.03] text-zinc-600" : plan.highlighted ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15" : "border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"].join(" ")}>{selected ? <span>Plano atual</span> : <span>Escolher {label}</span>}<strong>{amount === 0 ? "Grátis" : formatPrice(amount, price.currency)}</strong></button>; })}</div></article>;
      })}
    </section>

    {currentPlan !== "free" ? <section className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-zinc-900/35 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-sm font-medium text-white">Gerir subscrição</p><p className="mt-1 text-xs text-zinc-500">Cartão, faturas, cancelamento e detalhes de faturação.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={Boolean(busy)} onClick={() => void portal()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-200 hover:bg-white/[0.07]">Billing portal <ExternalLink className="size-3.5" /></button><button type="button" disabled={Boolean(busy)} onClick={() => void cancel()} className="min-h-10 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 text-xs font-semibold text-red-300 hover:bg-red-400/[0.08]">Cancelar no fim do período</button></div></section> : null}
  </div>;
}

type BillingPlan = BillingResponse["plans"][number];
