import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId")?.trim() ?? "";
    if (!/^\d{17,20}$/.test(guildId)) return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });

    await TicketStripeService.assertBillingAccess(session, guildId);
    const subscription = await TicketStripeService.reconcileSubscription(guildId, await TicketStripeService.getSubscription(guildId));
    const plan = await TicketStripeService.getEffectivePlan(guildId);

    return NextResponse.json({
      plan,
      subscription,
      stripeSubscriptionId: subscription?.stripe_subscription_id ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[billing/subscription]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load subscription." }, { status: 500 });
  }
}
