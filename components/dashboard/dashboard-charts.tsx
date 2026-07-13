"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHART_LOCATIONS,
  locationDailyCounts,
  vendorTrendSeries,
} from "@/lib/vendor-data";

type Period = "current" | "previous";

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

function getPeriodRange(period: Period, now: Date) {
  if (period === "previous") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: toLocalDateString(start), end: toLocalDateString(end) };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: toLocalDateString(start), end: toLocalDateString(now) };
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
        const x = (i / (values.length - 1)) * width;
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
            x={(i / (labels.length - 1)) * width}
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

type DashboardChartsProps = {
  appliedCount: number;
  selectedCount: number;
  rejectedCount: number;
};

export default function DashboardCharts({ appliedCount, selectedCount, rejectedCount }: DashboardChartsProps) {
  const [period, setPeriod] = useState<Period>("current");
  const [location, setLocation] = useState(CHART_LOCATIONS[0]);
  const [trendView, setTrendView] = useState<"all" | "applied" | "selected" | "rejected">("all");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const trendSeries = useMemo(() => {
    const all = [
      { label: "Applied", color: "#FFD200", values: vendorTrendSeries.applied },
      { label: "Selected", color: "#16a34a", values: vendorTrendSeries.selected },
      { label: "Rejected", color: "#dc2626", values: vendorTrendSeries.rejected },
    ];
    if (period === "previous") {
      return all.map((series) => ({
        ...series,
        values: series.values.map((value) => Math.max(value - 8, 0)),
      }));
    }
    if (trendView === "all") return all;
    return all.filter((series) => series.label.toLowerCase() === trendView);
  }, [period, trendView]);

  const locationData = useMemo(() => locationDailyCounts[location] ?? [0, 0, 0, 0], [location]);
  const locationLabels = ["Day 1", "Day 2", "Day 3", "Day 4"];

  const { start: rangeStart, end: rangeEnd } = getPeriodRange(period, now);
  const currentDateTime = formatLocalDateTime(now);

  const metrics =
    period === "current"
      ? { applied: appliedCount, selected: selectedCount, rejected: rejectedCount }
      : { applied: Math.max(appliedCount - 42, 0), selected: Math.max(selectedCount - 2, 0), rejected: Math.max(rejectedCount - 1, 0) };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-credicus-line-subtle bg-white p-1">
          <button
            type="button"
            onClick={() => setPeriod("current")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              period === "current" ? "bg-credicus-primary text-credicus-ink" : "text-credicus-ink-secondary hover:bg-credicus-surface"
            }`}
          >
            Current Month
          </button>
          <button
            type="button"
            onClick={() => setPeriod("previous")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              period === "previous" ? "bg-credicus-primary text-credicus-ink" : "text-credicus-ink-secondary hover:bg-credicus-surface"
            }`}
          >
            Previous Month
          </button>
        </div>
        <div className="rounded-lg border border-credicus-line-subtle bg-white px-4 py-2 text-sm text-credicus-ink-secondary">
          <span className="font-medium text-credicus-ink">{currentDateTime}</span>
          <span className="mx-2 text-credicus-ink-muted">|</span>
          <span>
            {rangeStart} — {rangeEnd}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Applied Candidate", value: metrics.applied, icon: "👤+", color: "text-credicus-ink bg-credicus-yellow-soft" },
          { label: "Selected Candidate", value: metrics.selected, icon: "✓", color: "text-green-600 bg-green-50" },
          { label: "Rejected Candidates", value: metrics.rejected, icon: "✕", color: "text-red-600 bg-red-50" },
        ].map((card) => (
          <article key={card.label} className="ui-card flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-sm text-credicus-gray">{card.label}</p>
              <p className="text-3xl font-bold text-credicus-ink">{card.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-credicus-ink">Location wise count</h3>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-credicus-line-subtle px-2 py-1.5 text-sm outline-none focus:border-credicus-primary"
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
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-credicus-ink">Location activity</h3>
            <select
              value={trendView}
              onChange={(e) => setTrendView(e.target.value as typeof trendView)}
              className="max-w-[200px] truncate rounded-lg border border-credicus-line-subtle px-2 py-1.5 text-sm outline-none focus:border-credicus-primary"
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
    </div>
  );
}
