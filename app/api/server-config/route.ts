import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabase";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { planHasFeature } from "@/lib/billing/entitlements";
import { TicketStripeService } from "@/services/billing/ticket-stripe.service";

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
    if (input[key] === undefined) continue;
    const color = cleanText(input[key], 7);
    if (color && HEX_COLOR.test(color)) output[key] = color.toUpperCase();
  }

  if (
    input.panelButtonStyle !== undefined &&
    ["secondary", "primary", "success", "danger"].includes(String(input.panelButtonStyle))
  ) {
    output.panelButtonStyle = String(input.panelButtonStyle);
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
    return new URL(origin).origin === new URL(request.url).origin;
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
    const guildId = cleanSnowflake(body?.guild_id);
    if (!guildId) {
      return NextResponse.json({ error: "Guild ID obrigatório" }, { status: 400 });
    }

    await assertGuildAccess(session, guildId);

    const plan = await TicketStripeService.getEffectivePlan(guildId);
    if (body.ticket_panel_config !== undefined && !planHasFeature(plan, "custom_branding")) {
      return NextResponse.json(
        { error: "A personalização de painéis requer um plano com custom branding." },
        { status: 402 },
      );
    }

    const payload: Record<string, unknown> = { guild_id: guildId };
    if (body.ticket_category_id !== undefined) payload.ticket_category_id = cleanSnowflake(body.ticket_category_id);
    if (body.admin_role_name !== undefined) payload.admin_role_name = cleanText(body.admin_role_name, 100);
    if (body.admin_role_id !== undefined) payload.admin_role_id = cleanSnowflake(body.admin_role_id);
    if (body.ticket_role_id !== undefined) payload.ticket_role_id = cleanSnowflake(body.ticket_role_id);
    if (body.transcript_channel_id !== undefined) payload.transcript_channel_id = cleanSnowflake(body.transcript_channel_id);
    if (body.language !== undefined) {
      const value = String(body.language);
      if (!["en", "pt-PT", "pt-BR"].includes(value)) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
      }
      payload.language = value;
    }
    if (body.ticket_panel_config !== undefined) payload.ticket_panel_config = cleanCustomization(body.ticket_panel_config);

    const { error } = await supabaseServer.from("servers").upsert(payload, { onConflict: "guild_id" });
    if (error) throw error;

    if (body.security_config !== undefined) {
      const { error: securityError } = await supabaseServer
        .from("security_configs")
        .upsert(
          {
            guild_id: guildId,
            config: body.security_config,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "guild_id" },
        );
      if (securityError) throw securityError;
    }

    return NextResponse.json(
      { success: true, guildId, plan },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[server-config]", error);
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "GUILD_ACCESS_DENIED" ? 403 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : message },
      { status },
    );
  }
}
