// Direct libSQL client - bypasses Prisma entirely.
// More reliable on Vercel serverless where Prisma client caching causes issues.

import { createClient, type Client, type InValue } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Re-export so callers can type their args arrays without depending on
// `@libsql/client` directly.
export type { InValue };

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.DATABASE_URL;
  const token = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Local dev: file-based SQLite (sync API not available, but libsql/client supports file: URLs)
  if (url.startsWith("file:")) {
    _client = createClient({ url });
    return _client;
  }

  // Production: Turso libSQL
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    _client = createClient({ url, authToken: token });
    return _client;
  }

  throw new Error(`Unsupported DATABASE_URL scheme: ${url}`);
}

// Helper to convert libsql rows (which use unknown types) into plain objects
export function row<T = Record<string, unknown>>(r: { [key: string]: unknown }): T {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(r)) {
    const v = r[k];
    if (typeof v === "bigint") out[k] = Number(v);
    else if (v instanceof Uint8Array) out[k] = new TextDecoder().decode(v);
    else out[k] = v;
  }
  return out as T;
}

// ============================================================
// AUTH / ROLE HELPERS
// ============================================================

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
};

// Look up the currently-authenticated user from the NextAuth session + DB.
// Returns null if there is no session, no matching user, or the user is inactive.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT id, email, name, role, active FROM User WHERE email = ?",
    args: [session.user.email],
  });
  if (r.rows.length === 0) return null;
  const u = row<{ id: string; email: string; name: string | null; role: string; active: number }>(
    r.rows[0] as Record<string, unknown>
  );
  if (!u.active) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    active: !!u.active,
  };
}

export type RequireRoleResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: Response };

// Check that the current user is signed in AND has one of the allowed roles.
// Returns a discriminated union - callers do `if (!auth.ok) return auth.response;`.
export async function requireRole(roles: string[]): Promise<RequireRoleResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  if (!roles.includes(user.role)) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "FORBIDDEN" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { ok: true, user };
}
