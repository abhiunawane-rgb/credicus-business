import { NextResponse } from "next/server";
import { createCandidate, listCandidates } from "@/lib/candidate-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET(request: Request) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const scope = searchParams.get("scope") ?? "all";
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const data = await listCandidates({
    search,
    createdBy: scope === "mine" ? session.email : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  return NextResponse.json({ data });
}

type CreateBody = {
  first_name?: string;
  last_name?: string;
  name?: string;
  mobile?: string;
  alt_mobile?: string | null;
  aadhar_no?: string | null;
  email?: string | null;
  skills?: string[];
  experience?: number;
  source?: string;
  portal_id?: string | null;
  process?: string | null;
  interview_date?: string | null;
  call_status?: string | null;
  current_company?: string | null;
  education?: string | null;
  preferred_locations?: string[];
  salary?: string | null;
  location?: string | null;
  notice_period?: string | null;
  initial_comment?: string | null;
};

export async function POST(request: Request) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.name?.trim() || !body.mobile?.trim()) {
    return NextResponse.json({ error: "First name, last name, and mobile are required." }, { status: 400 });
  }

  if (!body.source?.trim()) {
    return NextResponse.json({ error: "Source is required." }, { status: 400 });
  }

  const experience =
    typeof body.experience === "number" && !Number.isNaN(body.experience) ? body.experience : 0;

  try {
    const candidate = await createCandidate({
      first_name: body.first_name,
      last_name: body.last_name,
      name: body.name.trim(),
      mobile: body.mobile.trim(),
      alt_mobile: body.alt_mobile,
      aadhar_no: body.aadhar_no || null,
      email: body.email,
      skills: body.skills ?? [],
      experience,
      source: body.source.trim(),
      portal_id: body.portal_id,
      process: body.process,
      interview_date: body.interview_date,
      call_status: body.call_status,
      current_company: body.current_company,
      education: body.education,
      preferred_locations: body.preferred_locations ?? [],
      salary: body.salary,
      location: body.location,
      notice_period: body.notice_period,
      status: "new",
      created_by: session.email,
    });

    if (body.initial_comment?.trim()) {
      const { addComment } = await import("@/lib/candidate-service");
      const { displayNameForEmail } = await import("@/lib/demo-accounts");
      await addComment(candidate.id, body.initial_comment.trim(), {
        id: session.userId,
        name: displayNameForEmail(session.email),
        email: session.email,
      });
    }

    return NextResponse.json({ data: candidate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create candidate.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
