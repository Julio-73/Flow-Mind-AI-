import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAccessToken } from "@/lib/auth";

const MOCK_FLOWS = [
  { id: "f1", name: "Email Processing", icon: "Mail", status: "active", lastRunAt: "2026-07-11T08:30:00Z", lastRunStatus: "success", runCount: 1234, successRate: 0.98, updatedAt: "2026-07-11T08:30:00Z" },
  { id: "f2", name: "Slack Alerts to Database", icon: "Bell", status: "active", lastRunAt: "2026-07-11T09:00:00Z", lastRunStatus: "success", runCount: 567, successRate: 0.95, updatedAt: "2026-07-11T09:00:00Z" },
  { id: "f3", name: "Invoice Parser", icon: "FileText", status: "draft", lastRunAt: "2026-07-10T14:00:00Z", lastRunStatus: "error", runCount: 89, successRate: 0.72, updatedAt: "2026-07-10T14:00:00Z" },
  { id: "f4", name: "Customer Onboarding", icon: "UserPlus", status: "active", lastRunAt: "2026-07-11T07:45:00Z", lastRunStatus: "success", runCount: 345, successRate: 0.99, updatedAt: "2026-07-11T07:45:00Z" },
  { id: "f5", name: "Social Media Monitor", icon: "Globe", status: "paused", lastRunAt: "2026-07-09T12:00:00Z", lastRunStatus: "running", runCount: 2100, successRate: 0.91, updatedAt: "2026-07-09T12:00:00Z" },
];

export async function GET() {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  return NextResponse.json(MOCK_FLOWS);
}

export async function POST(req: NextRequest) {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const body = await req.json();
  const flow = {
    id: `f${Date.now()}`,
    name: body.name ?? "Untitled Flow",
    icon: "GitBranch",
    status: "draft",
    lastRunAt: null,
    lastRunStatus: null,
    runCount: 0,
    successRate: 0,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(flow, { status: 201 });
}
