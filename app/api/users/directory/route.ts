import { NextResponse } from "next/server";
import { demoAccounts } from "@/lib/demo-accounts";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isDbUnavailable } from "@/lib/db-unavailable";
import { memoryListUsers } from "@/lib/memory-users";
import { prisma } from "@/lib/prisma";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["admin", "team_leader", "recruiter"]);
  if (!session) return unauthorizedResponse();

  const directory = new Map<string, { email: string; name: string; role: string }>();

  for (const account of demoAccounts) {
    directory.set(account.email.toLowerCase(), {
      email: account.email.toLowerCase(),
      name: account.name,
      role: account.role,
    });
  }

  for (const user of memoryListUsers()) {
    directory.set(user.email.toLowerCase(), {
      email: user.email.toLowerCase(),
      name: user.name,
      role: user.role,
    });
  }

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const users = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
        orderBy: { name: "asc" },
      });
      for (const user of users) {
        directory.set(user.email.toLowerCase(), {
          email: user.email.toLowerCase(),
          name: user.name,
          role: user.role,
        });
      }
    } catch (error) {
      if (isDbUnavailable(error)) disableDatabase();
    }
  }

  return NextResponse.json({
    data: [...directory.values()].sort((a, b) => a.name.localeCompare(b.name)),
  });
}
