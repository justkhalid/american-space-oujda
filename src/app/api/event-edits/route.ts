import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// Editable Event fields an intern can request changes to.
const EDITABLE_FIELDS = new Set(["title", "description", "startDate", "location", "capacity"]);

// GET - ADMIN sees all, INTERN sees own. Optional ?eventId= / ?status=PENDING.
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
    sql: `SELECT r.*, e.title AS event_title, u.name AS intern_name, u.email AS intern_email
          FROM EventEditRequest r
          LEFT JOIN Event e ON e.id = r.eventId
          LEFT JOIN User u ON u.id = r.internId
          ${whereSql}
          ORDER BY r.createdAt DESC`,
    args,
  });
  const requests = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    const { event_title, intern_name, intern_email, ...rest } = x;
    return {
      ...rest,
      event: event_title ? { id: rest.eventId, title: event_title } : null,
      intern: rest.internId ? { name: intern_name, email: intern_email } : null,
    };
  });
  return NextResponse.json({ requests });
}

// POST - INTERN (assigned to the event) requests a change to one event field.
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "INTERN"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { eventId, field, requestedValue, reason } = body;
  if (!eventId || !field || requestedValue == null || requestedValue === "") {
    return NextResponse.json(
      { error: "eventId, field and requestedValue are required" },
      { status: 400 }
    );
  }
  if (!EDITABLE_FIELDS.has(field)) {
    return NextResponse.json(
      { error: "Field must be one of: " + [...EDITABLE_FIELDS].join(", ") },
      { status: 400 }
    );
  }

  const db = getDb();
  const evR = await db.execute({ sql: "SELECT * FROM Event WHERE id = ?", args: [eventId] });
  if (evR.rows.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const ev = row<Record<string, unknown>>(evR.rows[0]);
  if (user.role === "INTERN") {
    const assigned = String(ev.assignedInternId ?? "");
    if (assigned !== user.id) {
      return NextResponse.json({ error: "You are not assigned to this event" }, { status: 403 });
    }
  }

  const id = "ereq_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO EventEditRequest (id, eventId, internId, field, currentValue, requestedValue, reason, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    args: [id, eventId, user.id, field, ev[field] == null ? null : String(ev[field]), String(requestedValue), reason || null, now],
  });
  const r = await db.execute({ sql: "SELECT * FROM EventEditRequest WHERE id = ?", args: [id] });
  return NextResponse.json({ request: r.rows.length ? row(r.rows[0]) : { id } }, { status: 201 });
}

// PATCH - ADMIN approves or rejects. Approving applies the change to the Event.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, status, adminNote } = body;
  if (!id || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
  }

  const db = getDb();
  const reqR = await db.execute({ sql: "SELECT * FROM EventEditRequest WHERE id = ?", args: [id] });
  if (reqR.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const er = row<{ eventId: string; field: string; requestedValue: string; status: string }>(reqR.rows[0]);

  if (status === "APPROVED" && er.status !== "APPROVED") {
    if (!EDITABLE_FIELDS.has(er.field)) {
      return NextResponse.json({ error: "Unsupported field" }, { status: 400 });
    }
    let value: InValue = er.requestedValue;
    if (er.field === "capacity") value = parseInt(er.requestedValue, 10) || 0;
    if (er.field === "startDate") {
      const d = new Date(er.requestedValue);
      value = isNaN(d.getTime()) ? er.requestedValue : d.toISOString();
    }
    await db.execute({
      sql: `UPDATE Event SET ${er.field} = ?, updatedAt = ? WHERE id = ?`,
      args: [value, new Date().toISOString(), er.eventId],
    });
  }

  await db.execute({
    sql: "UPDATE EventEditRequest SET status = ?, adminNote = ?, reviewedAt = ? WHERE id = ?",
    args: [status, adminNote ?? null, new Date().toISOString(), id],
  });
  const r = await db.execute({ sql: "SELECT * FROM EventEditRequest WHERE id = ?", args: [id] });
  return NextResponse.json({ request: row(r.rows[0]) });
}

// DELETE - ADMIN.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  await db.execute({ sql: "DELETE FROM EventEditRequest WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
