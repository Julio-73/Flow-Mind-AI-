import { NextResponse } from "next/server";
import { verifyToken, getAccessToken } from "@/lib/auth";
import type { JwtPayload } from "@/lib/auth";

export async function GET() {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verifyToken<JwtPayload>(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: payload.userId, email: payload.email, orgId: payload.orgId, role: payload.role },
  });
}
