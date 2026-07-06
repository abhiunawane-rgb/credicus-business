import { redirect } from "next/navigation";
import AddCandidateForm from "@/components/candidates/add-candidate-form";
import { getAuthSession } from "@/lib/auth-session";

export default async function NewCandidatePage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <AddCandidateForm />
    </section>
  );
}
