import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStripeClient } from "@/lib/stripe/server";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id")?.trim();
    const guildId = searchParams.get("guildId")?.trim();
    if (!sessionId || !guildId) return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });

    await TicketStripeService.assertBillingAccess(session, guildId);
    const checkout = await getStripeClient().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });

    if (checkout.client_reference_id !== guildId && checkout.metadata?.guild_id !== guildId) {
      return NextResponse.json({ error: "Checkout session does not belong to this server." }, { status: 403 });
    }

    if (!checkout.subscription) return NextResponse.json({ error: "Checkout is not linked to a subscription yet." }, { status: 409 });
    const subscription = typeof checkout.subscription === "string"
      ? await getStripeClient().subscriptions.retrieve(checkout.subscription)
      : checkout.subscription;

    await TicketStripeService.syncFromStripe(guildId, session.user.id, subscription);
    return NextResponse.json({ success: true, subscriptionId: subscription.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[billing/checkout-complete]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not synchronize checkout." }, { status: 500 });
  }
}
