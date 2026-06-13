"use client";

import { Calendar, CheckCircle, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "@/components/ui/stat-card";
import { StaggerChildren } from "@/components/ui/animated-reveal";

type Stats = {
  createdToday: number;
  interviewsToday: number;
  confirmedToday: number;
  selectionsMonth: number;
  joiningsMonth: number;
  totalCandidates: number;
};

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="ui-card-dark h-24 p-4">
          <div className="ui-skeleton mb-3 h-3 w-20" />
          <div className="ui-skeleton h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export default function TodaySummary() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard/stats", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((b: { data?: Stats }) => setStats(b.data ?? null))
      .catch(() =>
        setStats({
          createdToday: 0,
          interviewsToday: 0,
          confirmedToday: 0,
          selectionsMonth: 0,
          joiningsMonth: 0,
          totalCandidates: 0,
        }),
      );
  }, []);

  if (!stats) return <SummarySkeleton />;

  return (
    <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" stagger={70}>
      <StatCard label="Created Today" value={String(stats.createdToday)} icon={UserPlus} />
      <StatCard label="Interviews Today" value={String(stats.interviewsToday)} icon={Calendar} />
      <StatCard label="Confirmed Today" value={String(stats.confirmedToday)} icon={CheckCircle} />
      <StatCard label="Selections (Month)" value={String(stats.selectionsMonth)} icon={Users} />
      <StatCard
        label="Joinings (Month)"
        value={String(stats.joiningsMonth)}
        icon={Users}
        trend={`${stats.totalCandidates} total`}
      />
    </StaggerChildren>
  );
}
