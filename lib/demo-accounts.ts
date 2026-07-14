export type DemoAccountRole = "recruiter" | "team_leader" | "admin";

export type DemoAccount = {
  id: string;
  email: string;
  password: string;
  role: DemoAccountRole;
  roleLabel: string;
  name: string;
  description: string;
};

export function displayNameForEmail(email: string): string {
  return demoAccounts.find((account) => account.email === email)?.name ?? email.split("@")[0];
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailsMatch(a?: string | null, b?: string | null): boolean {
  return Boolean(a && b && normalizeEmail(a) === normalizeEmail(b));
}

export function recruiterEmails(): string[] {
  return demoAccounts.filter((account) => account.role === "recruiter").map((account) => account.email);
}

/** Single bootstrap admin — create all other users from the Users page. */
export const demoAccounts: DemoAccount[] = [
  {
    id: "user-admin-1",
    email: "admin@credicus.com",
    password: "Admin@123",
    role: "admin",
    roleLabel: "Admin",
    name: "Credicus Admin",
    description: "Create recruiters, team leaders, and manage the system from zero",
  },
];
