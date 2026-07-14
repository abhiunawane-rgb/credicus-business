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

  return (
    <section className="space-y-6">
      <DashboardCharts candidates={candidates} />
    </section>
  );
}
