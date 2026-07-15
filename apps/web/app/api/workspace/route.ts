import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAccessToken } from "@/lib/auth";

const store = new Map<string, { workspaceName: string; workspaceIcon: string; timezone: string }>();

export async function GET() {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const data = store.get(payload.userId) ?? {
    workspaceName: "My Workspace",
    workspaceIcon: "FM",
    timezone: "UTC",
  };

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const body = await req.json();
  const current = store.get(payload.userId) ?? {};
  store.set(payload.userId, { ...current, ...body });

  return NextResponse.json({ success: true });
}
