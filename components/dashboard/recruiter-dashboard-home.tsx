"use client";

import { useEffect, useState } from "react";
import DashboardCharts from "@/components/dashboard/dashboard-charts";
import type { CandidateRecord } from "@/lib/candidate-types";

export default function RecruiterDashboardHome() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);

  useEffect(() => {
    void fetch("/api/candidates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((b: { data?: CandidateRecord[] }) => setCandidates(b.data ?? []));
  }, []);

  const appliedCount = candidates.length;
  const selectedCount = candidates.filter((c) => ["shortlisted", "offered", "hired"].includes(c.status)).length;
  const rejectedCount = candidates.filter((c) => c.status === "rejected").length;

  return (
    <section className="space-y-6">
      <DashboardCharts
        appliedCount={appliedCount}
        selectedCount={selectedCount}
        rejectedCount={rejectedCount}
      />
    </section>
  );
}
