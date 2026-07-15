import { Suspense } from "react";
import { redirect } from "next/navigation";
import RecruiterCandidatesClient from "@/components/dashboard/recruiter-candidates-client";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterCandidatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return (
    <Suspense fallback={<div className="ui-card p-6 text-sm text-credicus-ink-muted">Loading candidates…</div>}>
      <RecruiterCandidatesClient />
    </Suspense>
  );
}
