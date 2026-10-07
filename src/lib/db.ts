import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Standard Vercel pattern: create PrismaClient at module load time.
// Vercel reuses warm function instances, so we cache on globalThis to avoid
// creating new clients on every request.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // During build time, DATABASE_URL might not be available yet.
    // Return a stub PrismaClient - it won't actually be called at build time.
    console.warn("[db] No DATABASE_URL - returning stub client (build-time)");
    return new PrismaClient();
  }

  // Production: libSQL adapter (Turso)
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    console.log("[db] Connecting to Turso libSQL");
    const libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }

  // Local dev: SQLite file
  console.log("[db] Using local SQLite:", url);
  return new PrismaClient({
    log: process.env.NODE_ENV !== "production" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client on globalThis in dev to prevent multiple instances on hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
