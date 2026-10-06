import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // Prisma adapter omitted for credentials-only flow (sessions stored in JWT)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // We handle the sign-in page ourselves via the SPA hash router (#/login)
  // so we don't set pages.signIn here — NextAuth will use its default which is fine
  // because signIn() is called with redirect:false from our custom form.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          if (!user || !user.password || !user.active) return null;
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          } as unknown as { id: string; email: string; name?: string | null; role: string };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production-please",
};

// Type augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email: string;
      name?: string | null;
      role?: string;
    };
  }
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
