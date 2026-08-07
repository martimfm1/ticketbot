import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/require-session";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { isValidDiscordId } from "@/lib/discord/validation";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["approved", "rejected"]);

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as Record<string, unknown>;
    const messageId = body.message_id;
    const guildId = body.guild_id;
    const status =
      typeof body.status === "string" ? body.status.toLowerCase() : "";

    if (
      !isValidDiscordId(messageId) ||
      !isValidDiscordId(guildId) ||
      !VALID_STATUSES.has(status)
    ) {
      return NextResponse.json({ error: "Invalid suggestion update" }, { status: 400 });
    }

    await assertGuildAccess(req, session, guildId);

    const { error } = await supabaseServer
      .from("suggestions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("message_id", messageId)
      .eq("guild_id", guildId);

    if (error) throw error;

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("[suggestions]", error);

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
              : "Failed to update suggestion",
      },
      { status },
    );
  }
}
