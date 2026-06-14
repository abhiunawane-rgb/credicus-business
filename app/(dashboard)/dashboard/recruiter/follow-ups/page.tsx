import { redirect } from "next/navigation";
import { Phone } from "lucide-react";
import FollowUpTable from "@/components/candidates/follow-up-table";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterFollowUpsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="phone"
        title="Follow-up Tracker"
        description="Track upcoming interviews, call status, and next actions for all candidates."
      />
      <FollowUpTable />
    </section>
  );
}
