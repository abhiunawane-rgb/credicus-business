import { NextResponse } from "next/server";
import { createEmployee, listEmployees } from "@/lib/candidate-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["admin"]);
  if (!session) return unauthorizedResponse();
  const data = await listEmployees();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await requireRequestRole(["admin"]);
  if (!session) return unauthorizedResponse();

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

  return NextResponse.json({ data }, { status: 201 });
}
