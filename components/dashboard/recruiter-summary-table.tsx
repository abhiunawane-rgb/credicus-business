"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import ClickableMetricCell from "@/components/dashboard/clickable-metric-cell";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import SummaryMetricDetailDialog from "@/components/dashboard/summary-metric-detail-dialog";
import { matchesSearch } from "@/lib/list-filters";
import { buildSummaryMetricDetailRows } from "@/lib/summary-metric-details";

const recruiterRows = [
  { name: "Rahul", created: 10, interviews: 10, confirmed: 10, selections: 10, joinings: 10 },
  { name: "Mahesh", created: 15, interviews: 15, confirmed: 14, selections: 15, joinings: 15 },
  { name: "Rajesh", created: 20, interviews: 20, confirmed: 18, selections: 20, joinings: 20 },
  { name: "Aisha Khan", created: 12, interviews: 11, confirmed: 9, selections: 8, joinings: 5 },
];

type MetricKey = "created" | "interviews" | "confirmed" | "selections" | "joinings";

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

export default function RecruiterSummaryTable() {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DetailState | null>(null);

  const filtered = useMemo(
    () => recruiterRows.filter((row) => matchesSearch(search, [row.name])),
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
      subtitle: "Candidate-level breakdown for this recruiter metric.",
    });
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
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
            <Users className="h-5 w-5 text-credicus-primary" />
            Today Summary — Recruiter-wise
          </h4>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-default bg-credicus-surface text-credicus-gray">
                <th className="px-3 py-2 text-left">Recruiter</th>
                <th className="px-3 py-2 text-left">Candidates Created</th>
                <th className="px-3 py-2 text-left">Interviews</th>
                <th className="px-3 py-2 text-left">Confirmed</th>
                <th className="px-3 py-2 text-left">Selections (Month)</th>
                <th className="px-3 py-2 text-left">Joinings (Month)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                    No recruiters match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.name} className="border-b border-credicus-line-default transition-colors duration-200 hover:bg-credicus-primary-light/50">
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
