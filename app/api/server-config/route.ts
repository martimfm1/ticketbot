import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guild_id, ticket_category_id, admin_role_name, transcript_channel_id, language, security_config } = body;

    if (!guild_id) {
      return NextResponse.json({ error: "Guild ID obrigatório" }, { status: 400 });
    }

    // 1. Atualizar definições gerais do servidor
    const serverPayload: any = { guild_id };
    if (ticket_category_id !== undefined) serverPayload.ticket_category_id = ticket_category_id ? Number(ticket_category_id) : null;
    if (admin_role_name !== undefined) serverPayload.admin_role_name = admin_role_name;
    if (transcript_channel_id !== undefined) serverPayload.transcript_channel_id = transcript_channel_id ? Number(transcript_channel_id) : null;
    if (language !== undefined) serverPayload.language = language;

    const { error: serverError } = await supabaseServer
      .from("servers")
      .upsert(serverPayload, { onConflict: "guild_id" });

    if (serverError) throw serverError;

    // 2. Atualizar definições de segurança (se fornecidas)
    if (security_config !== undefined) {
      const { error: secError } = await supabaseServer
        .from("security_configs")
        .upsert(
          { guild_id: Number(guild_id), config: security_config, updated_at: new Date().toISOString() },
          { onConflict: "guild_id" }
        );
      if (secError) throw secError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro de servidor" }, { status: 500 });
  }
}