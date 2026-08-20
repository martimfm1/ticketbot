"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export function EmbeddedStripeCheckout({ guildId }: { guildId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const priceId = params.get("priceId")?.trim();
    if (!priceId || !guildId) {
      setError("Não foi selecionado nenhum plano para este servidor.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId, priceId }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "Não foi possível iniciar o checkout.");
        return body as { clientSecret?: string };
      })
      .then((body) => {
        if (cancelled) return;
        if (!body.clientSecret) throw new Error("Stripe não devolveu uma sessão de checkout válida.");
        setClientSecret(body.clientSecret);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Não foi possível iniciar o checkout.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [guildId]);

  const options = useMemo(() => clientSecret ? {
    clientSecret,
    onComplete: () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const suffix = sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : "";
      window.location.assign(`/checkout/success?guildId=${encodeURIComponent(guildId)}${suffix}`);
    },
  } : undefined, [clientSecret, guildId]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="size-4 text-emerald-300" /> Pagamento protegido pela Stripe
        </div>
      </div>

      <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">SILENTRA Billing</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Finaliza a tua subscrição</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Checkout integrado na Silentra, com faturação e pagamentos processados pela Stripe.</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
        {loading ? <div className="flex min-h-[520px] items-center justify-center text-sm text-zinc-500">A preparar o checkout…</div> : null}
        {error ? <div className="flex min-h-[420px] items-center justify-center p-6 text-center"><div className="max-w-md"><p className="text-sm font-semibold text-white">Não foi possível carregar o checkout</p><p className="mt-2 text-sm leading-6 text-zinc-500">{error}</p><Link href="/dashboard" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950">Voltar ao dashboard</Link></div></div> : null}
        {options ? <div className="min-h-[700px] bg-zinc-950"><EmbeddedCheckoutProvider stripe={stripePromise} options={options}><EmbeddedCheckout /></EmbeddedCheckoutProvider></div> : null}
      </div>
    </div>
  );
}
