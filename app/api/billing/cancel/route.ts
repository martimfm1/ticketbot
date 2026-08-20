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
    await TicketStripeService.cancelAtPeriodEnd(session, guildId);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[billing/cancel]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not cancel subscription." }, { status: 500 });
  }
}
