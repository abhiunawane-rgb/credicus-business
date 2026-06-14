import { redirect } from "next/navigation";
import { Send } from "lucide-react";
import InvitationForm from "@/components/candidates/invitation-form";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterInvitationsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="send"
        title="Invitations"
        description="Submit candidates to client companies with call status, reschedule date, and comments."
      />
      <InvitationForm />
    </section>
  );
}
