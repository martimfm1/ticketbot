import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const guildId = typeof body?.guildId === "string" ? body.guildId.trim() : "";
    if (!/^\d{17,20}$/.test(guildId)) return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    const url = await TicketStripeService.customerPortal(session, guildId, request.url);
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[billing/customer-portal]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create billing portal session." }, { status: 500 });
  }
}
