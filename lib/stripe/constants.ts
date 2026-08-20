export const STRIPE_API_VERSION = "2026-07-29.dahlia" as const;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
} as const;

export type BillingPlan = (typeof PLANS)[keyof typeof PLANS];

export const PLAN_META: Record<BillingPlan, {
  name: string;
  tagline: string;
  description: string;
  highlighted?: boolean;
}> = {
  [PLANS.FREE]: {
    name: "Launch",
    tagline: "Começa sem risco.",
    description: "O essencial para uma comunidade começar a organizar suporte no Discord.",
  },
  [PLANS.PRO]: {
    name: "Pro",
    tagline: "Para equipas que querem velocidade.",
    description: "Automação, analytics e colaboração para equipas de suporte em crescimento.",
    highlighted: true,
  },
  [PLANS.BUSINESS]: {
    name: "Business",
    tagline: "Suporte inteligente à escala.",
    description: "SLA, knowledge base, routing e AI copilot para operações de suporte sérias.",
  },
  [PLANS.ENTERPRISE]: {
    name: "Enterprise",
    tagline: "Governança e automação avançada.",
    description: "AI Autopilot, controlos empresariais, API e operações multi-comunidade.",
  },
};

const configuredPrices: Array<[BillingPlan, string | undefined, "monthly" | "yearly"]> = [
  [PLANS.PRO, process.env.STRIPE_PRICE_PRO_MONTHLY, "monthly"],
  [PLANS.PRO, process.env.STRIPE_PRICE_PRO_YEARLY, "yearly"],
  [PLANS.BUSINESS, process.env.STRIPE_PRICE_BUSINESS_MONTHLY, "monthly"],
  [PLANS.BUSINESS, process.env.STRIPE_PRICE_BUSINESS_YEARLY, "yearly"],
  [PLANS.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY, "monthly"],
  [PLANS.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_YEARLY, "yearly"],
];

export const PRICE_ID_TO_PLAN = new Map<string, BillingPlan>();
export const PRICE_ID_TO_INTERVAL = new Map<string, "monthly" | "yearly">();
for (const [plan, priceId, interval] of configuredPrices) {
  if (!priceId) continue;
  PRICE_ID_TO_PLAN.set(priceId, plan);
  PRICE_ID_TO_INTERVAL.set(priceId, interval);
}

export const TRIAL_PERIOD_DAYS = 30;
export const NEW_MEMBER_PRO_PROMOTION_CODE = "TRIALPRO" as const;

export function planForPrice(priceId: string): BillingPlan | undefined {
  return PRICE_ID_TO_PLAN.get(priceId);
}

export function intervalForPrice(priceId: string): "monthly" | "yearly" | undefined {
  return PRICE_ID_TO_INTERVAL.get(priceId);
}
