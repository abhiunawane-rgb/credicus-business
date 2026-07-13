import type { CandidateTransferRecord } from "@/lib/candidate-types";
import { displayCandidateName } from "@/lib/candidate-types";
import { getCandidate, updateCandidate } from "@/lib/candidate-service";
import {
  memoryCreateTransferRequest,
  memoryFindPendingTransfer,
  memoryGetTransfer,
  memoryListTransfers,
  memoryResolveTransfer,
  type ListTransferFilters,
} from "@/lib/memory-store";

export async function listTransferRequests(
  filters: ListTransferFilters = {},
): Promise<CandidateTransferRecord[]> {
  return memoryListTransfers(filters);
}

export async function createTransferRequest(input: {
  candidateId: string;
  requestedBy: string;
  message?: string;
}): Promise<{ transfer?: CandidateTransferRecord; error?: string }> {
  const candidate = await getCandidate(input.candidateId);
  if (!candidate) {
    return { error: "Candidate not found." };
  }

  const owner = candidate.created_by?.trim();
  if (!owner) {
    return { error: "This candidate has no owner to transfer from." };
  }

  if (owner === input.requestedBy) {
    return { error: "You already own this candidate." };
  }

  const existing = memoryFindPendingTransfer(input.candidateId, input.requestedBy);
  if (existing) {
    return { error: "You already have a pending transfer request for this candidate." };
  }

  const transfer = memoryCreateTransferRequest({
    candidate_id: candidate.id,
    candidate_name: displayCandidateName(candidate),
    from_owner: owner,
    requested_by: input.requestedBy,
    message: input.message ?? null,
  });

  return { transfer };
}

export async function resolveTransferRequest(input: {
  transferId: string;
  ownerEmail: string;
  action: "approve" | "reject";
}): Promise<{ transfer?: CandidateTransferRecord; error?: string }> {
  const transfer = memoryGetTransfer(input.transferId);
  if (!transfer) {
    return { error: "Transfer request not found." };
  }

  if (transfer.from_owner !== input.ownerEmail) {
    return { error: "Only the current owner can approve or reject this request." };
  }

  if (transfer.status !== "pending") {
    return { error: "This transfer request has already been processed." };
  }

  const candidate = await getCandidate(transfer.candidate_id);
  if (!candidate) {
    return { error: "Candidate no longer exists." };
  }

  if (candidate.created_by !== transfer.from_owner) {
    return { error: "Candidate ownership changed. This request is no longer valid." };
  }

  const resolved = memoryResolveTransfer(
    input.transferId,
    input.action === "approve" ? "approved" : "rejected",
  );
  if (!resolved) {
    return { error: "Could not update transfer request." };
  }

  if (input.action === "approve") {
    await updateCandidate(transfer.candidate_id, { created_by: transfer.requested_by });
  }

  return { transfer: resolved };
}
