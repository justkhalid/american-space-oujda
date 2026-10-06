import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// GET — any authenticated user; teachers only see their own classes
// (matched by teacherId === user.id OR teacherId === user.name).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();
  let r;
  if (user.role === "TEACHER") {
    r = await db.execute({
      sql: `SELECT * FROM CompanionClass
            WHERE active = 1 AND (teacherId = ? OR teacherId = ?)
            ORDER BY levelKey, name`,
      args: [user.id, user.name ?? ""],
    });
  } else {
    r = await db.execute({
      sql: `SELECT * FROM CompanionClass ORDER BY active DESC, levelKey, name`,
      args: [],
    });
  }
  const classes = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    return {
      id: String(x.id),
      name: String(x.name ?? ""),
      levelKey: String(x.levelKey ?? ""),
      teacherId: String(x.teacherId ?? ""),
      schedule: x.schedule ?? "",
      room: x.room ?? "",
      students: Number(x.students ?? 0),
      active: Number(x.active) === 1,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
    };
  });
  return NextResponse.json({ classes });
}

// POST — admin only.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.name || !body.levelKey) {
    return NextResponse.json({ error: "name and levelKey required" }, { status: 400 });
  }
  const id = "cls_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO CompanionClass (id, name, levelKey, teacherId, schedule, room, students, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.name,
      body.levelKey,
      body.teacherId || "",
      body.schedule || "",
      body.room || "",
      Number(body.students) || 0,
      body.active === false ? 0 : 1,
      now,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionClass WHERE id = ?", args: [id] });
  const cls = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ class: cls }, { status: 201 });
}

// PATCH — admin only.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];
  if (data.name !== undefined) { sets.push("name = ?"); args.push(data.name); }
  if (data.levelKey !== undefined) { sets.push("levelKey = ?"); args.push(data.levelKey); }
  if (data.teacherId !== undefined) { sets.push("teacherId = ?"); args.push(data.teacherId); }
  if (data.schedule !== undefined) { sets.push("schedule = ?"); args.push(data.schedule); }
  if (data.room !== undefined) { sets.push("room = ?"); args.push(data.room); }
  if (data.students !== undefined) { sets.push("students = ?"); args.push(Number(data.students) || 0); }
  if (data.active !== undefined) { sets.push("active = ?"); args.push(data.active ? 1 : 0); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE CompanionClass SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionClass WHERE id = ?", args: [id] });
  const cls = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ class: cls });
}

// DELETE — admin only.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM CompanionClass WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
