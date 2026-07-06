import { redirect } from "next/navigation";
import VendorJobsPanel from "@/components/dashboard/vendor-jobs-panel";
import { getAuthSession } from "@/lib/auth-session";

export default async function VendorJobsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return <VendorJobsPanel />;
}
