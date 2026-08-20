import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assertGuildAccess } from "@/lib/discord/guild-access";
import { requireGuildFeature } from "@/lib/billing/require-feature";
import type { BillingFeature } from "@/lib/billing/entitlements";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESOURCE_CONFIG = {
  forms: { table: "ticket_forms", feature: "ticket_forms", order: "sort_order" },
  teams: { table: "ticket_teams", feature: "teams", order: "created_at" },
  tags: { table: "ticket_tags", feature: "tags", order: "created_at" },
  "canned-responses": { table: "ticket_canned_responses", feature: "canned_responses", order: "created_at" },
  automations: { table: "ticket_automations", feature: "automations", order: "created_at" },
  sla: { table: "ticket_sla_policies", feature: "sla", order: "created_at" },
  knowledge: { table: "knowledge_articles", feature: "knowledge_base", order: "updated_at" },
  csat: { table: "ticket_csat", feature: "csat", order: "created_at" },
} as const satisfies Record<string, { table: string; feature: BillingFeature; order: string }>;

type ResourceKey = keyof typeof RESOURCE_CONFIG;

type RouteContext = { params: Promise<{ resource: string }> };

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function validateGuildId(value: string | null): value is string {
  return Boolean(value && /^\d{17,20}$/.test(value));
}

async function authForGuild(guildId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Response("Unauthorized", { status: 401 });
  await assertGuildAccess(session, guildId);
  return session;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const config = RESOURCE_CONFIG[resource as ResourceKey];
    if (!config) return jsonError("Unknown platform resource", 404);

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId");
    if (!validateGuildId(guildId)) return jsonError("Invalid guildId", 400);

    await authForGuild(guildId);
    await requireGuildFeature(guildId, config.feature);

    const { data, error } = await supabaseServer
      .from(config.table)
      .select("*")
      .eq("guild_id", guildId)
      .order(config.order, { ascending: resource === "forms" ? true : false });

    if (error) throw error;
    return NextResponse.json({ resource, items: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[platform/get]", error);
    return jsonError("Failed to load platform resource");
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const config = RESOURCE_CONFIG[resource as ResourceKey];
    if (!config) return jsonError("Unknown platform resource", 404);

    const body = await request.json().catch(() => ({}));
    const guildId = typeof body.guildId === "string" ? body.guildId : "";
    if (!validateGuildId(guildId)) return jsonError("Invalid guildId", 400);

    const session = await authForGuild(guildId);
    await requireGuildFeature(guildId, config.feature);

    const payload = { ...body };
    delete payload.guildId;
    delete payload.id;
    payload.guild_id = guildId;
    payload.created_by ??= session.user?.id ?? null;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer.from(config.table).insert(payload).select().single();
    if (error) throw error;

    await supabaseServer.from("ticket_audit_logs").insert({
      guild_id: guildId,
      actor_id: session.user?.id ?? null,
      action: `platform.${resource}.created`,
      target_type: resource,
      target_id: String(data.id),
      metadata: { id: data.id },
    });

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[platform/post]", error);
    return jsonError("Failed to create platform resource");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const config = RESOURCE_CONFIG[resource as ResourceKey];
    if (!config) return jsonError("Unknown platform resource", 404);

    const body = await request.json().catch(() => ({}));
    const guildId = typeof body.guildId === "string" ? body.guildId : "";
    const id = typeof body.id === "string" ? body.id : "";
    if (!validateGuildId(guildId) || !id) return jsonError("guildId and id are required", 400);

    const session = await authForGuild(guildId);
    await requireGuildFeature(guildId, config.feature);

    const payload = { ...body };
    delete payload.guildId;
    delete payload.id;
    delete payload.guild_id;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from(config.table)
      .update(payload)
      .eq("id", id)
      .eq("guild_id", guildId)
      .select()
      .single();
    if (error) throw error;

    await supabaseServer.from("ticket_audit_logs").insert({
      guild_id: guildId,
      actor_id: session.user?.id ?? null,
      action: `platform.${resource}.updated`,
      target_type: resource,
      target_id: id,
      metadata: { id },
    });

    return NextResponse.json({ item: data });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[platform/patch]", error);
    return jsonError("Failed to update platform resource");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const config = RESOURCE_CONFIG[resource as ResourceKey];
    if (!config) return jsonError("Unknown platform resource", 404);

    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId");
    const id = searchParams.get("id");
    if (!validateGuildId(guildId) || !id) return jsonError("guildId and id are required", 400);

    const session = await authForGuild(guildId);
    await requireGuildFeature(guildId, config.feature);

    const { error } = await supabaseServer.from(config.table).delete().eq("id", id).eq("guild_id", guildId);
    if (error) throw error;

    await supabaseServer.from("ticket_audit_logs").insert({
      guild_id: guildId,
      actor_id: session.user?.id ?? null,
      action: `platform.${resource}.deleted`,
      target_type: resource,
      target_id: id,
      metadata: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[platform/delete]", error);
    return jsonError("Failed to delete platform resource");
  }
}
