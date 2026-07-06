import { NextResponse } from "next/server";
import { addComment, listComments } from "@/lib/candidate-service";
import { displayNameForEmail } from "@/lib/demo-accounts";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const data = await listComments(id);
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required." }, { status: 400 });
  }

  const data = await addComment(id, body.content.trim(), {
    id: session.userId,
    name: displayNameForEmail(session.email),
    email: session.email,
  });
  return NextResponse.json({ data }, { status: 201 });
}
