import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { isValidDiscordId } from "@/lib/discord/validation";
import { assertSameOrigin } from "@/lib/security/request-origin";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONFIG_BYTES = 12_000;

function isSafeString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireSession();
    const body = (await req.json()) as Record<string, unknown>;
    const { guild_id, ticket_category_id, admin_role_name, transcript_channel_id, language, security_config } = body;

    if (!isValidDiscordId(guild_id)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }

    await assertGuildAccess(req, session, guild_id);

    if (ticket_category_id !== undefined && ticket_category_id !== null && !isValidDiscordId(String(ticket_category_id))) {
      return NextResponse.json({ error: "Invalid ticket category" }, { status: 400 });
    }

    if (transcript_channel_id !== undefined && transcript_channel_id !== null && !isValidDiscordId(String(transcript_channel_id))) {
      return NextResponse.json({ error: "Invalid transcript channel" }, { status: 400 });
    }

    if (admin_role_name !== undefined && !isSafeString(admin_role_name, 100)) {
      return NextResponse.json({ error: "Invalid admin role" }, { status: 400 });
    }

    if (language !== undefined && !isSafeString(language, 10)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    if (security_config !== undefined && JSON.stringify(security_config).length > MAX_CONFIG_BYTES) {
      return NextResponse.json({ error: "Security configuration is too large" }, { status: 413 });
    }

    const serverPayload: Record<string, unknown> = { guild_id };
    if (ticket_category_id !== undefined) serverPayload.ticket_category_id = ticket_category_id ? String(ticket_category_id) : null;
    if (admin_role_name !== undefined) serverPayload.admin_role_name = admin_role_name;
    if (transcript_channel_id !== undefined) serverPayload.transcript_channel_id = transcript_channel_id ? String(transcript_channel_id) : null;
    if (language !== undefined) serverPayload.language = language;

    const { error: serverError } = await supabaseServer.from("servers").upsert(serverPayload, { onConflict: "guild_id" });
    if (serverError) throw serverError;

    if (security_config !== undefined) {
      const { error: secError } = await supabaseServer
        .from("security_configs")
        .upsert({ guild_id, config: security_config, updated_at: new Date().toISOString() }, { onConflict: "guild_id" });
      if (secError) throw secError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[server-config]", error);

    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" || message === "DISCORD_OAUTH_TOKEN_MISSING" || message === "DISCORD_AUTHORIZATION_EXPIRED"
        ? 401
        : message === "GUILD_ACCESS_DENIED" || message === "INVALID_REQUEST_ORIGIN"
          ? 403
          : 500;

    return NextResponse.json(
      {
        error: status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : "Failed to update server configuration",
      },
      { status },
    );
  }
}
