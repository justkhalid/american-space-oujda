import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";

// GET — ADMIN + LIBRARY. Returns high-level counts for the dashboard overview.
export async function GET() {
  const auth = await requireRole(["ADMIN", "LIBRARY"]);
  if (!auth.ok) return auth.response;

  const db = getDb();

  // totalBooks — total number of distinct titles
  const totalBooksR = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM LibraryBook",
    args: [],
  });
  // availableBooks — sum of available copies across all books
  const availableBooksR = await db.execute({
    sql: "SELECT COALESCE(SUM(available), 0) AS n FROM LibraryBook",
    args: [],
  });
  // totalMembers
  const totalMembersR = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM LibraryMember",
    args: [],
  });
  // activeMembers — status = 'ACTIVE'
  const activeMembersR = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM LibraryMember WHERE status = 'ACTIVE'",
    args: [],
  });
  // activeLoans
  const activeLoansR = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM LibraryLoan WHERE status = 'ACTIVE'",
    args: [],
  });
  // overdueLoans — active + past dueAt
  const overdueLoansR = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM LibraryLoan WHERE status = 'ACTIVE' AND dueAt < ?",
    args: [new Date().toISOString()],
  });

  const num = (r: { rows: { n: unknown }[] }) =>
    Number(row<{ n: number }>(r.rows[0] as Record<string, unknown>).n ?? 0);

  return NextResponse.json({
    totalBooks: num(totalBooksR),
    availableBooks: num(availableBooksR),
    totalMembers: num(totalMembersR),
    activeMembers: num(activeMembersR),
    activeLoans: num(activeLoansR),
    overdueLoans: num(overdueLoansR),
  });
}
