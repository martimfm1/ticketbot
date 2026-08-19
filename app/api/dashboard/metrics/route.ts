import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardMetrics } from "@/lib/dashboard/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_SNOWFLAKE_REGEX = /^\d{17,20}$/;

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);

    console.info("[dashboard-metrics] request", {
      requestId,
      authenticated: Boolean(session?.user?.id),
      userId: session?.user?.id ?? null,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId") ?? searchParams.get("guild_id");

    if (!guildId) {
      return NextResponse.json({ error: "Missing guildId", requestId }, { status: 400 });
    }

    if (!DISCORD_SNOWFLAKE_REGEX.test(guildId)) {
      return NextResponse.json({ error: "Invalid guildId", requestId }, { status: 400 });
    }

    console.info("[dashboard-metrics] loading", {
      requestId,
      guildId,
    });

    const data = await getDashboardMetrics(guildId);

    console.info("[dashboard-metrics] success", {
      requestId,
      guildId,
      tickets: data.tickets.total,
      openTickets: data.tickets.open,
      closedTickets: data.tickets.closed,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[dashboard-metrics] failed", {
      requestId,
      error,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard metrics",
        requestId,
      },
      { status: 500 },
    );
  }
}
