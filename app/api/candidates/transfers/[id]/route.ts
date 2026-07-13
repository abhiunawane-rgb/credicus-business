import { NextResponse } from "next/server";
import { resolveTransferRequest } from "@/lib/transfer-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

type PatchBody = {
  action?: "approve" | "reject";
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireRequestRole(["recruiter"]);
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "Action must be approve or reject." }, { status: 400 });
  }

  const result = await resolveTransferRequest({
    transferId: id,
    ownerEmail: session.email,
    action: body.action,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.transfer });
}
