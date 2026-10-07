import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// GET - any authenticated user. Returns all active team members.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT * FROM CompanionTeamMember ORDER BY active DESC, name ASC`,
    args: [],
  });
  const team = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    let levels: string[] = [];
    try {
      const parsed = x.levels ? JSON.parse(String(x.levels)) : [];
      if (Array.isArray(parsed)) levels = parsed.map(String);
    } catch {
      levels = [];
    }
    return {
      id: String(x.id),
      name: String(x.name ?? ""),
      role: String(x.role ?? ""),
      phone: x.phone ?? "",
      email: x.email ?? "",
      levels,
      active: Number(x.active) === 1,
      createdAt: x.createdAt,
    };
  });
  return NextResponse.json({ team });
}

// POST - admin only.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const id = "tm_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const levels = Array.isArray(body.levels) ? JSON.stringify(body.levels) : "[]";
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO CompanionTeamMember (id, name, role, phone, email, levels, active, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.name,
      body.role || "",
      body.phone || null,
      body.email || null,
      levels,
      body.active === false ? 0 : 1,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionTeamMember WHERE id = ?", args: [id] });
  const member = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ member }, { status: 201 });
}

// PATCH - admin only.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];
  if (data.name !== undefined) { sets.push("name = ?"); args.push(data.name); }
  if (data.role !== undefined) { sets.push("role = ?"); args.push(data.role); }
  if (data.phone !== undefined) { sets.push("phone = ?"); args.push(data.phone || null); }
  if (data.email !== undefined) { sets.push("email = ?"); args.push(data.email || null); }
  if (data.levels !== undefined) {
    const levels = Array.isArray(data.levels) ? JSON.stringify(data.levels) : String(data.levels || "[]");
    sets.push("levels = ?"); args.push(levels);
  }
  if (data.active !== undefined) { sets.push("active = ?"); args.push(data.active ? 1 : 0); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE CompanionTeamMember SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionTeamMember WHERE id = ?", args: [id] });
  const member = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ member });
}

// DELETE - admin only.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM CompanionTeamMember WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
