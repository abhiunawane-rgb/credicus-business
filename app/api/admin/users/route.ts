import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { demoAccounts } from "@/lib/demo-accounts";
import { prisma } from "@/lib/prisma";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
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
  }));

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
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

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email, password are required." }, { status: 400 });
  }
  if (!Object.values(UserRole).includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
