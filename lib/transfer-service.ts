import { randomUUID } from "node:crypto";
import type { CandidateTransferPending, CandidateTransferRecord } from "@/lib/candidate-types";
import { displayCandidateName } from "@/lib/candidate-types";
import { emailsMatch, normalizeEmail } from "@/lib/demo-accounts";
import { getCandidate, updateCandidate } from "@/lib/candidate-service";
import {
  memoryAppendTransferHistory,
  memoryFindAnyPendingTransferForCandidate,
  memoryFindCandidateByTransferPendingId,
  memoryGetTransfer,
  memoryListTransfers,
  memoryResolveTransfer,
  type ListTransferFilters,
} from "@/lib/memory-store";

const now = () => new Date().toISOString();

function pendingToTransferRecord(
  candidate: NonNullable<Awaited<ReturnType<typeof getCandidate>>>,
): CandidateTransferRecord | null {
  if (!candidate.transfer_pending || !candidate.created_by) return null;
  return {
    id: candidate.transfer_pending.id,
    candidate_id: candidate.id,
    candidate_name: displayCandidateName(candidate),
    from_owner: normalizeEmail(candidate.created_by),
    requested_by: normalizeEmail(candidate.transfer_pending.requested_by),
    status: "pending",
    message: candidate.transfer_pending.message ?? null,
    created_at: candidate.transfer_pending.requested_at,
    resolved_at: null,
  };
}

export async function listTransferRequests(
  filters: ListTransferFilters = {},
): Promise<CandidateTransferRecord[]> {
  const normalized: ListTransferFilters = {
    ...filters,
    fromOwner: filters.fromOwner ? normalizeEmail(filters.fromOwner) : undefined,
    requestedBy: filters.requestedBy ? normalizeEmail(filters.requestedBy) : undefined,
  };
  return memoryListTransfers(normalized);
}

export async function createTransferRequest(input: {
  candidateId: string;
  requestedBy: string;
  message?: string;
}): Promise<{ transfer?: CandidateTransferRecord; error?: string }> {
  const requestedBy = normalizeEmail(input.requestedBy);
  const candidate = await getCandidate(input.candidateId);
  if (!candidate) {
    return { error: "Candidate not found." };
  }

  const owner = candidate.created_by ? normalizeEmail(candidate.created_by) : "";
  if (!owner) {
    return { error: "This candidate has no owner to transfer from." };
  }

  if (emailsMatch(owner, requestedBy)) {
    return { error: "You already own this candidate." };
  }

  const existingPending = memoryFindAnyPendingTransferForCandidate(candidate.id);
  if (existingPending) {
    if (emailsMatch(existingPending.requested_by, requestedBy)) {
      return { error: "You already have a pending transfer request for this candidate." };
    }
    return { error: "Another recruiter already requested this candidate." };
  }

  const pending: CandidateTransferPending = {
    id: randomUUID(),
    requested_by: requestedBy,
    requested_at: now(),
    message: input.message?.trim() || null,
  };

  const updated = await updateCandidate(candidate.id, { transfer_pending: pending });
  if (!updated) {
    return { error: "Could not save transfer request." };
  }

  const transfer = pendingToTransferRecord(updated);
  return transfer ? { transfer } : { error: "Could not save transfer request." };
}

export async function resolveTransferRequest(input: {
  transferId: string;
  ownerEmail: string;
  action: "approve" | "reject";
}): Promise<{ transfer?: CandidateTransferRecord; error?: string }> {
  const ownerEmail = normalizeEmail(input.ownerEmail);
  let candidate = memoryFindCandidateByTransferPendingId(input.transferId) ?? null;

  if (!candidate) {
    const legacy = memoryGetTransfer(input.transferId);
    if (legacy?.status === "pending") {
      candidate = await getCandidate(legacy.candidate_id);
    }
  }

  if (!candidate?.transfer_pending) {
    return { error: "Transfer request not found or already processed." };
  }

  if (!emailsMatch(candidate.created_by, ownerEmail)) {
    return { error: "Only the current owner can approve or reject this request." };
  }

  const pending = candidate.transfer_pending;
  const requester = normalizeEmail(pending.requested_by);
  const resolvedStatus = input.action === "approve" ? "approved" : "rejected";

  if (input.action === "approve") {
    const updated = await updateCandidate(candidate.id, {
      created_by: requester,
      transfer_pending: null,
    });
    if (!updated) {
      return { error: "Failed to transfer candidate ownership." };
    }
    if (!emailsMatch(updated.created_by, requester)) {
      return { error: "Failed to transfer candidate ownership." };
    }
  } else {
    const updated = await updateCandidate(candidate.id, { transfer_pending: null });
    if (!updated) {
      return { error: "Could not reject transfer request." };
    }
  }

  const historyRecord: CandidateTransferRecord = {
    id: pending.id,
    candidate_id: candidate.id,
    candidate_name: displayCandidateName(candidate),
    from_owner: ownerEmail,
    requested_by: requester,
    status: resolvedStatus,
    message: pending.message ?? null,
    created_at: pending.requested_at,
    resolved_at: now(),
  };

  memoryAppendTransferHistory(historyRecord);
  memoryResolveTransfer(pending.id, resolvedStatus);

  return { transfer: historyRecord };
}
