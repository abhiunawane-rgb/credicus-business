import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import CandidateWorkbench from "@/components/candidates/candidate-workbench";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function TeamLeaderTalentPoolPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "team_leader") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="database"
        title="Talent Pool"
        description="Full candidate pool view. Each card shows which recruiter added the candidate. Team Leaders can update stages and add comments."
      />
      <CandidateWorkbench currentUserEmail={session.email} showAddedBy scope="all" />
    </section>
  );
}
