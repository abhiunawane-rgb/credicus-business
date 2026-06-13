import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth";

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return false;
  }
  const payload = verifyAuthToken(token);
  return payload?.role === "admin";
}
