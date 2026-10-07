import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// ============================================================
// CLUBS
// ============================================================

export async function GET_CLUBS() {
  const db = getDb();
  const r = await db.execute("SELECT * FROM Club WHERE active = 1 ORDER BY name");
  return NextResponse.json({ clubs: r.rows.map((x) => row(x)) });
}

export async function POST_CLUB(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  const id = "club_" + Math.random().toString(36).slice(2, 12);
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO Club (id, name, description, schedule, iconName, colorClass, imageUrl, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [id, body.name, body.description || "", body.schedule || "", body.iconName || "Users", body.colorClass || "bg-sky-500/10 text-sky-700 dark:text-sky-300", body.imageUrl || null, new Date().toISOString(), new Date().toISOString()],
  });
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH_CLUB(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({
    sql: `UPDATE Club SET name = ?, description = ?, schedule = ?, iconName = ?, colorClass = ?, imageUrl = ?, active = ?, updatedAt = ? WHERE id = ?`,
    args: [data.name, data.description, data.schedule, data.iconName, data.colorClass, data.imageUrl || null, data.active ? 1 : 0, new Date().toISOString(), id],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE_CLUB(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM Club WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}

// ============================================================
// SITE LINKS
// ============================================================

export async function GET_LINKS() {
  const db = getDb();
  const r = await db.execute("SELECT * FROM SiteLink ORDER BY category, name");
  return NextResponse.json({ links: r.rows.map((x) => row(x)) });
}

export async function POST_LINK(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  const id = "link_" + Math.random().toString(36).slice(2, 12);
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO SiteLink (id, name, description, url, iconName, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.name, body.description || "", body.url, body.iconName || "Link2", body.category || "partner", new Date().toISOString()],
  });
  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE_LINK(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM SiteLink WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}

// ============================================================
// PAGE CONTENT (mini-CMS)
// ============================================================

export async function GET_PAGES() {
  const db = getDb();
  const r = await db.execute("SELECT * FROM PageContent ORDER BY pageKey");
  return NextResponse.json({ pages: r.rows.map((x) => row(x)) });
}

export async function PUT_PAGE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  const { pageKey, section, content } = body;
  if (!pageKey || !content) return NextResponse.json({ error: "pageKey and content required" }, { status: 400 });
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO PageContent (id, pageKey, section, content, updatedAt) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(pageKey) DO UPDATE SET content = excluded.content, section = excluded.section, updatedAt = excluded.updatedAt`,
    args: ["page_" + Math.random().toString(36).slice(2, 12), pageKey, section || "general", content, new Date().toISOString()],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE_PAGE(req: Request) {
  const auth = await requireRole(["ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const pageKey = searchParams.get("pageKey");
  if (!pageKey) return NextResponse.json({ error: "pageKey required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM PageContent WHERE pageKey = ?", args: [pageKey] });
  return NextResponse.json({ ok: true });
}
