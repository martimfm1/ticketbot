import type { BillingPlan } from "@/lib/stripe/constants";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface ServerSubscriptionRecord {
  id: string;
  guild_id: string;
  billing_owner_user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: BillingPlan;
  plan_override: BillingPlan | null;
  status: SubscriptionStatus;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export class BillingError extends Error {
  constructor(
    message: string,
    public readonly code: BillingErrorCode,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

export type BillingErrorCode =
  | "BILLING_NOT_CONFIGURED"
  | "INVALID_PRICE"
  | "CUSTOMER_NOT_FOUND"
  | "SUBSCRIPTION_NOT_FOUND"
  | "SUBSCRIPTION_NOT_ACTIVE"
  | "DB_READ_FAILED"
  | "DB_WRITE_FAILED"
  | "WEBHOOK_VERIFICATION_FAILED"
  | "WEBHOOK_PROCESSING_FAILED";
