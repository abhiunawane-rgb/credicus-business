import { randomUUID } from "node:crypto";
import type { CandidateRecord, CommentRecord, EmployeeRecord } from "@/lib/candidate-types";

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
    created_by: "recruiter@credicus.com",
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
    created_by: "teamleader@credicus.com",
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
};

const globalStore = globalThis as unknown as { __credicusStore?: MemoryStore };

function getStore(): MemoryStore {
  if (!globalStore.__credicusStore) {
    globalStore.__credicusStore = {
      candidates: [...seedCandidates],
      comments: [...seedComments],
      employees: [...seedEmployees],
      contacts: [],
    };
  }
  return globalStore.__credicusStore;
}

export function memoryListCandidates(search?: string): CandidateRecord[] {
  const list = getStore().candidates;
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
