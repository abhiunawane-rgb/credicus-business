import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-guard";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isDbUnavailable } from "@/lib/db-unavailable";
import { memoryCreateUser, memoryFindUserByEmail } from "@/lib/memory-users";
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
    if (!(useDatabase() && process.env.DATABASE_URL)) {
      return NextResponse.json(
        { error: "Candidate import requires a configured database (DATABASE_URL)." },
        { status: 503 },
      );
    }

    try {
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
    } catch (error) {
      if (isDbUnavailable(error)) disableDatabase();
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to import candidates." },
        { status: 500 },
      );
    }
  }

  let inserted = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const name = String(row.name ?? "").trim();
    const email = String(row.email ?? "").trim().toLowerCase();
    const password = String(row.password ?? "Password@123");
    const roleRaw = String(row.role ?? "recruiter") as UserRole;
    const role = Object.values(UserRole).includes(roleRaw) ? roleRaw : UserRole.recruiter;
    const statusRaw = String(row.status ?? "active") as UserStatus;
    const status = Object.values(UserStatus).includes(statusRaw) ? statusRaw : UserStatus.active;

    if (!name || !email) {
      errors.push("Skipped a row with missing name or email.");
      continue;
    }

    if (useDatabase() && process.env.DATABASE_URL) {
      try {
        await prisma.user.create({
          data: {
            name,
            email,
            password: hashPassword(password),
            role,
            status,
          },
        });
        inserted += 1;
        continue;
      } catch (error) {
        if (isDbUnavailable(error)) {
          disableDatabase();
        } else {
          errors.push(`${email}: ${error instanceof Error ? error.message : "failed"}`);
          continue;
        }
      }
    }

    try {
      if (memoryFindUserByEmail(email)) {
        errors.push(`${email}: already exists`);
        continue;
      }
      memoryCreateUser({ name, email, password, role, status });
      inserted += 1;
    } catch (error) {
      errors.push(`${email}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return NextResponse.json({
    message: "Users imported.",
    inserted,
    errors: errors.length ? errors.slice(0, 10) : undefined,
  });
}
