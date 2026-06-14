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
        description="View all candidates in the shared pool. Contact Team Leader to request ownership changes."
        tip="This is a read-only view. Use Candidates tab to edit stages and add comment logs."
      />
      <CandidateWorkbench currentUserEmail={session.email} readOnly />
    </section>
  );
}
