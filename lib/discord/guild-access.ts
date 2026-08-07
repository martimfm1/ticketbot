import type { Session } from "next-auth";

const DISCORD_API_URL =
  "https://discord.com/api/v10";

interface UserGuild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

function hasManageGuildPermission(
  permissions: string,
): boolean {
  const value = BigInt(permissions);

  const ADMINISTRATOR =
    BigInt(1) << BigInt(3);

  const MANAGE_GUILD =
    BigInt(1) << BigInt(5);

  return (
    (value & ADMINISTRATOR) ===
      ADMINISTRATOR ||
    (value & MANAGE_GUILD) ===
      MANAGE_GUILD
  );
}

export async function assertGuildAccess(
  session: Session,
  guildId: string,
): Promise<void> {
  const accessToken =
    session.user?.accessToken;

  if (!accessToken) {
    throw new Error(
      "DISCORD_OAUTH_TOKEN_MISSING",
    );
  }

  const response = await fetch(
    `${DISCORD_API_URL}/users/@me/guilds`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "DISCORD_AUTHORIZATION_EXPIRED",
    );
  }

  const guilds =
    (await response.json()) as UserGuild[];

  const guild = guilds.find(
    (guild) => guild.id === guildId,
  );

  if (!guild) {
    throw new Error("GUILD_ACCESS_DENIED");
  }

  const canManage =
    guild.owner ||
    hasManageGuildPermission(
      guild.permissions,
    );

  if (!canManage) {
    throw new Error("GUILD_ACCESS_DENIED");
  }
}