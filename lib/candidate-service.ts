import type { CandidateRecord, CommentRecord, EmployeeRecord } from "@/lib/candidate-types";
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
import { prisma } from "@/lib/prisma";

function isDbError(error: unknown): boolean {
  const message = (error as Error).message ?? "";
  return (
    message.includes("Can't reach database") ||
    message.includes("P1001") ||
    message.includes("Unknown arg") ||
    message.includes("Invalid")
  );
}

function mapDbCandidate(row: Record<string, unknown>): CandidateRecord {
  return {
    id: String(row.id),
    first_name: row.first_name as string | null,
    last_name: row.last_name as string | null,
    name: String(row.name),
    mobile: String(row.mobile),
    alt_mobile: row.alt_mobile as string | null,
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

export async function listCandidates(search?: string): Promise<CandidateRecord[]> {
  try {
    const where = search?.trim()
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { mobile: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};
    const rows = await prisma.candidate.findMany({ where, orderBy: { name: "desc" } });
    if (rows.length > 0) return rows.map((r) => mapDbCandidate(r as unknown as Record<string, unknown>));
  } catch (error) {
    if (!isDbError(error)) throw error;
  }
  return memoryListCandidates(search);
}

export async function getCandidate(id: string): Promise<CandidateRecord | null> {
  try {
    const row = await prisma.candidate.findUnique({ where: { id } });
    if (row) return mapDbCandidate(row as unknown as Record<string, unknown>);
  } catch (error) {
    if (!isDbError(error)) throw error;
  }
  return memoryGetCandidate(id) ?? null;
}

export async function createCandidate(
  data: Partial<CandidateRecord> & { name: string; mobile: string; experience: number },
): Promise<CandidateRecord> {
  const payload = {
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    name: data.name,
    mobile: data.mobile,
    alt_mobile: data.alt_mobile ?? null,
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

  try {
    const row = await prisma.candidate.create({
      data: {
        name: payload.name,
        mobile: payload.mobile,
        email: payload.email,
        skills: payload.skills,
        experience: payload.experience,
        source: payload.source,
        resume_url: payload.resume_url,
        status: payload.status,
      },
    });
    return mapDbCandidate(row as unknown as Record<string, unknown>);
  } catch (error) {
    if (!isDbError(error)) throw error;
  }

  return memoryCreateCandidate({
    ...payload,
    source: String(payload.source),
    call_status: payload.call_status ? String(payload.call_status) : null,
    interview_date: payload.interview_date?.toISOString() ?? null,
    status: (payload.status as CandidateRecord["status"]) ?? "new",
  } as Omit<CandidateRecord, "id" | "created_at" | "updated_at">);
}

export async function updateCandidate(
  id: string,
  data: Partial<CandidateRecord>,
): Promise<CandidateRecord | null> {
  try {
    const row = await prisma.candidate.update({
      where: { id },
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        skills: data.skills,
        experience: data.experience,
        source: data.source as never,
        resume_url: data.resume_url,
        status: data.status as never,
      },
    });
    return mapDbCandidate(row as unknown as Record<string, unknown>);
  } catch (error) {
    if (!isDbError(error)) throw error;
  }
  return memoryUpdateCandidate(id, data);
}

export async function deleteCandidate(id: string): Promise<boolean> {
  try {
    await prisma.candidate.delete({ where: { id } });
    return true;
  } catch (error) {
    if (!isDbError(error)) throw error;
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
