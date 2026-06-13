"use client";

import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import type { CandidateRecord } from "@/lib/candidate-types";
import { STAGE_LABELS } from "@/lib/candidate-types";

export default function FollowUpTable() {
  const [rows, setRows] = useState<CandidateRecord[]>([]);

  useEffect(() => {
    void fetch("/api/candidates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((b: { data?: CandidateRecord[] }) => setRows(b.data ?? []));
  }, []);

  return (
    <div className="ui-card-dark overflow-x-auto p-4">
      <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Phone className="h-5 w-5 text-credicus-yellow" />
        Follow-up Tracker
      </h4>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-credicus-border text-credicus-gray">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Mobile</th>
            <th className="px-3 py-2 text-left">Interview</th>
            <th className="px-3 py-2 text-left">Call Status</th>
            <th className="px-3 py-2 text-left">Stage</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-sm text-credicus-gray">
                No candidates yet. Add candidates from the Candidates tab.
              </td>
            </tr>
          ) : null}
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-credicus-border/60 hover:bg-white/5">
              <td className="px-3 py-3 font-medium text-white">{row.name}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.mobile}</td>
              <td className="px-3 py-3 text-credicus-gray-light">
                {row.interview_date ? new Date(row.interview_date).toLocaleDateString() : "—"}
              </td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.call_status ?? "—"}</td>
              <td className="px-3 py-3 text-credicus-yellow">{STAGE_LABELS[row.status]}</td>
              <td className="px-3 py-3">
                <a href={`/dashboard/recruiter/candidates/${row.id}`} className="ui-link text-xs">
                  View / Update
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
