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
        console.log("[auth] authorize called for:", credentials?.email);
        console.log("[auth] DATABASE_URL present:", !!process.env.DATABASE_URL);
        console.log("[auth] DATABASE_URL value (first 30 chars):", process.env.DATABASE_URL?.slice(0, 30));
        console.log("[auth] NODE_ENV:", process.env.NODE_ENV);
        console.log("[auth] VERCEL_ENV:", process.env.VERCEL_ENV);

        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] missing email or password");
          return null;
        }
        try {
          console.log("[auth] querying database for user...");
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          console.log("[auth] user found:", user ? user.email : "NONE");
          if (!user || !user.password || !user.active) {
            console.log("[auth] no user, no password, or inactive");
            return null;
          }
          console.log("[auth] comparing passwords...");
          const ok = await bcrypt.compare(credentials.password, user.password);
          console.log("[auth] bcrypt match:", ok);
          if (!ok) return null;
          console.log("[auth] login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          } as unknown as { id: string; email: string; name?: string | null; role: string };
        } catch (e) {
          console.error("[auth] authorize error:", e instanceof Error ? e.message : e);
          console.error("[auth] full error:", e);
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
