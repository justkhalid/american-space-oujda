import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// POST - any authenticated user: heartbeat, marks them online.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER", "EDITOR", "LIBRARY", "INTERN"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const db = getDb();
  await db.execute({
    sql: "UPDATE User SET lastSeenAt = ? WHERE id = ?",
    args: [new Date().toISOString(), user.id],
  });
  return NextResponse.json({ ok: true });
}

// GET - admin: who is online (active in the last 5 minutes) + last-seen list.
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = getDb();
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const r = await db.execute({
    sql: `SELECT id, name, email, role, lastSeenAt FROM User WHERE lastSeenAt IS NOT NULL ORDER BY lastSeenAt DESC`,
    args: [],
  });
  const users = r.rows.map((x) => row(x));
  return NextResponse.json({
    online: users.filter((u) => String(u.lastSeenAt) >= cutoff),
    recent: users.filter((u) => String(u.lastSeenAt) < cutoff).slice(0, 10),
  });
}
