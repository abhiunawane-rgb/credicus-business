"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import ReportDownloadButtons from "@/components/dashboard/report-download-buttons";
import type { MonthSummaryRow } from "@/lib/report-summaries";

export default function MonthWiseReportsTable() {
  const [rows, setRows] = useState<MonthSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/reports?type=month", { credentials: "same-origin" });
        const body = (await response.json()) as { data?: MonthSummaryRow[] };
        if (!cancelled) setRows(body.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ui-card overflow-x-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-credicus-ink">
          <BarChart3 className="h-5 w-5 text-credicus-primary" />
          Month-wise Data
        </h4>
        <ReportDownloadButtons report="month" />
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-credicus-line-default bg-credicus-surface text-credicus-gray">
            <th className="px-3 py-2 text-left">Month</th>
            <th className="px-3 py-2 text-left">Candidates Created</th>
            <th className="px-3 py-2 text-left">Interviews</th>
            <th className="px-3 py-2 text-left">Selections</th>
            <th className="px-3 py-2 text-left">Joinings</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-credicus-ink-muted">
                Loading month-wise reports...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-credicus-ink-muted">
                No monthly data yet.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className="border-b border-credicus-line-default hover:bg-credicus-primary-light/50">
                <td className="px-3 py-3 font-medium text-credicus-ink">{row.month}</td>
                <td className="px-3 py-3 text-credicus-gray">{row.created}</td>
                <td className="px-3 py-3 text-credicus-gray">{row.interviews}</td>
                <td className="px-3 py-3 font-medium text-credicus-primary">{row.selections}</td>
                <td className="px-3 py-3 font-medium text-credicus-primary">{row.joinings}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
