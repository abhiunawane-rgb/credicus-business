"use client";

import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import { matchesSearch } from "@/lib/list-filters";

const clientRows = [
  { client: "NovaCorp", interviews: 11, confirmed: 9, tomorrow: 7, selections: 11, joinings: 5 },
  { client: "GreenLeaf", interviews: 14, confirmed: 12, tomorrow: 9, selections: 13, joinings: 8 },
  { client: "Summit HR", interviews: 18, confirmed: 15, tomorrow: 12, selections: 17, joinings: 10 },
  { client: "TechBridge", interviews: 9, confirmed: 8, tomorrow: 6, selections: 7, joinings: 4 },
];

export default function ClientSummaryTable({ title = "Client-wise Summary" }: { title?: string }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => clientRows.filter((row) => matchesSearch(search, [row.client])),
    [search],
  );

  return (
    <div className="space-y-4">
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search client..."
        onReset={() => setSearch("")}
        resultCount={filtered.length}
      />

      <div className="ui-card overflow-x-auto p-4">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
          <Building2 className="h-5 w-5 text-credicus-primary" />
          {title}
        </h4>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-credicus-line-default bg-credicus-surface text-credicus-gray">
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Today Interviews</th>
              <th className="px-3 py-2 text-left">Confirmed</th>
              <th className="px-3 py-2 text-left">Tomorrow</th>
              <th className="px-3 py-2 text-left">Selections (Month)</th>
              <th className="px-3 py-2 text-left">Joinings (Month)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-credicus-ink-muted">
                  No clients match your search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.client} className="border-b border-credicus-line-default transition-colors duration-200 hover:bg-credicus-primary-light/50">
                  <td className="px-3 py-3 font-medium text-credicus-ink">{row.client}</td>
                  <td className="px-3 py-3 text-credicus-gray">{row.interviews}</td>
                  <td className="px-3 py-3 text-credicus-gray">{row.confirmed}</td>
                  <td className="px-3 py-3 text-credicus-gray">{row.tomorrow}</td>
                  <td className="px-3 py-3 font-medium text-credicus-primary">{row.selections}</td>
                  <td className="px-3 py-3 font-medium text-credicus-primary">{row.joinings}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
