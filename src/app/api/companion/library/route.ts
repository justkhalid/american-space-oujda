import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser } from "@/lib/sql";

// GET — any authenticated user. Returns all library items.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT * FROM CompanionLibraryItem ORDER BY category ASC, name ASC`,
    args: [],
  });
  const items = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    return {
      id: String(x.id),
      name: String(x.name ?? ""),
      category: String(x.category ?? ""),
      url: String(x.url ?? ""),
      notes: String(x.notes ?? ""),
      createdAt: x.createdAt,
    };
  });
  return NextResponse.json({ items });
}

// POST — admin + editor.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.name || !body.url) {
    return NextResponse.json({ error: "name and url required" }, { status: 400 });
  }
  const id = "lib_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO CompanionLibraryItem (id, name, category, url, notes, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.name,
      body.category || "general",
      body.url,
      body.notes || "",
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionLibraryItem WHERE id = ?", args: [id] });
  const item = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ item }, { status: 201 });
}

// DELETE — admin + editor.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM CompanionLibraryItem WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
