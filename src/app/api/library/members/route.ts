import { NextResponse } from "next/server";
import { getDb, row, requireRole, type InValue } from "@/lib/sql";

// GET - ADMIN + LIBRARY. List all members, with optional ?search= filter
// on asoNumber / fullName / phone / cniNumber.
export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  const db = getDb();
  let sql = "SELECT * FROM LibraryMember";
  const args: InValue[] = [];
  if (search) {
    sql +=
      " WHERE asoNumber LIKE ? OR fullName LIKE ? OR phone LIKE ? OR cniNumber LIKE ? OR email LIKE ?";
    const pat = `%${search}%`;
    args.push(pat, pat, pat, pat, pat);
  }
  sql += " ORDER BY joinedAt DESC";
  const r = await db.execute({ sql, args });
  const members = r.rows.map((x) => row(x));
  return NextResponse.json({ members });
}

// Generate the next ASO number by finding the highest existing number and
// incrementing it. Format: "ASO-XXXX" (zero-padded to 4 digits).
async function nextAsoNumber(db: ReturnType<typeof getDb>): Promise<string> {
  const r = await db.execute({
    sql: "SELECT asoNumber FROM LibraryMember ORDER BY asoNumber DESC LIMIT 1",
    args: [],
  });
  if (r.rows.length === 0) return "ASO-0001";
  const highest = row<{ asoNumber: string }>(r.rows[0]).asoNumber || "ASO-0000";
  const match = highest.match(/^ASO-0*(\d+)$/);
  const next = (match ? parseInt(match[1], 10) : 0) + 1;
  return "ASO-" + String(next).padStart(4, "0");
}

// POST - ADMIN + LIBRARY. Register a new member. asoNumber is auto-generated.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.fullName) {
    return NextResponse.json({ error: "fullName required" }, { status: 400 });
  }

  const db = getDb();
  const asoNumber = await nextAsoNumber(db);
  const id = "mem_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO LibraryMember (id, asoNumber, fullName, email, phone, cniNumber, birthDate, address, photoUrl, status, joinedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      asoNumber,
      body.fullName,
      body.email || null,
      body.phone || null,
      body.cniNumber || null,
      body.birthDate || null,
      body.address || null,
      body.photoUrl || null,
      "ACTIVE",
      now,
      now,
      now,
    ],
  });

  const r = await db.execute({ sql: "SELECT * FROM LibraryMember WHERE id = ?", args: [id] });
  const m = row(r.rows[0]);
  return NextResponse.json({ member: m }, { status: 201 });
}

// PATCH - ADMIN + LIBRARY. Update a member (incl. status).
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];

  if (data.fullName !== undefined) { sets.push("fullName = ?"); args.push(data.fullName); }
  if (data.email !== undefined) { sets.push("email = ?"); args.push(data.email || null); }
  if (data.phone !== undefined) { sets.push("phone = ?"); args.push(data.phone || null); }
  if (data.cniNumber !== undefined) { sets.push("cniNumber = ?"); args.push(data.cniNumber || null); }
  if (data.birthDate !== undefined) { sets.push("birthDate = ?"); args.push(data.birthDate || null); }
  if (data.address !== undefined) { sets.push("address = ?"); args.push(data.address || null); }
  if (data.photoUrl !== undefined) { sets.push("photoUrl = ?"); args.push(data.photoUrl || null); }
  if (data.status !== undefined) {
    const s = String(data.status).toUpperCase();
    if (!["ACTIVE", "SUSPENDED", "EXPIRED"].includes(s)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    sets.push("status = ?");
    args.push(s);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE LibraryMember SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM LibraryMember WHERE id = ?", args: [id] });
  if (r.rows.length === 0) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json({ member: row(r.rows[0]) });
}

// DELETE - ADMIN + LIBRARY. Delete a member by ?id=.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM LibraryMember WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
