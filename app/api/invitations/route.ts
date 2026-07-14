import { NextResponse } from "next/server";
import { createInvitation, listInvitations } from "@/lib/invitation-service";
import { listCompanies } from "@/lib/admin-catalog";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["admin", "team_leader", "recruiter"]);
  if (!session) return unauthorizedResponse();
  return NextResponse.json({ data: await listInvitations() });
}

type CreateBody = {
  candidate_id?: string;
  candidate_name?: string;
  company?: string;
  reschedule_date?: string;
  comment?: string;
};

export async function POST(request: Request) {
  const session = await requireRequestRole(["admin", "team_leader", "recruiter"]);
  if (!session) return unauthorizedResponse();

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const candidateId = body.candidate_id?.trim();
  const candidateName = body.candidate_name?.trim();
  const company = body.company?.trim();
  if (!candidateId || !candidateName || !company) {
    return NextResponse.json({ error: "Candidate and company are required." }, { status: 400 });
  }

  const companies = await listCompanies();
  if (!companies.some((item) => item.toLowerCase() === company.toLowerCase())) {
    return NextResponse.json(
      { error: "Choose a company from the admin company list." },
      { status: 400 },
    );
  }

  try {
    const invitation = await createInvitation({
      candidate_id: candidateId,
      candidate_name: candidateName,
      company,
      reschedule_date: body.reschedule_date || null,
      comment: body.comment?.trim() || null,
      submitted_by: session.email,
    });
    return NextResponse.json({ data: invitation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invitation." },
      { status: 500 },
    );
  }
}
