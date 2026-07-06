import { redirect } from "next/navigation";
import UsersPanel from "@/components/admin/users-panel";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="users"
        title="User Management"
        description="Create accounts, define user type, edit details, change roles, and remove users. Admin access only."
        tip="User types: Recruiter (candidates), Team Leader (team view), Admin (full control). Inactive users cannot sign in."
      />
      <UsersPanel />
    </section>
  );
}
