"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { TeamLeaderKpiDetail } from "@/lib/team-leader-kpi-details";

type KpiDetailDialogProps = {
  detail: TeamLeaderKpiDetail | null;
  onClose: () => void;
  actionHref?: string;
  actionLabel?: string;
};

export default function KpiDetailDialog({ detail, onClose, actionHref, actionLabel }: KpiDetailDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!detail) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detail, onClose]);

  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close KPI details"
        className="absolute inset-0 bg-credicus-ink/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg animate-fade-in-up rounded-2xl border border-credicus-line-subtle bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-credicus-line-subtle px-5 py-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-credicus-ink">
              {detail.title}
            </h2>
            <p className="mt-1 text-3xl font-bold tabular-nums text-credicus-primary">{detail.value}</p>
            {detail.trend ? <p className="mt-1 text-sm font-medium text-credicus-ink-secondary">{detail.trend}</p> : null}
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

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-credicus-ink-secondary">{detail.description}</p>

          {detail.breakdown.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-credicus-line-subtle">
              <div className="border-b border-credicus-line-subtle bg-credicus-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">
                {detail.breakdownTitle ?? "Breakdown"}
              </div>
              <table className="min-w-full text-sm">
                <tbody>
                  {detail.breakdown.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-credicus-ink">{row.label}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-credicus-primary">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-credicus-line-subtle px-5 py-4">
          {actionHref && actionLabel ? (
            <Link href={actionHref} onClick={onClose} className="ui-button-primary">
              {actionLabel}
            </Link>
          ) : null}
          <button type="button" onClick={onClose} className="ui-button-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
