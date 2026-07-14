import { redirect } from "next/navigation";
import ClientSummaryTable from "@/components/dashboard/client-summary-table";
import MonthWiseReportsTable from "@/components/dashboard/month-wise-reports-table";
import RecruiterSummaryTable from "@/components/dashboard/recruiter-summary-table";
import ReportDownloadButtons from "@/components/dashboard/report-download-buttons";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

export default async function AdminReportsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DashboardHeader
          iconName="barChart3"
          title="Reports"
          description="Month-wise hiring data, recruiter performance, and client-wise summaries."
        />
        <ReportDownloadButtons report="all" className="mt-1" />
      </div>

      <MonthWiseReportsTable />
      <RecruiterSummaryTable showDownload />
      <ClientSummaryTable title="All Client-wise Summary" showDownload />
    </section>
  );
}
