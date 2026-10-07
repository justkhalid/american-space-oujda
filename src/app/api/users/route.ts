import { NextResponse } from "next/server";
import { getDb, row, requireRole, type InValue } from "@/lib/sql";
import bcrypt from "bcryptjs";

// GET - admin only. Returns user list with course/report counts.
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const r = await db.execute({
    sql: `SELECT u.id, u.email, u.name, u.role, u.active, u.createdAt,
            (SELECT COUNT(*) FROM Course c WHERE c.teacherId = u.id) AS coursesTaughtCount,
            (SELECT COUNT(*) FROM Report rp WHERE rp.teacherId = u.id) AS reportsCount
          FROM User u
          ORDER BY u.createdAt ASC`,
    args: [],
  });
  const users = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    const coursesTaughtCount = Number(x.coursesTaughtCount ?? 0);
    const reportsCount = Number(x.reportsCount ?? 0);
    const { coursesTaughtCount: _c, reportsCount: _r, ...rest } = x;
    return {
      ...rest,
      active: !!rest.active,
      _count: { coursesTaught: coursesTaughtCount, reports: reportsCount },
    };
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { email, name, password, role } = body;
  if (!email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["ADMIN", "TEACHER", "LIBRARY", "INTERN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const db = getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM User WHERE email = ?",
    args: [email.toLowerCase()],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const id = "usr_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [id, email.toLowerCase(), name || null, hash, role, now, now],
  });
  return NextResponse.json(
    {
      user: { id, email: email.toLowerCase(), name: name || null, role, active: true, createdAt: now },
    },
    { status: 201 }
  );
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, name, role, active, password } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];

  if (name !== undefined) { sets.push("name = ?"); args.push(name || null); }
  if (role && ["ADMIN", "TEACHER", "LIBRARY", "INTERN"].includes(role)) { sets.push("role = ?"); args.push(role); }
  if (active !== undefined) { sets.push("active = ?"); args.push(active ? 1 : 0); }
  if (password) { sets.push("password = ?"); args.push(await bcrypt.hash(password, 12)); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  sets.push("updatedAt = ?");
  args.push(new Date().toISOString());
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE User SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({
    sql: "SELECT id, email, name, role, active FROM User WHERE id = ?",
    args: [id],
  });
  if (r.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const u = row<{ id: string; email: string; name: string | null; role: string; active: number }>(
    r.rows[0] as Record<string, unknown>
  );
  return NextResponse.json({ user: { ...u, active: !!u.active } });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { user: adminUser } = auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (id === adminUser.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const db = getDb();
  await db.execute({ sql: "DELETE FROM User WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
