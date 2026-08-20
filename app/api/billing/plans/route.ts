import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/server";
import { PLANS, PLAN_META, intervalForPrice } from "@/lib/stripe/constants";
import { planLimits } from "@/lib/billing/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_CONFIG = [
  [PLANS.PRO, "monthly", process.env.STRIPE_PRICE_PRO_MONTHLY],
  [PLANS.PRO, "yearly", process.env.STRIPE_PRICE_PRO_YEARLY],
  [PLANS.BUSINESS, "monthly", process.env.STRIPE_PRICE_BUSINESS_MONTHLY],
  [PLANS.BUSINESS, "yearly", process.env.STRIPE_PRICE_BUSINESS_YEARLY],
  [PLANS.ENTERPRISE, "monthly", process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY],
  [PLANS.ENTERPRISE, "yearly", process.env.STRIPE_PRICE_ENTERPRISE_YEARLY],
] as const;

const FEATURES = {
  free: ["1 servidor", "Tickets base", "Branding essencial", "Audit log"],
  pro: ["Até 5 servidores", "Forms", "Teams", "Tags", "Canned responses", "Automations", "Advanced analytics", "AI Copilot"],
  business: ["Até 25 servidores", "SLA e escalations", "Knowledge Base", "Smart routing", "CSAT", "AI sentiment", "AI insights", "Webhooks"],
  enterprise: ["Servidores ilimitados", "AI Autopilot", "Support Score", "API access", "White-label", "Enterprise controls", "Tudo do Business"],
} as const;

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

    const plans = ([PLANS.FREE, PLANS.PRO, PLANS.BUSINESS, PLANS.ENTERPRISE] as const).map((id) => ({
      id,
      name: PLAN_META[id].name,
      tagline: PLAN_META[id].tagline,
      description: PLAN_META[id].description,
      highlighted: Boolean(PLAN_META[id].highlighted),
      features: FEATURES[id],
      limits: planLimits(id),
      prices: id === PLANS.FREE
        ? [{ interval: "monthly" as const, unitAmount: 0, currency: "eur", priceId: null }]
        : prices.filter((price) => price.plan === id),
    }));

    return NextResponse.json({ plans }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[billing/plans]", error);
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
}
