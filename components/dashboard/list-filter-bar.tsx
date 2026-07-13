"use client";

import { RefreshCw, Search } from "lucide-react";

export type FilterSelectConfig = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
};

type ListFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  filters?: FilterSelectConfig[];
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  onReset?: () => void;
  resultCount?: number;
};

export default function ListFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  refreshing = false,
  filters = [],
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  onReset,
  resultCount,
}: ListFilterBarProps) {
  return (
    <div className="ui-card flex flex-col gap-3 border-b-0 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-ink-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="ui-input pl-10"
            type="search"
            aria-label="Search list"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-credicus-line-subtle text-credicus-ink-secondary hover:bg-credicus-surface"
              aria-label="Refresh list"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          ) : null}

          {filters.map((filter) => (
            <label key={filter.id} className="flex items-center gap-2 text-sm text-credicus-ink-secondary">
              <span className="sr-only">{filter.label}</span>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className={`rounded-lg border border-credicus-line-subtle bg-white px-3 py-2 text-sm outline-none focus:border-credicus-primary ${filter.className ?? ""}`}
                aria-label={filter.label}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {onDateFromChange ? (
            <label className="flex items-center gap-2 text-sm text-credicus-ink-secondary">
              <span className="hidden sm:inline">From</span>
              <input
                type="date"
                value={dateFrom ?? ""}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="rounded-lg border border-credicus-line-subtle bg-white px-3 py-2 text-sm outline-none focus:border-credicus-primary"
                aria-label="Filter from date"
              />
            </label>
          ) : null}

          {onDateToChange ? (
            <label className="flex items-center gap-2 text-sm text-credicus-ink-secondary">
              <span className="hidden sm:inline">To</span>
              <input
                type="date"
                value={dateTo ?? ""}
                onChange={(e) => onDateToChange(e.target.value)}
                className="rounded-lg border border-credicus-line-subtle bg-white px-3 py-2 text-sm outline-none focus:border-credicus-primary"
                aria-label="Filter to date"
              />
            </label>
          ) : null}

          {pageSize !== undefined && onPageSizeChange ? (
            <label className="flex items-center gap-2 text-sm text-credicus-ink-secondary">
              Show
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-credicus-line-subtle px-2 py-1.5 text-sm"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {onReset ? (
            <button type="button" onClick={onReset} className="ui-button-secondary px-3 py-2 text-xs">
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {resultCount !== undefined ? (
        <p className="text-xs text-credicus-ink-muted">{resultCount} result{resultCount === 1 ? "" : "s"}</p>
      ) : null}
    </div>
  );
}
