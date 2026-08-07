import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import {
  getGuildRoles,
} from "@/lib/discord/discord.service";
import {
  isValidDiscordId,
} from "@/lib/discord/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
) {
  try {
    const session =
      await requireSession();

    const { searchParams } =
      new URL(request.url);

    const guildId =
      searchParams.get("guildId");

    if (!isValidDiscordId(guildId)) {
      return NextResponse.json(
        {
          error: "Invalid guildId",
        },
        {
          status: 400,
        },
      );
    }

    await assertGuildAccess(
      session,
      guildId,
    );

    const roles =
      await getGuildRoles(guildId);

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
      })),
    });
  } catch (error) {
    console.error(
      "[dashboard/roles]",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "GUILD_ACCESS_DENIED"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "DISCORD_AUTHORIZATION_EXPIRED"
    ) {
      return NextResponse.json(
        {
          error:
            "Discord authorization expired",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to load Discord roles",
      },
      { status: 500 },
    );
  }
}