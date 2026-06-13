import { NextResponse } from "next/server";
import { getAuthCookieClearOptions } from "@/lib/auth-cookie";
import { getAuthCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: getAuthCookieName(),
    value: "",
    ...getAuthCookieClearOptions(request),
  });
  return response;
}
