import { NextResponse } from "next/server";
import {
  deleteCandidate,
  DuplicateRecordError,
  getCandidate,
  updateCandidate,
} from "@/lib/candidate-service";
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

  try {
    const updated = await updateCandidate(id, {
      status: body.status as CandidateStage | undefined,
      rejection_reason: body.rejection_reason as string | undefined,
      call_status: body.call_status as string | undefined,
      interview_date: body.interview_date as string | null | undefined,
      join_date: body.join_date as string | null | undefined,
      exit_date: body.exit_date as string | null | undefined,
      name: body.name as string | undefined,
      mobile: body.mobile as string | undefined,
      email: body.email as string | null | undefined,
    });

    if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof DuplicateRecordError) {
      return NextResponse.json({ error: error.message, code: "DUPLICATE" }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update candidate." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const ok = await deleteCandidate(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
