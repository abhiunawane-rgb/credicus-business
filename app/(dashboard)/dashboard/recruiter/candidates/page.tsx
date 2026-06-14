import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import CandidateWorkbench from "@/components/candidates/candidate-workbench";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterCandidatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="users"
        title="Candidates"
        description="Manage candidates with Naukri-style cards — change stage, shortlist, reject, and log comments."
      />
      <CandidateWorkbench currentUserEmail={session.email} />
    </section>
  );
}
