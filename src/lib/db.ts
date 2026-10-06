import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Vercel-friendly Prisma client.
// Vercel supports full Node.js runtime, so no edge runtime hacks needed.
// We just create one client per environment based on DATABASE_URL.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "";

  if (!url) {
    console.error("[db] No DATABASE_URL set!");
    throw new Error("DATABASE_URL is not set");
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

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
