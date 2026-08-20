import { planHasFeature, featureUpgradeTarget, type BillingFeature } from "@/lib/billing/entitlements";
import { type BillingPlan } from "@/lib/stripe/constants";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";

export async function getGuildPlan(guildId: string): Promise<BillingPlan> {
  return TicketStripeService.getEffectivePlan(guildId);
}

export async function requireGuildFeature(guildId: string, feature: BillingFeature): Promise<BillingPlan> {
  const plan = await getGuildPlan(guildId);
  if (!planHasFeature(plan, feature)) {
    const upgradeTo = featureUpgradeTarget(feature);
    throw new Response(JSON.stringify({
      error: "FEATURE_LOCKED",
      feature,
      plan,
      upgradeTo,
    }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }
  return plan;
}
