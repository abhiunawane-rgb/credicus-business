import { redirect } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import CandidateUploadForm from "@/components/candidates/upload-form";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterUploadPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.role !== "recruiter") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={FileSpreadsheet}
        title="Candidate Import"
        description="Upload Excel sheets to bulk import candidate data into the CRM."
      />
      <CandidateUploadForm />
    </section>
  );
}
