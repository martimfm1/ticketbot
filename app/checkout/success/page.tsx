"use client";

import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Server } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Payload = {
  success?: boolean;
  plan?: "free" | "pro" | "enterprise";
  status?: string;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  error?: string;
};

const NAMES = { free: "Ticket Free", pro: "Ticket Pro", enterprise: "Ticket Enterprise" } as const;

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : null;
}

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const guildId = params.get("guildId");

    const run = async () => {
      if (!guildId) {
        if (!cancelled) { setPayload({ error: "Servidor não identificado." }); setLoading(false); }
        return;
      }

      for (let attempt = 0; attempt < 8 && !cancelled; attempt += 1) {
        try {
          if (sessionId) {
            await fetch(`/api/billing/checkout-complete?guildId=${encodeURIComponent(guildId)}&session_id=${encodeURIComponent(sessionId)}`, { method: "POST", cache: "no-store" }).catch(() => undefined);
          }
          const response = await fetch(`/api/billing/subscription?guildId=${encodeURIComponent(guildId)}`, { cache: "no-store" });
          const body = await response.json().catch(() => ({}));
          if (response.ok && body.subscription && ["active", "trialing", "past_due"].includes(body.subscription.status)) {
            if (!cancelled) { setPayload({ success: true, plan: body.plan, status: body.subscription.status, trialEnd: body.subscription.trial_end, currentPeriodEnd: body.subscription.current_period_end }); setLoading(false); }
            return;
          }
          if (attempt < 7) await new Promise((resolve) => window.setTimeout(resolve, 900));
          else if (!cancelled) { setPayload({ error: body.error || "A subscrição ainda está a ser sincronizada." }); setLoading(false); }
        } catch (error) {
          if (attempt < 7) await new Promise((resolve) => window.setTimeout(resolve, 900));
          else if (!cancelled) { setPayload({ error: error instanceof Error ? error.message : "Não foi possível confirmar a subscrição." }); setLoading(false); }
        }
      }
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#050505] px-4 text-white"><div className="text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Loader2 className="size-5 animate-spin" /></div><h1 className="mt-5 text-xl font-semibold">A confirmar a subscrição…</h1><p className="mt-2 text-sm text-zinc-500">Estamos a sincronizar Stripe e o servidor.</p></div></main>;

  if (!payload?.success) return <main className="grid min-h-screen place-items-center bg-[#050505] px-4 text-white"><div className="w-full max-w-lg rounded-[2rem] border border-red-400/15 bg-zinc-900/80 p-8 text-center"><h1 className="text-2xl font-semibold">Não foi possível confirmar</h1><p className="mt-3 text-sm leading-6 text-zinc-400">{payload?.error || "A subscrição ainda não está disponível."}</p><Link href="/dashboard?tab=Billing" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950">Voltar ao billing <ArrowRight className="size-4" /></Link></div></main>;

  return <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6"><div className="mx-auto max-w-3xl"><div className="rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-zinc-900 to-black p-8 shadow-[0_30px_110px_rgba(0,0,0,0.4)] sm:p-10"><div className="flex size-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"><CheckCircle2 className="size-7" /></div><p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Subscrição confirmada</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">O teu servidor já está no {payload.plan ? NAMES[payload.plan] : "novo plano"}.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">O Stripe e o Supabase foram sincronizados. As funcionalidades do plano ficam disponíveis no dashboard.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="flex items-center gap-2 text-zinc-500"><ShieldCheck className="size-4 text-emerald-300" /><span className="text-xs uppercase tracking-[0.12em]">Estado</span></div><p className="mt-2 text-lg font-semibold text-white">{payload.status?.replaceAll("_", " ")}</p></div><div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="flex items-center gap-2 text-zinc-500"><Server className="size-4 text-emerald-300" /><span className="text-xs uppercase tracking-[0.12em]">Plano</span></div><p className="mt-2 text-lg font-semibold text-white">{payload.plan ? NAMES[payload.plan] : "Ticket"}</p></div></div>{payload.trialEnd ? <p className="mt-4 text-sm text-emerald-100">Trial ativo até <strong>{date(payload.trialEnd)}</strong>.</p> : null}{payload.currentPeriodEnd && !payload.trialEnd ? <p className="mt-4 text-xs text-zinc-500">Período atual até {date(payload.currentPeriodEnd)}.</p> : null}<div className="mt-8"><Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-zinc-950">Ir para o dashboard <ArrowRight className="size-4" /></Link></div></div></div></main>;
}
