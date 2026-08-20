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

async function botFetch<T>(endpoint: string): Promise<T> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) throw new Error("DISCORD_BOT_TOKEN_MISSING");

  const response = await fetch(`${DISCORD_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`DISCORD_BOT_API_${response.status}`);
  return response.json() as Promise<T>;
}

async function getServerConfig(guildId: string) {
  const { data, error } = await supabaseServer
    .from("servers")
    .select("guild_id, ticket_role_id, admin_role_id, admin_role_name")
    .eq("guild_id", guildId)
    .maybeSingle();

  if (error) throw new Error("Failed to load server configuration");
  return data;
}

export async function requireTicketAccess(guildId: string): Promise<TicketAccess> {
  if (!validSnowflake(guildId)) throw new Error("Invalid guildId");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Response("Unauthorized", { status: 401 });

  const [guild, member, roles, config] = await Promise.all([
    botFetch<{ owner_id: string }>(`/guilds/${guildId}`),
    botFetch<{ roles?: string[] }>(`/guilds/${guildId}/members/${userId}`),
    botFetch<Array<{ id: string; permissions: string }>>(`/guilds/${guildId}/roles`),
    getServerConfig(guildId),
  ]);

  const roleIds = new Set(member.roles ?? []);
  const permissions = roles
    .filter((role) => roleIds.has(role.id))
    .reduce((acc, role) => acc | BigInt(role.permissions), BigInt(0));

  const canManage = guild.owner_id === userId || hasManageGuildPermission(permissions);
  const configuredRoleId = config?.ticket_role_id ?? config?.admin_role_id;
  const canSupport = canManage || Boolean(configuredRoleId && roleIds.has(String(configuredRoleId)));

  if (!canSupport) {
    throw new Response("Insufficient ticket permissions", { status: 403 });
  }

  return {
    userId,
    guildId,
    canManage,
    canSupport,
  };
}

export function jsonError(error: unknown) {
  if (error instanceof Response) return error;

  const message = error instanceof Error ? error.message : "";
  console.error("[dashboard/ticket-auth]", error);

  if (message === "DISCORD_BOT_TOKEN_MISSING") {
    return new Response("Ticket authorization is unavailable", { status: 503 });
  }

  if (message.startsWith("DISCORD_BOT_API_")) {
    return new Response("Discord authorization unavailable", { status: 502 });
  }

  return new Response("Internal server error", { status: 500 });
}
