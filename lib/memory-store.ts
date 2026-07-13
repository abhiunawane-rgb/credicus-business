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

const seedCandidates: CandidateRecord[] = [
  {
    id: "cand-1",
    first_name: "Karan",
    last_name: "Iyer",
    name: "Karan Iyer",
    mobile: "8765432109",
    alt_mobile: "8765400001",
    email: "karan.iyer@example.in",
    skills: ["Content Strategy", "SEO", "Campaign Management", "Analytics"],
    experience: 2,
    source: "naukri",
    portal_id: "NAUK-4412",
    process: "Marketing",
    current_company: "BrightWave Media",
    education: "B.Com, Osmania University 2021",
    preferred_locations: ["Hyderabad", "Bengaluru"],
    salary: "4.5 Lacs",
    location: "Hyderabad, Telangana, India",
    notice_period: "30 days",
    call_status: "interested",
    interview_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "maybe",
    created_by: "recruiter@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-2",
    first_name: "Meera",
    last_name: "Nair",
    name: "Meera Nair",
    mobile: "7654321098",
    email: "meera.nair@example.in",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    experience: 4,
    source: "linkedin",
    process: "Engineering",
    current_company: "CloudNest Labs",
    education: "B.Tech IT, CUSAT 2019",
    preferred_locations: ["Kochi", "Bengaluru"],
    salary: "12 Lacs",
    location: "Kochi, Kerala, India",
    call_status: "confirmed",
    interview_date: new Date().toISOString(),
    status: "interviewed",
    created_by: "recruiter2@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-3",
    first_name: "Vikram",
    last_name: "Patel",
    name: "Vikram Patel",
    mobile: "9456123780",
    skills: ["B2B Sales", "CRM", "Client Relations", "Negotiation"],
    experience: 3,
    source: "referral",
    process: "Sales",
    current_company: "Summit Retail Group",
    preferred_locations: ["Ahmedabad", "Mumbai"],
    salary: "6 Lacs",
    location: "Ahmedabad, Gujarat, India",
    status: "shortlisted",
    created_by: "recruiter2@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-4",
    first_name: "Ananya",
    last_name: "Reddy",
    name: "Ananya Reddy",
    mobile: "8123456789",
    email: "ananya.reddy@example.in",
    skills: ["HR Operations", "Payroll", "Employee Engagement"],
    experience: 5,
    source: "walk_in",
    process: "Human Resources",
    current_company: "Horizon Staffing",
    education: "MBA HR, Anna University 2018",
    preferred_locations: ["Bengaluru"],
    salary: "7 Lacs",
    location: "Bengaluru, Karnataka, India",
    call_status: "callback",
    interview_date: new Date(Date.now() + 86400000 * 6).toISOString(),
    status: "new",
    created_by: "recruiter@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
];

const seedComments: CommentRecord[] = [
  {
    id: "com-1",
    candidate_id: "cand-1",
    author_name: "Arjun Mehta",
    author_email: "recruiter@credicus.com",
    content: "Strong portfolio for digital campaigns. Follow up on salary expectations.",
    created_at: now(),
  },
  {
    id: "com-2",
    candidate_id: "cand-1",
    author_name: "Neha Kapoor",
    author_email: "teamleader@credicus.com",
    content: "Schedule a panel interview at the Hyderabad office next week.",
    created_at: now(),
  },
  {
    id: "com-3",
    candidate_id: "cand-2",
    author_name: "Arjun Mehta",
    author_email: "recruiter@credicus.com",
    content: "Technical round completed. Awaiting client feedback.",
    created_at: now(),
  },
];

const seedEmployees: EmployeeRecord[] = [
  {
    id: "emp-1",
    employee_code: "CRED-001",
    first_name: "Divya",
    last_name: "Krishnan",
    email: "divya.krishnan@credicus.in",
    mobile: "9123456701",
    department: "Recruitment",
    designation: "Senior Recruiter",
    joining_date: "2022-03-15T00:00:00.000Z",
    status: "active",
    created_at: now(),
  },
  {
    id: "emp-2",
    employee_code: "CRED-002",
    first_name: "Rahul",
    last_name: "Joshi",
    email: "rahul.joshi@credicus.in",
    mobile: "9123456702",
    department: "Recruitment",
    designation: "Recruiter",
    joining_date: "2023-06-01T00:00:00.000Z",
    status: "active",
    created_at: now(),
  },
];

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

const globalStore = globalThis as unknown as { __credicusStore?: MemoryStore };

function getStore(): MemoryStore {
  if (!globalStore.__credicusStore) {
    globalStore.__credicusStore = {
      candidates: [...seedCandidates],
      comments: [...seedComments],
      employees: [...seedEmployees],
      contacts: [],
      transfers: [],
    };
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
