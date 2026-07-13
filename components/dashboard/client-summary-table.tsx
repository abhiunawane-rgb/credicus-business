"use client";

import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import ClickableMetricCell from "@/components/dashboard/clickable-metric-cell";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import SummaryMetricDetailDialog from "@/components/dashboard/summary-metric-detail-dialog";
import { matchesSearch } from "@/lib/list-filters";
import { buildSummaryMetricDetailRows } from "@/lib/summary-metric-details";

const clientRows = [
  { client: "NovaCorp", interviews: 11, confirmed: 9, tomorrow: 7, selections: 11, joinings: 5 },
  { client: "GreenLeaf", interviews: 14, confirmed: 12, tomorrow: 9, selections: 13, joinings: 8 },
  { client: "Summit HR", interviews: 18, confirmed: 15, tomorrow: 12, selections: 17, joinings: 10 },
  { client: "TechBridge", interviews: 9, confirmed: 8, tomorrow: 6, selections: 7, joinings: 4 },
];

type MetricKey = "interviews" | "confirmed" | "tomorrow" | "selections" | "joinings";

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

export default function ClientSummaryTable({ title = "Client-wise Summary" }: { title?: string }) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DetailState | null>(null);

  const filtered = useMemo(
    () => clientRows.filter((row) => matchesSearch(search, [row.client])),
    [search],
  );

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
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
            <Building2 className="h-5 w-5 text-credicus-primary" />
            {title}
          </h4>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-default bg-credicus-surface text-credicus-gray">
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Today Interviews</th>
                <th className="px-3 py-2 text-left">Confirmed</th>
                <th className="px-3 py-2 text-left">Tomorrow</th>
                <th className="px-3 py-2 text-left">Selections (Month)</th>
                <th className="px-3 py-2 text-left">Joinings (Month)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    No clients match your search.
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
