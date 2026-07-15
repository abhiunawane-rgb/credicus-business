import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import {
  DatabaseRequiredError,
  DatabaseUnavailableError,
  isDatabaseConfigured,
  useDatabase,
} from "@/lib/db-mode";
import { isUniqueEmailError } from "@/lib/db-unavailable";
import { friendlyUserApiError } from "@/lib/user-api-errors";
import {
  memoryMirrorUser,
  type MemoryUserRole,
  type MemoryUserStatus,
} from "@/lib/memory-users";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: MemoryUserRole;
  status?: MemoryUserStatus;
};

const ROLES: MemoryUserRole[] = ["recruiter", "team_leader", "admin"];
const STATUSES: MemoryUserStatus[] = ["active", "inactive"];

function databaseMissingResponse() {
  return NextResponse.json(
    {
      error:
        "Database is not configured. Add a PostgreSQL DATABASE_URL in your hosting environment variables, run npm run prisma:setup, then restart the app.",
      code: "DATABASE_REQUIRED",
    },
    { status: 503 },
  );
}

function databaseFailedResponse(error: unknown) {
  return NextResponse.json(
    {
      error: friendlyUserApiError(
        error,
        "Database error while saving user. Check DATABASE_URL and run npm run prisma:setup.",
      ),
      code: "DATABASE_UNAVAILABLE",
      details: error instanceof Error ? error.message : undefined,
    },
    { status: 503 },
  );
}

async function emailAlreadyExists(email: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !useDatabase()) {
    return databaseMissingResponse();
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    return NextResponse.json({
      data: users.map((user) => ({
        ...user,
        status: user.status ?? "active",
      })),
      mode: "database",
    });
  } catch (error) {
    return databaseFailedResponse(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !useDatabase()) {
    return databaseMissingResponse();
  }

  let payload: CreateUserPayload;
  try {
    payload = (await request.json()) as CreateUserPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password?.trim();
  const role = payload.role ?? "recruiter";
  const status = payload.status ?? "active";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Invalid user type. Choose Recruiter, Team Leader, or Admin." },
      { status: 400 },
    );
  }
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status. Choose Active or Inactive." }, { status: 400 });
  }

  try {
    if (await emailAlreadyExists(email)) {
      return NextResponse.json(
        { error: "A user with this email address already exists.", code: "DUPLICATE" },
        { status: 409 },
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role,
        status,
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    try {
      memoryMirrorUser({
        id: user.id,
        name: user.name,
        email: user.email,
        password,
        role: user.role as MemoryUserRole,
        status: user.status as MemoryUserStatus,
      });
    } catch {
      // mirror is best-effort for same-instance login cache only
    }

    return NextResponse.json({ data: user, mode: "database" }, { status: 201 });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return NextResponse.json(
        { error: "A user with this email address already exists.", code: "DUPLICATE" },
        { status: 409 },
      );
    }
    if (error instanceof DatabaseRequiredError || error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 503 });
    }
    return databaseFailedResponse(error);
  }
}
