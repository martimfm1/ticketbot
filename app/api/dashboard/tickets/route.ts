import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase";
import { jsonError, requireTicketAccess } from "@/lib/dashboard/ticket-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SNOWFLAKE = /^\d{17,20}$/;
const ALLOWED_STATUS = new Set(["open", "pending", "closed"]);
const ALLOWED_PRIORITY = new Set(["low", "normal", "high", "urgent"]);

function normalizeTicket(ticket: Record<string, any>) {
  return {
    channelId: String(ticket.channel_id),
    guildId: ticket.guild_id == null ? null : String(ticket.guild_id),
    userId: String(ticket.user_id),
    subject: ticket.subject ?? null,
    status: ticket.status ?? "open",
    priority: ticket.priority ?? "normal",
    openedAt: ticket.opened_at,
    closedAt: ticket.closed_at ?? null,
    claimedBy: ticket.claimed_by == null ? null : String(ticket.claimed_by),
    assignedTo: ticket.assigned_to == null ? null : String(ticket.assigned_to),
    claimedAt: ticket.claimed_at ?? null,
    lastActivityAt: ticket.last_activity_at ?? null,
    closedBy: ticket.closed_by == null ? null : String(ticket.closed_by),
    resolutionNote: ticket.resolution_note ?? null,
    updatedAt: ticket.updated_at ?? null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId") ?? "";
    const status = searchParams.get("status")?.toLowerCase();
    const priority = searchParams.get("priority")?.toLowerCase();
    const requestedLimit = Number(searchParams.get("limit") ?? 100);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 100;

    if (!SNOWFLAKE.test(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }

    await requireTicketAccess(guildId);

    let query = supabaseServer
      .from("tickets")
      .select(
        "channel_id, guild_id, user_id, subject, status, opened_at, closed_at, claimed_by, priority, assigned_to, claimed_at, last_activity_at, closed_by, resolution_note, updated_at",
      )
      .eq("guild_id", guildId)
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .order("opened_at", { ascending: false })
      .limit(limit);

    if (status && ALLOWED_STATUS.has(status)) query = query.eq("status", status);
    if (priority && ALLOWED_PRIORITY.has(priority)) query = query.eq("priority", priority);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      { tickets: (data ?? []).map(normalizeTicket) },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-SILENTRA-Ticket-API": "v1",
        },
      },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const guildId = String(body.guildId ?? "");
    const channelId = String(body.channelId ?? "");
    const action = String(body.action ?? "").toLowerCase();

    if (!SNOWFLAKE.test(guildId) || !SNOWFLAKE.test(channelId)) {
      return NextResponse.json({ error: "Invalid ticket identifier" }, { status: 400 });
    }

    const access = await requireTicketAccess(guildId);
    const payload: Record<string, unknown> = {};
    let eventPayload: Record<string, unknown> = {};

    switch (action) {
      case "claim":
        payload.claimed_by = access.userId;
        payload.assigned_to = access.userId;
        payload.claimed_at = new Date().toISOString();
        payload.status = "open";
        eventPayload = { assigned_to: access.userId };
        break;
      case "unclaim":
        payload.claimed_by = null;
        payload.assigned_to = null;
        payload.claimed_at = null;
        break;
      case "close":
        payload.status = "closed";
        payload.closed_at = new Date().toISOString();
        payload.closed_by = access.userId;
        payload.resolution_note = body.note ? String(body.note).slice(0, 1000) : null;
        eventPayload = { note: payload.resolution_note };
        break;
      case "reopen":
        payload.status = "open";
        payload.closed_at = null;
        payload.closed_by = null;
        break;
      case "priority": {
        const value = String(body.priority ?? "normal").toLowerCase();
        if (!ALLOWED_PRIORITY.has(value)) {
          return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
        }
        payload.priority = value;
        eventPayload = { priority: value };
        break;
      }
      case "status": {
        const value = String(body.status ?? "open").toLowerCase();
        if (!ALLOWED_STATUS.has(value)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        payload.status = value;
        if (value === "closed") {
          payload.closed_at = new Date().toISOString();
          payload.closed_by = access.userId;
        }
        eventPayload = { status: value };
        break;
      }
      case "assign": {
        if (!access.canManage) {
          return NextResponse.json({ error: "Only server managers can assign tickets" }, { status: 403 });
        }
        const assignedTo = body.userId ? String(body.userId) : null;
        if (assignedTo && !SNOWFLAKE.test(assignedTo)) {
          return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
        }
        payload.assigned_to = assignedTo;
        payload.claimed_by = assignedTo;
        payload.claimed_at = assignedTo ? new Date().toISOString() : null;
        eventPayload = { assigned_to: assignedTo };
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown ticket action" }, { status: 400 });
    }

    const { data: ticket, error: ticketError } = await supabaseServer
      .from("tickets")
      .update(payload)
      .eq("guild_id", guildId)
      .eq("channel_id", channelId)
      .select("*")
      .maybeSingle();

    if (ticketError) throw ticketError;
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found", guildId, channelId },
        { status: 404 },
      );
    }

    const { error: eventError } = await supabaseServer.from("ticket_events").insert({
      guild_id: guildId,
      channel_id: channelId,
      event_type: `dashboard.${action}`,
      actor_id: access.userId,
      payload: eventPayload,
      status: "pending",
    });

    if (eventError) throw eventError;

    return NextResponse.json(
      { success: true, ticket: normalizeTicket(ticket) },
      { headers: { "X-SILENTRA-Ticket-API": "v1" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
