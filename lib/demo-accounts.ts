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

export const demoAccounts: DemoAccount[] = [
  {
    id: "user-recruiter-1",
    email: "recruiter@credicus.com",
    password: "Recruiter@123",
    role: "recruiter",
    roleLabel: "Recruiter",
    name: "Arjun Mehta",
    description: "Upload candidates, manage resumes, track leads",
  },
  {
    id: "user-team-leader-1",
    email: "teamleader@credicus.com",
    password: "TeamLeader@123",
    role: "team_leader",
    roleLabel: "Team Leader",
    name: "Neha Kapoor",
    description: "Monitor team performance and assign leads",
  },
  {
    id: "user-admin-1",
    email: "admin@credicus.com",
    password: "Admin@123",
    role: "admin",
    roleLabel: "Admin",
    name: "Sanjay Malhotra",
    description: "Manage users, import data, system settings",
  },
];
