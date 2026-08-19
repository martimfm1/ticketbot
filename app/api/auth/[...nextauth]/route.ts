import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not configured in the production environment.");
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
        token.discordId = account.providerAccountId;
        console.info("[auth] Discord OAuth completed", {
          provider: account.provider,
          discordId: account.providerAccountId,
          hasAccessToken: Boolean(account.access_token),
          hasProfile: Boolean(profile),
        });
      }

      return token;
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
