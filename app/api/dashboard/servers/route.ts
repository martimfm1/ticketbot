import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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

function hasManageGuildPermission(
  permissions: string,
): boolean {
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

function getGuildIconUrl(
  guild: DiscordGuild,
): string | null {
  if (!guild.icon) {
    return null;
  }

  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const accessToken = session.user.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Discord access token unavailable",
        },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${DISCORD_API_URL}/users/@me/guilds`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body = await response.text();

      console.error(
        "[dashboard/servers] Discord API error",
        {
          status: response.status,
          body,
        },
      );

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Discord authorization expired",
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch Discord servers",
        },
        { status: 502 },
      );
    }

    const discordGuilds =
      (await response.json()) as DiscordGuild[];

    const guilds: DashboardGuild[] =
      discordGuilds
        .filter(
          (guild) =>
            guild.owner ||
            hasManageGuildPermission(
              guild.permissions,
            ),
        )
        .map((guild) => ({
          id: guild.id,
          name: guild.name,
          icon: getGuildIconUrl(guild),
          owner: guild.owner,
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        );

    return NextResponse.json(
      { guilds },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "[dashboard/servers]",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to load servers",
      },
      { status: 500 },
    );
  }
}