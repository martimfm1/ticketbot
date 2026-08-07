import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: AuthOptions = {
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.discordId = account.providerAccountId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.discordId as string) ??
          (token.sub as string);

        session.user.accessToken =
          token.accessToken as string | undefined;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };