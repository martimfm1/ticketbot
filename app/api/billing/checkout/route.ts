import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";
import { BillingError } from "@/types/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const guildId = typeof body?.guildId === "string" ? body.guildId.trim() : "";
    const priceId = typeof body?.priceId === "string" ? body.priceId.trim() : "";
    if (!guildId || !/^\d{17,20}$/.test(guildId)) throw new BillingError("Invalid server.", "INVALID_PRICE");
    if (!priceId) throw new BillingError("The requested price is not available.", "INVALID_PRICE");

    const checkout = await TicketStripeService.createEmbeddedCheckout(session, guildId, priceId);
    return NextResponse.json(checkout, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[billing/checkout]", error);
    const status = error instanceof BillingError
      ? error.code === "INVALID_PRICE" ? 400
        : error.code === "SUBSCRIPTION_NOT_ACTIVE" ? 409
        : error.code === "BILLING_NOT_CONFIGURED" ? 503
        : 500
      : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start checkout." }, { status });
  }
}
