import type { UserRole } from "@/lib/auth";
import type { DashboardIconName } from "@/lib/dashboard-icons";

export type NavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const recruiterNav: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { href: "/dashboard/recruiter", label: "Dashboard", icon: "layoutGrid" },
      { href: "/dashboard/recruiter/candidates", label: "Candidates", icon: "users" },
    ],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    items: [
      { href: "/dashboard/recruiter/candidates/new", label: "Add Candidate", icon: "userPlus" },
      { href: "/dashboard/recruiter/invitations", label: "Invitations", icon: "send" },
      { href: "/dashboard/recruiter/transfers", label: "Transfer Requests", icon: "userCheck" },
      { href: "/dashboard/recruiter/talentpool", label: "Talent Pool", icon: "users" },
      { href: "/dashboard/recruiter/follow-ups", label: "Follow-ups", icon: "calendar" },
    ],
  },
];

const teamLeaderNav: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { href: "/dashboard/team-leader", label: "Dashboard", icon: "layoutGrid" },
      { href: "/dashboard/team-leader/candidates", label: "Candidates", icon: "users" },
      { href: "/dashboard/team-leader/talentpool", label: "Talent Pool", icon: "users" },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { href: "/dashboard/admin", label: "Dashboard", icon: "layoutGrid" },
      { href: "/dashboard/admin/users", label: "Users", icon: "userCog" },
      { href: "/dashboard/admin/employees", label: "Employees", icon: "user" },
      { href: "/dashboard/admin/talentpool", label: "Talent Pool", icon: "users" },
      { href: "/dashboard/admin/reports", label: "Reports", icon: "barChart3" },
    ],
  },
];

export function navGroupsForRole(role: UserRole): NavGroup[] {
  if (role === "team_leader") return teamLeaderNav;
  if (role === "admin") return adminNav;
  return recruiterNav;
}

export function flattenNavItems(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((group) => group.items);
}

export function pageTitleFromPath(pathname: string, role: UserRole): string {
  const groups = navGroupsForRole(role);
  const items = flattenNavItems(groups);
  const match = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (match) return match.label;

  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/candidates/new")) return "Add Candidate";
  if (pathname.includes("/transfers")) return "Transfer Requests";
  if (pathname.match(/\/candidates\/[^/]+$/)) return "Candidate Detail";

  return "Dashboard";
}
