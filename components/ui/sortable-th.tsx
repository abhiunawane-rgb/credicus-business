"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDirection } from "@/lib/table-sort";

type SortableThProps = {
  label: string;
  active: boolean;
  direction?: SortDirection;
  onSort: () => void;
  className?: string;
  align?: "left" | "right" | "center";
};

export default function SortableTh({
  label,
  active,
  direction = "asc",
  onSort,
  className = "",
  align = "left",
}: SortableThProps) {
  const alignClass =
    align === "right" ? "justify-end text-right" : align === "center" ? "justify-center text-center" : "justify-start text-left";

  return (
    <th scope="col" className={`px-3 py-2 ${className}`}>
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex min-h-10 w-full items-center gap-1.5 rounded-md px-1 py-1 text-xs font-semibold uppercase tracking-wide transition hover:bg-credicus-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credicus-primary ${alignClass} ${
          active ? "text-credicus-ink" : "text-credicus-ink-muted"
        }`}
        aria-label={`Sort by ${label}${active ? `, currently ${direction === "asc" ? "ascending" : "descending"}` : ""}`}
      >
        <span>{label}</span>
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-credicus-primary" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-credicus-primary" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        )}
      </button>
    </th>
  );
}
