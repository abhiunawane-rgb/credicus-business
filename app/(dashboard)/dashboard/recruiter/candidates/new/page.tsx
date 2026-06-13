import { redirect } from "next/navigation";
import AddCandidateForm from "@/components/candidates/add-candidate-form";
import DashboardHeader from "@/components/ui/dashboard-header";
import { UserPlus } from "lucide-react";
import { getAuthSession } from "@/lib/auth-session";

export default async function NewCandidatePage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={UserPlus}
        title="Add New Candidate"
        description="Complete candidate data form as defined in Credicus Flow — source, process, call status, and comments."
      />
      <AddCandidateForm />
    </section>
  );
}
