import { PLANS, type BillingPlan } from "@/lib/stripe/constants";

export type BillingFeature =
  | "basic_tickets"
  | "multi_panels"
  | "custom_branding"
  | "ticket_forms"
  | "teams"
  | "tags"
  | "canned_responses"
  | "internal_notes"
  | "audit_log"
  | "sla"
  | "escalation"
  | "analytics"
  | "advanced_analytics"
  | "csat"
  | "knowledge_base"
  | "smart_routing"
  | "automations"
  | "webhooks"
  | "ai_copilot"
  | "ai_classification"
  | "ai_translation"
  | "ai_sentiment"
  | "ai_autopilot"
  | "ai_insights"
  | "support_score"
  | "api_access"
  | "white_label"
  | "enterprise_controls";

const FEATURES: Record<BillingPlan, readonly BillingFeature[]> = {
  [PLANS.FREE]: [
    "basic_tickets",
    "custom_branding",
    "audit_log",
  ],
  [PLANS.PRO]: [
    "basic_tickets",
    "multi_panels",
    "custom_branding",
    "ticket_forms",
    "teams",
    "tags",
    "canned_responses",
    "internal_notes",
    "audit_log",
    "analytics",
    "advanced_analytics",
    "smart_routing",
    "automations",
    "webhooks",
    "ai_copilot",
    "ai_translation",
    "ai_classification",
  ],
  [PLANS.BUSINESS]: [
    "basic_tickets",
    "multi_panels",
    "custom_branding",
    "ticket_forms",
    "teams",
    "tags",
    "canned_responses",
    "internal_notes",
    "audit_log",
    "sla",
    "escalation",
    "analytics",
    "advanced_analytics",
    "csat",
    "knowledge_base",
    "smart_routing",
    "automations",
    "webhooks",
    "ai_copilot",
    "ai_classification",
    "ai_translation",
    "ai_sentiment",
    "ai_insights",
  ],
  [PLANS.ENTERPRISE]: [
    "basic_tickets",
    "multi_panels",
    "custom_branding",
    "ticket_forms",
    "teams",
    "tags",
    "canned_responses",
    "internal_notes",
    "audit_log",
    "sla",
    "escalation",
    "analytics",
    "advanced_analytics",
    "csat",
    "knowledge_base",
    "smart_routing",
    "automations",
    "webhooks",
    "ai_copilot",
    "ai_classification",
    "ai_translation",
    "ai_sentiment",
    "ai_autopilot",
    "ai_insights",
    "support_score",
    "api_access",
    "white_label",
    "enterprise_controls",
  ],
};

export function planHasFeature(plan: BillingPlan, feature: BillingFeature): boolean {
  return FEATURES[plan].includes(feature);
}

export function planLimits(plan: BillingPlan) {
  return {
    maxServers: plan === PLANS.FREE ? 1 : plan === PLANS.PRO ? 5 : plan === PLANS.BUSINESS ? 25 : Number.POSITIVE_INFINITY,
    maxPanels: plan === PLANS.FREE ? 1 : plan === PLANS.PRO ? 5 : Number.POSITIVE_INFINITY,
    maxTeams: plan === PLANS.FREE ? 1 : plan === PLANS.PRO ? 3 : plan === PLANS.BUSINESS ? 15 : Number.POSITIVE_INFINITY,
    maxTags: plan === PLANS.FREE ? 5 : plan === PLANS.PRO ? 50 : Number.POSITIVE_INFINITY,
    maxAutomationRules: plan === PLANS.FREE ? 0 : plan === PLANS.PRO ? 10 : plan === PLANS.BUSINESS ? 50 : Number.POSITIVE_INFINITY,
    maxKnowledgeArticles: plan === PLANS.FREE ? 0 : plan === PLANS.PRO ? 25 : plan === PLANS.BUSINESS ? 250 : Number.POSITIVE_INFINITY,
    analyticsDays: plan === PLANS.FREE ? 7 : plan === PLANS.PRO ? 90 : plan === PLANS.BUSINESS ? 365 : Number.POSITIVE_INFINITY,
    maxApiKeys: plan === PLANS.ENTERPRISE ? Number.POSITIVE_INFINITY : plan === PLANS.BUSINESS ? 5 : 0,
  } as const;
}

export function featureUpgradeTarget(feature: BillingFeature): BillingPlan {
  const order: BillingPlan[] = [PLANS.FREE, PLANS.PRO, PLANS.BUSINESS, PLANS.ENTERPRISE];
  const first = order.find((plan) => planHasFeature(plan, feature));
  return first ?? PLANS.ENTERPRISE;
}
