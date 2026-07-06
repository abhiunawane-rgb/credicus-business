import { redirect } from "next/navigation";
import InvitationForm from "@/components/candidates/invitation-form";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterInvitationsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <InvitationForm />
    </section>
  );
}
