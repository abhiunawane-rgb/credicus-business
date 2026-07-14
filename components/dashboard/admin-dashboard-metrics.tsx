"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KpiDetailDialog from "@/components/dashboard/kpi-detail-dialog";
import StatCard from "@/components/ui/stat-card";
import { StaggerChildren } from "@/components/ui/animated-reveal";
import type { TeamLeaderKpiDetail } from "@/lib/team-leader-kpi-details";

type Stats = {
  createdToday: number;
  interviewsToday: number;
  confirmedToday: number;
  selectionsMonth: number;
  joiningsMonth: number;
  totalCandidates: number;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type DetailState = TeamLeaderKpiDetail & {
  actionHref?: string;
  actionLabel?: string;
};

function SummarySkeleton({ count }: { count: number }) {
  return (
    <div className={`grid gap-4 ${count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-5"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-card h-24 p-4">
          <div className="ui-skeleton mb-3 h-3 w-20" />
          <div className="ui-skeleton h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardMetrics() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [detail, setDetail] = useState<DetailState | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/dashboard/stats", { credentials: "same-origin" }).then((r) => r.json()),
      fetch("/api/admin/users", { credentials: "same-origin" }).then((r) => r.json()),
    ])
      .then(([statsBody, usersBody]: [{ data?: Stats }, { data?: UserRow[] }]) => {
        setStats(
          statsBody.data ?? {
            createdToday: 0,
            interviewsToday: 0,
            confirmedToday: 0,
            selectionsMonth: 0,
            joiningsMonth: 0,
            totalCandidates: 0,
          },
        );
        setUsers(usersBody.data ?? []);
      })
      .catch(() => {
        setStats({
          createdToday: 0,
          interviewsToday: 0,
          confirmedToday: 0,
          selectionsMonth: 0,
          joiningsMonth: 0,
          totalCandidates: 0,
        });
        setUsers([]);
      });
  }, []);

  const totalUsers = users.length;
  const activeRecruiters = users.filter((user) => user.role === "recruiter" && user.status === "active").length;
  const pendingSupport = users.filter((user) => user.status === "inactive").length;

  function openUsersBreakdown(kind: "all" | "recruiters" | "inactive") {
    const filtered =
      kind === "all"
        ? users
        : kind === "recruiters"
          ? users.filter((user) => user.role === "recruiter" && user.status === "active")
          : users.filter((user) => user.status === "inactive");

    setDetail({
      id: `admin-${kind}`,
      title: kind === "all" ? "Total Users" : kind === "recruiters" ? "Active Recruiters" : "Pending Support",
      value: String(filtered.length),
      description:
        kind === "all"
          ? "All login accounts in the system. Open User Management to create, edit, or deactivate users."
          : kind === "recruiters"
            ? "Active recruiter accounts that can add and manage candidates."
            : "Inactive accounts that need review before they can sign in again.",
      breakdownTitle: kind === "inactive" ? "Inactive accounts" : "Accounts",
      breakdown: filtered.map((user) => ({
        label: `${user.name} · ${user.role.replaceAll("_", " ")}`,
        value: user.status,
      })),
      actionHref: "/dashboard/admin/users",
      actionLabel: "Open User Management",
    });
  }

  return (
    <>
      {!stats ? (
        <SummarySkeleton count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Users"
            value={String(totalUsers || "0")}
            iconName="users"
            onClick={() => openUsersBreakdown("all")}
          />
          <StatCard
            label="Active Recruiters"
            value={String(activeRecruiters)}
            iconName="userCog"
            trend={`${users.filter((u) => u.role === "recruiter").length} recruiters`}
            onClick={() => openUsersBreakdown("recruiters")}
          />
          <StatCard
            label="Pending Support"
            value={String(pendingSupport)}
            iconName="headphones"
            onClick={() => openUsersBreakdown("inactive")}
          />
        </div>
      )}

      {!stats ? (
        <SummarySkeleton count={5} />
      ) : (
        <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" stagger={70}>
          <StatCard
            label="Created Today"
            value={String(stats.createdToday)}
            iconName="userPlus"
            onClick={() => router.push("/dashboard/admin/talentpool")}
          />
          <StatCard
            label="Interviews Today"
            value={String(stats.interviewsToday)}
            iconName="calendar"
            onClick={() => router.push("/dashboard/admin/talentpool")}
          />
          <StatCard
            label="Confirmed Today"
            value={String(stats.confirmedToday)}
            iconName="checkCircle"
            onClick={() => router.push("/dashboard/admin/talentpool")}
          />
          <StatCard
            label="Selections (Month)"
            value={String(stats.selectionsMonth)}
            iconName="users"
            onClick={() => router.push("/dashboard/admin/reports")}
          />
          <StatCard
            label="Joinings (Month)"
            value={String(stats.joiningsMonth)}
            iconName="users"
            trend={`${stats.totalCandidates} total`}
            onClick={() => router.push("/dashboard/admin/reports")}
          />
        </StaggerChildren>
      )}

      <KpiDetailDialog
        detail={detail}
        actionHref={detail?.actionHref}
        actionLabel={detail?.actionLabel}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
