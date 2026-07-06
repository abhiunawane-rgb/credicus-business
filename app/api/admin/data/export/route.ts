import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const raw = row[header];
          const value = Array.isArray(raw) ? raw.join("|") : raw ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") ?? "users";

  if (entity === "candidates") {
    const candidates = await prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        skills: true,
        experience: true,
        source: true,
        status: true,
      },
      orderBy: { name: "asc" },
    });
    return new NextResponse(toCsv(candidates), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=candidates.csv",
      },
    });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true },
    orderBy: { name: "asc" },
  });
  return new NextResponse(toCsv(users), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=users.csv",
    },
  });
}
