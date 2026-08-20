import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_API_URL = "https://discord.com/api/v10";

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface DashboardGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

function hasManageGuildPermission(permissions: string): boolean {
  try {
    const value = BigInt(permissions);
    const ADMINISTRATOR = BigInt(1) << BigInt(3);
    const MANAGE_GUILD = BigInt(1) << BigInt(5);
    return (
      (value & ADMINISTRATOR) === ADMINISTRATOR ||
      (value & MANAGE_GUILD) === MANAGE_GUILD
    );
  } catch {
    return false;
  }
}

function getGuildIconUrl(guild: DiscordGuild): string | null {
  return guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the Discord OAuth token only from the encrypted server-side JWT.
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const accessToken = typeof token?.accessToken === "string" ? token.accessToken : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Discord authorization unavailable" },
        { status: 401 },
      );
    }

    const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[dashboard/servers] Discord API error", {
        status: response.status,
        body,
      });

      return NextResponse.json(
        {
          error: response.status === 401
            ? "Discord authorization expired"
            : "Failed to fetch Discord servers",
        },
        { status: response.status === 401 ? 401 : 502 },
      );
    }

    const discordGuilds = (await response.json()) as DiscordGuild[];
    const guilds: DashboardGuild[] = discordGuilds
      .filter((guild) => guild.owner || hasManageGuildPermission(guild.permissions))
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: getGuildIconUrl(guild),
        owner: guild.owner,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      { guilds },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("[dashboard/servers]", error);
    return NextResponse.json({ error: "Failed to load servers" }, { status: 500 });
  }
}
