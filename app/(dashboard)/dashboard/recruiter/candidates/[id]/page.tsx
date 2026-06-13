import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import CandidateDetailView from "@/components/candidates/candidate-detail-view";
import { getCandidate, listComments } from "@/lib/candidate-service";
import { getAuthSession } from "@/lib/auth-session";

type Props = { params: Promise<{ id: string }> };

export default async function CandidateDetailPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter" && session.role !== "team_leader") redirect("/dashboard");

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) notFound();

  const comments = await listComments(id);

  const backHref =
    session.role === "team_leader"
      ? "/dashboard/team-leader/candidates"
      : "/dashboard/recruiter/candidates";

  return (
    <CandidateDetailView
      candidate={candidate}
      initialComments={comments}
      currentUserEmail={session.email}
      readOnly={session.role === "team_leader"}
      backHref={backHref}
    />
  );
}
