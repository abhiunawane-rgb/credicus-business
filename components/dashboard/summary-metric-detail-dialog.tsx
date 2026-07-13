"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { SummaryMetricDetailRow } from "@/lib/summary-metric-details";

type SummaryMetricDetailDialogProps = {
  title: string;
  subtitle?: string;
  rows: SummaryMetricDetailRow[];
  onClose: () => void;
};

export default function SummaryMetricDetailDialog({
  title,
  subtitle,
  rows,
  onClose,
}: SummaryMetricDetailDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
            <p className="mt-1 text-xs text-credicus-ink-muted">{rows.length} record{rows.length === 1 ? "" : "s"}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-credicus-line-subtle text-credicus-ink-secondary hover:bg-credicus-surface"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-credicus-gray">No records for this metric.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-credicus-line-subtle bg-credicus-surface text-left text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">
                  <th className="px-3 py-2">Candidate ID</th>
                  <th className="px-3 py-2">Full Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
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
          <button type="button" onClick={onClose} className="ui-button-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
