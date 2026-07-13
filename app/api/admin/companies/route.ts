import { NextResponse } from "next/server";
import { addCompany, listCompanies } from "@/lib/admin-catalog";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["admin", "team_leader", "recruiter"]);
  if (!session) return unauthorizedResponse();
  return NextResponse.json({ data: listCompanies() });
}

type CreateBody = { name?: string };

export async function POST(request: Request) {
  const session = await requireRequestRole(["admin"]);
  if (!session) return unauthorizedResponse();

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const result = addCompany(body.name ?? "");
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: listCompanies() }, { status: 201 });
}
