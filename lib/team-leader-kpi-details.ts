export type KpiBreakdownRow = {
  label: string;
  value: string | number;
};

export type TeamLeaderKpiDetail = {
  id: string;
  title: string;
  value: string;
  trend?: string;
  description: string;
  breakdownTitle?: string;
  breakdown: KpiBreakdownRow[];
};

const recruiterRows = [
  { recruiter: "Aisha Khan", calls: 62, interviews: 20, selections: 8, joinings: 5, created: 12 },
  { recruiter: "Rohit Mehta", calls: 54, interviews: 18, selections: 7, joinings: 4, created: 10 },
  { recruiter: "Neha Verma", calls: 49, interviews: 16, selections: 6, joinings: 3, created: 8 },
  { recruiter: "Arjun Reddy", calls: 58, interviews: 22, selections: 9, joinings: 6, created: 11 },
];

export function getTeamLeaderKpiDetail(
  id: string,
  liveStats?: {
    createdToday: number;
    interviewsToday: number;
    confirmedToday: number;
    selectionsMonth: number;
    joiningsMonth: number;
    totalCandidates: number;
  },
): TeamLeaderKpiDetail | null {
  const map: Record<string, TeamLeaderKpiDetail> = {
    "total-calls": {
      id: "total-calls",
      title: "Total Calls",
      value: "223",
      trend: "+12% vs last week",
      description: "Total outbound and follow-up calls made by all recruiters on your team this week.",
      breakdownTitle: "Calls by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.calls })),
    },
    interviews: {
      id: "interviews",
      title: "Interviews",
      value: "76",
      description: "Candidates who reached interview stage across the team pipeline.",
      breakdownTitle: "Interviews by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.interviews })),
    },
    selections: {
      id: "selections",
      title: "Selections",
      value: "30",
      description: "Candidates shortlisted, offered, or marked as selected by recruiters.",
      breakdownTitle: "Selections by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.selections })),
    },
    joinings: {
      id: "joinings",
      title: "Joinings",
      value: "18",
      trend: "60% conversion",
      description: "Candidates who successfully joined client roles after selection.",
      breakdownTitle: "Joinings by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.joinings })),
    },
  };

  if (liveStats) {
    map["created-today"] = {
      id: "created-today",
      title: "Created Today",
      value: String(liveStats.createdToday),
      description: "New candidates added to the system today by your recruitment team.",
      breakdownTitle: "Created today by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.created })),
    };
    map["interviews-today"] = {
      id: "interviews-today",
      title: "Interviews Today",
      value: String(liveStats.interviewsToday),
      description: "Interviews scheduled or completed today across all active candidates.",
      breakdownTitle: "Interview activity",
      breakdown: [
        { label: "Scheduled today", value: liveStats.interviewsToday },
        { label: "Confirmed calls", value: liveStats.confirmedToday },
      ],
    };
    map["confirmed-today"] = {
      id: "confirmed-today",
      title: "Confirmed Today",
      value: String(liveStats.confirmedToday),
      description: "Candidates with confirmed interview or callback status updated today.",
      breakdownTitle: "Confirmation summary",
      breakdown: [
        { label: "Confirmed today", value: liveStats.confirmedToday },
        { label: "Interviews today", value: liveStats.interviewsToday },
      ],
    };
    map["selections-month"] = {
      id: "selections-month",
      title: "Selections (Month)",
      value: String(liveStats.selectionsMonth),
      description: "Total shortlisted and offered candidates in the current month.",
      breakdownTitle: "Selections by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.selections })),
    };
    map["joinings-month"] = {
      id: "joinings-month",
      title: "Joinings (Month)",
      value: String(liveStats.joiningsMonth),
      trend: `${liveStats.totalCandidates} total candidates`,
      description: "Candidates marked as joined during the current month.",
      breakdownTitle: "Joinings by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.joinings })),
    };
  }

  return map[id] ?? null;
}
