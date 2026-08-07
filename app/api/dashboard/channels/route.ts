import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import {
  getGuildChannels,
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
        { status: 400 },
      );
    }

    await assertGuildAccess(
      session,
      guildId,
    );

    const channels =
      await getGuildChannels(guildId);

    return NextResponse.json({
      categories: channels
        .filter(
          (channel) =>
            channel.type === 4,
        )
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
        })),

      channels: channels
        .filter((channel) =>
          [0, 5, 15].includes(
            channel.type,
          ),
        )
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          parentId:
            channel.parent_id,
        })),
    });
  } catch (error) {
    console.error(
      "[dashboard/channels]",
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
          "Failed to load Discord channels",
      },
      { status: 500 },
    );
  }
}