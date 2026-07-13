import { redirect } from "next/navigation";
import CandidateStatusTable from "@/components/dashboard/candidate-status-table";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterCandidatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return <CandidateStatusTable detailBasePath="/dashboard/recruiter/candidates" scope="mine" showDateFilters />;
}
