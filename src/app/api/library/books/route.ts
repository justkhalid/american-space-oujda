import { NextResponse } from "next/server";
import { getDb, row, requireRole, type InValue } from "@/lib/sql";

// GET — ADMIN + LIBRARY. List all books, with optional ?search= filter
// on title / author / isbn / deweyCode / category.
export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  const db = getDb();
  let sql = "SELECT * FROM LibraryBook";
  const args: InValue[] = [];
  if (search) {
    sql +=
      " WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR deweyCode LIKE ? OR category LIKE ?";
    const pat = `%${search}%`;
    args.push(pat, pat, pat, pat, pat);
  }
  sql += " ORDER BY title ASC";
  const r = await db.execute({ sql, args });
  const books = r.rows.map((x) => {
    const b = row<Record<string, unknown>>(x);
    return {
      ...b,
      copies: Number(b.copies ?? 0),
      available: Number(b.available ?? 0),
    };
  });
  return NextResponse.json({ books });
}

// POST — ADMIN + LIBRARY. Add a new book.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const copies = parseInt(body.copies, 10) || 1;
  const id = "bk_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO LibraryBook (id, title, author, isbn, deweyCode, category, copies, available, location, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.title,
      body.author || null,
      body.isbn || null,
      body.deweyCode || null,
      body.category || null,
      copies,
      copies, // available starts at full copies
      body.location || null,
      body.notes || null,
      now,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM LibraryBook WHERE id = ?", args: [id] });
  const b = row<Record<string, unknown>>(r.rows[0]);
  return NextResponse.json(
    { book: { ...b, copies: Number(b.copies), available: Number(b.available) } },
    { status: 201 }
  );
}

// PATCH — ADMIN + LIBRARY. Update a book by id.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];

  if (data.title !== undefined) { sets.push("title = ?"); args.push(data.title); }
  if (data.author !== undefined) { sets.push("author = ?"); args.push(data.author || null); }
  if (data.isbn !== undefined) { sets.push("isbn = ?"); args.push(data.isbn || null); }
  if (data.deweyCode !== undefined) { sets.push("deweyCode = ?"); args.push(data.deweyCode || null); }
  if (data.category !== undefined) { sets.push("category = ?"); args.push(data.category || null); }
  if (data.location !== undefined) { sets.push("location = ?"); args.push(data.location || null); }
  if (data.notes !== undefined) { sets.push("notes = ?"); args.push(data.notes || null); }
  if (data.copies !== undefined) {
    const copies = parseInt(data.copies, 10) || 0;
    sets.push("copies = ?");
    args.push(copies);
    // Keep available <= copies. If copies shrinks below current available,
    // clamp available to copies.
    sets.push("available = MIN(available, ?)");
    args.push(copies);
  }
  if (data.available !== undefined) {
    const available = parseInt(data.available, 10) || 0;
    sets.push("available = ?");
    args.push(available);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE LibraryBook SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM LibraryBook WHERE id = ?", args: [id] });
  if (r.rows.length === 0) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  const b = row<Record<string, unknown>>(r.rows[0]);
  return NextResponse.json({
    book: { ...b, copies: Number(b.copies), available: Number(b.available) },
  });
}

// DELETE — ADMIN + LIBRARY. Delete a book by ?id=.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM LibraryBook WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
