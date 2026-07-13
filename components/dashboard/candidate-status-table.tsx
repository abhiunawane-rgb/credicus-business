"use client";

import { Edit } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import type { CandidateRecord } from "@/lib/candidate-types";
import {
  APPLICATION_STATUS_LABELS,
  applicantDisplayId,
  displayCandidateName,
  STAGE_LABELS,
  type CandidateStage,
} from "@/lib/candidate-types";
import { matchesSearch, paginate, toLocalDateKey, totalPages } from "@/lib/list-filters";
import { displayNameForEmail } from "@/lib/demo-accounts";

type CandidateStatusTableProps = {
  detailBasePath: string;
  readOnly?: boolean;
  scope?: "mine" | "all";
  showAddedBy?: boolean;
  showDateFilters?: boolean;
  showJoinExitDates?: boolean;
};

const STAGE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All statuses" },
  ...Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label })),
];

function statusBadgeClass(status: CandidateRecord["status"]): string {
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "hired" || status === "shortlisted") return "border-green-200 bg-green-50 text-green-700";
  if (status === "interviewed" || status === "offered") return "border-credicus-yellow/40 bg-credicus-yellow-soft text-credicus-ink";
  return "border-credicus-line-subtle bg-credicus-surface text-credicus-ink-secondary";
}

function dateInputValue(iso?: string | null) {
  return iso ? toLocalDateKey(iso) : "";
}

function EditableDateCell({
  value,
  editable,
  saving,
  onChange,
  label,
}: {
  value?: string | null;
  editable: boolean;
  saving: boolean;
  onChange: (value: string) => void;
  label: string;
}) {
  if (!editable) {
    return <span>{value ? toLocalDateKey(value) : "—"}</span>;
  }

  return (
    <input
      type="date"
      value={dateInputValue(value)}
      disabled={saving}
      onChange={(event) => onChange(event.target.value)}
      className="w-full min-w-[9.5rem] rounded-md border border-credicus-line-subtle bg-white px-2 py-1.5 text-sm outline-none focus:border-credicus-primary disabled:opacity-60"
      aria-label={label}
    />
  );
}

export default function CandidateStatusTable({
  detailBasePath,
  readOnly = false,
  scope = "all",
  showAddedBy = false,
  showDateFilters = false,
  showJoinExitDates = false,
}: CandidateStatusTableProps) {
  const { notify } = useActionFeedback();
  const [rows, setRows] = useState<CandidateRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingDateKey, setSavingDateKey] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const response = await fetch(`/api/candidates?${params.toString()}`, { credentials: "same-origin" });
      const payload = (await response.json()) as { data?: CandidateRecord[] };
      setRows(payload.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [scope, dateFrom, dateTo]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const name = displayCandidateName(row);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesText = matchesSearch(search, [
        name,
        row.mobile,
        row.email,
        row.location,
        row.process,
        APPLICATION_STATUS_LABELS[row.status],
      ]);
      return matchesStatus && matchesText;
    });
  }, [rows, search, statusFilter]);

  const pages = totalPages(filtered.length, pageSize);
  const pageRows = paginate(filtered, page, pageSize);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  async function updateCandidateDate(
    candidateId: string,
    field: "join_date" | "exit_date",
    value: string,
  ) {
    const savingKey = `${candidateId}:${field}`;
    setSavingDateKey(savingKey);
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ [field]: value || null }),
      });
      const payload = (await response.json()) as { data?: CandidateRecord; error?: string };
      if (!response.ok || !payload.data) {
        notify.error(payload.error ?? "Could not update date.");
        return;
      }
      setRows((current) => current.map((row) => (row.id === candidateId ? payload.data! : row)));
    } catch {
      notify.error("Could not update date.");
    } finally {
      setSavingDateKey(null);
    }
  }

  const columnCount = 8 + (showJoinExitDates ? 2 : 0) + (showAddedBy ? 1 : 0);
  const editableDates = showJoinExitDates && !readOnly;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-credicus-ink">Candidates</h2>
        <p className="mt-1 text-sm text-credicus-gray">
          {scope === "mine"
            ? "Candidates you added. Use date filters to narrow results."
            : "Track application progress across your hiring pipeline."}
        </p>
      </div>

      <ListFilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search name, mobile, email, location..."
        onRefresh={() => void loadRows()}
        refreshing={loading}
        filters={[
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1);
            },
            options: STAGE_FILTER_OPTIONS,
          },
        ]}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onReset={resetFilters}
        resultCount={filtered.length}
        dateFrom={showDateFilters ? dateFrom : undefined}
        dateTo={showDateFilters ? dateTo : undefined}
        onDateFromChange={
          showDateFilters
            ? (value) => {
                setDateFrom(value);
                setPage(1);
              }
            : undefined
        }
        onDateToChange={
          showDateFilters
            ? (value) => {
                setDateTo(value);
                setPage(1);
              }
            : undefined
        }
      />

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-subtle bg-credicus-surface text-left text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">
                <th className="px-4 py-3">Candidate ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Application Status</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Applied For</th>
                <th className="px-4 py-3">Preferred Date</th>
                <th className="px-4 py-3">Location</th>
                {showJoinExitDates ? <th className="px-4 py-3">Join Date</th> : null}
                {showJoinExitDates ? <th className="px-4 py-3">Exit Date</th> : null}
                {showAddedBy ? <th className="px-4 py-3">Added By</th> : null}
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-10 text-center text-credicus-gray">
                    Loading candidates...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-10 text-center text-credicus-gray">
                    No candidates match your filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const displayName = displayCandidateName(row);
                  return (
                    <tr key={row.id} className="border-b border-gray-100 transition-colors hover:bg-credicus-surface/80">
                      <td className="px-4 py-3 font-medium text-credicus-ink">
                        {applicantDisplayId(row.id, (page - 1) * pageSize + index)}
                      </td>
                      <td className="px-4 py-3 font-medium text-credicus-ink">{displayName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                          {APPLICATION_STATUS_LABELS[row.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-credicus-ink-secondary">{row.mobile}</td>
                      <td className="px-4 py-3 text-credicus-ink-secondary">{row.process ?? "—"}</td>
                      <td className="px-4 py-3 text-credicus-ink-secondary">
                        {row.interview_date ? toLocalDateKey(row.interview_date) : "—"}
                      </td>
                      <td className="px-4 py-3 text-credicus-ink-secondary">
                        {row.location ?? row.preferred_locations[0] ?? "—"}
                      </td>
                      {showJoinExitDates ? (
                        <td className="px-4 py-3 text-credicus-ink-secondary">
                          <EditableDateCell
                            value={row.join_date}
                            editable={editableDates}
                            saving={savingDateKey === `${row.id}:join_date`}
                            onChange={(value) => void updateCandidateDate(row.id, "join_date", value)}
                            label={`Join date for ${displayName}`}
                          />
                        </td>
                      ) : null}
                      {showJoinExitDates ? (
                        <td className="px-4 py-3 text-credicus-ink-secondary">
                          <EditableDateCell
                            value={row.exit_date}
                            editable={editableDates}
                            saving={savingDateKey === `${row.id}:exit_date`}
                            onChange={(value) => void updateCandidateDate(row.id, "exit_date", value)}
                            label={`Exit date for ${displayName}`}
                          />
                        </td>
                      ) : null}
                      {showAddedBy ? (
                        <td className="px-4 py-3 text-credicus-ink-secondary">
                          {row.created_by ? displayNameForEmail(row.created_by) : "—"}
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <Link
                          href={`${detailBasePath}/${row.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-600 hover:bg-teal-100"
                          aria-label={readOnly ? `View ${displayName}` : `Edit ${displayName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-credicus-line-subtle px-4 py-3 text-sm text-credicus-ink-secondary sm:flex-row">
          <p>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-credicus-line-subtle px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-lg bg-credicus-primary px-3 py-1.5 font-medium text-credicus-ink">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-credicus-line-subtle px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
