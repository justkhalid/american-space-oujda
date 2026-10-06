import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const db = getDb();
  if (category && category !== "ALL") {
    const r = await db.execute({
      sql: "SELECT * FROM GalleryItem WHERE category = ? ORDER BY createdAt DESC LIMIT 200",
      args: [category],
    });
    return NextResponse.json({ items: r.rows.map((x) => row(x)) });
  }
  const r = await db.execute("SELECT * FROM GalleryItem ORDER BY createdAt DESC LIMIT 200");
  return NextResponse.json({ items: r.rows.map((x) => row(x)) });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.title || !body.imageUrl) {
    return NextResponse.json({ error: "title and imageUrl required" }, { status: 400 });
  }
  const id = "gal_" + Math.random().toString(36).slice(2, 12);
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO GalleryItem (id, title, description, imageUrl, category, eventDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.title,
      body.description || null,
      body.imageUrl,
      body.category || "general",
      body.eventDate ? new Date(body.eventDate).toISOString() : null,
      new Date().toISOString(),
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM GalleryItem WHERE id = ?", args: [id] });
  const item = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM GalleryItem WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
