import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const category = searchParams.get("category");
  const featuredOnly = searchParams.get("featured") === "1";
  const upcomingOnly = searchParams.get("upcoming") !== "0";
  const assignedOnly = searchParams.get("assigned") === "1";

  const db = getDb();
  const where: string[] = ["published = 1"];
  const args: InValue[] = [];

  // Interns can fetch the events they are assigned to (includes unpublished).
  if (assignedOnly) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (!["INTERN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    where.length = 0;
    where.push("assignedInternId = ?");
    args.push(user.id);
  }

  if (category && category !== "ALL") {
    where.push("category = ?");
    args.push(category);
  }
  if (featuredOnly) {
    where.push("featured = 1");
  }
  // Assigned view shows past events too, so interns can report on them.
  if (upcomingOnly && !assignedOnly) {
    where.push("startDate >= ?");
    args.push(new Date().toISOString());
  }
  args.push(limit);

  const r = await db.execute({
    sql: `SELECT * FROM Event WHERE ${where.join(" AND ")} ORDER BY startDate ASC LIMIT ?`,
    args,
  });
  return NextResponse.json({ events: r.rows.map((x) => row(x)) });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const id = "evt_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO Event (id, title, description, category, startDate, endDate, location, capacity, registered, imageUrl, featured, published, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?)`,
    args: [
      id,
      body.title,
      body.description || "",
      body.category || "OTHER",
      new Date(body.startDate).toISOString(),
      body.endDate ? new Date(body.endDate).toISOString() : null,
      body.location || null,
      body.capacity ? parseInt(body.capacity, 10) : null,
      body.imageUrl || null,
      body.featured ? 1 : 0,
      now,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Event WHERE id = ?", args: [id] });
  const ev = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ event: ev }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];

  if (data.title !== undefined) { sets.push("title = ?"); args.push(data.title); }
  if (data.description !== undefined) { sets.push("description = ?"); args.push(data.description); }
  if (data.category !== undefined) { sets.push("category = ?"); args.push(data.category); }
  if (data.startDate !== undefined) { sets.push("startDate = ?"); args.push(data.startDate ? new Date(data.startDate).toISOString() : null); }
  if (data.endDate !== undefined) { sets.push("endDate = ?"); args.push(data.endDate ? new Date(data.endDate).toISOString() : null); }
  if (data.location !== undefined) { sets.push("location = ?"); args.push(data.location || null); }
  if (data.capacity !== undefined) { sets.push("capacity = ?"); args.push(data.capacity ? parseInt(data.capacity, 10) : null); }
  if (data.imageUrl !== undefined) { sets.push("imageUrl = ?"); args.push(data.imageUrl || null); }
  if (data.featured !== undefined) { sets.push("featured = ?"); args.push(data.featured ? 1 : 0); }
  if (data.published !== undefined) { sets.push("published = ?"); args.push(data.published ? 1 : 0); }
  if (data.registered !== undefined) { sets.push("registered = ?"); args.push(parseInt(data.registered, 10) || 0); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE Event SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM Event WHERE id = ?", args: [id] });
  const ev = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ event: ev });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM Event WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
