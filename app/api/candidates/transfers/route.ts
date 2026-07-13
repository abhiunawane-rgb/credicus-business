import { NextResponse } from "next/server";
import { createTransferRequest, listTransferRequests } from "@/lib/transfer-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";
import type { TransferRequestStatus } from "@/lib/candidate-types";

export async function GET(request: Request) {
  const session = await requireRequestRole(["recruiter"]);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "all";
  const status = (searchParams.get("status") as TransferRequestStatus | null) ?? undefined;

  const filters =
    view === "incoming"
      ? { fromOwner: session.email, status }
      : view === "outgoing"
        ? { requestedBy: session.email, status }
        : { status };

  const data = await listTransferRequests(filters);
  return NextResponse.json({ data });
}

type CreateBody = {
  candidateId?: string;
  message?: string;
};

export async function POST(request: Request) {
  const session = await requireRequestRole(["recruiter"]);
  if (!session) return unauthorizedResponse();

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.candidateId?.trim()) {
    return NextResponse.json({ error: "Candidate ID is required." }, { status: 400 });
  }

  const result = await createTransferRequest({
    candidateId: body.candidateId.trim(),
    requestedBy: session.email,
    message: body.message?.trim(),
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.transfer }, { status: 201 });
}
