export const STRIPE_API_VERSION = "2026-07-29.dahlia" as const;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type BillingPlan = (typeof PLANS)[keyof typeof PLANS];

const configuredPrices: Array<[BillingPlan, string | undefined, "monthly" | "yearly"]> = [
  [PLANS.PRO, process.env.STRIPE_PRICE_PRO_MONTHLY, "monthly"],
  [PLANS.PRO, process.env.STRIPE_PRICE_PRO_YEARLY, "yearly"],
  [PLANS.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY, "monthly"],
  [PLANS.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_YEARLY, "yearly"],
];

export const PRICE_ID_TO_PLAN = new Map<string, BillingPlan>();
export const PRICE_ID_TO_INTERVAL = new Map<string, "monthly" | "yearly">();
for (const [plan, priceId, interval] of configuredPrices) {
  if (priceId) {
    PRICE_ID_TO_PLAN.set(priceId, plan);
    PRICE_ID_TO_INTERVAL.set(priceId, interval);
  }
}

export const TRIAL_PERIOD_DAYS = 30;
export const NEW_MEMBER_PRO_PROMOTION_CODE = "TRIALPRO" as const;

export function planForPrice(priceId: string): BillingPlan | undefined {
  return PRICE_ID_TO_PLAN.get(priceId);
}

export function intervalForPrice(priceId: string): "monthly" | "yearly" | undefined {
  return PRICE_ID_TO_INTERVAL.get(priceId);
}
