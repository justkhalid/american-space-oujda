import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Lazy Prisma client — only connects to the database when actually queried,
// not when the module is imported. This prevents build-time crashes when
// DATABASE_URL isn't available during static page generation.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "";

  // If no URL (e.g. during build), return a stub that won't actually connect
  // until someone calls a method on it
  if (!url) {
    console.warn("[db] No DATABASE_URL — returning stub PrismaClient");
    return new PrismaClient();
  }

  // If it's a libsql:// URL, use the libSQL adapter (production / Turso)
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }

  // Otherwise: local SQLite file
  return new PrismaClient({
    log: process.env.NODE_ENV !== "production" ? ["query"] : [],
  });
}

// Use a Proxy that lazily creates the client on first access
// This prevents the URL_INVALID error during build static page generation
let _client: PrismaClient | null = null;
function getClient(): PrismaClient {
  if (!_client) {
    _client = createPrismaClient();
  }
  return _client;
}

// Export a proxy that lazily initializes on first property access
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as never as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = getClient();
