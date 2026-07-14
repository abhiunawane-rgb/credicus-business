import { APPLICATION_STATUS_LABELS, type CandidateRecord } from "@/lib/candidate-types";
import type { SummaryMetricDetailRow } from "@/lib/summary-metric-details";

function toDateOnly(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function candidateInDateRange(
  candidate: CandidateRecord,
  from?: string,
  to?: string,
): boolean {
  const created = toDateOnly(candidate.created_at);
  if (!created) return true;
  if (from && created < from) return false;
  if (to && created > to) return false;
  return true;
}

export function isSelectedCandidate(candidate: CandidateRecord): boolean {
  return ["shortlisted", "offered", "hired"].includes(candidate.status);
}

export function isRejectedCandidate(candidate: CandidateRecord): boolean {
  return candidate.status === "rejected";
}

export function candidatesToDetailRows(candidates: CandidateRecord[]): SummaryMetricDetailRow[] {
  return candidates.map((candidate) => ({
    id: candidate.id,
    candidateId: candidate.id.slice(0, 8).toUpperCase(),
    name: candidate.name,
    mobile: candidate.mobile || candidate.email || "—",
    company: candidate.current_company || "—",
    city: candidate.location || candidate.preferred_locations?.[0] || "—",
    status: APPLICATION_STATUS_LABELS[candidate.status] ?? candidate.status,
    date: toDateOnly(candidate.created_at) || "—",
  }));
}
