import { redirect } from "next/navigation";
import { BarChart3, Database, UserCog, UserPlus } from "lucide-react";
import AdminPanel from "@/components/admin/admin-panel";
import CatalogManager from "@/components/admin/catalog-manager";
import AdminDashboardMetrics from "@/components/dashboard/admin-dashboard-metrics";
import ClientSummaryTable from "@/components/dashboard/client-summary-table";
import RecruiterSummaryTable from "@/components/dashboard/recruiter-summary-table";
import ActionCard from "@/components/ui/action-card";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function AdminDashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <DashboardHeader
        iconName="shield"
        title="Admin Dashboard"
        description="Manage users, role assignments, data movement, and system controls in one place."
        tip="User management: go to Users in the sidebar to add accounts, set roles, activate/deactivate, reset passwords, or delete users."
      />

      <AdminDashboardMetrics />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard href="/dashboard/admin/users" title="User Management" description="Create users, set user type, edit, change roles, and remove accounts." icon={UserCog} />
        <ActionCard href="/dashboard/admin/employees" title="Employee Data" description="Add and manage internal employee records." icon={UserPlus} />
        <ActionCard href="/dashboard/admin/talentpool" title="Talent Pool" description="View all candidates across recruiters." icon={Database} />
        <ActionCard href="/dashboard/admin/reports" title="Reports" description="Month-wise hiring data and performance tables." icon={BarChart3} />
      </div>

      <RecruiterSummaryTable showDownload />
      <ClientSummaryTable title="All Client-wise Summary" showDownload />

      <CatalogManager />
      <AdminPanel />
    </section>
  );
}
