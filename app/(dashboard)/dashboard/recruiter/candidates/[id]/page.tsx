import { redirect } from "next/navigation";
import CandidateDetailView from "@/components/candidates/candidate-detail-view";
import { getCandidate, listComments } from "@/lib/candidate-service";
import { getAuthSession } from "@/lib/auth-session";

type Props = { params: Promise<{ id: string }> };

export default async function CandidateDetailPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (!["recruiter", "team_leader", "admin"].includes(session.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const candidate = await getCandidate(id);

  const backHref =
    session.role === "team_leader"
      ? "/dashboard/team-leader/candidates"
      : session.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/recruiter/candidates";

  // Soft recovery when record isn't found (e.g. demo memory on another serverless instance)
  if (!candidate) {
    redirect(`${backHref}?missing=1`);
  }

  const comments = await listComments(id);

  return (
    <CandidateDetailView
      candidate={candidate}
      initialComments={comments}
      currentUserEmail={session.email}
      readOnly={session.role === "team_leader" || session.role === "admin"}
      backHref={backHref}
    />
  );
}
