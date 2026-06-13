import { cookies } from "next/headers";
import { getAuthCookieName, type UserRole, verifyAuthToken } from "@/lib/auth";

export type AuthSession = {
  userId: string;
  email: string;
  role: UserRole;
};

export async function getAuthSession(): Promise<AuthSession | null> {
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
