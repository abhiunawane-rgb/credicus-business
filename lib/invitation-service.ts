import { randomUUID } from "node:crypto";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { prisma } from "@/lib/prisma";

export type InvitationRecord = {
  id: string;
  candidate_id: string;
  candidate_name: string;
  company: string;
  reschedule_date?: string | null;
  comment?: string | null;
  submitted_by?: string | null;
  created_at: string;
};

type InvitationStore = {
  invitations: InvitationRecord[];
};

const globalInvites = globalThis as unknown as { __credicusInvitations?: InvitationStore };

function getStore(): InvitationStore {
  if (!globalInvites.__credicusInvitations) {
    globalInvites.__credicusInvitations = { invitations: [] };
  }
  return globalInvites.__credicusInvitations;
}

function isDbError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("database_url") ||
    message.includes("environment variable not found") ||
    message.includes("can't reach database") ||
    message.includes("connection refused") ||
    message.includes("p1001") ||
    message.includes("does not exist") ||
    message.includes("timed out fetching")
  );
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  const memory = [...getStore().invitations];

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const rows = await prisma.candidateInvitation.findMany({
        include: {
          company: { select: { name: true } },
          candidate: { select: { name: true } },
        },
        orderBy: { created_at: "desc" },
      });
      const dbRows = rows.map((row) => ({
        id: row.id,
        candidate_id: row.candidate_id,
        candidate_name: row.candidate.name,
        company: row.company.name,
        reschedule_date: row.reschedule_date?.toISOString() ?? null,
        comment: row.comment,
        submitted_by: row.submitted_by,
        created_at: row.created_at.toISOString(),
      }));
      const seen = new Set(dbRows.map((row) => row.id));
      return [...dbRows, ...memory.filter((row) => !seen.has(row.id))].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    } catch (error) {
      if (isDbError(error)) disableDatabase();
    }
  }

  return memory.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createInvitation(input: {
  candidate_id: string;
  candidate_name: string;
  company: string;
  reschedule_date?: string | null;
  comment?: string | null;
  submitted_by?: string | null;
}): Promise<InvitationRecord> {
  const companyName = input.company.trim();
  const memoryRecord: InvitationRecord = {
    id: randomUUID(),
    candidate_id: input.candidate_id,
    candidate_name: input.candidate_name,
    company: companyName,
    reschedule_date: input.reschedule_date ?? null,
    comment: input.comment ?? null,
    submitted_by: input.submitted_by ?? null,
    created_at: new Date().toISOString(),
  };

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      const company = await prisma.clientCompany.upsert({
        where: { name: companyName },
        update: {},
        create: { name: companyName },
      });

      const candidateExists = await prisma.candidate.findUnique({
        where: { id: input.candidate_id },
        select: { id: true, name: true },
      });

      if (candidateExists) {
        const row = await prisma.candidateInvitation.create({
          data: {
            candidate_id: input.candidate_id,
            company_id: company.id,
            reschedule_date: input.reschedule_date ? new Date(input.reschedule_date) : null,
            comment: input.comment ?? null,
            submitted_by: input.submitted_by ?? null,
          },
          include: {
            company: { select: { name: true } },
            candidate: { select: { name: true } },
          },
        });

        return {
          id: row.id,
          candidate_id: row.candidate_id,
          candidate_name: row.candidate.name,
          company: row.company.name,
          reschedule_date: row.reschedule_date?.toISOString() ?? null,
          comment: row.comment,
          submitted_by: row.submitted_by,
          created_at: row.created_at.toISOString(),
        };
      }
    } catch (error) {
      if (isDbError(error)) {
        disableDatabase();
      } else {
        // Fall through to memory store when candidate is demo/memory-only.
      }
    }
  }

  getStore().invitations.unshift(memoryRecord);
  return memoryRecord;
}
