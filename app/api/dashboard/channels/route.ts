import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { getGuildChannels } from "@/lib/discord/discord.service";
import { isValidDiscordId } from "@/lib/discord/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const guildId = new URL(request.url).searchParams.get("guildId");

    if (!isValidDiscordId(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }

    await assertGuildAccess(request, session, guildId);
    const channels = await getGuildChannels(guildId);

    return NextResponse.json(
      {
        categories: channels.filter((channel) => channel.type === 4).map((channel) => ({ id: channel.id, name: channel.name })),
        channels: channels.filter((channel) => [0, 5, 15].includes(channel.type)).map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          parentId: channel.parent_id,
        })),
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[dashboard/channels]", error);
    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" || message === "DISCORD_OAUTH_TOKEN_MISSING" || message === "DISCORD_AUTHORIZATION_EXPIRED"
        ? 401
        : message === "GUILD_ACCESS_DENIED"
          ? 403
          : 500;

    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : "Failed to load Discord channels" },
      { status },
    );
  }
}
