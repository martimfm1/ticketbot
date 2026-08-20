import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/server";
import { PLANS, intervalForPrice } from "@/lib/stripe/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_CONFIG = [
  [PLANS.PRO, "monthly", process.env.STRIPE_PRICE_PRO_MONTHLY],
  [PLANS.PRO, "yearly", process.env.STRIPE_PRICE_PRO_YEARLY],
  [PLANS.ENTERPRISE, "monthly", process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY],
  [PLANS.ENTERPRISE, "yearly", process.env.STRIPE_PRICE_ENTERPRISE_YEARLY],
] as const;

export async function GET() {
  try {
    const stripe = getStripeClient();
    const prices = await Promise.all(
      PRICE_CONFIG.filter(([, , id]) => Boolean(id)).map(async ([plan, configuredInterval, id]) => {
        const price = await stripe.prices.retrieve(id!);
        return {
          plan,
          interval: intervalForPrice(price.id) ?? configuredInterval,
          priceId: price.id,
          unitAmount: price.unit_amount ?? 0,
          currency: price.currency,
        };
      }),
    );

    return NextResponse.json({
      plans: [
        {
          id: PLANS.FREE,
          name: "Ticket Free",
          description: "O essencial para começares a organizar suporte no Discord.",
          features: ["1 servidor", "Tickets base", "Configuração essencial", "Dashboard básico"],
          prices: [{ interval: "monthly", unitAmount: 0, currency: "eur", priceId: null }],
        },
        {
          id: PLANS.PRO,
          name: "Ticket Pro",
          description: "Automação, analytics e ferramentas avançadas para equipas.",
          features: ["Servidores ilimitados", "Inbox completo", "Analytics", "Ticket customization", "Prioridades e assignment", "30 dias de trial"],
          prices: prices.filter((price) => price.plan === PLANS.PRO),
        },
        {
          id: PLANS.ENTERPRISE,
          name: "Ticket Enterprise",
          description: "Governança e escala para redes e operações maiores.",
          features: ["Tudo do Pro", "Planos multi-servidor", "Overrides", "Billing portal", "Suporte prioritário"],
          prices: prices.filter((price) => price.plan === PLANS.ENTERPRISE),
        },
      ],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[billing/plans]", error);
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
}
