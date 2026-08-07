import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardMetrics } from "@/lib/dashboard/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_SNOWFLAKE_REGEX = /^\d{17,20}$/;

export async function GET(request: Request) {
  try {
    // ─────────────────────────────────────────────
    // Authentication
    // ─────────────────────────────────────────────

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // ─────────────────────────────────────────────
    // Input validation
    // ─────────────────────────────────────────────

    const { searchParams } = new URL(request.url);

    const guildId =
      searchParams.get("guildId") ??
      searchParams.get("guild_id");

    if (!guildId) {
      return NextResponse.json(
        {
          error: "Missing guildId",
        },
        {
          status: 400,
        },
      );
    }

    if (!DISCORD_SNOWFLAKE_REGEX.test(guildId)) {
      return NextResponse.json(
        {
          error: "Invalid guildId",
        },
        {
          status: 400,
        },
      );
    }

    // ─────────────────────────────────────────────
    // Dashboard data
    // ─────────────────────────────────────────────

    const data = await getDashboardMetrics(guildId);

    // ─────────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────────

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[dashboard-metrics]", error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard metrics",
      },
      {
        status: 500,
      },
    );
  }
}