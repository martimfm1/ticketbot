const DISCORD_API_URL = "https://discord.com/api/v10";

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    throw new Error(
      "DISCORD_BOT_TOKEN is not configured",
    );
  }

  return token;
}

async function discordFetch<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${DISCORD_API_URL}${endpoint}`,
    {
      ...init,
      headers: {
        Authorization: `Bot ${getBotToken()}`,
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();

    console.error("[discord]", {
      endpoint,
      status: response.status,
      body,
    });

    throw new Error(
      `Discord API returned ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
  mentionable: boolean;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id: string | null;
  position: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
}

export async function getGuildRoles(
  guildId: string,
) {
  const roles =
    await discordFetch<DiscordRole[]>(
      `/guilds/${guildId}/roles`,
    );

  return roles
    .filter((role) => !role.managed)
    .sort(
      (a, b) => b.position - a.position,
    );
}

export async function getGuildChannels(
  guildId: string,
) {
  const channels =
    await discordFetch<DiscordChannel[]>(
      `/guilds/${guildId}/channels`,
    );

  return channels
    .filter((channel) =>
      [0, 2, 4].includes(channel.type),
    )
    .sort(
      (a, b) => a.position - b.position,
    );
}

export async function getGuild(
  guildId: string,
) {
  return discordFetch<DiscordGuild>(
    `/guilds/${guildId}`,
  );
}