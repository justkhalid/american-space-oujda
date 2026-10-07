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
    sql: "SELECT * FROM Attendance WHERE courseId = ? ORDER BY date DESC",
    args: [courseId],
  });
  return NextResponse.json({ attendance: r.rows.map((x) => row(x)) });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { courseId, date, records } = body as {
    courseId: string;
    date: string;
    records: { studentEmail: string; studentName: string; status: string; notes?: string }[];
  };

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

  const dateStr = new Date(date).toISOString();

  // Batch upsert using ON CONFLICT - unique(courseId, date, studentEmail)
  for (const r of records) {
    const id = "att_" + Math.random().toString(36).slice(2, 12);
    await db.execute({
      sql: `INSERT INTO Attendance (id, courseId, date, studentEmail, studentName, status, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(courseId, date, studentEmail) DO UPDATE SET
              status = excluded.status,
              notes = excluded.notes`,
      args: [
        id,
        courseId,
        dateStr,
        r.studentEmail,
        r.studentName,
        r.status,
        r.notes || null,
        new Date().toISOString(),
      ],
    });
  }

  return NextResponse.json({ ok: true, count: records.length });
}
