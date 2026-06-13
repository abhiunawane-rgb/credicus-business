import { NextResponse } from "next/server";
import { getRoleDashboardPath } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth-session";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    role: session.role,
    redirectTo: getRoleDashboardPath(session.role),
  });
}
