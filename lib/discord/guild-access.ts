import type { Session } from "next-auth";

const DISCORD_API_URL = "https://discord.com/api/v10";

const ADMINISTRATOR = BigInt(1) << BigInt(3);
const MANAGE_GUILD = BigInt(1) << BigInt(5);

interface UserGuild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

interface DiscordRole {
  id: string;
  permissions: string;
}

interface DiscordMember {
  roles?: string[];
}

interface DiscordGuild {
  owner_id: string;
}

function hasManageGuildPermission(permissions: string | number | bigint): boolean {
  try {
    const value = BigInt(permissions);
    return (
      (value & ADMINISTRATOR) === ADMINISTRATOR ||
      (value & MANAGE_GUILD) === MANAGE_GUILD
    );
  } catch {
    return false;
  }
}

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN_MISSING");
  }
  return token;
}

async function discordBotFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${DISCORD_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bot ${getBotToken()}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DISCORD_BOT_API_${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function assertGuildAccessWithBot(
  session: Session,
  guildId: string,
): Promise<void> {
  const userId = session.user?.id;
  if (!userId) throw new Error("UNAUTHORIZED");

  const [guild, member, roles] = await Promise.all([
    discordBotFetch<DiscordGuild>(`/guilds/${guildId}`),
    discordBotFetch<DiscordMember>(`/guilds/${guildId}/members/${userId}`),
    discordBotFetch<DiscordRole[]>(`/guilds/${guildId}/roles`),
  ]);

  if (guild.owner_id === userId) return;

  const memberRoleIds = new Set(member.roles ?? []);
  const permissions = roles
    .filter((role) => memberRoleIds.has(role.id))
    .reduce((acc, role) => acc | BigInt(role.permissions), BigInt(0));

  if (!hasManageGuildPermission(permissions)) {
    throw new Error("GUILD_ACCESS_DENIED");
  }
}

export async function assertGuildAccess(
  session: Session,
  guildId: string,
): Promise<void> {
  const accessToken = session.user?.accessToken;

  if (!accessToken) {
    await assertGuildAccessWithBot(session, guildId);
    return;
  }

  const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.ok) {
    const guilds = (await response.json()) as UserGuild[];
    const guild = guilds.find((entry) => entry.id === guildId);

    if (!guild) {
      throw new Error("GUILD_ACCESS_DENIED");
    }

    if (guild.owner || hasManageGuildPermission(guild.permissions)) {
      return;
    }

    throw new Error("GUILD_ACCESS_DENIED");
  }

  if (response.status === 401) {
    try {
      await assertGuildAccessWithBot(session, guildId);
      return;
    } catch (error) {
      if (error instanceof Error && error.message === "GUILD_ACCESS_DENIED") {
        throw error;
      }
      throw new Error("DISCORD_AUTHORIZATION_EXPIRED");
    }
  }

  throw new Error("DISCORD_AUTHORIZATION_EXPIRED");
}
