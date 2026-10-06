import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Detect environment:
// - Local dev: DATABASE_URL=file:./db/custom.db → use plain PrismaClient
// - Production (Cloudflare Pages): DATABASE_URL=libsql://... → use libSQL adapter
//
// During build time, DATABASE_URL may be undefined — we return a no-op client
// in that case so the build doesn't crash trying to connect.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "";

  // During build time, DATABASE_URL might not be set yet — return a placeholder
  if (!url && process.env.NEXT_PHASE === "phase-production-build") {
    console.warn("[db] No DATABASE_URL during build — returning stub client");
    return new PrismaClient();
  }

  // If no URL at all (shouldn't happen at runtime), return stub
  if (!url) {
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

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
