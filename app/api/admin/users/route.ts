import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import {
  memoryCreateUser,
  memoryListUsers,
} from "@/lib/memory-users";
import { prisma } from "@/lib/prisma";
import { friendlyUserApiError } from "@/lib/user-api-errors";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
};

function isDbUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("database_url") ||
    message.includes("environment variable not found") ||
    message.includes("can't reach database") ||
    message.includes("connection refused") ||
    message.includes("connect econnrefused") ||
    message.includes("p1001") ||
    message.includes("timed out fetching")
  );
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (useDatabase()) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true, status: true },
      });
      return NextResponse.json({ data: users });
    } catch (error) {
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        return NextResponse.json(
          { error: friendlyUserApiError(error, "Failed to load users.") },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ data: memoryListUsers() });
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
    return NextResponse.json({ error: "Invalid user type. Choose Recruiter, Team Leader, or Admin." }, { status: 400 });
  }
  if (!Object.values(UserStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status. Choose Active or Inactive." }, { status: 400 });
  }

  if (useDatabase() && process.env.DATABASE_URL) {
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
      return NextResponse.json({ data: user }, { status: 201 });
    } catch (error) {
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        const message = friendlyUserApiError(error, "Failed to create user.");
        return NextResponse.json(
          { error: message, details: error instanceof Error ? error.message : String(error) },
          { status: 500 },
        );
      }
    }
  }

  try {
    const user = memoryCreateUser({ name, email, password, role, status });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user." },
      { status: 500 },
    );
  }
}
