import { NextResponse } from "next/server";
import {
  buildClientSummary,
  buildMonthSummary,
  buildRecruiterSummary,
} from "@/lib/report-summaries";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET(request: Request) {
  const session = await requireRequestRole(["admin", "team_leader"]);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";

  if (type === "recruiter") {
    return NextResponse.json({ data: await buildRecruiterSummary() });
  }
  if (type === "client") {
    return NextResponse.json({ data: await buildClientSummary() });
  }
  if (type === "month") {
    return NextResponse.json({ data: await buildMonthSummary() });
  }

  const [recruiter, client, month] = await Promise.all([
    buildRecruiterSummary(),
    buildClientSummary(),
    buildMonthSummary(),
  ]);

  return NextResponse.json({ data: { recruiter, client, month } });
}
