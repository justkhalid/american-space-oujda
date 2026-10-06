import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function GET() {
  const allowed = await withRole(new Request("http://x"), ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { coursesTaught: true, reports: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  const { email, name, password, role } = body;
  if (!email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["ADMIN", "TEACHER", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      password: hash,
      role: role as Role,
    },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}

export async function PATCH(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  const { id, name, role, active, password } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: {
    name?: string | null;
    role?: Role;
    active?: boolean;
    password?: string;
  } = {};
  if (name !== undefined) data.name = name || null;
  if (role && ["ADMIN", "TEACHER", "EDITOR"].includes(role)) data.role = role as Role;
  if (active !== undefined) data.active = !!active;
  if (password) data.password = await bcrypt.hash(password, 12);

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user: adminUser } = allowed;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (id === adminUser.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
