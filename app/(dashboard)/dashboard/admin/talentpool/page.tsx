import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import CandidateWorkbench from "@/components/candidates/candidate-workbench";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function AdminTalentPoolPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={Database}
        title="Talent Pool"
        description="Admin view of all candidates across recruiters and clients."
      />
      <CandidateWorkbench currentUserEmail={session.email} />
    </section>
  );
}
