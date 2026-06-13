import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

type ImportRow = Record<string, unknown>;

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const entity = String(formData.get("entity") ?? "users");
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "JSON file is required." }, { status: 400 });
  }

  const text = await file.text();
  let rows: ImportRow[];
  try {
    rows = JSON.parse(text) as ImportRow[];
  } catch {
    return NextResponse.json({ error: "Invalid JSON file content." }, { status: 400 });
  }

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "JSON must be an array." }, { status: 400 });
  }

  if (entity === "candidates") {
    const result = await prisma.candidate.createMany({
      data: rows.map((row) => ({
        name: String(row.name ?? "").trim(),
        mobile: String(row.mobile ?? "").trim(),
        email: row.email ? String(row.email).trim() : null,
        skills: Array.isArray(row.skills) ? row.skills.map((s) => String(s).trim()).filter(Boolean) : [],
        experience: Number(row.experience ?? 0),
        source: "other",
        status: "new",
      })),
      skipDuplicates: true,
    });
    return NextResponse.json({ message: "Candidates imported.", inserted: result.count });
  }

  const result = await prisma.user.createMany({
    data: rows.map((row) => {
      const role = String(row.role ?? "recruiter") as UserRole;
      return {
        name: String(row.name ?? "").trim(),
        email: String(row.email ?? "").trim().toLowerCase(),
        password: hashPassword(String(row.password ?? "Password@123")),
        role: Object.values(UserRole).includes(role) ? role : UserRole.recruiter,
      };
    }),
    skipDuplicates: true,
  });

  return NextResponse.json({ message: "Users imported.", inserted: result.count });
}
