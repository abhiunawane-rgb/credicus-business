import { randomUUID } from "node:crypto";
import type {
  CandidateRecord,
  CandidateTransferPending,
  CandidateTransferRecord,
  CommentRecord,
  EmployeeRecord,
  TransferRequestStatus,
} from "@/lib/candidate-types";
import { toLocalDateKey } from "@/lib/list-filters";

const now = () => new Date().toISOString();

/** Fresh install — no demo candidates, comments, or employees. */
const seedCandidates: CandidateRecord[] = [];
const seedComments: CommentRecord[] = [];
const seedEmployees: EmployeeRecord[] = [];

type ContactRecord = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type MemoryStore = {
  candidates: CandidateRecord[];
  comments: CommentRecord[];
  employees: EmployeeRecord[];
  contacts: ContactRecord[];
  transfers: CandidateTransferRecord[];
};

const globalStore = globalThis as unknown as {
  __credicusStore?: MemoryStore;
  __credicusStoreVersion?: number;
};

const STORE_VERSION = 3;

function getStore(): MemoryStore {
  if (!globalStore.__credicusStore || globalStore.__credicusStoreVersion !== STORE_VERSION) {
    globalStore.__credicusStore = {
      candidates: [...seedCandidates],
      comments: [...seedComments],
      employees: [...seedEmployees],
      contacts: [],
      transfers: [],
    };
    globalStore.__credicusStoreVersion = STORE_VERSION;
  }
  return globalStore.__credicusStore;
}

export type ListCandidatesFilters = {
  search?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
};

function matchesCreatedDate(candidate: CandidateRecord, dateFrom?: string, dateTo?: string): boolean {
  if (!dateFrom && !dateTo) return true;
  const key = toLocalDateKey(candidate.created_at);
  if (dateFrom && key < dateFrom) return false;
  if (dateTo && key > dateTo) return false;
  return true;
}

export function memoryListCandidates(filters: ListCandidatesFilters = {}): CandidateRecord[] {
  const { search, createdBy, dateFrom, dateTo } = filters;
  let list = getStore().candidates;

  if (createdBy) {
    list = list.filter((candidate) =>
      candidate.created_by ? candidate.created_by.toLowerCase() === createdBy.toLowerCase() : false,
    );
  }

  list = list.filter((candidate) => matchesCreatedDate(candidate, dateFrom, dateTo));

  if (!search?.trim()) return list;
  const q = search.toLowerCase();
  return list.filter(
    (c) =>
      (c.name?.toLowerCase().includes(q) ?? false) ||
      (c.mobile?.includes(q) ?? false) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.skills?.some((s) => s.toLowerCase().includes(q)) ?? false),
  );
}

export function memoryGetCandidate(id: string): CandidateRecord | undefined {
  return getStore().candidates.find((c) => c.id === id);
}

export function memoryCreateCandidate(
  data: Omit<CandidateRecord, "id" | "created_at" | "updated_at">,
): CandidateRecord {
  const record: CandidateRecord = {
    ...data,
    id: randomUUID(),
    created_at: now(),
    updated_at: now(),
  };
  getStore().candidates.unshift(record);
  return record;
}

export function memoryUpdateCandidate(
  id: string,
  data: Partial<CandidateRecord>,
): CandidateRecord | null {
  const store = getStore();
  const index = store.candidates.findIndex((c) => c.id === id);
  if (index < 0) return null;
  const patch = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<CandidateRecord>;
  store.candidates[index] = { ...store.candidates[index], ...patch, updated_at: now() };
  return store.candidates[index];
}

export function memoryDeleteCandidate(id: string): boolean {
  const store = getStore();
  const before = store.candidates.length;
  store.candidates = store.candidates.filter((c) => c.id !== id);
  store.comments = store.comments.filter((c) => c.candidate_id !== id);
  return store.candidates.length < before;
}

export function memoryListComments(candidateId: string): CommentRecord[] {
  return getStore()
    .comments.filter((c) => c.candidate_id === candidateId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function memoryAddComment(
  candidateId: string,
  content: string,
  author: { id?: string; name: string; email?: string },
): CommentRecord {
  const record: CommentRecord = {
    id: randomUUID(),
    candidate_id: candidateId,
    author_id: author.id ?? null,
    author_name: author.name,
    author_email: author.email ?? null,
    content,
    created_at: now(),
  };
  getStore().comments.unshift(record);
  return record;
}

export function memoryListEmployees(): EmployeeRecord[] {
  return getStore().employees;
}

export function memoryCreateEmployee(
  data: Omit<EmployeeRecord, "id" | "created_at">,
): EmployeeRecord {
  const record: EmployeeRecord = { ...data, id: randomUUID(), created_at: now() };
  getStore().employees.unshift(record);
  return record;
}

export function memoryCreateContact(data: {
  name: string;
  email: string;
  message: string;
}): { id: string; name: string; email: string } {
  const record = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    message: data.message,
    created_at: now(),
  };
  getStore().contacts.unshift(record);
  return { id: record.id, name: record.name, email: record.email };
}

export type ListTransferFilters = {
  fromOwner?: string;
  requestedBy?: string;
  candidateId?: string;
  status?: TransferRequestStatus;
};

export function memoryFindCandidateByTransferPendingId(
  transferId: string,
): CandidateRecord | undefined {
  return getStore().candidates.find((candidate) => candidate.transfer_pending?.id === transferId);
}

export function memoryAppendTransferHistory(record: CandidateTransferRecord): CandidateTransferRecord {
  getStore().transfers.unshift(record);
  return record;
}

export function memoryListTransfers(filters: ListTransferFilters = {}): CandidateTransferRecord[] {
  const pendingFromCandidates: CandidateTransferRecord[] = getStore()
    .candidates.filter((candidate) => candidate.transfer_pending && candidate.created_by)
    .map((candidate) => ({
      id: candidate.transfer_pending!.id,
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      from_owner: candidate.created_by!,
      requested_by: candidate.transfer_pending!.requested_by,
      status: "pending" as const,
      message: candidate.transfer_pending!.message ?? null,
      created_at: candidate.transfer_pending!.requested_at,
      resolved_at: null,
    }));

  let list = [...pendingFromCandidates, ...getStore().transfers.filter((transfer) => transfer.status !== "pending")];
  if (filters.fromOwner) {
    const owner = filters.fromOwner.toLowerCase();
    list = list.filter((transfer) => transfer.from_owner.toLowerCase() === owner);
  }
  if (filters.requestedBy) {
    const requester = filters.requestedBy.toLowerCase();
    list = list.filter((transfer) => transfer.requested_by.toLowerCase() === requester);
  }
  if (filters.candidateId) {
    list = list.filter((transfer) => transfer.candidate_id === filters.candidateId);
  }
  if (filters.status) {
    list = list.filter((transfer) => transfer.status === filters.status);
  }
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function memoryGetTransfer(id: string): CandidateTransferRecord | undefined {
  return getStore().transfers.find((transfer) => transfer.id === id);
}

export function memoryFindPendingTransfer(
  candidateId: string,
  requestedBy: string,
): CandidateTransferRecord | undefined {
  const candidate = getStore().candidates.find((item) => item.id === candidateId);
  if (!candidate?.transfer_pending) return undefined;
  if (candidate.transfer_pending.requested_by.toLowerCase() !== requestedBy.toLowerCase()) {
    return undefined;
  }
  return {
    id: candidate.transfer_pending.id,
    candidate_id: candidate.id,
    candidate_name: candidate.name,
    from_owner: candidate.created_by ?? "",
    requested_by: candidate.transfer_pending.requested_by,
    status: "pending",
    message: candidate.transfer_pending.message ?? null,
    created_at: candidate.transfer_pending.requested_at,
    resolved_at: null,
  };
}

export function memoryFindAnyPendingTransferForCandidate(
  candidateId: string,
): CandidateTransferPending | undefined {
  return getStore().candidates.find((item) => item.id === candidateId)?.transfer_pending ?? undefined;
}

export function memoryCreateTransferRequest(data: {
  candidate_id: string;
  candidate_name: string;
  from_owner: string;
  requested_by: string;
  message?: string | null;
}): CandidateTransferRecord {
  const record: CandidateTransferRecord = {
    id: randomUUID(),
    candidate_id: data.candidate_id,
    candidate_name: data.candidate_name,
    from_owner: data.from_owner,
    requested_by: data.requested_by,
    status: "pending",
    message: data.message ?? null,
    created_at: now(),
    resolved_at: null,
  };
  getStore().transfers.unshift(record);
  return record;
}

export function memoryResolveTransfer(
  id: string,
  status: Exclude<TransferRequestStatus, "pending">,
): CandidateTransferRecord | null {
  const store = getStore();
  const index = store.transfers.findIndex((transfer) => transfer.id === id);
  if (index < 0) return null;
  store.transfers[index] = {
    ...store.transfers[index],
    status,
    resolved_at: now(),
  };
  return store.transfers[index];
}
