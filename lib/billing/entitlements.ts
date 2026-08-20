import { PLANS, type BillingPlan } from "@/lib/stripe/constants";

export type BillingFeature =
  | "basic_tickets"
  | "advanced_panels"
  | "analytics"
  | "priority_assignment"
  | "advanced_transcripts"
  | "multi_server"
  | "enterprise_controls";

const FEATURES: Record<BillingPlan, readonly BillingFeature[]> = {
  [PLANS.FREE]: ["basic_tickets"],
  [PLANS.PRO]: ["basic_tickets", "advanced_panels", "analytics", "priority_assignment", "advanced_transcripts", "multi_server"],
  [PLANS.ENTERPRISE]: ["basic_tickets", "advanced_panels", "analytics", "priority_assignment", "advanced_transcripts", "multi_server", "enterprise_controls"],
};

export function planHasFeature(plan: BillingPlan, feature: BillingFeature) {
  return FEATURES[plan].includes(feature);
}

export function planLimits(plan: BillingPlan) {
  return {
    maxServers: plan === PLANS.FREE ? 1 : Number.POSITIVE_INFINITY,
    analyticsDays: plan === PLANS.FREE ? 7 : plan === PLANS.PRO ? 90 : Number.POSITIVE_INFINITY,
    maxPanelCustomizations: plan === PLANS.FREE ? 1 : Number.POSITIVE_INFINITY,
  } as const;
}
