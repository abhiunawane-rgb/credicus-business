import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let payload: UpdateUserPayload;
  try {
    payload = (await request.json()) as UpdateUserPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (payload.role && !Object.values(UserRole).includes(payload.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: payload.name?.trim(),
        email: payload.email?.trim().toLowerCase(),
        role: payload.role,
        password: payload.password ? hashPassword(payload.password.trim()) : undefined,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user.", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
