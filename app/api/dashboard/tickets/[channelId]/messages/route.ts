import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase";
import { jsonError, requireTicketAccess } from "@/lib/dashboard/ticket-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SNOWFLAKE = /^\d{17,20}$/;
const DISCORD_API = "https://discord.com/api/v10";

type DiscordMessage = {
  id: string;
  author?: { id?: string; username?: string; global_name?: string | null; bot?: boolean };
  content?: string;
  timestamp?: string;
  edited_timestamp?: string | null;
  attachments?: Array<{ url: string }>;
};

async function backfillDiscordMessages(guildId: string, channelId: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return;

  const response = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages?limit=100`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("[dashboard/messages] Discord history fetch failed", {
      guildId,
      channelId,
      status: response.status,
    });
    return;
  }

  const messages = (await response.json()) as DiscordMessage[];
  if (!Array.isArray(messages) || messages.length === 0) return;

  const rows = messages
    .filter((message) => message.author?.id && !message.author.bot)
    .map((message) => ({
      guild_id: guildId,
      channel_id: channelId,
      message_id: message.id,
      author_id: message.author!.id!,
      author_name: message.author!.global_name ?? message.author!.username ?? message.author!.id!,
      content: (message.content ?? "").slice(0, 4000),
      created_at: message.timestamp ?? new Date().toISOString(),
      edited_at: message.edited_timestamp ?? null,
      attachment_count: message.attachments?.length ?? 0,
      metadata: {
        attachments: (message.attachments ?? []).map((attachment) => attachment.url),
      },
    }));

  if (rows.length === 0) return;

  const { error } = await supabaseServer
    .from("ticket_messages")
    .upsert(rows, { onConflict: "message_id" });

  if (error) {
    console.error("[dashboard/messages] Backfill failed", {
      channelId,
      error,
    });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ channelId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId") ?? "";
    const { channelId } = await context.params;

    if (!SNOWFLAKE.test(guildId) || !SNOWFLAKE.test(channelId)) {
      return NextResponse.json({ error: "Invalid ticket identifier" }, { status: 400 });
    }

    await requireTicketAccess(guildId);

    let { data, error } = await supabaseServer
      .from("ticket_messages")
      .select(
        "id, channel_id, message_id, author_id, author_name, content, created_at, edited_at, attachment_count, metadata",
      )
      .eq("guild_id", guildId)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(1000);

    if (error) throw error;

    if (!data || data.length === 0) {
      await backfillDiscordMessages(guildId, channelId);

      const refreshed = await supabaseServer
        .from("ticket_messages")
        .select(
          "id, channel_id, message_id, author_id, author_name, content, created_at, edited_at, attachment_count, metadata",
        )
        .eq("guild_id", guildId)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(1000);

      data = refreshed.data ?? [];
      error = refreshed.error;
      if (error) throw error;
    }

    return NextResponse.json(
      { messages: data ?? [] },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-SILENTRA-Ticket-Messages": "v1",
        },
      },
    );
  } catch (error) {
    return jsonError(error);
  }
}
