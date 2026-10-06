import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Vercel-friendly Prisma client.
// Creates the client lazily on first query to avoid evaluating env vars at build time.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _client: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("[db] DATABASE_URL is not set!");
    console.error("[db] Available env vars:", Object.keys(process.env).filter(k => !k.startsWith("NEXT_")).sort());
    throw new Error("DATABASE_URL is not set. Check Vercel Environment Variables.");
  }

  // If it's a libsql:// URL (production / Turso), use the libSQL adapter
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    console.log("[db] Connecting to Turso:", url);
    const libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }

  // Otherwise: local SQLite file (dev)
  console.log("[db] Using local SQLite:", url);
  return new PrismaClient({
    log: process.env.NODE_ENV !== "production" ? ["query", "error", "warn"] : ["error"],
  });
}

// Lazy getter — only creates the client on first access
function getClient(): PrismaClient {
  if (!_client) {
    _client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _client;
    }
  }
  return _client;
}

// Export a proxy so the client is created lazily on first query
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
