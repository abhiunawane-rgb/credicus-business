"use client";

import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ClickableMetricCell from "@/components/dashboard/clickable-metric-cell";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import ReportDownloadButtons from "@/components/dashboard/report-download-buttons";
import SummaryMetricDetailDialog from "@/components/dashboard/summary-metric-detail-dialog";
import SortableTh from "@/components/ui/sortable-th";
import { matchesSearch } from "@/lib/list-filters";
import type { ClientSummaryRow } from "@/lib/report-summaries";
import { buildSummaryMetricDetailRows } from "@/lib/summary-metric-details";
import { sortRows, type SortDirection } from "@/lib/table-sort";

type MetricKey = "interviews" | "confirmed" | "tomorrow" | "selections" | "joinings";
type SortKey = "client" | MetricKey;

const metricLabels: Record<MetricKey, string> = {
  interviews: "Today Interviews",
  confirmed: "Confirmed",
  tomorrow: "Tomorrow",
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
  title?: string;
  showDownload?: boolean;
};

export default function ClientSummaryTable({ title = "Client-wise Summary", showDownload = false }: Props) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [rows, setRows] = useState<ClientSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("client");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/reports?type=client", { credentials: "same-origin" });
        const body = (await response.json()) as { data?: ClientSummaryRow[] };
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
    const matched = rows.filter((row) => matchesSearch(search, [row.client]));
    return sortRows(matched, (row) => (sortKey === "client" ? row.client : row[sortKey]), sortDir);
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
      subtitle: "Candidate-level breakdown for this client metric.",
    });
  }

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "client" ? "asc" : "desc");
  }

  return (
    <>
      <div className="space-y-4">
        <ListFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search client..."
          onReset={() => setSearch("")}
          resultCount={filtered.length}
        />

        <div className="ui-card overflow-x-auto p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-credicus-ink">
              <Building2 className="h-5 w-5 text-credicus-primary" />
              {title}
            </h4>
            {showDownload ? <ReportDownloadButtons report="client" /> : null}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-default bg-credicus-surface">
                <SortableTh label="Client" active={sortKey === "client"} direction={sortDir} onSort={() => onSort("client")} />
                <SortableTh label="Today Interviews" active={sortKey === "interviews"} direction={sortDir} onSort={() => onSort("interviews")} />
                <SortableTh label="Confirmed" active={sortKey === "confirmed"} direction={sortDir} onSort={() => onSort("confirmed")} />
                <SortableTh label="Tomorrow" active={sortKey === "tomorrow"} direction={sortDir} onSort={() => onSort("tomorrow")} />
                <SortableTh label="Selections (Month)" active={sortKey === "selections"} direction={sortDir} onSort={() => onSort("selections")} />
                <SortableTh label="Joinings (Month)" active={sortKey === "joinings"} direction={sortDir} onSort={() => onSort("joinings")} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    Loading client summary...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    No clients match your search. Admin can add companies on the dashboard.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.client} className="border-b border-credicus-line-default transition-colors duration-200 hover:bg-credicus-primary-light/50">
                    <td className="px-3 py-3 font-medium text-credicus-ink">{row.client}</td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.interviews} label={`${row.client} — Today Interviews`} onClick={() => openDetail(row.client, "interviews", row.interviews)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.confirmed} label={`${row.client} — Confirmed`} onClick={() => openDetail(row.client, "confirmed", row.confirmed)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.tomorrow} label={`${row.client} — Tomorrow`} onClick={() => openDetail(row.client, "tomorrow", row.tomorrow)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.selections} label={`${row.client} — Selections`} onClick={() => openDetail(row.client, "selections", row.selections)} />
                    </td>
                    <td className="px-3 py-3">
                      <ClickableMetricCell value={row.joinings} label={`${row.client} — Joinings`} onClick={() => openDetail(row.client, "joinings", row.joinings)} />
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
