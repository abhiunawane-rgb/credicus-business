import type { CandidateRecord, CommentRecord, EmployeeRecord } from "@/lib/candidate-types";
import { displayCandidateName, normalizeCandidateRecord } from "@/lib/candidate-types";
import {
  memoryAddComment,
  memoryCreateCandidate,
  memoryCreateEmployee,
  memoryDeleteCandidate,
  memoryGetCandidate,
  memoryListCandidates,
  memoryListComments,
  memoryListEmployees,
  memoryUpdateCandidate,
} from "@/lib/memory-store";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { prisma } from "@/lib/prisma";

function isDbError(error: unknown): boolean {
  const message = (error as Error).message ?? "";
  return (
    message.includes("Can't reach database") ||
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("P1012") ||
    message.includes("P2021") ||
    message.includes("P2022") ||
    message.includes("Unknown arg") ||
    message.includes("Invalid") ||
    message.includes("does not exist") ||
    message.includes("ConnectorError") ||
    message.includes("Environment variable not found")
  );
}

function handleDbError(error: unknown): void {
  if (isDbError(error)) {
    disableDatabase();
    return;
  }
  throw error;
}

function mapDbCandidate(row: Record<string, unknown>): CandidateRecord {
  return {
    id: String(row.id),
    first_name: row.first_name as string | null,
    last_name: row.last_name as string | null,
    name: String(row.name),
    mobile: String(row.mobile),
    alt_mobile: row.alt_mobile as string | null,
    aadhar_no: row.aadhar_no as string | null,
    email: row.email as string | null,
    skills: (row.skills as string[]) ?? [],
    experience: Number(row.experience),
    source: String(row.source),
    portal_id: row.portal_id as string | null,
    process: row.process as string | null,
    current_company: row.current_company as string | null,
    education: row.education as string | null,
    preferred_locations: (row.preferred_locations as string[]) ?? [],
    salary: row.salary as string | null,
    location: row.location as string | null,
    notice_period: row.notice_period as string | null,
    call_status: row.call_status as string | null,
    interview_date: row.interview_date ? new Date(row.interview_date as string).toISOString() : null,
    join_date: row.join_date ? new Date(row.join_date as string).toISOString() : null,
    exit_date: row.exit_date ? new Date(row.exit_date as string).toISOString() : null,
    rejection_reason: row.rejection_reason as string | null,
    resume_url: row.resume_url as string | null,
    status: row.status as CandidateRecord["status"],
    created_by: row.created_by as string | null,
    created_at: row.created_at
      ? new Date(row.created_at as string).toISOString()
      : new Date().toISOString(),
    updated_at: row.updated_at
      ? new Date(row.updated_at as string).toISOString()
      : new Date().toISOString(),
  };
}

export type ListCandidatesOptions = {
  search?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function listCandidates(options: ListCandidatesOptions = {}): Promise<CandidateRecord[]> {
  const { search, createdBy, dateFrom, dateTo } = options;

  if (useDatabase()) {
    try {
      const where: Record<string, unknown> = {};

      if (search?.trim()) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" as const } },
          { mobile: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ];
      }

      if (createdBy) {
        where.created_by = createdBy;
      }

      if (dateFrom || dateTo) {
        where.created_at = {
          ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000`) } : {}),
          ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999`) } : {}),
        };
      }

      const rows = await prisma.candidate.findMany({ where, orderBy: { created_at: "desc" } });
      if (rows.length > 0) {
        return rows.map((r) =>
          normalizeCandidateRecord(mapDbCandidate(r as unknown as Record<string, unknown>)),
        );
      }
    } catch (error) {
      handleDbError(error);
    }
  }
  return memoryListCandidates({ search, createdBy, dateFrom, dateTo }).map(normalizeCandidateRecord);
}

export async function getCandidate(id: string): Promise<CandidateRecord | null> {
  if (useDatabase()) {
    try {
      const row = await prisma.candidate.findUnique({ where: { id } });
      if (row) return normalizeCandidateRecord(mapDbCandidate(row as unknown as Record<string, unknown>));
    } catch (error) {
      handleDbError(error);
    }
  }
  const candidate = memoryGetCandidate(id);
  return candidate ? normalizeCandidateRecord(candidate) : null;
}

export async function createCandidate(
  data: Partial<CandidateRecord> & { name: string; mobile: string; experience: number },
): Promise<CandidateRecord> {
  const payload = {
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    name: displayCandidateName({
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
    }),
    mobile: data.mobile,
    alt_mobile: data.alt_mobile ?? null,
    aadhar_no: data.aadhar_no ?? null,
    email: data.email ?? null,
    skills: data.skills ?? [],
    experience: data.experience,
    source: (data.source as never) ?? "other",
    portal_id: data.portal_id ?? null,
    process: data.process ?? null,
    current_company: data.current_company ?? null,
    education: data.education ?? null,
    preferred_locations: data.preferred_locations ?? [],
    salary: data.salary ?? null,
    location: data.location ?? null,
    notice_period: data.notice_period ?? null,
    call_status: (data.call_status as never) ?? null,
    interview_date: data.interview_date ? new Date(data.interview_date) : null,
    rejection_reason: data.rejection_reason ?? null,
    resume_url: data.resume_url ?? null,
    status: (data.status as never) ?? "new",
    created_by: data.created_by ?? null,
  };

  if (useDatabase()) {
    try {
      const row = await prisma.candidate.create({
        data: {
          name: payload.name,
          mobile: payload.mobile,
          email: payload.email,
          alt_mobile: payload.alt_mobile,
          aadhar_no: payload.aadhar_no,
          skills: payload.skills,
          experience: payload.experience,
          source: payload.source,
          resume_url: payload.resume_url,
          status: payload.status,
          created_by: payload.created_by,
        },
      });
      return normalizeCandidateRecord(mapDbCandidate(row as unknown as Record<string, unknown>));
    } catch (error) {
      handleDbError(error);
    }
  }

  return normalizeCandidateRecord(
    memoryCreateCandidate({
      ...payload,
      source: String(payload.source),
      call_status: payload.call_status ? String(payload.call_status) : null,
      interview_date: payload.interview_date?.toISOString() ?? null,
      status: (payload.status as CandidateRecord["status"]) ?? "new",
    } as Omit<CandidateRecord, "id" | "created_at" | "updated_at">),
  );
}

function definedFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function normalizeDateField(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T00:00:00`).toISOString();
}

function normalizeCandidatePatch(patch: Partial<CandidateRecord>): Partial<CandidateRecord> {
  const next = { ...patch };
  if ("interview_date" in next) {
    next.interview_date = normalizeDateField(next.interview_date) ?? null;
  }
  if ("join_date" in next) {
    next.join_date = normalizeDateField(next.join_date) ?? null;
  }
  if ("exit_date" in next) {
    next.exit_date = normalizeDateField(next.exit_date) ?? null;
  }
  return next;
}

export async function updateCandidate(
  id: string,
  data: Partial<CandidateRecord>,
): Promise<CandidateRecord | null> {
  const patch = normalizeCandidatePatch(definedFields(data as Record<string, unknown>) as Partial<CandidateRecord>);
  if (useDatabase()) {
    try {
      const row = await prisma.candidate.update({
        where: { id },
        data: {
          name: patch.name,
          mobile: patch.mobile,
          email: patch.email,
          alt_mobile: patch.alt_mobile,
          aadhar_no: patch.aadhar_no,
          skills: patch.skills,
          experience: patch.experience,
          source: patch.source as never,
          resume_url: patch.resume_url,
          status: patch.status as never,
          created_by: patch.created_by,
          interview_date:
            patch.interview_date !== undefined
              ? patch.interview_date
                ? new Date(patch.interview_date)
                : null
              : undefined,
          join_date:
            patch.join_date !== undefined
              ? patch.join_date
                ? new Date(patch.join_date)
                : null
              : undefined,
          exit_date:
            patch.exit_date !== undefined
              ? patch.exit_date
                ? new Date(patch.exit_date)
                : null
              : undefined,
        },
      });
      return normalizeCandidateRecord(mapDbCandidate(row as unknown as Record<string, unknown>));
    } catch (error) {
      handleDbError(error);
    }
  }
  const updated = memoryUpdateCandidate(id, patch);
  return updated ? normalizeCandidateRecord(updated) : null;
}

export async function deleteCandidate(id: string): Promise<boolean> {
  if (useDatabase()) {
    try {
      await prisma.candidate.delete({ where: { id } });
      return true;
    } catch (error) {
      handleDbError(error);
    }
  }
  return memoryDeleteCandidate(id);
}

/** Comments use in-memory store (works without DB; run prisma:generate for DB persistence). */
export async function listComments(candidateId: string): Promise<CommentRecord[]> {
  return memoryListComments(candidateId);
}

export async function addComment(
  candidateId: string,
  content: string,
  author: { id?: string; name: string; email?: string },
): Promise<CommentRecord> {
  return memoryAddComment(candidateId, content, author);
}

/** Employees use in-memory store (works without DB). */
export async function listEmployees(): Promise<EmployeeRecord[]> {
  return memoryListEmployees();
}

export async function createEmployee(
  data: Omit<EmployeeRecord, "id" | "created_at">,
): Promise<EmployeeRecord> {
  return memoryCreateEmployee(data);
}
