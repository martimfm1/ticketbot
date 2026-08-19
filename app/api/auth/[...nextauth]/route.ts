import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { JWT } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not configured in the production environment.");
}

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

async function refreshDiscordAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      authError: "RefreshTokenMissing",
    };
  }

  try {
    const response = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID ?? "",
        client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    };

    if (!response.ok || !data.access_token) {
      console.error("[auth] Discord token refresh failed", {
        status: response.status,
        error: data.error ?? "unknown",
      });

      return {
        ...token,
        authError: "RefreshAccessTokenError",
      };
    }

    console.info("[auth] Discord access token refreshed", {
      discordId: token.discordId ?? null,
    });

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + (data.expires_in ?? 604800) * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
      authError: undefined,
    };
  } catch (error) {
    console.error("[auth] Discord token refresh exception", error);

    return {
      ...token,
      authError: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  secret: NEXTAUTH_SECRET,

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires =
          account.expires_at != null
            ? account.expires_at * 1000
            : Date.now() + 604800000;
        token.discordId = account.providerAccountId;
        token.authError = undefined;

        console.info("[auth] Discord OAuth completed", {
          provider: account.provider,
          discordId: account.providerAccountId,
          hasAccessToken: Boolean(account.access_token),
          hasRefreshToken: Boolean(account.refresh_token),
          hasProfile: Boolean(profile),
        });

        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60_000
      ) {
        return token;
      }

      return refreshDiscordAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.discordId as string | undefined) ??
          (token.sub as string | undefined) ??
          "";

        session.user.accessToken =
          token.accessToken as string | undefined;
      }

      console.info("[auth] Session built", {
        userId: session.user?.id ?? null,
        hasAccessToken: Boolean(session.user?.accessToken),
        authError: token.authError ?? null,
      });

      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      console.info("[auth] signIn", {
        userId: user.id,
        provider: account?.provider ?? null,
      });
    },
  },

  session: {
    strategy: "jwt",
  },

  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
