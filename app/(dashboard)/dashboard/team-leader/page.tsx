import { redirect } from "next/navigation";
import { Phone, UserCheck, UserPlus, Users } from "lucide-react";
import ClientSummaryTable from "@/components/dashboard/client-summary-table";
import RecruiterSummaryTable from "@/components/dashboard/recruiter-summary-table";
import TodaySummary from "@/components/dashboard/today-summary";
import LeadAssignmentWorkbench from "@/components/team-leader/lead-assignment-workbench";
import ActionCard from "@/components/ui/action-card";
import DashboardHeader from "@/components/ui/dashboard-header";
import StatCard from "@/components/ui/stat-card";
import { getAuthSession } from "@/lib/auth-session";

const recruiterPerformance = [
  { recruiter: "Aisha Khan", calls: 62, interviews: 20, selections: 8, joinings: 5 },
  { recruiter: "Rohit Mehta", calls: 54, interviews: 18, selections: 7, joinings: 4 },
  { recruiter: "Neha Verma", calls: 49, interviews: 16, selections: 6, joinings: 3 },
  { recruiter: "Arjun Reddy", calls: 58, interviews: 22, selections: 9, joinings: 6 },
];

const leadBacklog = [
  { id: "lead-101", company: "FinEdge", role: "Senior Backend Engineer" },
  { id: "lead-102", company: "BluePeak", role: "Sales Manager" },
  { id: "lead-103", company: "NorthBridge", role: "Product Analyst" },
];

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
      <DashboardHeader
        iconName="users"
        title="Team Leader Dashboard"
        description="Monitor recruiter productivity, conversion funnel, and assign fresh leads to the team."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Calls" value="223" iconName="phone" trend="+12% vs last week" />
        <StatCard label="Interviews" value="76" iconName="users" />
        <StatCard label="Selections" value="30" iconName="userCheck" />
        <StatCard label="Joinings" value="18" iconName="userPlus" trend="60% conversion" />
      </div>

      <TodaySummary />

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
