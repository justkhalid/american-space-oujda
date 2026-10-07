import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser } from "@/lib/sql";

// GET - any authenticated user. Returns all CompanionSetting as flat key→value.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();
  const r = await db.execute("SELECT key, value FROM CompanionSetting");
  const map: Record<string, string> = {};
  for (const raw of r.rows) {
    const s = row<{ key: string; value: string }>(raw as Record<string, unknown>);
    map[s.key] = s.value;
  }
  return NextResponse.json({ settings: map });
}

// PUT - admin only. Accepts a partial map of key→value pairs and upserts them all.
export async function PUT(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as Record<string, string>;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "object of {key: value} required" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const db = getDb();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    await db.execute({
      sql: `INSERT INTO CompanionSetting (key, value, updatedAt)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
      args: [key, value, now],
    });
  }
  const r = await db.execute("SELECT key, value FROM CompanionSetting");
  const map: Record<string, string> = {};
  for (const raw of r.rows) {
    const s = row<{ key: string; value: string }>(raw as Record<string, unknown>);
    map[s.key] = s.value;
  }
  return NextResponse.json({ settings: map });
}
