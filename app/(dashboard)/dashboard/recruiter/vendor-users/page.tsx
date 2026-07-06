import { redirect } from "next/navigation";
import VendorUsersPanel from "@/components/dashboard/vendor-users-panel";
import { getAuthSession } from "@/lib/auth-session";

export default async function VendorUsersPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return <VendorUsersPanel />;
}
