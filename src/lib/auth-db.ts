// Direct libSQL client for authentication — bypasses Prisma entirely.
// This is more reliable on Vercel serverless where Prisma client caching can cause issues.

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  password: string;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const url = process.env.DATABASE_URL;
  const token = process.env.DATABASE_AUTH_TOKEN;

  console.log("[auth-db] DATABASE_URL present:", !!url);
  console.log("[auth-db] DATABASE_URL starts with libsql:", url?.startsWith("libsql://"));
  console.log("[auth-db] DATABASE_AUTH_TOKEN present:", !!token);

  if (!url || !url.startsWith("libsql://")) {
    console.error("[auth-db] DATABASE_URL missing or invalid");
    return null;
  }

  const client = createClient({ url, authToken: token });

  try {
    console.log("[auth-db] querying for:", email.toLowerCase());
    const result = await client.execute({
      sql: "SELECT id, email, name, password, role, active FROM User WHERE email = ?",
      args: [email.toLowerCase()],
    });

    console.log("[auth-db] rows returned:", result.rows.length);

    if (result.rows.length === 0) {
      console.log("[auth-db] no user found");
      return null;
    }

    const row = result.rows[0];
    const user: AuthUser = {
      id: String(row.id),
      email: String(row.email),
      name: row.name ? String(row.name) : null,
      password: String(row.password),
      role: String(row.role),
      active: row.active === 1 || row.active === true || row.active === 1n,
    };

    console.log("[auth-db] user found:", user.email, "role:", user.role, "active:", user.active);
    return user;
  } catch (e) {
    console.error("[auth-db] query error:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch (e) {
    console.error("[auth-db] bcrypt error:", e instanceof Error ? e.message : e);
    return false;
  }
}
