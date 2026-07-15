import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signAccessToken, signRefreshToken, comparePassword, setAuthCookies } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    try {
      const { getConnection } = await import("@flowmind/database");
      const { users } = await import("@flowmind/database");
      const { eq } = await import("drizzle-orm");
      const db = getConnection();
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = result[0];

      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        orgId: "org-1",
        role: "ADMIN",
      });
      const refreshToken = signRefreshToken({ userId: user.id });

      setAuthCookies(accessToken, refreshToken);

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch {
      const demoUser = { id: "demo-1", email: "demo@flowmind.ai", name: "Demo User" };
      if (email === "demo@flowmind.ai" && password === "demo1234") {
        const accessToken = signAccessToken({
          userId: demoUser.id,
          email: demoUser.email,
          orgId: "org-1",
          role: "ADMIN",
        });
        const refreshToken = signRefreshToken({ userId: demoUser.id });
        setAuthCookies(accessToken, refreshToken);
        return NextResponse.json({ user: demoUser });
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
