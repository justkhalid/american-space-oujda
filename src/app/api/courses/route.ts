import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET — public (list of active courses with teacher info + enrollment counts)
export async function GET() {
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT c.*,
            u.id AS teacher_id,
            u.email AS teacher_email,
            u.name AS teacher_name,
            (SELECT COUNT(*) FROM Enrollment e WHERE e.courseId = c.id) AS enrollmentCount
          FROM Course c
          LEFT JOIN User u ON u.id = c.teacherId
          WHERE c.active = 1
          ORDER BY c.startDate ASC`,
    args: [],
  });
  const courses = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    const enrollmentCount = Number(x.enrollmentCount ?? 0);
    const teacher =
      x.teacher_id != null
        ? { id: x.teacher_id, email: x.teacher_email, name: x.teacher_name }
        : null;
    // Strip prefixed teacher_ keys from output, keep the enrollmentCount
    const { teacher_id, teacher_email, teacher_name, ...rest } = x;
    return { ...rest, teacher, _count: { enrollments: enrollmentCount } };
  });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const id = "crs_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO Course (id, title, description, level, schedule, startDate, endDate, capacity, active, teacherId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    args: [
      id,
      body.title,
      body.description || "",
      body.level || "BEGINNER",
      body.schedule || "",
      new Date(body.startDate).toISOString(),
      body.endDate ? new Date(body.endDate).toISOString() : null,
      body.capacity ? parseInt(body.capacity, 10) : 20,
      body.teacherId || null,
      now,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Course WHERE id = ?", args: [id] });
  const course = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ course }, { status: 201 });
}
