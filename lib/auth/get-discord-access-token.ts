import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "__Secure-next-auth.session-token";

export async function getDiscordAccessToken(request: Request): Promise<string | null> {
  const nextRequest = request instanceof NextRequest ? request : new NextRequest(request);
  const token = await getToken({
    req: nextRequest,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    secureCookie: true,
  });

  return typeof token?.accessToken === "string" && token.accessToken.length > 0
    ? token.accessToken
    : null;
}
