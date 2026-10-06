import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser } from "@/lib/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const user = await getCurrentUser();
  const db = getDb();
  if (user?.role === "TEACHER") {
    const ck = await db.execute({
      sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
      args: [courseId, user.id],
    });
    if (ck.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const r = await db.execute({
    sql: "SELECT * FROM Grade WHERE courseId = ? ORDER BY createdAt DESC",
    args: [courseId],
  });
  return NextResponse.json({ grades: r.rows.map((x) => row(x)) });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { courseId, studentEmail, studentName, title, score, maxScore, weight, notes } = body;

  const db = getDb();
  if (user.role === "TEACHER") {
    const ck = await db.execute({
      sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
      args: [courseId, user.id],
    });
    if (ck.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const id = "grd_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO Grade (id, courseId, studentEmail, studentName, title, score, maxScore, weight, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      courseId,
      studentEmail,
      studentName,
      title,
      parseFloat(score),
      parseFloat(maxScore),
      weight ? parseFloat(weight) : 1.0,
      notes || null,
      now,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Grade WHERE id = ?", args: [id] });
  const g = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ grade: g }, { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  if (user.role === "TEACHER") {
    const r = await db.execute({
      sql: `SELECT g.id FROM Grade g
            JOIN Course c ON c.id = g.courseId
            WHERE g.id = ? AND c.teacherId = ?`,
      args: [id, user.id],
    });
    if (r.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.execute({ sql: "DELETE FROM Grade WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
