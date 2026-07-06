import { redirect } from "next/navigation";
import RecruiterDashboardHome from "@/components/dashboard/recruiter-dashboard-home";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return <RecruiterDashboardHome />;
}
