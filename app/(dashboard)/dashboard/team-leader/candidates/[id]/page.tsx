import { redirect } from "next/navigation";
import CandidateDetailView from "@/components/candidates/candidate-detail-view";
import { getCandidate, listComments } from "@/lib/candidate-service";
import { getAuthSession } from "@/lib/auth-session";

type Props = { params: Promise<{ id: string }> };

export default async function TeamLeaderCandidateDetailPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "team_leader" && session.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) {
    redirect("/dashboard/team-leader/candidates?missing=1");
  }

  const comments = await listComments(id);

  return (
    <CandidateDetailView
      candidate={candidate}
      initialComments={comments}
      currentUserEmail={session.email}
      readOnly
      backHref="/dashboard/team-leader/candidates"
    />
  );
}
