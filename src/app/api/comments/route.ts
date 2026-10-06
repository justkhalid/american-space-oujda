import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET — admin only
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const r = await db.execute("SELECT * FROM Comment ORDER BY createdAt DESC LIMIT 200");
  return NextResponse.json({ comments: r.rows.map((x) => row(x)) });
}

// POST — public (anyone can submit feedback)
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }
  const id = "cmt_" + Math.random().toString(36).slice(2, 12);
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO Comment (id, name, email, subject, message, category, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)`,
    args: [
      id,
      body.name,
      body.email || null,
      body.subject || "General",
      body.message,
      body.category || "general",
      new Date().toISOString(),
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Comment WHERE id = ?", args: [id] });
  const c = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ comment: c }, { status: 201 });
}
