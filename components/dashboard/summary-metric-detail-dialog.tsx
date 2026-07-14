"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SummaryMetricDetailRow } from "@/lib/summary-metric-details";
import { sortRows, type SortDirection } from "@/lib/table-sort";

type SummaryMetricDetailDialogProps = {
  title: string;
  subtitle?: string;
  rows: SummaryMetricDetailRow[];
  onClose: () => void;
};

type SortKey = keyof SummaryMetricDetailRow;

const columns: Array<{ key: SortKey; label: string }> = [
  { key: "candidateId", label: "Candidate ID" },
  { key: "name", label: "Full Name" },
  { key: "mobile", label: "Contact" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

export default function SummaryMetricDetailDialog({
  title,
  subtitle,
  rows,
  onClose,
}: SummaryMetricDetailDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = !q
      ? rows
      : rows.filter((row) =>
          [row.candidateId, row.name, row.mobile, row.company, row.city, row.status, row.date]
            .join(" ")
            .toLowerCase()
            .includes(q),
        );
    return sortRows(filtered, (row) => row[sortKey], sortDir);
  }, [rows, search, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-credicus-ink/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-credicus-line-subtle bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-credicus-line-subtle px-5 py-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-credicus-ink">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-credicus-ink-secondary">{subtitle}</p> : null}
            <p className="mt-1 text-xs text-credicus-ink-muted">
              {visibleRows.length} of {rows.length} record{rows.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-credicus-line-subtle text-credicus-ink-secondary hover:bg-credicus-surface"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-credicus-line-subtle px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter this list…"
              className="ui-input min-h-11 pl-10"
              aria-label="Filter detail list"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {visibleRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-credicus-gray">No records match this view.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-credicus-line-subtle bg-credicus-surface">
                  {columns.map((column) => {
                    const active = sortKey === column.key;
                    return (
                      <th key={column.key} scope="col" className="px-3 py-2 text-left">
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-1 text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted hover:bg-white hover:text-credicus-ink"
                          aria-label={`Sort by ${column.label}`}
                        >
                          {column.label}
                          {active ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-credicus-primary" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-credicus-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-credicus-surface/80">
                    <td className="px-3 py-3 font-medium text-credicus-ink">{row.candidateId}</td>
                    <td className="px-3 py-3 font-medium text-credicus-ink">{row.name}</td>
                    <td className="px-3 py-3 text-credicus-ink-secondary">{row.mobile}</td>
                    <td className="px-3 py-3 text-credicus-ink-secondary">{row.company}</td>
                    <td className="px-3 py-3 text-credicus-ink-secondary">{row.city}</td>
                    <td className="px-3 py-3 text-credicus-ink-secondary">{row.status}</td>
                    <td className="px-3 py-3 text-credicus-ink-secondary">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-credicus-line-subtle px-5 py-4">
          <button type="button" onClick={onClose} className="ui-button-primary min-h-11">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
