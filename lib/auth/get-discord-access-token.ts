import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getDiscordAccessToken(request: Request): Promise<string | null> {
  const nextRequest = request instanceof NextRequest ? request : new NextRequest(request);
  const token = await getToken({
    req: nextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return typeof token?.accessToken === "string" ? token.accessToken : null;
}
