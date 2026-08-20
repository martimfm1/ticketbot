import type Stripe from "stripe";
import type { Session } from "next-auth";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { planForPrice, PLANS, TRIAL_PERIOD_DAYS, type BillingPlan } from "@/lib/stripe/constants";
import { BillingError, type ServerSubscriptionRecord } from "@/types/billing";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);
const CHECKOUT_BUCKET_MS = 10 * 60 * 1000;

type BillingAccount = {
  guild_id: string;
  billing_owner_user_id: string | null;
  stripe_customer_id: string;
  billing_email: string | null;
  trial_started_at: string | null;
};

function customerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer) {
  return typeof customer === "string" ? customer : customer.id;
}
function periodEnd(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.current_period_end ?? null;
}
function planFromSubscription(subscription: Stripe.Subscription): BillingPlan {
  return planForPrice(subscription.items.data[0]?.price.id ?? "") ?? PLANS.FREE;
}

export class TicketStripeService {
  static async assertBillingAccess(session: Session, guildId: string) {
    await assertGuildAccess(session, guildId);
    const userId = session.user?.id;
    if (!userId) throw new BillingError("Unauthorized", "SUBSCRIPTION_NOT_ACTIVE");
    const { data: server, error } = await createAdminClient().from("servers").select("guild_id").eq("guild_id", guildId).maybeSingle();
    if (error) throw new BillingError("Could not load the server.", "DB_READ_FAILED");
    if (!server) throw new BillingError("This server is not connected to SILENTRA Ticket.", "SUBSCRIPTION_NOT_ACTIVE");
    return { userId, guildId };
  }

  static async getBillingAccount(guildId: string): Promise<BillingAccount | null> {
    const { data, error } = await createAdminClient().from("server_billing_accounts").select("guild_id, billing_owner_user_id, stripe_customer_id, billing_email, trial_started_at").eq("guild_id", guildId).maybeSingle();
    if (error) throw new BillingError("Could not load Stripe billing account.", "DB_READ_FAILED");
    return data as BillingAccount | null;
  }

  static async getSubscription(guildId: string): Promise<ServerSubscriptionRecord | null> {
    const { data, error } = await createAdminClient().from("server_subscriptions").select("*").eq("guild_id", guildId).maybeSingle();
    if (error) throw new BillingError("Could not load server subscription.", "DB_READ_FAILED");
    return data as ServerSubscriptionRecord | null;
  }

  static async getOrCreateCustomer(session: Session, guildId: string) {
    await this.assertBillingAccess(session, guildId);
    const userId = session.user?.id ?? "";
    const email = session.user?.email ?? undefined;
    const database = createAdminClient();
    const existing = await this.getBillingAccount(guildId);
    if (existing?.stripe_customer_id) {
      try {
        const customer = await getStripeClient().customers.retrieve(existing.stripe_customer_id);
        if (!customer.deleted) {
          await getStripeClient().customers.update(existing.stripe_customer_id, { email, metadata: { ...customer.metadata, app: "silentra-ticket", guild_id: guildId, billing_owner_user_id: userId } });
          return existing.stripe_customer_id;
        }
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || (error as { code?: string }).code !== "resource_missing") throw error;
      }
    }
    const customer = await getStripeClient().customers.create({ email, metadata: { app: "silentra-ticket", guild_id: guildId, billing_owner_user_id: userId } }, { idempotencyKey: `ticket-customer:${guildId}` });
    const { error } = await database.from("server_billing_accounts").upsert({ guild_id: guildId, billing_owner_user_id: userId, stripe_customer_id: customer.id, billing_email: email ?? null }, { onConflict: "guild_id" });
    if (error) throw new BillingError("Could not persist the Stripe customer.", "DB_WRITE_FAILED");
    return customer.id;
  }

  static async reconcileSubscription(guildId: string, current: ServerSubscriptionRecord | null) {
    if (!current?.stripe_subscription_id || current.plan_override) return current;
    try {
      const remote = await getStripeClient().subscriptions.retrieve(current.stripe_subscription_id);
      const end = periodEnd(remote);
      const updates = {
        stripe_customer_id: customerId(remote.customer),
        stripe_price_id: remote.items.data[0]?.price.id ?? current.stripe_price_id,
        plan: ACTIVE_STATUSES.has(remote.status) ? planFromSubscription(remote) : PLANS.FREE,
        status: remote.status,
        trial_end: remote.trial_end ? new Date(remote.trial_end * 1000).toISOString() : null,
        current_period_end: end ? new Date(end * 1000).toISOString() : current.current_period_end,
        cancel_at_period_end: remote.cancel_at_period_end,
      };
      const changed = Object.entries(updates).some(([key, value]) => value !== (current as unknown as Record<string, unknown>)[key]);
      if (changed) {
        const { error } = await createAdminClient().from("server_subscriptions").update(updates).eq("id", current.id);
        if (error) throw new BillingError("Could not reconcile subscription.", "DB_WRITE_FAILED");
      }
      return { ...current, ...updates } as ServerSubscriptionRecord;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || (error as { code?: string }).code !== "resource_missing") throw error;
      await createAdminClient().from("server_subscriptions").update({ plan: PLANS.FREE, status: "canceled", cancel_at_period_end: false }).eq("id", current.id);
      return { ...current, plan: PLANS.FREE, status: "canceled", cancel_at_period_end: false } as ServerSubscriptionRecord;
    }
  }

  static async createEmbeddedCheckout(session: Session, guildId: string, priceId: string) {
    await this.assertBillingAccess(session, guildId);
    const requestedPlan = planForPrice(priceId);
    if (!requestedPlan || requestedPlan === PLANS.FREE) throw new BillingError("The requested price is not available.", "INVALID_PRICE");
    const current = await this.reconcileSubscription(guildId, await this.getSubscription(guildId));
    if (current && ACTIVE_STATUSES.has(current.status) && current.plan !== PLANS.FREE) throw new BillingError("An active paid subscription already exists for this server.", "SUBSCRIPTION_NOT_ACTIVE");
    const customer = await this.getOrCreateCustomer(session, guildId);
    const isNewPro = requestedPlan === PLANS.PRO && !current;
    const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://ticket.silentra.me").replace(/\/$/, "");
    const returnUrl = `${origin}/checkout/success?guildId=${encodeURIComponent(guildId)}&session_id={CHECKOUT_SESSION_ID}`;
    const bucket = Math.floor(Date.now() / CHECKOUT_BUCKET_MS);
    const checkout = await getStripeClient().checkout.sessions.create({
      customer,
      mode: "subscription",
      ui_mode: "elements",
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: returnUrl,
      client_reference_id: guildId,
      allow_promotion_codes: true,
      metadata: { app: "silentra-ticket", guild_id: guildId, billing_owner_user_id: session.user?.id ?? "", stripe_customer_id: customer, plan: requestedPlan, trial_eligible: isNewPro ? "true" : "false" },
      subscription_data: { metadata: { app: "silentra-ticket", guild_id: guildId, billing_owner_user_id: session.user?.id ?? "" }, ...(isNewPro ? { trial_period_days: TRIAL_PERIOD_DAYS } : {}) },
      billing_address_collection: "required",
      customer_update: { name: "auto", address: "auto" },
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      locale: "pt",
    }, { idempotencyKey: `ticket-checkout:${guildId}:${priceId}:${bucket}` });
    if (!checkout.client_secret) throw new BillingError("Stripe did not return a Checkout client secret.", "WEBHOOK_PROCESSING_FAILED");
    return { clientSecret: checkout.client_secret, sessionId: checkout.id };
  }

  static async syncFromStripe(guildId: string, ownerUserId: string, subscription: Stripe.Subscription) {
    const stripeCustomer = customerId(subscription.customer);
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) throw new BillingError("Stripe subscription has no price.", "WEBHOOK_PROCESSING_FAILED");
    const end = periodEnd(subscription);
    const database = createAdminClient();
    const { error } = await database.from("server_subscriptions").upsert({ guild_id: guildId, billing_owner_user_id: ownerUserId, stripe_customer_id: stripeCustomer, stripe_subscription_id: subscription.id, stripe_price_id: priceId, plan: ACTIVE_STATUSES.has(subscription.status) ? planFromSubscription(subscription) : PLANS.FREE, status: subscription.status, trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null, current_period_end: end ? new Date(end * 1000).toISOString() : null, cancel_at_period_end: subscription.cancel_at_period_end }, { onConflict: "guild_id" });
    if (error) throw new BillingError("Could not persist the Stripe subscription.", "DB_WRITE_FAILED");
    const account = await database.from("server_billing_accounts").upsert({ guild_id: guildId, billing_owner_user_id: ownerUserId, stripe_customer_id: stripeCustomer }, { onConflict: "guild_id" });
    if (account.error) throw new BillingError("Could not persist the Stripe billing account.", "DB_WRITE_FAILED");
  }

  static async getEffectivePlan(guildId: string): Promise<BillingPlan> {
    const assignment = await createAdminClient().from("server_plan_assignments").select("plan, expires_at").eq("guild_id", guildId).maybeSingle();
    if (assignment.error) throw new BillingError("Could not load plan assignment.", "DB_READ_FAILED");
    if (assignment.data && (!assignment.data.expires_at || new Date(assignment.data.expires_at).getTime() > Date.now())) return assignment.data.plan as BillingPlan;
    const current = await this.reconcileSubscription(guildId, await this.getSubscription(guildId));
    return current?.plan_override ?? current?.plan ?? PLANS.FREE;
  }

  static async cancelAtPeriodEnd(session: Session, guildId: string) {
    await this.assertBillingAccess(session, guildId);
    const current = await this.reconcileSubscription(guildId, await this.getSubscription(guildId));
    if (!current?.stripe_subscription_id) throw new BillingError("No active paid subscription was found.", "SUBSCRIPTION_NOT_FOUND");
    const subscription = await getStripeClient().subscriptions.update(current.stripe_subscription_id, { cancel_at_period_end: true });
    await this.syncFromStripe(guildId, session.user!.id, subscription);
  }

  static async customerPortal(session: Session, guildId: string, requestUrl?: string) {
    await this.assertBillingAccess(session, guildId);
    const customer = await this.getOrCreateCustomer(session, guildId);
    const origin = (process.env.NEXT_PUBLIC_APP_URL || (requestUrl ? new URL(requestUrl).origin : "https://ticket.silentra.me")).replace(/\/$/, "");
    const configuration = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID?.trim();
    const portal = await getStripeClient().billingPortal.sessions.create({ customer, return_url: `${origin}/dashboard?tab=Billing`, ...(configuration ? { configuration } : {}) });
    return portal.url;
  }
}
