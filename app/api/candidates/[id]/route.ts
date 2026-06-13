import { NextResponse } from "next/server";
import { deleteCandidate, getCandidate, updateCandidate } from "@/lib/candidate-service";
import type { CandidateStage } from "@/lib/candidate-types";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ data: candidate });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const updated = await updateCandidate(id, {
    status: body.status as CandidateStage | undefined,
    rejection_reason: body.rejection_reason as string | undefined,
    call_status: body.call_status as string | undefined,
    interview_date: body.interview_date as string | undefined,
    name: body.name as string | undefined,
    mobile: body.mobile as string | undefined,
  });

  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const ok = await deleteCandidate(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
