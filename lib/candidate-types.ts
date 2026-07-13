export type CandidateStage =
  | "new"
  | "screening"
  | "maybe"
  | "interviewed"
  | "shortlisted"
  | "offered"
  | "hired"
  | "rejected"
  | "hold";

export type CandidateRecord = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  name: string;
  mobile: string;
  alt_mobile?: string | null;
  aadhar_no?: string | null;
  email?: string | null;
  skills: string[];
  experience: number;
  source: string;
  portal_id?: string | null;
  process?: string | null;
  current_company?: string | null;
  education?: string | null;
  preferred_locations: string[];
  salary?: string | null;
  location?: string | null;
  notice_period?: string | null;
  call_status?: string | null;
  interview_date?: string | null;
  join_date?: string | null;
  exit_date?: string | null;
  rejection_reason?: string | null;
  resume_url?: string | null;
  status: CandidateStage;
  created_by?: string | null;
  transfer_pending?: CandidateTransferPending | null;
  created_at: string;
  updated_at: string;
};

export type CommentRecord = {
  id: string;
  candidate_id: string;
  author_id?: string | null;
  author_name: string;
  author_email?: string | null;
  content: string;
  created_at: string;
};

export type EmployeeRecord = {
  id: string;
  employee_code?: string | null;
  first_name: string;
  last_name: string;
  email?: string | null;
  mobile: string;
  department?: string | null;
  designation?: string | null;
  joining_date?: string | null;
  status: string;
  created_at: string;
};

export type TransferRequestStatus = "pending" | "approved" | "rejected";

export type CandidateTransferPending = {
  id: string;
  requested_by: string;
  requested_at: string;
  message?: string | null;
};

export type CandidateTransferRecord = {
  id: string;
  candidate_id: string;
  candidate_name: string;
  from_owner: string;
  requested_by: string;
  status: TransferRequestStatus;
  message?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
  new: "New",
  screening: "Screening",
  maybe: "Maybe",
  interviewed: "Interviewed",
  shortlisted: "Shortlist",
  offered: "Offered",
  hired: "Joined",
  rejected: "Reject",
  hold: "Hold",
};

/** Application status labels shown in Candidate Status table */
export const APPLICATION_STATUS_LABELS: Record<CandidateStage, string> = {
  new: "Request Submitted",
  screening: "Under Screening",
  maybe: "Under Review",
  interviewed: "Interview Scheduled",
  shortlisted: "Shortlisted",
  offered: "Offer Extended",
  hired: "Joined",
  rejected: "Rejected",
  hold: "On Hold",
};

export function applicantDisplayId(id: string, index: number): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-6).padStart(6, "0");
  return String(712100 + index + 1);
}

/** Avoid duplicated full names such as "Karan Iyer Karan Iyer" in legacy imports. */
export function displayCandidateName(
  candidate: Pick<CandidateRecord, "name" | "first_name" | "last_name">,
): string {
  const first = candidate.first_name?.trim() ?? "";
  const last = candidate.last_name?.trim() ?? "";
  const fromParts = [first, last].filter(Boolean).join(" ").trim();
  let name = candidate.name?.trim() ?? "";

  if (first && last && first === last) {
    return first;
  }

  if (fromParts && name === `${fromParts} ${fromParts}`) {
    return fromParts;
  }

  if (!name && fromParts) {
    return fromParts;
  }

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length % 2 === 0) {
    const mid = words.length / 2;
    const firstHalf = words.slice(0, mid).join(" ");
    const secondHalf = words.slice(mid).join(" ");
    if (firstHalf === secondHalf) {
      return firstHalf;
    }
  }

  return name || fromParts;
}

export function normalizeCandidateRecord(candidate: CandidateRecord): CandidateRecord {
  const name = displayCandidateName(candidate);
  if (name === candidate.name) {
    return candidate;
  }
  return { ...candidate, name };
}

export const STAGE_QUICK_ACTIONS = [
  { key: "shortlisted" as const, label: "Shortlist", color: "yellow" },
  { key: "maybe" as const, label: "Maybe", color: "gray" },
  { key: "rejected" as const, label: "Reject", color: "red" },
];

export const CALL_STATUS_OPTIONS = [
  { value: "not_received", label: "Call Not Received" },
  { value: "not_reachable", label: "Not Reachable" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "callback", label: "Callback" },
  { value: "interviewed", label: "Interviewed" },
  { value: "confirmed", label: "Confirmed Interview" },
];

export const SOURCE_OPTIONS = [
  { value: "naukri", label: "Naukri" },
  { value: "walk_in", label: "Walk-in" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "workindia", label: "Workindia" },
  { value: "apna", label: "Apna" },
  { value: "resdex", label: "Resdex" },
  { value: "other", label: "Other" },
];

export const CLIENT_COMPANIES = ["NovaCorp", "GreenLeaf", "Summit HR", "TechBridge", "Horizon Staffing", "BlueRidge"];
