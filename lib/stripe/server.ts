import Stripe from "stripe";
import { STRIPE_API_VERSION } from "@/lib/stripe/constants";
import { BillingError } from "@/types/billing";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) throw new BillingError("Stripe billing is not configured.", "BILLING_NOT_CONFIGURED");

  if (!stripe) {
    stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION });
  }
  return stripe;
}
