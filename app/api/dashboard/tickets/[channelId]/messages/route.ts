import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase";
import { jsonError, requireTicketAccess } from "@/lib/dashboard/ticket-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SNOWFLAKE = /^\d{17,20}$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ channelId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId") ?? "";
    const { channelId } = await context.params;

    await requireTicketAccess(guildId);

    if (!SNOWFLAKE.test(channelId)) {
      return NextResponse.json({ error: "Invalid channelId" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("ticket_messages")
      .select("id, channel_id, message_id, author_id, author_name, content, created_at, edited_at, attachment_count, metadata")
      .eq("guild_id", guildId)
      .eq("channel_id", Number(channelId))
      .order("created_at", { ascending: true })
      .limit(1000);

    if (error) throw error;

    return NextResponse.json({ messages: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
