import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || !user.active) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireRole(...roles: Role[]): Promise<AuthUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

// Helper for API routes — returns a 401/403 NextResponse or the user
export async function withRole(
  req: Request,
  roles: Role[]
): Promise<{ user: AuthUser } | { error: Response }> {
  try {
    const user = await requireRole(...roles);
    return { user };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERROR";
    const status = msg === "FORBIDDEN" ? 403 : 401;
    return {
      error: new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
}
