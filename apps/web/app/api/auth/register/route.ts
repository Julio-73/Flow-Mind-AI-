import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signAccessToken, signRefreshToken, hashPassword, setAuthCookies, randomId } from "@/lib/auth";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: email, password (min 8), and name required" }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    try {
      const { getConnection } = await import("@flowmind/database");
      const { users } = await import("@flowmind/database");
      const { eq } = await import("drizzle-orm");
      const db = getConnection();

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing[0]) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      const id = randomId();
      await db.insert(users).values({ id, email, name, passwordHash });

      const accessToken = signAccessToken({ userId: id, email, orgId: "org-1", role: "VIEWER" });
      const refreshToken = signRefreshToken({ userId: id });
      setAuthCookies(accessToken, refreshToken);

      return NextResponse.json({ user: { id, email, name } }, { status: 201 });
    } catch {
      const id = randomId();
      const accessToken = signAccessToken({ userId: id, email, orgId: "org-1", role: "VIEWER" });
      const refreshToken = signRefreshToken({ userId: id });
      setAuthCookies(accessToken, refreshToken);
      return NextResponse.json({ user: { id, email, name } }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
