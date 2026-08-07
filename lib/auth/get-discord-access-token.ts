import { getToken } from "next-auth/jwt";

export async function getDiscordAccessToken(
  request: Request,
): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return typeof token?.accessToken === "string"
    ? token.accessToken
    : null;
}
