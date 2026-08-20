import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_API_URL = "https://discord.com/api/v10";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

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

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) return { ...token, authError: "RefreshTokenMissing" };

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? "",
      client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!response.ok || !data.access_token) {
    return { ...token, authError: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: data.access_token,
    accessTokenExpires: Date.now() + (data.expires_in ?? 604800) * 1000,
    refreshToken: data.refresh_token ?? token.refreshToken,
    authError: undefined,
  };
}

async function getUsableAccessToken(token: JWT): Promise<string | null> {
  if (
    typeof token.accessToken === "string" &&
    (!token.accessTokenExpires || Date.now() < token.accessTokenExpires - 60_000)
  ) {
    return token.accessToken;
  }

  const refreshed = await refreshAccessToken(token);
  return typeof refreshed.accessToken === "string" ? refreshed.accessToken : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access token is read only from the encrypted NextAuth JWT and never sent
    // to the browser/client session.
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const accessToken = token ? await getUsableAccessToken(token) : null;

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
