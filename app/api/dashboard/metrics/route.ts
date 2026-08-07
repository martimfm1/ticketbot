import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { getDashboardMetrics } from "@/lib/dashboard/dashboard.service";
import { isValidDiscordId } from "@/lib/discord/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId") ?? searchParams.get("guild_id");

    if (!isValidDiscordId(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }

    await assertGuildAccess(request, session, guildId);
    const data = await getDashboardMetrics(guildId);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[dashboard-metrics]", error);

    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" ||
      message === "DISCORD_OAUTH_TOKEN_MISSING" ||
      message === "DISCORD_AUTHORIZATION_EXPIRED"
        ? 401
        : message === "GUILD_ACCESS_DENIED"
          ? 403
          : 500;

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Unauthorized"
            : status === 403
              ? "Forbidden"
              : "Failed to load dashboard metrics",
      },
      { status },
    );
  }
}
