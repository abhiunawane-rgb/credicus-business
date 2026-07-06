import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { demoAccounts } from "@/lib/demo-accounts";
import { prisma } from "@/lib/prisma";
import { friendlyUserApiError } from "@/lib/user-api-errors";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
};

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const demoUsers = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: UserStatus.active,
  }));

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    const merged = [...users];
    for (const demoUser of demoUsers) {
      if (!merged.some((user) => user.email === demoUser.email)) {
        merged.push(demoUser);
      }
    }

    return NextResponse.json({ data: merged });
  } catch {
    return NextResponse.json({ data: demoUsers });
  }
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

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database is not configured. Add DATABASE_URL to your .env file, then run: npm run prisma:setup" },
      { status: 503 },
    );
  }

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
    const message = friendlyUserApiError(error, "Failed to create user.");
    return NextResponse.json(
      { error: message, details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
