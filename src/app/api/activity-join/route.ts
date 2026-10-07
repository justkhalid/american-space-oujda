import { NextResponse } from "next/server";
import { getDb, row, requireRole, type InValue } from "@/lib/sql";

// POST - public: reserve one of the limited spots on an event or club.
// Body: { itemType: "event" | "club", itemId, name, email }
export async function POST(req: Request) {
  const body = await req.json();
  const { itemType, itemId, name, email } = body;
  if (!["event", "club"].includes(itemType) || !itemId || !name || !email) {
    return NextResponse.json(
      { error: "itemType, itemId, name and email are required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const table = itemType === "event" ? "Event" : "Club";
  const r = await db.execute({
    sql: `SELECT id, joinable, capacity, registered, status, statusNote FROM ${table} WHERE id = ?`,
    args: [itemId],
  });
  if (r.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const item = row<{ joinable: number; capacity: number | null; registered: number; status: string; statusNote: string | null }>(r.rows[0]);

  if (itemType === "event" && item.status === "CANCELED") {
    return NextResponse.json({ error: "This event has been canceled." }, { status: 409 });
  }
  if (itemType === "club" && item.status === "PAUSED") {
    return NextResponse.json({ error: "This club is paused right now." }, { status: 409 });
  }
  if (!item.joinable) {
    return NextResponse.json({ error: "This activity does not take reservations." }, { status: 409 });
  }
  if (item.capacity != null && item.registered >= item.capacity) {
    return NextResponse.json({ error: "All spots are taken." }, { status: 409 });
  }

  // One reservation per email per activity.
  const dup = await db.execute({
    sql: "SELECT id FROM ActivityJoin WHERE itemType = ? AND itemId = ? AND email = ?",
    args: [itemType, itemId, String(email).toLowerCase()],
  });
  if (dup.rows.length > 0) {
    return NextResponse.json({ error: "This email already reserved a spot." }, { status: 409 });
  }

  const id = "join_" + Math.random().toString(36).slice(2, 12);
  await db.execute({
    sql: "INSERT INTO ActivityJoin (id, itemType, itemId, name, email, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, itemType, itemId, name, String(email).toLowerCase(), new Date().toISOString()],
  });
  await db.execute({
    sql: `UPDATE ${table} SET registered = registered + 1 WHERE id = ?`,
    args: [itemId],
  });

  return NextResponse.json({ ok: true, spotsLeft: item.capacity == null ? null : item.capacity - item.registered - 1 }, { status: 201 });
}

// GET - admin: join records, optional ?itemType=&itemId=
export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY", "TEACHER", "INTERN"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const itemType = searchParams.get("itemType");
  const itemId = searchParams.get("itemId");

  const where: string[] = [];
  const args: InValue[] = [];
  if (itemType) { where.push("itemType = ?"); args.push(itemType); }
  if (itemId) { where.push("itemId = ?"); args.push(itemId); }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

  const db = getDb();
  const r = await db.execute({
    sql: `SELECT * FROM ActivityJoin ${whereSql} ORDER BY createdAt DESC`,
    args,
  });
  return NextResponse.json({ joins: r.rows.map((x) => row(x)) });
}

// DELETE - admin: remove a join record and give the spot back.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  const j = await db.execute({ sql: "SELECT itemType, itemId FROM ActivityJoin WHERE id = ?", args: [id] });
  if (j.rows.length > 0) {
    const rec = row<{ itemType: string; itemId: string }>(j.rows[0]);
    const table = rec.itemType === "event" ? "Event" : "Club";
    await db.execute({
      sql: `UPDATE ${table} SET registered = MAX(registered - 1, 0) WHERE id = ?`,
      args: [rec.itemId],
    });
  }
  await db.execute({ sql: "DELETE FROM ActivityJoin WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
