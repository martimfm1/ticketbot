import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { requireGuildFeature } from "@/lib/billing/require-feature";
import { groundedSuggestion } from "@/lib/ai/ticket-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const guildId = typeof body.guildId === "string" ? body.guildId : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!/^\d{17,20}$/.test(guildId) || !text) return NextResponse.json({ error: "guildId and text are required" }, { status: 400 });

    await assertGuildAccess(session, guildId);
    await requireGuildFeature(guildId, "ai_copilot");

    const result = await groundedSuggestion(guildId, text);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[ai/ticket-intelligence]", error);
    return NextResponse.json({ error: "Could not analyze ticket" }, { status: 500 });
  }
}
