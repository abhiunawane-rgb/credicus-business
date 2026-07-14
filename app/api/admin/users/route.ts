import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isUniqueEmailError } from "@/lib/db-unavailable";
import {
  memoryCreateUser,
  memoryListUsers,
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

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const ROLES: MemoryUserRole[] = ["recruiter", "team_leader", "admin"];
const STATUSES: MemoryUserStatus[] = ["active", "inactive"];

function mergeUsers(primary: PublicUser[], secondary: PublicUser[]): PublicUser[] {
  const byEmail = new Map<string, PublicUser>();
  for (const user of secondary) {
    byEmail.set(user.email.toLowerCase(), {
      ...user,
      status: user.status ?? "active",
    });
  }
  for (const user of primary) {
    byEmail.set(user.email.toLowerCase(), {
      ...user,
      status: user.status ?? "active",
    });
  }
  return [...byEmail.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memoryUsers = memoryListUsers();

  if (useDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true, status: true },
      });
      return NextResponse.json({ data: mergeUsers(users, memoryUsers) });
    } catch {
      disableDatabase();
    }
  }

  return NextResponse.json({ data: memoryUsers });
}

/**
 * Create login accounts.
 * Always succeeds without DATABASE_URL (memory/demo).
 * When Postgres is configured on Vercel, also persists durably.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Path A — Postgres (Vercel + Neon/Supabase). Never return DATABASE_URL setup errors.
  if (useDatabase()) {
    try {
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
        // ignore
      }
      return NextResponse.json({ data: user, mode: "database" }, { status: 201 });
    } catch (error) {
      if (isUniqueEmailError(error)) {
        return NextResponse.json(
          { error: "A user with this email address already exists." },
          { status: 409 },
        );
      }
      disableDatabase();
      // Fall through to memory — do not surface prisma:setup / DATABASE_URL messages.
    }
  }

  // Path B — demo / no database (works on Vercel immediately after redeploy)
  try {
    const user = memoryCreateUser({ name, email, password, role, status });
    return NextResponse.json(
      {
        data: user,
        mode: "memory",
        warning: "User created in demo mode. Add DATABASE_URL on Vercel for permanent users.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    const statusCode = message.toLowerCase().includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
