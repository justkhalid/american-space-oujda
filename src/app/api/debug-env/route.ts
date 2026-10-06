import { NextResponse } from "next/server";

// Debug endpoint — safely shows what env vars are set (without revealing values).
// Delete this file after debugging is done.
export async function GET() {
  const envStatus = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET ✓" : "MISSING ✗",
    DATABASE_URL_starts_with_libsql: process.env.DATABASE_URL?.startsWith("libsql://") || false,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN ? "SET ✓" : "MISSING ✗",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "SET ✓" : "MISSING ✗",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET ✓" : "MISSING ✗",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(envStatus, { status: 200 });
}
