"use client";

import Link from "next/link";
import { Check, CreditCard, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Price = { interval: "monthly" | "yearly"; unitAmount: number; currency: string; priceId: string | null };
type Plan = { id: "free" | "pro" | "enterprise"; name: string; description: string; features: string[]; prices: Price[] };

function money(value: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency, maximumFractionDigits: 2 }).format(value / 100);
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/billing/plans", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => setPlans(Array.isArray(body.plans) ? body.plans : []))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-[#050505] px-4 py-16 text-white sm:px-6"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300"><Sparkles className="size-3.5" /> SILENTRA Ticket</div><h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Simple pricing. Serious support.</h1><p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">O mesmo modelo de planos do ecossistema Silentra, adaptado ao teu bot de tickets.</p></div><div className="mt-10 flex justify-center"><div className="inline-flex rounded-xl border border-white/8 bg-white/[0.03] p-1"><button type="button" onClick={() => setBilling("monthly")} className={`rounded-lg px-4 py-2 text-xs font-semibold ${billing === "monthly" ? "bg-white text-zinc-950" : "text-zinc-500"}`}>Mensal</button><button type="button" onClick={() => setBilling("yearly")} className={`rounded-lg px-4 py-2 text-xs font-semibold ${billing === "yearly" ? "bg-white text-zinc-950" : "text-zinc-500"}`}>Anual</button></div></div>{loading ? <div className="mt-12 text-center text-sm text-zinc-500">A carregar planos…</div> : <div className="mt-10 grid gap-4 lg:grid-cols-3">{plans.map((plan) => { const price = plan.prices.find((item) => item.interval === billing) ?? plan.prices[0]; const featured = plan.id === "pro"; return <article key={plan.id} className={`flex min-h-[520px] flex-col rounded-[2rem] border p-6 ${featured ? "border-emerald-400/25 bg-emerald-400/[0.035]" : "border-white/8 bg-zinc-900/35"}`}><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-300">{plan.id === "pro" ? <Zap className="size-5" /> : plan.id === "enterprise" ? <ShieldCheck className="size-5" /> : <CreditCard className="size-5" />}</div><div><h2 className="font-semibold text-white">{plan.name}</h2><p className="text-[11px] text-zinc-600">{plan.description}</p></div></div><div className="mt-7"><p className="text-4xl font-semibold tracking-tight text-white">{price?.unitAmount ? money(price.unitAmount, price.currency) : "Grátis"}</p>{price?.unitAmount ? <p className="mt-1 text-xs text-zinc-600">por {billing === "yearly" ? "ano" : "mês"}</p> : <p className="mt-1 text-xs text-zinc-600">sem cartão</p>}</div><div className="mt-7 flex-1 space-y-3">{plan.features.map((feature) => <div key={feature} className="flex gap-2 text-sm text-zinc-300"><Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />{feature}</div>)}</div><Link href="/login" className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold ${featured ? "bg-emerald-400 text-zinc-950" : "border border-white/10 bg-white/[0.04] text-zinc-100"}`}>{plan.id === "free" ? "Começar grátis" : "Escolher plano"}</Link></article>; })}</div>}<p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-zinc-600">Os preços apresentados são obtidos dos Price IDs configurados em ambiente Stripe. O checkout e a gestão da subscrição acontecem dentro da Silentra.</p></div></main>;
}
