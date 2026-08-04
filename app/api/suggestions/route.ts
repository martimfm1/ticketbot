import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH(req: Request) {
  try {
    const { message_id, status } = await req.json();

    if (!message_id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("suggestions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("message_id", message_id);

    if (error) throw error;

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 });
  }
}