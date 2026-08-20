import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabase";
import { assertGuildAccess } from "@/lib/discord/guild-access";

const SNOWFLAKE = /^\d{17,20}$/;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function cleanSnowflake(value: unknown): string | null {
  const normalized = value == null ? "" : String(value);
  return SNOWFLAKE.test(normalized) ? normalized : null;
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (value == null) return null;
  const normalized = String(value).replace(/\u0000/g, "").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function cleanCustomization(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  const textFields: Record<string, number> = {
    panelTitle: 256,
    panelDescription: 4000,
    panelFooter: 2048,
    panelButtonLabel: 80,
    panelButtonEmoji: 16,
    ticketTitle: 256,
    ticketDescription: 4000,
    ticketFooter: 2048,
    welcomeMessage: 2000,
    modalTitle: 45,
    modalSubjectLabel: 45,
    modalSubjectPlaceholder: 100,
    channelPrefix: 20,
  };

  for (const [key, maxLength] of Object.entries(textFields)) {
    if (input[key] !== undefined) output[key] = cleanText(input[key], maxLength);
  }

  for (const key of ["panelColor", "ticketColor"]) {
    if (input[key] !== undefined) {
      const color = cleanText(input[key], 7);
      if (color && HEX_COLOR.test(color)) output[key] = color.toUpperCase();
    }
  }

  if (input.panelButtonStyle !== undefined) {
    const style = String(input.panelButtonStyle);
    if (["secondary", "primary", "success", "danger"].includes(style)) {
      output.panelButtonStyle = style;
    }
  }

  for (const key of ["mentionSupport", "allowUserAttachments"]) {
    if (input[key] !== undefined) output[key] = Boolean(input[key]);
  }

  return output;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      ticket_panel_config,
    } = body;

    const guildId = cleanSnowflake(guild_id);
    if (!guildId) {
      return NextResponse.json({ error: "Guild ID obrigatório" }, { status: 400 });
    }

    await assertGuildAccess(session, guildId);

    const serverPayload: Record<string, unknown> = { guild_id: guildId };
    if (ticket_category_id !== undefined) serverPayload.ticket_category_id = cleanSnowflake(ticket_category_id);
    if (admin_role_name !== undefined) serverPayload.admin_role_name = cleanText(admin_role_name, 100);
    if (admin_role_id !== undefined) serverPayload.admin_role_id = cleanSnowflake(admin_role_id);
    if (ticket_role_id !== undefined) serverPayload.ticket_role_id = cleanSnowflake(ticket_role_id);
    if (transcript_channel_id !== undefined) serverPayload.transcript_channel_id = cleanSnowflake(transcript_channel_id);
    if (language !== undefined) {
      const normalizedLanguage = String(language);
      if (!["en", "pt-PT", "pt-BR"].includes(normalizedLanguage)) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
      }
      serverPayload.language = normalizedLanguage;
    }
    if (ticket_panel_config !== undefined) {
      serverPayload.ticket_panel_config = cleanCustomization(ticket_panel_config);
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
    const message = err instanceof Error ? err.message : "";
    console.error("[server-config]", err);

    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "GUILD_ACCESS_DENIED" ? 403 :
      message === "DISCORD_BOT_TOKEN_MISSING" ? 503 : 500;

    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : message || "Server error" },
      { status },
    );
  }
}
