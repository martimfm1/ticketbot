import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const SNOWFLAKE = /^\d{17,20}$/;

function cleanSnowflake(value: unknown): string | null {
  const normalized = value == null ? "" : String(value);
  return SNOWFLAKE.test(normalized) ? normalized : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      guild_id,
      ticket_category_id,
      admin_role_name,
      admin_role_id,
      ticket_role_id,
      transcript_channel_id,
      language,
      security_config,
    } = body;

    const guildId = cleanSnowflake(guild_id);

    if (!guildId) {
      return NextResponse.json(
        { error: "Guild ID obrigatório" },
        { status: 400 },
      );
    }

    const serverPayload: Record<string, unknown> = {
      guild_id: guildId,
    };

    if (ticket_category_id !== undefined) {
      serverPayload.ticket_category_id = cleanSnowflake(ticket_category_id);
    }

    if (admin_role_name !== undefined) {
      serverPayload.admin_role_name = admin_role_name || null;
    }

    if (admin_role_id !== undefined) {
      serverPayload.admin_role_id = cleanSnowflake(admin_role_id);
    }

    if (ticket_role_id !== undefined) {
      serverPayload.ticket_role_id = cleanSnowflake(ticket_role_id);
    }

    if (transcript_channel_id !== undefined) {
      serverPayload.transcript_channel_id = cleanSnowflake(transcript_channel_id);
    }

    if (language !== undefined) {
      serverPayload.language = language;
    }

    const { error: serverError } = await supabaseServer
      .from("servers")
      .upsert(serverPayload, { onConflict: "guild_id" });

    if (serverError) throw serverError;

    if (security_config !== undefined) {
      const { error: secError } = await supabaseServer
        .from("security_configs")
        .upsert(
          {
            guild_id: guildId,
            config: security_config,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "guild_id" },
        );

      if (secError) throw secError;
    }

    return NextResponse.json({ success: true, guildId });
  } catch (err: unknown) {
    console.error("[server-config]", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro de servidor",
      },
      { status: 500 },
    );
  }
}
