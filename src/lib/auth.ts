import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "@/lib/auth-db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[auth] authorize called for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] missing email or password");
          return null;
        }

        const user = await findUserByEmail(credentials.email);
        if (!user) {
          console.log("[auth] no user found");
          return null;
        }

        if (!user.active) {
          console.log("[auth] user inactive");
          return null;
        }

        const ok = await verifyPassword(credentials.password, user.password);
        console.log("[auth] bcrypt match:", ok);
        if (!ok) return null;

        console.log("[auth] login successful for:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        } as unknown as { id: string; email: string; name?: string | null; role: string };
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
