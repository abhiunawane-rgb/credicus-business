import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import ClientSummaryTable from "@/components/dashboard/client-summary-table";
import RecruiterSummaryTable from "@/components/dashboard/recruiter-summary-table";
import TeamLeaderDashboardMetrics from "@/components/dashboard/team-leader-dashboard-metrics";
import LeadAssignmentWorkbench from "@/components/team-leader/lead-assignment-workbench";
import ActionCard from "@/components/ui/action-card";
import { getAuthSession } from "@/lib/auth-session";

const recruiterPerformance: Array<{
  recruiter: string;
  calls: number;
  interviews: number;
  selections: number;
  joinings: number;
}> = [];

const leadBacklog: Array<{ id: string; company: string; role: string }> = [];

export default async function TeamLeaderDashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.role !== "team_leader") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <TeamLeaderDashboardMetrics />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard href="/dashboard/team-leader/candidates" title="Candidates" description="Review team candidates, change stages, add comment logs." icon={Users} />
        <ActionCard href="/dashboard/team-leader/talentpool" title="Talent Pool" description="Full shared pool with stage updates and comments." icon={Users} />
      </div>

      <RecruiterSummaryTable />
      <ClientSummaryTable />

      <LeadAssignmentWorkbench recruiterPerformance={recruiterPerformance} leadBacklog={leadBacklog} />
    </section>
  );
}
