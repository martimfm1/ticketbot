import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { getGuildRoles } from "@/lib/discord/discord.service";
import { isValidDiscordId } from "@/lib/discord/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId");

    if (!isValidDiscordId(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }

    await assertGuildAccess(request, session, guildId);
    const roles = await getGuildRoles(guildId);

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
      })),
    });
  } catch (error) {
    console.error("[dashboard/roles]", error);

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
              : "Failed to load Discord roles",
      },
      { status },
    );
  }
}
