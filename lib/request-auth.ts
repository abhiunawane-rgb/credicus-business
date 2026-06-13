import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthCookieName, type UserRole, verifyAuthToken } from "@/lib/auth";

export type RequestSession = {
  userId: string;
  email: string;
  role: UserRole;
};

export async function getRequestSession(): Promise<RequestSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export async function requireRequestRole(roles: UserRole[]): Promise<RequestSession | null> {
  const session = await getRequestSession();
  if (!session || !roles.includes(session.role)) {
    return null;
  }
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
