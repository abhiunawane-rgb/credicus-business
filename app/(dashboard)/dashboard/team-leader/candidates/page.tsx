import { redirect } from "next/navigation";
import CandidateStatusTable from "@/components/dashboard/candidate-status-table";
import { getAuthSession } from "@/lib/auth-session";

export default async function TeamLeaderCandidatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "team_leader") redirect("/dashboard");

  return <CandidateStatusTable detailBasePath="/dashboard/team-leader/candidates" />;
}
