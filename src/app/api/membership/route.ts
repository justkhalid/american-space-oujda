import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET - admin only (list of membership requests)
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const r = await db.execute("SELECT * FROM Membership ORDER BY createdAt DESC LIMIT 200");
  return NextResponse.json({ members: r.rows.map((x) => row(x)) });
}

// POST - public (anyone can request membership)
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.fullName || !body.email || !body.type || !body.duration) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const id = "mem_" + Math.random().toString(36).slice(2, 12);
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO Membership (id, fullName, email, phone, type, duration, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)`,
    args: [
      id,
      body.fullName,
      body.email,
      body.phone || null,
      body.type,
      body.duration,
      new Date().toISOString(),
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Membership WHERE id = ?", args: [id] });
  const m = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ membership: m }, { status: 201 });
}
