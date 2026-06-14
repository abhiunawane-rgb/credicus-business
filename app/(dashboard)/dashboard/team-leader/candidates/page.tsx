import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import CandidateWorkbench from "@/components/candidates/candidate-workbench";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function TeamLeaderCandidatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "team_leader") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="users"
        title="Candidates"
        description="Review team candidates, change stages, and maintain comment logs."
      />
      <CandidateWorkbench currentUserEmail={session.email} />
    </section>
  );
}
