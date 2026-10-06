import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ comments: items });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }
  const c = await db.comment.create({
    data: {
      name: body.name,
      email: body.email || null,
      subject: body.subject || "General",
      message: body.message,
      category: body.category || "general",
    },
  });
  return NextResponse.json({ comment: c }, { status: 201 });
}
