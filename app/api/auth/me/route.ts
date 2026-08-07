import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  return NextResponse.json(
    {
      id: session.user.id,
      name: session.user.name,
      username: session.user.name,
      image: session.user.image,
    },
    {
      status: 200,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}
