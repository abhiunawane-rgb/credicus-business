import { NextResponse } from "next/server";
import { listCandidates } from "@/lib/candidate-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

export async function GET() {
  const session = await requireRequestRole(["recruiter", "team_leader", "admin"]);
  if (!session) return unauthorizedResponse();

  const candidates = await listCandidates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createdToday = candidates.filter((c) => new Date(c.created_at) >= today).length;
  const interviewsToday = candidates.filter((c) => {
    if (!c.interview_date) return false;
    const d = new Date(c.interview_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).length;
  const confirmedToday = candidates.filter((c) => c.call_status === "confirmed").length;
  const selectionsMonth = candidates.filter((c) =>
    ["shortlisted", "offered", "hired"].includes(c.status),
  ).length;
  const joiningsMonth = candidates.filter((c) => c.status === "hired").length;

  return NextResponse.json({
    data: {
      createdToday,
      interviewsToday,
      confirmedToday,
      selectionsMonth,
      joiningsMonth,
      totalCandidates: candidates.length,
    },
  });
}
