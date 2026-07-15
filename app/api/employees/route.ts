import { NextResponse } from "next/server";
import {
  createEmployee,
  DuplicateRecordError,
  listEmployees,
} from "@/lib/candidate-service";
import { DatabaseRequiredError, DatabaseUnavailableError, isDatabaseConfigured } from "@/lib/db-mode";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["admin"]);
  if (!session) return unauthorizedResponse();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database is not configured. Add PostgreSQL DATABASE_URL, run npm run prisma:setup, then restart.",
        code: "DATABASE_REQUIRED",
      },
      { status: 503 },
    );
  }

  try {
    const data = await listEmployees();
    return NextResponse.json({ data, mode: "database" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load employees from the database.";
    return NextResponse.json({ error: message, code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireRequestRole(["admin"]);
  if (!session) return unauthorizedResponse();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database is not configured. Add PostgreSQL DATABASE_URL, run npm run prisma:setup, then restart.",
        code: "DATABASE_REQUIRED",
      },
      { status: 503 },
    );
  }

  let body: {
    employee_code?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    mobile?: string;
    department?: string;
    designation?: string;
    joining_date?: string;
    status?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.first_name?.trim() || !body.last_name?.trim() || !body.mobile?.trim()) {
    return NextResponse.json({ error: "first_name, last_name, mobile are required." }, { status: 400 });
  }

  try {
    const data = await createEmployee({
      employee_code: body.employee_code ?? null,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email ?? null,
      mobile: body.mobile.trim(),
      department: body.department ?? null,
      designation: body.designation ?? null,
      joining_date: body.joining_date ?? null,
      status: body.status ?? "active",
    });
    return NextResponse.json({ data, mode: "database" }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateRecordError) {
      return NextResponse.json({ error: error.message, code: "DUPLICATE" }, { status: 409 });
    }
    if (error instanceof DatabaseRequiredError || error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Failed to save employee.";
    return NextResponse.json({ error: message, code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
