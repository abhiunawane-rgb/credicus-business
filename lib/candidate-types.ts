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
  rejection_reason?: string | null;
  resume_url?: string | null;
  status: CandidateStage;
  created_by?: string | null;
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
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export const CLIENT_COMPANIES = ["Eureka", "Altruist", "OPO", "FinEdge", "NorthBridge", "BluePeak"];
