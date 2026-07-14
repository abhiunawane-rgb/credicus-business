import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/demo-users";
import { getAuthCookieSetOptions } from "@/lib/auth-cookie";
import { getAuthCookieName, getRoleDashboardPath, signAuthToken, verifyPassword } from "@/lib/auth";
import { useDatabase } from "@/lib/db-mode";
import { memoryFindUserByEmail } from "@/lib/memory-users";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

function loginSuccessResponse(
  request: Request,
  user: { id: string; email: string; role: Parameters<typeof signAuthToken>[0]["role"] },
) {
  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
    redirectTo: getRoleDashboardPath(user.role),
  });
  response.cookies.set({
    name: getAuthCookieName(),
    value: token,
    ...getAuthCookieSetOptions(request, 60 * 60 * 24),
  });
  return response;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Prefer database accounts when DB is configured so admin-created users always win.
  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, password: true, role: true, status: true },
      });

      if (dbUser && verifyPassword(password, dbUser.password)) {
        if (dbUser.status === "inactive") {
          return NextResponse.json(
            { error: "Your account is inactive. Contact an administrator." },
            { status: 403 },
          );
        }
        return loginSuccessResponse(request, dbUser);
      }
    } catch {
      // Database unavailable; fall through to memory / demo accounts.
    }
  }

  const memoryUser = memoryFindUserByEmail(email);
  if (memoryUser && verifyPassword(password, memoryUser.password)) {
    if (memoryUser.status === "inactive") {
      return NextResponse.json(
        { error: "Your account is inactive. Contact an administrator." },
        { status: 403 },
      );
    }
    return loginSuccessResponse(request, memoryUser);
  }

  const demoUser = findUserByEmail(email);
  if (demoUser && verifyPassword(password, demoUser.passwordHash)) {
    return loginSuccessResponse(request, demoUser);
  }

  return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
}
