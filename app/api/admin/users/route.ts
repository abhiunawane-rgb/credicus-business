import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isUniqueEmailError } from "@/lib/db-unavailable";
import {
  memoryCreateUser,
  memoryListUsers,
  memoryMirrorUser,
} from "@/lib/memory-users";
import { prisma } from "@/lib/prisma";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  status: UserStatus | string;
};

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
  const role = payload.role ?? UserRole.recruiter;
  const status = payload.status ?? UserStatus.active;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!Object.values(UserRole).includes(role)) {
    return NextResponse.json(
      { error: "Invalid user type. Choose Recruiter, Team Leader, or Admin." },
      { status: 400 },
    );
  }
  if (!Object.values(UserStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status. Choose Active or Inactive." }, { status: 400 });
  }

  // Prefer Postgres when configured; on ANY DB failure (except duplicate email),
  // fall back to in-memory create so admin can still add users in demo mode.
  if (useDatabase()) {
    try {
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
          role: user.role,
          status: user.status,
        });
      } catch {
        // Memory mirror is best-effort.
      }

      return NextResponse.json({ data: user }, { status: 201 });
    } catch (error) {
      if (isUniqueEmailError(error)) {
        return NextResponse.json(
          { error: "A user with this email address already exists." },
          { status: 409 },
        );
      }
      disableDatabase();
    }
  }

  try {
    const user = memoryCreateUser({ name, email, password, role, status });
    return NextResponse.json(
      {
        data: user,
        warning: "Saved without a database. This account may reset when the server restarts.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    const statusCode = message.toLowerCase().includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
