import { redirect } from "next/navigation";
import { FileSpreadsheet, FileText, Users } from "lucide-react";
import TodaySummary from "@/components/dashboard/today-summary";
import ActionCard from "@/components/ui/action-card";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  const firstName = session.email.split("@")[0];
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={Users}
        title={`${greeting}, ${firstName}`}
        description="Track today's hiring activity, manage candidates, and move talent through your pipeline."
      />

      <TodaySummary />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard href="/dashboard/recruiter/candidates/new" title="Add New Candidate" description="Full employee-style candidate data form." icon={Users} />
        <ActionCard href="/dashboard/recruiter/candidates" title="Candidate List" description="Search, change stage, and add comment logs." icon={Users} />
        <ActionCard href="/dashboard/recruiter/upload" title="Import Excel" description="Bulk-import candidates from spreadsheet." icon={FileSpreadsheet} />
        <ActionCard href="/dashboard/recruiter/resumes" title="Upload Resumes" description="Attach resume files to profiles." icon={FileText} />
        <ActionCard href="/dashboard/recruiter/invitations" title="Invitations" description="Submit candidates to client companies." icon={Users} />
        <ActionCard href="/dashboard/recruiter/follow-ups" title="Follow-ups" description="Track calls, interviews, and next actions." icon={Users} />
      </div>
    </section>
  );
}
