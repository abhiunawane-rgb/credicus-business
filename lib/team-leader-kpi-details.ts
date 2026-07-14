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

/** Starts empty — fills from live recruiter data once admin creates the team. */
const recruiterRows: Array<{
  recruiter: string;
  calls: number;
  interviews: number;
  selections: number;
  joinings: number;
  created: number;
}> = [];

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
  const emptyNote = "No recruiter activity yet. Admin can create recruiters from Users.";

  const map: Record<string, TeamLeaderKpiDetail> = {
    "total-calls": {
      id: "total-calls",
      title: "Total Calls",
      value: "0",
      description: emptyNote,
      breakdownTitle: "Calls by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.calls })),
    },
    interviews: {
      id: "interviews",
      title: "Interviews",
      value: "0",
      description: emptyNote,
      breakdownTitle: "Interviews by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.interviews })),
    },
    selections: {
      id: "selections",
      title: "Selections",
      value: "0",
      description: emptyNote,
      breakdownTitle: "Selections by recruiter",
      breakdown: recruiterRows.map((row) => ({ label: row.recruiter, value: row.selections })),
    },
    joinings: {
      id: "joinings",
      title: "Joinings",
      value: "0",
      description: emptyNote,
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
      breakdown:
        recruiterRows.length > 0
          ? recruiterRows.map((row) => ({ label: row.recruiter, value: row.created }))
          : [{ label: "No recruiters yet", value: liveStats.createdToday }],
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
      breakdown:
        recruiterRows.length > 0
          ? recruiterRows.map((row) => ({ label: row.recruiter, value: row.selections }))
          : [{ label: "No recruiters yet", value: liveStats.selectionsMonth }],
    };
    map["joinings-month"] = {
      id: "joinings-month",
      title: "Joinings (Month)",
      value: String(liveStats.joiningsMonth),
      trend: `${liveStats.totalCandidates} total candidates`,
      description: "Candidates marked as joined during the current month.",
      breakdownTitle: "Joinings by recruiter",
      breakdown:
        recruiterRows.length > 0
          ? recruiterRows.map((row) => ({ label: row.recruiter, value: row.joinings }))
          : [{ label: "No recruiters yet", value: liveStats.joiningsMonth }],
    };
  }

  return map[id] ?? null;
}
