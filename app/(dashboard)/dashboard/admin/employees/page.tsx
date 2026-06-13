import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import EmployeeForm from "@/components/admin/employee-form";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function AdminEmployeesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={UserPlus}
        title="Employee Data"
        description="Add and manage internal employee records — recruiters, team leaders, and staff."
      />
      <EmployeeForm />
    </section>
  );
}
