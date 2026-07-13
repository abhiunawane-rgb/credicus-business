"use client";

import { useEffect, useState } from "react";
import KpiDetailDialog from "@/components/dashboard/kpi-detail-dialog";
import StatCard from "@/components/ui/stat-card";
import { StaggerChildren } from "@/components/ui/animated-reveal";
import { getTeamLeaderKpiDetail, type TeamLeaderKpiDetail } from "@/lib/team-leader-kpi-details";

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
        <div key={i} className="ui-card h-28 p-4">
          <div className="ui-skeleton mb-3 h-3 w-20" />
          <div className="ui-skeleton h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export default function TeamLeaderDashboardMetrics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeDetail, setActiveDetail] = useState<TeamLeaderKpiDetail | null>(null);

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

  function openDetail(id: string) {
    const detail = getTeamLeaderKpiDetail(id, stats ?? undefined);
    if (detail) setActiveDetail(detail);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Calls"
          value="223"
          iconName="phone"
          trend="+12% vs last week"
          onClick={() => openDetail("total-calls")}
        />
        <StatCard label="Interviews" value="76" iconName="users" onClick={() => openDetail("interviews")} />
        <StatCard label="Selections" value="30" iconName="userCheck" onClick={() => openDetail("selections")} />
        <StatCard
          label="Joinings"
          value="18"
          iconName="userPlus"
          trend="60% conversion"
          onClick={() => openDetail("joinings")}
        />
      </div>

      {!stats ? (
        <SummarySkeleton />
      ) : (
        <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" stagger={70}>
          <StatCard
            label="Created Today"
            value={String(stats.createdToday)}
            iconName="userPlus"
            onClick={() => openDetail("created-today")}
          />
          <StatCard
            label="Interviews Today"
            value={String(stats.interviewsToday)}
            iconName="calendar"
            onClick={() => openDetail("interviews-today")}
          />
          <StatCard
            label="Confirmed Today"
            value={String(stats.confirmedToday)}
            iconName="checkCircle"
            onClick={() => openDetail("confirmed-today")}
          />
          <StatCard
            label="Selections (Month)"
            value={String(stats.selectionsMonth)}
            iconName="users"
            onClick={() => openDetail("selections-month")}
          />
          <StatCard
            label="Joinings (Month)"
            value={String(stats.joiningsMonth)}
            iconName="users"
            trend={`${stats.totalCandidates} total`}
            onClick={() => openDetail("joinings-month")}
          />
        </StaggerChildren>
      )}

      <KpiDetailDialog detail={activeDetail} onClose={() => setActiveDetail(null)} />
    </>
  );
}
