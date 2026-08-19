import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabase";

const DISCORD_API_URL = "https://discord.com/api/v10";
const SNOWFLAKE = /^\d{17,20}$/;

export type TicketAccess = {
  userId: string;
  guildId: string;
  canManage: boolean;
  canSupport: boolean;
};

function validSnowflake(value: string): boolean {
  return SNOWFLAKE.test(value);
}

function hasManageGuildPermission(permissions: string | number | bigint): boolean {
  try {
    const value = BigInt(permissions);
    const administrator = BigInt(1) << BigInt(3);
    const manageGuild = BigInt(1) << BigInt(5);
    return (value & administrator) === administrator || (value & manageGuild) === manageGuild;
  } catch {
    return false;
  }
}

async function getDiscordGuildPermissions(accessToken: string, guildId: string) {
  const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const guilds = (await response.json()) as Array<{
    id: string;
    owner: boolean;
    permissions: string;
  }>;

  return guilds.find((guild) => guild.id === guildId) ?? null;
}

async function getServerConfig(guildId: string) {
  const { data, error } = await supabaseServer
    .from("servers")
    .select("guild_id, admin_role_id, ticket_role_id, admin_role_name")
    .eq("guild_id", guildId)
    .maybeSingle();

  if (error) throw new Error("Failed to load server configuration");
  return data;
}

async function getBotMemberRoles(guildId: string, userId: string): Promise<string[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return [];

  const response = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const member = (await response.json()) as { roles?: string[] };
  return Array.isArray(member.roles) ? member.roles : [];
}

export async function requireTicketAccess(guildId: string): Promise<TicketAccess> {
  if (!validSnowflake(guildId)) {
    throw new Error("Invalid guildId");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const accessToken = session.user.accessToken;
  if (!accessToken) {
    throw new Response("Discord authorization expired", { status: 401 });
  }

  const [discordGuild, config] = await Promise.all([
    getDiscordGuildPermissions(accessToken, guildId),
    getServerConfig(guildId),
  ]);

  if (!discordGuild) {
    throw new Response("Guild access denied", { status: 403 });
  }

  const canManage = discordGuild.owner || hasManageGuildPermission(discordGuild.permissions);

  if (!canManage && !process.env.DISCORD_BOT_TOKEN) {
    throw new Response("Staff authorization is unavailable", { status: 503 });
  }

  const roles = canManage ? [] : await getBotMemberRoles(guildId, session.user.id);
  const configuredRoleId = config?.ticket_role_id ?? config?.admin_role_id;

  const canSupport = canManage || Boolean(configuredRoleId && roles.includes(String(configuredRoleId)));

  if (!canSupport) {
    throw new Response("Insufficient ticket permissions", { status: 403 });
  }

  return {
    userId: session.user.id,
    guildId,
    canManage,
    canSupport,
  };
}

export function jsonError(error: unknown) {
  if (error instanceof Response) return error;

  console.error("[dashboard/ticket-auth]", error);
  return new Response("Internal server error", { status: 500 });
}
