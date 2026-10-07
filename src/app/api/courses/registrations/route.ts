import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET - admin only (full list of public course registrations)
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const r = await db.execute(
    "SELECT * FROM CourseRegistration ORDER BY createdAt DESC LIMIT 200"
  );
  return NextResponse.json({ registrations: r.rows.map((x) => row(x)) });
}
