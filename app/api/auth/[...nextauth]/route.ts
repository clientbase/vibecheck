// eslint-disable-next-line @typescript-eslint/no-explicit-any
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verify } from "argon2";
import type { Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" as const },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = (creds?.email || "").toString().toLowerCase();
        const password = (creds?.password || "").toString();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await verify(user.passwordHash, password);
        return ok ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }: { session: Session; user?: AdapterUser; token?: JWT }) {
      if (user) {
        session.user.id = user.id;
        session.user.role = (user as AdapterUser & { role?: string }).role || "user";
      }
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export async function GET(request: Request) {
  return handler(request);
}
export async function POST(request: Request) {
  return handler(request);
}
