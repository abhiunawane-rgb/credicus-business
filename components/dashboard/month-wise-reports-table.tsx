"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import ReportDownloadButtons from "@/components/dashboard/report-download-buttons";
import SortableTh from "@/components/ui/sortable-th";
import { matchesSearch } from "@/lib/list-filters";
import type { MonthSummaryRow } from "@/lib/report-summaries";
import { sortRows, type SortDirection } from "@/lib/table-sort";

type SortKey = "month" | "created" | "interviews" | "selections" | "joinings";

export default function MonthWiseReportsTable() {
  const [rows, setRows] = useState<MonthSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

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

  const filtered = useMemo(() => {
    const matched = rows.filter((row) => matchesSearch(search, [row.month, row.key]));
    return sortRows(matched, (row) => row[sortKey], sortDir);
  }, [rows, search, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "month" ? "desc" : "desc");
  }

  return (
    <div className="space-y-4">
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter month..."
        onReset={() => setSearch("")}
        resultCount={filtered.length}
      />
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
            <tr className="border-b border-credicus-line-default bg-credicus-surface">
              <SortableTh label="Month" active={sortKey === "month"} direction={sortDir} onSort={() => onSort("month")} />
              <SortableTh label="Candidates Created" active={sortKey === "created"} direction={sortDir} onSort={() => onSort("created")} />
              <SortableTh label="Interviews" active={sortKey === "interviews"} direction={sortDir} onSort={() => onSort("interviews")} />
              <SortableTh label="Selections" active={sortKey === "selections"} direction={sortDir} onSort={() => onSort("selections")} />
              <SortableTh label="Joinings" active={sortKey === "joinings"} direction={sortDir} onSort={() => onSort("joinings")} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-credicus-ink-muted">
                  Loading month-wise reports...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-credicus-ink-muted">
                  No monthly data yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
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
    </div>
  );
}
