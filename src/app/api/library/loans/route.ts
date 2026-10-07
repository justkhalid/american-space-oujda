import { NextResponse } from "next/server";
import { getDb, row, requireRole, type InValue } from "@/lib/sql";

const LOAN_DAYS = 14;

// GET - ADMIN + LIBRARY. List all loans (with book + member joins).
// Filters: ?status=ACTIVE|RETURNED|OVERDUE  and  ?memberId=
export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.toUpperCase();
  const memberId = searchParams.get("memberId");

  const where: string[] = [];
  const args: InValue[] = [];
  if (memberId) {
    where.push("l.memberId = ?");
    args.push(memberId);
  }
  if (status === "ACTIVE") {
    where.push("l.status = 'ACTIVE'");
  } else if (status === "RETURNED") {
    where.push("l.status = 'RETURNED'");
  } else if (status === "OVERDUE") {
    where.push("l.status = 'ACTIVE'");
    where.push("l.dueAt < ?");
    args.push(new Date().toISOString());
  }
  const whereSql = where.length > 0 ? "WHERE " + where.join(" AND ") : "";

  const db = getDb();
  const r = await db.execute({
    sql: `SELECT l.*, b.title AS bookTitle, b.author AS bookAuthor, b.isbn AS bookIsbn,
                 m.asoNumber AS memberAsoNumber, m.fullName AS memberName, m.phone AS memberPhone
          FROM LibraryLoan l
          LEFT JOIN LibraryBook b ON b.id = l.bookId
          LEFT JOIN LibraryMember m ON m.id = l.memberId
          ${whereSql}
          ORDER BY l.borrowedAt DESC`,
    args,
  });

  const now = new Date();
  const loans = r.rows.map((x) => {
    const l = row<Record<string, unknown>>(x);
    // Compute effective status: ACTIVE loans past dueAt display as OVERDUE.
    const rawStatus = String(l.status || "ACTIVE");
    let effectiveStatus = rawStatus;
    if (rawStatus === "ACTIVE" && l.dueAt && new Date(l.dueAt as string) < now) {
      effectiveStatus = "OVERDUE";
    }
    return { ...l, status: rawStatus, effectiveStatus };
  });
  return NextResponse.json({ loans });
}

// POST - ADMIN + LIBRARY. Create a new loan.
// - dueAt = borrowedAt + 14 days
// - decrements LibraryBook.available
// - blocks if the member already has an ACTIVE loan (1 book at a time rule)
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { bookId, memberId, notes } = body;
  if (!bookId || !memberId) {
    return NextResponse.json({ error: "bookId and memberId required" }, { status: 400 });
  }

  const db = getDb();

  // 1) Verify the book exists and has an available copy.
  const bookR = await db.execute({
    sql: "SELECT id, available, copies FROM LibraryBook WHERE id = ?",
    args: [bookId],
  });
  if (bookR.rows.length === 0) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  const book = row<{ id: string; available: number; copies: number }>(bookR.rows[0]);
  if (Number(book.available) <= 0) {
    return NextResponse.json({ error: "No available copies of this book" }, { status: 409 });
  }

  // 2) Verify the member exists and is ACTIVE.
  const memberR = await db.execute({
    sql: "SELECT id, status FROM LibraryMember WHERE id = ?",
    args: [memberId],
  });
  if (memberR.rows.length === 0) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  const member = row<{ id: string; status: string }>(memberR.rows[0]);
  if (member.status !== "ACTIVE") {
    return NextResponse.json(
      { error: `Member is ${member.status.toLowerCase()} and cannot borrow books` },
      { status: 409 }
    );
  }

  // 3) Enforce the 1-book-at-a-time rule.
  const activeR = await db.execute({
    sql: "SELECT id FROM LibraryLoan WHERE memberId = ? AND status = 'ACTIVE' LIMIT 1",
    args: [memberId],
  });
  if (activeR.rows.length > 0) {
    return NextResponse.json(
      { error: "Member already has an active loan. Return it before borrowing another book." },
      { status: 409 }
    );
  }

  // 4) Create the loan + decrement available atomically.
  const id = "ln_" + Math.random().toString(36).slice(2, 12);
  const borrowedAt = new Date();
  const dueAt = new Date(borrowedAt.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);
  await db.execute({
    sql: `INSERT INTO LibraryLoan (id, bookId, memberId, borrowedAt, dueAt, returnedAt, status, notes, createdAt)
          VALUES (?, ?, ?, ?, ?, NULL, 'ACTIVE', ?, ?)`,
    args: [
      id,
      bookId,
      memberId,
      borrowedAt.toISOString(),
      dueAt.toISOString(),
      notes || null,
      borrowedAt.toISOString(),
    ],
  });
  await db.execute({
    sql: "UPDATE LibraryBook SET available = available - 1, updatedAt = ? WHERE id = ?",
    args: [new Date().toISOString(), bookId],
  });

  const r = await db.execute({ sql: "SELECT * FROM LibraryLoan WHERE id = ?", args: [id] });
  const loan = row(r.rows[0]);
  return NextResponse.json(
    { loan: { ...loan, effectiveStatus: "ACTIVE" } },
    { status: 201 }
  );
}

// PATCH - ADMIN + LIBRARY. Return a loan (?id=).
// - sets returnedAt = now, status = RETURNED
// - increments LibraryBook.available
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();

  // Find the loan.
  const loanR = await db.execute({
    sql: "SELECT id, bookId, status FROM LibraryLoan WHERE id = ?",
    args: [id],
  });
  if (loanR.rows.length === 0) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }
  const loan = row<{ id: string; bookId: string; status: string }>(loanR.rows[0]);
  if (loan.status === "RETURNED") {
    return NextResponse.json({ error: "Loan already returned" }, { status: 409 });
  }

  const now = new Date().toISOString();
  await db.execute({
    sql: "UPDATE LibraryLoan SET returnedAt = ?, status = 'RETURNED' WHERE id = ?",
    args: [now, id],
  });
  await db.execute({
    sql: "UPDATE LibraryBook SET available = MIN(available + 1, copies), updatedAt = ? WHERE id = ?",
    args: [now, loan.bookId],
  });

  const r = await db.execute({ sql: "SELECT * FROM LibraryLoan WHERE id = ?", args: [id] });
  const updated = row(r.rows[0]);
  return NextResponse.json({ loan: { ...updated, effectiveStatus: "RETURNED" } });
}

// DELETE - ADMIN + LIBRARY. Delete a loan record by ?id=.
// Note: this does NOT adjust book.available - use PATCH to return a loan
// first if you want stock counts to stay correct.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM LibraryLoan WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
