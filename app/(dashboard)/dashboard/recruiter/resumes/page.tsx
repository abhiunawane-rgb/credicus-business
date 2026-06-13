import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import ResumeUploadForm from "@/components/candidates/resume-upload-form";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterResumesPage() {
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
        icon={FileText}
        title="Resume Management"
        description="Upload resumes, store them under /uploads, and save the file path in the candidate record."
      />
      <ResumeUploadForm />
    </section>
  );
}
