import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isDbUnavailable, isUniqueEmailError } from "@/lib/db-unavailable";
import {
  memoryDeleteUser,
  memoryFindUserById,
  memoryMirrorUser,
  memoryUpdateUser,
} from "@/lib/memory-users";
import { getRequestSession } from "@/lib/request-auth";
import { prisma } from "@/lib/prisma";
import { friendlyUserApiError } from "@/lib/user-api-errors";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getRequestSession();
  const { id } = await params;
  let payload: UpdateUserPayload;
  try {
    payload = (await request.json()) as UpdateUserPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (payload.role && !Object.values(UserRole).includes(payload.role)) {
    return NextResponse.json(
      { error: "Invalid user type. Choose Recruiter, Team Leader, or Admin." },
      { status: 400 },
    );
  }
  if (payload.status && !Object.values(UserStatus).includes(payload.status)) {
    return NextResponse.json({ error: "Invalid status. Choose Active or Inactive." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const password = payload.password?.trim();
  if (password !== undefined && password.length > 0 && password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (session?.userId === id) {
    if (payload.status === UserStatus.inactive) {
      return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
    }
    if (payload.role && payload.role !== UserRole.admin) {
      return NextResponse.json({ error: "You cannot change your own admin role." }, { status: 400 });
    }
  }

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: payload.name?.trim(),
          email: email,
          role: payload.role,
          status: payload.status,
          password: password ? hashPassword(password) : undefined,
        },
        select: { id: true, name: true, email: true, role: true, status: true },
      });

      if (password) {
        try {
          memoryMirrorUser({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            password,
            role: updated.role,
            status: updated.status,
          });
        } catch {
          // best-effort mirror
        }
      } else if (memoryFindUserById(id)) {
        try {
          memoryUpdateUser(id, {
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status,
          });
        } catch {
          // best-effort mirror
        }
      }

      return NextResponse.json({ data: updated });
    } catch (error) {
      if (isUniqueEmailError(error)) {
        return NextResponse.json(
          { error: "A user with this email address already exists." },
          { status: 409 },
        );
      }
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        const message = friendlyUserApiError(error, "Failed to update user.");
        // User may only exist in memory (demo account) — fall through.
        if (!message.toLowerCase().includes("not found")) {
          return NextResponse.json(
            { error: message, details: error instanceof Error ? error.message : String(error) },
            { status: 500 },
          );
        }
      }
    }
  }

  try {
    if (!memoryFindUserById(id)) {
      return NextResponse.json(
        { error: "User not found. They may have been removed or only exist as a demo account." },
        { status: 404 },
      );
    }
    const updated = memoryUpdateUser(id, {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      password: password || undefined,
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user.";
    const statusCode = message.toLowerCase().includes("already exists")
      ? 409
      : message.toLowerCase().includes("not found")
        ? 404
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getRequestSession();
  const { id } = await params;

  if (session?.userId === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      await prisma.user.delete({ where: { id } });
      try {
        if (memoryFindUserById(id)) memoryDeleteUser(id);
      } catch {
        // ignore memory miss
      }
      return NextResponse.json({ success: true });
    } catch (error) {
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        const message = friendlyUserApiError(error, "Failed to delete user.");
        if (!message.toLowerCase().includes("not found")) {
          return NextResponse.json(
            { error: message, details: error instanceof Error ? error.message : String(error) },
            { status: 500 },
          );
        }
      }
    }
  }

  try {
    memoryDeleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user." },
      { status: 404 },
    );
  }
}
