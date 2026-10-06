import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// GET — any authenticated user. Returns levels with their weeks (week count).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();
  const lvlR = await db.execute({
    sql: `SELECT l.*, (SELECT COUNT(*) FROM CompanionWeek w WHERE w.levelId = l.id) AS weekCount
          FROM CompanionLevel l
          ORDER BY l.sortOrder ASC, l.label ASC`,
    args: [],
  });
  const levels = lvlR.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    return {
      id: String(x.id),
      key: String(x.key ?? ""),
      label: String(x.label ?? ""),
      cefr: String(x.cefr ?? ""),
      sortOrder: Number(x.sortOrder ?? 0),
      weekCount: Number(x.weekCount ?? 0),
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
    };
  });
  return NextResponse.json({ levels });
}

// POST — admin only. Create a new level.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.label || !body.key) {
    return NextResponse.json({ error: "key and label required" }, { status: 400 });
  }
  const id = "lvl_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO CompanionLevel (id, key, label, cefr, sortOrder, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.key, body.label, body.cefr || "", sortOrder, now, now],
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionLevel WHERE id = ?", args: [id] });
  const level = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ level }, { status: 201 });
}

// PATCH — admin only. Update level fields.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];
  if (data.key !== undefined) { sets.push("key = ?"); args.push(data.key); }
  if (data.label !== undefined) { sets.push("label = ?"); args.push(data.label); }
  if (data.cefr !== undefined) { sets.push("cefr = ?"); args.push(data.cefr); }
  if (data.sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(Number(data.sortOrder)); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE CompanionLevel SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionLevel WHERE id = ?", args: [id] });
  const level = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ level });
}

// DELETE — admin only. Removes a level (and cascades weeks via SQL or manually).
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM CompanionWeek WHERE levelId = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM CompanionLevel WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
