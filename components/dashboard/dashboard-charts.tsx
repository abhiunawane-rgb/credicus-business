"use client";

import { useEffect, useMemo, useState } from "react";
import SummaryMetricDetailDialog from "@/components/dashboard/summary-metric-detail-dialog";
import {
  candidateInDateRange,
  candidatesToDetailRows,
  isRejectedCandidate,
  isSelectedCandidate,
} from "@/lib/candidate-kpi";
import type { CandidateRecord } from "@/lib/candidate-types";
import {
  CHART_LOCATIONS,
  locationDailyCounts,
  vendorTrendSeries,
} from "@/lib/vendor-data";

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDateTime(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex h-48 items-end gap-2 pt-4">
      {data.map((value, index) => (
        <div key={labels[index]} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-credicus-primary/80 transition-all hover:bg-credicus-primary"
            style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? "8px" : "2px" }}
            title={`${labels[index]}: ${value}`}
          />
          <span className="text-[10px] text-credicus-ink-muted">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({
  series,
}: {
  series: { label: string; color: string; values: number[] }[];
}) {
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1);
  const width = 320;
  const height = 160;
  const labels = vendorTrendSeries.labels;

  function points(values: number[]) {
    return values
      .map((v, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * width;
        const y = height - (v / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 24}`} className="h-48 w-full min-w-[280px]">
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            points={points(s.values)}
          />
        ))}
        {labels.map((label, i) => (
          <text
            key={label}
            x={(i / Math.max(labels.length - 1, 1)) * width}
            y={height + 18}
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-credicus-ink-secondary">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

type KpiKey = "applied" | "selected" | "rejected";

type DashboardChartsProps = {
  candidates: CandidateRecord[];
};

export default function DashboardCharts({ candidates }: DashboardChartsProps) {
  const [location, setLocation] = useState(CHART_LOCATIONS[0]);
  const [trendView, setTrendView] = useState<"all" | "applied" | "selected" | "rejected">("all");
  const [now, setNow] = useState(() => new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredCandidates = useMemo(
    () => candidates.filter((candidate) => candidateInDateRange(candidate, dateFrom || undefined, dateTo || undefined)),
    [candidates, dateFrom, dateTo],
  );

  const applied = filteredCandidates;
  const selected = filteredCandidates.filter(isSelectedCandidate);
  const rejected = filteredCandidates.filter(isRejectedCandidate);

  const trendSeries = useMemo(() => {
    const all = [
      { label: "Applied", color: "#FFD200", values: vendorTrendSeries.applied },
      { label: "Selected", color: "#16a34a", values: vendorTrendSeries.selected },
      { label: "Rejected", color: "#dc2626", values: vendorTrendSeries.rejected },
    ];
    if (trendView === "all") return all;
    return all.filter((series) => series.label.toLowerCase() === trendView);
  }, [trendView]);

  const locationData = useMemo(() => locationDailyCounts[location] ?? [0, 0, 0, 0], [location]);
  const locationLabels = ["Day 1", "Day 2", "Day 3", "Day 4"];
  const currentDateTime = formatLocalDateTime(now);
  const today = toLocalDateString(now);

  const kpiCards: Array<{
    key: KpiKey;
    label: string;
    value: number;
    icon: string;
    color: string;
    rows: CandidateRecord[];
  }> = [
    {
      key: "applied",
      label: "Applied Candidate",
      value: applied.length,
      icon: "👤+",
      color: "text-credicus-ink bg-credicus-yellow-soft",
      rows: applied,
    },
    {
      key: "selected",
      label: "Selected Candidate",
      value: selected.length,
      icon: "✓",
      color: "text-green-600 bg-green-50",
      rows: selected,
    },
    {
      key: "rejected",
      label: "Rejected Candidates",
      value: rejected.length,
      icon: "✕",
      color: "text-red-600 bg-red-50",
      rows: rejected,
    },
  ];

  const activeCard = kpiCards.find((card) => card.key === activeKpi) ?? null;

  function resetDates() {
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="rounded-2xl border border-credicus-line-subtle bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">Today</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-credicus-ink" aria-live="polite">
            {currentDateTime}
          </p>
          <p className="mt-0.5 text-xs text-credicus-ink-secondary">{today}</p>
        </div>

        <div className="ui-card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="dash-date-from" className="ui-label">
              From date
            </label>
            <input
              id="dash-date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="ui-input mt-1 min-h-11"
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="dash-date-to" className="ui-label">
              To date
            </label>
            <input
              id="dash-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="ui-input mt-1 min-h-11"
            />
          </div>
          <button type="button" onClick={resetDates} className="ui-button-secondary min-h-11 shrink-0">
            Clear dates
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setActiveKpi(card.key)}
            aria-label={`${card.label}: ${card.value}. Open detail list.`}
            className="ui-card group flex min-h-[5.5rem] w-full items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:border-credicus-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credicus-primary"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${card.color}`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-credicus-gray">{card.label}</p>
              <p className="text-3xl font-bold tabular-nums text-credicus-ink">{card.value}</p>
              <p className="mt-1 text-xs font-medium text-credicus-ink-muted group-hover:text-credicus-primary">
                Tap to view list
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-credicus-ink">Location wise count</h3>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter location"
              className="min-h-11 rounded-lg border border-credicus-line-subtle px-3 py-2 text-sm outline-none focus:border-credicus-primary"
            >
              {CHART_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <BarChart data={locationData} labels={locationLabels} />
        </div>

        <div className="ui-card p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-credicus-ink">Location activity</h3>
            <select
              value={trendView}
              onChange={(e) => setTrendView(e.target.value as typeof trendView)}
              aria-label="Filter activity metrics"
              className="min-h-11 max-w-full truncate rounded-lg border border-credicus-line-subtle px-3 py-2 text-sm outline-none focus:border-credicus-primary sm:max-w-[200px]"
            >
              <option value="all">All metrics</option>
              <option value="applied">Applied only</option>
              <option value="selected">Selected only</option>
              <option value="rejected">Rejected only</option>
            </select>
          </div>
          <LineChart series={trendSeries} />
        </div>
      </div>

      {activeCard ? (
        <SummaryMetricDetailDialog
          title={activeCard.label}
          subtitle={
            dateFrom || dateTo
              ? `Filtered ${dateFrom || "…"} → ${dateTo || "…"}`
              : "All records in the selected range"
          }
          rows={candidatesToDetailRows(activeCard.rows)}
          onClose={() => setActiveKpi(null)}
        />
      ) : null}
    </div>
  );
}
