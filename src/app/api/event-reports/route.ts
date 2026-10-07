import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// GET - ADMIN sees all, INTERN sees own. Optional ?eventId= or ?status=PENDING.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!["ADMIN", "INTERN"].includes(user.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const status = searchParams.get("status");

  const where: string[] = [];
  const args: InValue[] = [];
  if (user.role === "INTERN") {
    where.push("r.internId = ?");
    args.push(user.id);
  }
  if (eventId) {
    where.push("r.eventId = ?");
    args.push(eventId);
  }
  if (status) {
    where.push("r.status = ?");
    args.push(status);
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

  const db = getDb();
  const r = await db.execute({
    sql: `SELECT r.*, e.title AS event_title, e.startDate AS event_startDate, e.location AS event_location,
            u.name AS intern_name, u.email AS intern_email
          FROM EventReport r
          LEFT JOIN Event e ON e.id = r.eventId
          LEFT JOIN User u ON u.id = r.internId
          ${whereSql}
          ORDER BY r.submittedAt DESC`,
    args,
  });
  const reports = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    const { event_title, event_startDate, event_location, intern_name, intern_email, ...rest } = x;
    return {
      ...rest,
      event: event_title
        ? { id: rest.eventId, title: event_title, startDate: event_startDate, location: event_location }
        : null,
      intern: rest.internId ? { name: intern_name, email: intern_email } : null,
      attendees: rest.attendees == null ? null : Number(rest.attendees),
      staffCount: rest.staffCount == null ? null : Number(rest.staffCount),
    };
  });
  return NextResponse.json({ reports });
}

// POST - INTERN or ADMIN submits a report for an event assigned to them.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "INTERN"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { eventId, attendees, staffCount, highlights, challenges, photoUrls } = body;
  if (!eventId || !highlights) {
    return NextResponse.json({ error: "eventId and highlights are required" }, { status: 400 });
  }

  const db = getDb();
  const ev = await db.execute({ sql: "SELECT id, assignedInternId FROM Event WHERE id = ?", args: [eventId] });
  if (ev.rows.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (user.role === "INTERN") {
    const assigned = String(row<{ assignedInternId: string | null }>(ev.rows[0]).assignedInternId ?? "");
    if (assigned !== user.id) {
      return NextResponse.json({ error: "You are not assigned to this event" }, { status: 403 });
    }
  }

  const id = "erpt_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO EventReport (id, eventId, internId, attendees, staffCount, highlights, challenges, photoUrls, status, submittedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    args: [
      id,
      eventId,
      user.id,
      attendees == null || attendees === "" ? null : parseInt(attendees, 10),
      staffCount == null || staffCount === "" ? null : parseInt(staffCount, 10),
      highlights,
      challenges || null,
      photoUrls || null,
      now,
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM EventReport WHERE id = ?", args: [id] });
  return NextResponse.json({ report: r.rows.length ? row(r.rows[0]) : { id } }, { status: 201 });
}

// PATCH - ADMIN reviews a report: status APPROVED/REJECTED + adminNote.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, status, adminNote } = body;
  if (!id || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
  }

  const db = getDb();
  await db.execute({
    sql: "UPDATE EventReport SET status = ?, adminNote = ?, reviewedAt = ? WHERE id = ?",
    args: [status, adminNote ?? null, new Date().toISOString(), id],
  });
  const r = await db.execute({ sql: "SELECT * FROM EventReport WHERE id = ?", args: [id] });
  if (r.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ report: row(r.rows[0]) });
}

// DELETE - ADMIN.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM EventReport WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
