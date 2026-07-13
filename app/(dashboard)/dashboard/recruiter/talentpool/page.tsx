import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import CandidateWorkbench from "@/components/candidates/candidate-workbench";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterTalentPoolPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="database"
        title="Talent Pool"
        description="Browse all candidates in the shared database. Request transfer to process candidates owned by others."
        tip="After the owner approves, the candidate appears in your Candidates list and ownership updates here."
      />
      <CandidateWorkbench
        currentUserEmail={session.email}
        readOnly
        scope="all"
        showAddedBy
        showDateFilters
        enableTransferRequests
      />
    </section>
  );
}
