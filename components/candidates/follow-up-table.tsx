"use client";

import { Phone } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import type { CandidateRecord } from "@/lib/candidate-types";
import { displayCandidateName, STAGE_LABELS } from "@/lib/candidate-types";
import { matchesSearch } from "@/lib/list-filters";

const STAGE_FILTER_OPTIONS = [
  { value: "all", label: "All stages" },
  ...Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label })),
];

export default function FollowUpTable() {
  const [rows, setRows] = useState<CandidateRecord[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/candidates", { credentials: "same-origin" });
      const payload = (await response.json()) as { data?: CandidateRecord[] };
      setRows(payload.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const name = displayCandidateName(row);
      const matchesStage = stageFilter === "all" || row.status === stageFilter;
      const matchesText = matchesSearch(search, [name, row.mobile, row.location, STAGE_LABELS[row.status]]);
      return matchesStage && matchesText;
    });
  }, [rows, search, stageFilter]);

  return (
    <div className="space-y-4">
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, mobile, or stage..."
        onRefresh={() => void loadRows()}
        refreshing={loading}
        filters={[
          {
            id: "stage",
            label: "Stage",
            value: stageFilter,
            onChange: setStageFilter,
            options: STAGE_FILTER_OPTIONS,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStageFilter("all");
        }}
        resultCount={filtered.length}
      />

      <div className="ui-card overflow-x-auto p-4">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
          <Phone className="h-5 w-5 text-credicus-primary" />
          Follow-up Tracker
        </h4>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-credicus-line-default bg-credicus-surface text-credicus-gray">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Mobile</th>
              <th className="px-3 py-2 text-left">Interview</th>
              <th className="px-3 py-2 text-left">Stage</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-credicus-gray">
                  Loading follow-ups...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-credicus-gray">
                  No candidates match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-credicus-line-default hover:bg-credicus-surface">
                  <td className="px-3 py-3 font-medium text-credicus-ink">{displayCandidateName(row)}</td>
                  <td className="px-3 py-3 text-credicus-gray">{row.mobile}</td>
                  <td className="px-3 py-3 text-credicus-gray">
                    {row.interview_date ? new Date(row.interview_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-3 font-medium text-credicus-primary">{STAGE_LABELS[row.status]}</td>
                  <td className="px-3 py-3">
                    <a
                      href={`/dashboard/recruiter/candidates/${row.id}`}
                      className="text-xs font-medium text-credicus-primary hover:underline"
                    >
                      View / Update
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
