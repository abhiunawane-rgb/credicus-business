import { listCompanies } from "@/lib/admin-catalog";
import { listCandidates } from "@/lib/candidate-service";
import { displayNameForEmail } from "@/lib/demo-accounts";
import { listInvitations } from "@/lib/invitation-service";
import { toLocalDateKey } from "@/lib/list-filters";
import { prisma } from "@/lib/prisma";
import { useDatabase } from "@/lib/db-mode";

export type RecruiterSummaryRow = {
  name: string;
  email: string;
  created: number;
  interviews: number;
  confirmed: number;
  selections: number;
  joinings: number;
};

export type ClientSummaryRow = {
  client: string;
  interviews: number;
  confirmed: number;
  tomorrow: number;
  selections: number;
  joinings: number;
};

export type MonthSummaryRow = {
  month: string;
  key: string;
  created: number;
  interviews: number;
  selections: number;
  joinings: number;
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

function isSameLocalDay(iso: string | null | undefined, day: Date) {
  if (!iso) return false;
  return toLocalDateKey(iso) === toLocalDateKey(day.toISOString());
}

function monthKey(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

async function recruiterDirectory(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const users = await prisma.user.findMany({
        where: { role: { in: ["recruiter", "team_leader", "admin"] } },
        select: { email: true, name: true },
      });
      for (const user of users) {
        map.set(user.email.toLowerCase(), user.name);
      }
    } catch {
      // fall through to displayNameForEmail
    }
  }
  return map;
}

export async function buildRecruiterSummary(): Promise<RecruiterSummaryRow[]> {
  const candidates = await listCandidates();
  const names = await recruiterDirectory();
  const today = startOfToday();
  const byRecruiter = new Map<string, RecruiterSummaryRow>();

  function rowFor(email: string): RecruiterSummaryRow {
    const key = email.toLowerCase();
    const existing = byRecruiter.get(key);
    if (existing) return existing;
    const created: RecruiterSummaryRow = {
      email: key,
      name: names.get(key) ?? displayNameForEmail(key),
      created: 0,
      interviews: 0,
      confirmed: 0,
      selections: 0,
      joinings: 0,
    };
    byRecruiter.set(key, created);
    return created;
  }

  for (const candidate of candidates) {
    const email = (candidate.created_by ?? "unknown").toLowerCase();
    const row = rowFor(email);

    if (new Date(candidate.created_at) >= today) row.created += 1;
    if (isSameLocalDay(candidate.interview_date, today)) row.interviews += 1;
    if (candidate.call_status === "confirmed") row.confirmed += 1;
    if (["shortlisted", "offered", "hired"].includes(candidate.status)) row.selections += 1;
    if (candidate.status === "hired") row.joinings += 1;
  }

  return [...byRecruiter.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function buildClientSummary(): Promise<ClientSummaryRow[]> {
  const [companies, candidates, invitations] = await Promise.all([
    listCompanies(),
    listCandidates(),
    listInvitations(),
  ]);
  const today = startOfToday();
  const tomorrow = startOfTomorrow();

  const invitedCandidateIds = new Map<string, Set<string>>();
  for (const invitation of invitations) {
    const key = invitation.company.toLowerCase();
    const set = invitedCandidateIds.get(key) ?? new Set<string>();
    set.add(invitation.candidate_id);
    invitedCandidateIds.set(key, set);
  }

  return companies.map((client) => {
    const key = client.toLowerCase();
    const invitedIds = invitedCandidateIds.get(key) ?? new Set<string>();
    const related = candidates.filter((candidate) => {
      if (invitedIds.has(candidate.id)) return true;
      if (candidate.current_company?.toLowerCase() === key) return true;
      if (candidate.process?.toLowerCase() === key) return true;
      return false;
    });

    return {
      client,
      interviews: related.filter((c) => isSameLocalDay(c.interview_date, today)).length,
      confirmed: related.filter((c) => c.call_status === "confirmed").length,
      tomorrow: related.filter((c) => isSameLocalDay(c.interview_date, tomorrow)).length,
      selections: related.filter((c) => ["shortlisted", "offered", "hired"].includes(c.status)).length,
      joinings: related.filter((c) => c.status === "hired").length,
    };
  });
}

export async function buildMonthSummary(limit = 6): Promise<MonthSummaryRow[]> {
  const candidates = await listCandidates();
  const byMonth = new Map<string, MonthSummaryRow>();

  for (const candidate of candidates) {
    const key = monthKey(candidate.created_at);
    const existing = byMonth.get(key) ?? {
      key,
      month: monthLabel(key),
      created: 0,
      interviews: 0,
      selections: 0,
      joinings: 0,
    };
    existing.created += 1;
    if (candidate.interview_date) existing.interviews += 1;
    if (["shortlisted", "offered", "hired"].includes(candidate.status)) existing.selections += 1;
    if (candidate.status === "hired") existing.joinings += 1;
    byMonth.set(key, existing);
  }

  return [...byMonth.values()].sort((a, b) => b.key.localeCompare(a.key)).slice(0, limit);
}
