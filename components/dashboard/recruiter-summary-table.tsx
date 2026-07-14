"use client";

import { Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ClickableMetricCell from "@/components/dashboard/clickable-metric-cell";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import ReportDownloadButtons from "@/components/dashboard/report-download-buttons";
import SummaryMetricDetailDialog from "@/components/dashboard/summary-metric-detail-dialog";
import SortableTh from "@/components/ui/sortable-th";
import { matchesSearch } from "@/lib/list-filters";
import type { RecruiterSummaryRow } from "@/lib/report-summaries";
import { buildSummaryMetricDetailRows } from "@/lib/summary-metric-details";
import { sortRows, type SortDirection } from "@/lib/table-sort";

type MetricKey = "created" | "interviews" | "confirmed" | "selections" | "joinings";
type SortKey = "name" | MetricKey;

const metricLabels: Record<MetricKey, string> = {
  created: "Candidates Created",
  interviews: "Interviews",
  confirmed: "Confirmed",
  selections: "Selections (Month)",
  joinings: "Joinings (Month)",
};

type DetailState = {
  title: string;
  subtitle: string;
  metricKey: MetricKey;
  count: number;
  rowLabel: string;
};

type Props = {
  showDownload?: boolean;
};

export default function RecruiterSummaryTable({ showDownload = false }: Props) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [rows, setRows] = useState<RecruiterSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/reports?type=recruiter", { credentials: "same-origin" });
        const body = (await response.json()) as { data?: RecruiterSummaryRow[] };
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
    const matched = rows.filter((row) => matchesSearch(search, [row.name, row.email]));
    return sortRows(matched, (row) => (sortKey === "name" ? row.name : row[sortKey]), sortDir);
  }, [search, rows, sortKey, sortDir]);

  const detailRows = detail
    ? buildSummaryMetricDetailRows({
        rowLabel: detail.rowLabel,
        metricKey: detail.metricKey,
        metricLabel: metricLabels[detail.metricKey],
        count: detail.count,
      })
    : [];

  function openDetail(rowLabel: string, metricKey: MetricKey, count: number) {
    setDetail({
      rowLabel,
      metricKey,
      count,
      title: `${metricLabels[metricKey]} — ${rowLabel}`,
      subtitle: "Candidate-level breakdown for this recruiter metric.",
    });
  }

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  }

  return (
    <>
      <div className="space-y-4">
        <ListFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search recruiter..."
          onReset={() => setSearch("")}
          resultCount={filtered.length}
        />

        <div className="ui-card overflow-x-auto p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-credicus-ink">
              <Users className="h-5 w-5 text-credicus-primary" />
              Today Summary — Recruiter-wise
            </h4>
            {showDownload ? <ReportDownloadButtons report="recruiter" /> : null}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-default bg-credicus-surface">
                <SortableTh label="Recruiter" active={sortKey === "name"} direction={sortDir} onSort={() => onSort("name")} />
                <SortableTh label="Candidates Created" active={sortKey === "created"} direction={sortDir} onSort={() => onSort("created")} />
                <SortableTh label="Interviews" active={sortKey === "interviews"} direction={sortDir} onSort={() => onSort("interviews")} />
                <SortableTh label="Confirmed" active={sortKey === "confirmed"} direction={sortDir} onSort={() => onSort("confirmed")} />
                <SortableTh label="Selections (Month)" active={sortKey === "selections"} direction={sortDir} onSort={() => onSort("selections")} />
                <SortableTh label="Joinings (Month)" active={sortKey === "joinings"} direction={sortDir} onSort={() => onSort("joinings")} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    Loading recruiter summary...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    No recruiters match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.email} className="border-b border-credicus-line-default transition-colors duration-200 hover:bg-credicus-primary-light/50">
                    <td className="px-3 py-3 font-medium text-credicus-ink">{row.name}</td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.created} label={`${row.name} — Candidates Created`} onClick={() => openDetail(row.name, "created", row.created)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.interviews} label={`${row.name} — Interviews`} onClick={() => openDetail(row.name, "interviews", row.interviews)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.confirmed} label={`${row.name} — Confirmed`} onClick={() => openDetail(row.name, "confirmed", row.confirmed)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.selections} label={`${row.name} — Selections`} onClick={() => openDetail(row.name, "selections", row.selections)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.joinings} label={`${row.name} — Joinings`} onClick={() => openDetail(row.name, "joinings", row.joinings)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail ? (
        <SummaryMetricDetailDialog
          title={detail.title}
          subtitle={detail.subtitle}
          rows={detailRows}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </>
  );
}
