import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAccessToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  return NextResponse.json({ id: params.id, updatedAt: new Date().toISOString() });
}
