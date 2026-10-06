import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// Update application status
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();

  const db = getDb();
  await db.execute({
    sql: "UPDATE Application SET status = ?, notes = ?, updatedAt = ? WHERE id = ?",
    args: [body.status, body.notes ?? null, new Date().toISOString(), id],
  });
  const r = await db.execute({ sql: "SELECT * FROM Application WHERE id = ?", args: [id] });
  const updated = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ application: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM Application WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
