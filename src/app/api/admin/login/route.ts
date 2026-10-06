export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple admin login — checks email + password hash placeholder.
// In production: use NextAuth credentials provider + bcrypt.
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user || !user.password.includes(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // Return a non-secret session token (demo only)
  return NextResponse.json({
    token: `demo-token-${user.id}`,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
