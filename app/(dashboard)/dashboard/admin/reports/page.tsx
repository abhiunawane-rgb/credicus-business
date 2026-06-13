import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import ClientSummaryTable from "@/components/dashboard/client-summary-table";
import RecruiterSummaryTable from "@/components/dashboard/recruiter-summary-table";
import DashboardHeader from "@/components/ui/dashboard-header";
import { getAuthSession } from "@/lib/auth-session";

const monthReports = [
  { month: "April 2026", created: 145, interviews: 89, selections: 34, joinings: 18 },
  { month: "March 2026", created: 132, interviews: 76, selections: 28, joinings: 15 },
  { month: "February 2026", created: 118, interviews: 68, selections: 25, joinings: 12 },
];

export default async function AdminReportsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <section className="space-y-6">
      <DashboardHeader
        icon={BarChart3}
        title="Reports"
        description="Month-wise hiring data, recruiter performance, and client-wise summaries."
      />

      <div className="ui-card-dark overflow-x-auto p-4">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-credicus-yellow" />
          Month-wise Data
        </h4>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-credicus-border text-credicus-gray">
              <th className="px-3 py-2 text-left">Month</th>
              <th className="px-3 py-2 text-left">Candidates Created</th>
              <th className="px-3 py-2 text-left">Interviews</th>
              <th className="px-3 py-2 text-left">Selections</th>
              <th className="px-3 py-2 text-left">Joinings</th>
            </tr>
          </thead>
          <tbody>
            {monthReports.map((row) => (
              <tr key={row.month} className="border-b border-credicus-border/60 hover:bg-white/5">
                <td className="px-3 py-3 font-medium text-white">{row.month}</td>
                <td className="px-3 py-3 text-credicus-gray-light">{row.created}</td>
                <td className="px-3 py-3 text-credicus-gray-light">{row.interviews}</td>
                <td className="px-3 py-3 text-credicus-yellow">{row.selections}</td>
                <td className="px-3 py-3 text-credicus-yellow">{row.joinings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RecruiterSummaryTable />
      <ClientSummaryTable title="All Client-wise Summary" />
    </section>
  );
}
