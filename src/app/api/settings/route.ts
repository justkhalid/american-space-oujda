import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET — public (returns all site settings as a flat key→value map)
export async function GET() {
  const db = getDb();
  const r = await db.execute("SELECT key, value FROM SiteSetting");
  const map: Record<string, string> = {};
  for (const raw of r.rows) {
    const s = row<{ key: string; value: string }>(raw as Record<string, unknown>);
    map[s.key] = s.value;
  }
  return NextResponse.json({ settings: map });
}

export async function PUT(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as { key: string; value: string; category?: string };
  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const db = getDb();
  await db.execute({
    sql: `INSERT INTO SiteSetting (key, value, category, updatedAt)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    args: [body.key, body.value, body.category || "general", new Date().toISOString()],
  });
  return NextResponse.json({
    setting: { key: body.key, value: body.value, category: body.category || "general" },
  });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM SiteSetting WHERE key = ?", args: [key] });
  return NextResponse.json({ ok: true });
}
