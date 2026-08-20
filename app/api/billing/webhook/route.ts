import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getStripeClient } from "@/lib/stripe/server";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";
import { BillingError } from "@/types/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markFailed(eventId: string, error: unknown) {
  await supabaseServer.rpc("fail_stripe_webhook_event", {
    p_event_id: eventId,
    p_error: error instanceof Error ? error.message : "UNKNOWN",
  });
}

async function syncCheckout(session: Stripe.Checkout.Session) {
  if (!session.subscription) return;
  const subscription = typeof session.subscription === "string"
    ? await getStripeClient().subscriptions.retrieve(session.subscription)
    : session.subscription;
  const metadata = session.metadata ?? subscription.metadata;
  const guildId = metadata?.guild_id?.trim();
  const ownerId = metadata?.billing_owner_user_id?.trim();
  if (!guildId || !ownerId) {
    throw new BillingError(
      "Checkout session is missing server billing metadata.",
      "WEBHOOK_PROCESSING_FAILED",
    );
  }
  await TicketStripeService.syncFromStripe(guildId, ownerId, subscription);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Invalid webhook request." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  const { data: claim, error: claimError } = await supabaseServer.rpc("claim_stripe_webhook_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_lease_seconds: 300,
  });

  if (claimError) {
    return NextResponse.json({ error: "Webhook ledger unavailable." }, { status: 500 });
  }
  if (claim === "processed") return NextResponse.json({ received: true, duplicate: true });
  if (claim === "processing") return NextResponse.json({ received: true, processing: true });
  if (claim !== "claimed") return NextResponse.json({ error: "Webhook claim failed." }, { status: 500 });

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await syncCheckout(event.data.object as Stripe.Checkout.Session);
    }

    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const guildId = subscription.metadata?.guild_id?.trim();
      const ownerId = subscription.metadata?.billing_owner_user_id?.trim();
      if (guildId && ownerId) {
        await TicketStripeService.syncFromStripe(guildId, ownerId, subscription);
      }
    }

    await supabaseServer.rpc("complete_stripe_webhook_event", { p_event_id: event.id });
    return NextResponse.json({ received: true });
  } catch (error) {
    await markFailed(event.id, error);
    console.error("[billing/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
