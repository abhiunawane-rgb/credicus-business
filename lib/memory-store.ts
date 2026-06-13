import { randomUUID } from "node:crypto";
import type { CandidateRecord, CommentRecord, EmployeeRecord } from "@/lib/candidate-types";

const now = () => new Date().toISOString();

const seedCandidates: CandidateRecord[] = [
  {
    id: "cand-1",
    first_name: "Shivani",
    last_name: "Aggarwal",
    name: "Shivani Aggarwal",
    mobile: "9876543210",
    alt_mobile: "9876500000",
    email: "shivani@email.com",
    skills: ["Enrollment", "Counselling", "Admission Counselling", "Academics", "Career Development"],
    experience: 0.5,
    source: "naukri",
    portal_id: "NAUK-8821",
    process: "Permanent",
    current_company: "Study Bharat",
    education: "B.A - Bachelor of Arts, Delhi University - College of Art 2015",
    preferred_locations: ["Pune", "Mumbai"],
    salary: "2 Lacs",
    location: "Pune, Maharashtra, India",
    notice_period: "Immediate",
    call_status: "interested",
    interview_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "maybe",
    created_by: "recruiter@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-2",
    first_name: "Ravi",
    last_name: "Kumar",
    name: "Ravi Kumar",
    mobile: "9988776655",
    email: "ravi.k@email.com",
    skills: ["Java", "Spring Boot", "SQL", "Microservices"],
    experience: 3,
    source: "walk_in",
    process: "IT Hiring",
    current_company: "TechNova",
    education: "B.Tech CSE 2019",
    preferred_locations: ["Pune", "Bangalore"],
    salary: "8 Lacs",
    location: "Pune, Maharashtra, India",
    call_status: "confirmed",
    interview_date: new Date().toISOString(),
    status: "interviewed",
    created_by: "recruiter@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-3",
    first_name: "Amit",
    last_name: "Sharma",
    name: "Amit Sharma",
    mobile: "9123456780",
    skills: ["Sales", "B2B", "CRM", "Lead Generation"],
    experience: 2,
    source: "referral",
    process: "Sales",
    current_company: "ScaleLabs",
    preferred_locations: ["Pune", "Mumbai"],
    salary: "5 Lacs",
    location: "Pune, Maharashtra, India",
    status: "shortlisted",
    created_by: "teamleader@credicus.com",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "cand-4",
    first_name: "Priya",
    last_name: "Desai",
    name: "Priya Desai",
    mobile: "9012345678",
    email: "priya.d@email.com",
    skills: ["HR Operations", "Payroll", "Onboarding"],
    experience: 4,
    source: "naukri",
    portal_id: "NAUK-9912",
    process: "HR",
    current_company: "FinEdge",
    education: "MBA HR, Pune University 2020",
    preferred_locations: ["Pune"],
    salary: "6 Lacs",
    location: "Pune, Maharashtra, India",
    call_status: "callback",
    interview_date: new Date(Date.now() + 86400000 * 5).toISOString(),
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
    author_name: "Recruiter User",
    author_email: "recruiter@credicus.com",
    content: "Candidate interested in counselling roles. Good communication.",
    created_at: now(),
  },
  {
    id: "com-2",
    candidate_id: "cand-1",
    author_name: "Team Leader User",
    author_email: "teamleader@credicus.com",
    content: "Schedule interview for next week at Pune office.",
    created_at: now(),
  },
  {
    id: "com-3",
    candidate_id: "cand-2",
    author_name: "Recruiter User",
    author_email: "recruiter@credicus.com",
    content: "Technical round completed. Moving to client submission.",
    created_at: now(),
  },
];

const seedEmployees: EmployeeRecord[] = [
  {
    id: "emp-1",
    employee_code: "CRED-001",
    first_name: "Aisha",
    last_name: "Khan",
    email: "aisha@credicus.com",
    mobile: "9000000001",
    department: "Recruitment",
    designation: "Senior Recruiter",
    joining_date: "2022-03-15T00:00:00.000Z",
    status: "active",
    created_at: now(),
  },
  {
    id: "emp-2",
    employee_code: "CRED-002",
    first_name: "Rohit",
    last_name: "Mehta",
    email: "rohit@credicus.com",
    mobile: "9000000002",
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
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)),
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
  store.candidates[index] = { ...store.candidates[index], ...data, updated_at: now() };
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
