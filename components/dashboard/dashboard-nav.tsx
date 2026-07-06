"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import type { UserRole } from "@/lib/auth";

type NavItem = { href: string; label: string; group: string };

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const recruiterNav: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/dashboard/recruiter", label: "Dashboard", group: "overview" }],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    items: [
      { href: "/dashboard/recruiter/candidates", label: "Candidates", group: "pipeline" },
      { href: "/dashboard/recruiter/candidates/new", label: "Add Candidate", group: "pipeline" },
      { href: "/dashboard/recruiter/talentpool", label: "Talent Pool", group: "pipeline" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    items: [
      { href: "/dashboard/recruiter/follow-ups", label: "Follow-ups", group: "actions" },
      { href: "/dashboard/recruiter/invitations", label: "Invitations", group: "actions" },
      { href: "/dashboard/recruiter/upload", label: "Import", group: "actions" },
      { href: "/dashboard/recruiter/resumes", label: "Resumes", group: "actions" },
    ],
  },
];

const teamLeaderNav: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/dashboard/team-leader", label: "Dashboard", group: "overview" }],
  },
  {
    id: "team",
    label: "Team",
    items: [
      { href: "/dashboard/team-leader/candidates", label: "Candidates", group: "team" },
      { href: "/dashboard/team-leader/talentpool", label: "Talent Pool", group: "team" },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/dashboard/admin", label: "Dashboard", group: "overview" }],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { href: "/dashboard/admin/employees", label: "Employees", group: "manage" },
      { href: "/dashboard/admin/talentpool", label: "Talent Pool", group: "manage" },
      { href: "/dashboard/admin/reports", label: "Reports", group: "manage" },
    ],
  },
];

function navGroupsForRole(role: UserRole): NavGroup[] {
  if (role === "team_leader") return teamLeaderNav;
  if (role === "admin") return adminNav;
  return recruiterNav;
}

function flattenGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((group) => group.items);
}

function isActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;

  const hasMoreSpecificMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );

  return !hasMoreSpecificMatch;
}

type DashboardNavProps = {
  role: UserRole;
};

export default function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const menuId = useId();
  const groups = navGroupsForRole(role);
  const allItems = useMemo(() => flattenGroups(groups), [groups]);
  const primaryItems = useMemo(() => {
    if (role === "recruiter") {
      return allItems.filter((item) =>
        ["/dashboard/recruiter", "/dashboard/recruiter/candidates", "/dashboard/recruiter/talentpool", "/dashboard/recruiter/follow-ups"].includes(
          item.href,
        ),
      );
    }
    return allItems.slice(0, 4);
  }, [allItems, role]);
  const secondaryItems = useMemo(
    () => allItems.filter((item) => !primaryItems.some((primary) => primary.href === item.href)),
    [allItems, primaryItems],
  );

  const [moreOpen, setMoreOpen] = useState(false);
  const allHrefs = useMemo(() => allItems.map((item) => item.href), [allItems]);
  const secondaryActive = secondaryItems.some((item) => isActive(pathname, item.href, allHrefs));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  function linkClass(active: boolean, compact = false) {
    return [
      "relative inline-flex min-h-[var(--touch-min)] items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-all duration-200",
      compact ? "text-xs sm:text-sm" : "text-sm",
      active
        ? "bg-credicus-primary text-credicus-ink shadow-sm"
        : "text-credicus-gray-dark hover:bg-credicus-primary-light hover:text-credicus-primary",
    ].join(" ");
  }

  return (
    <div className="mb-6 space-y-2">
      <nav
        aria-label="Dashboard"
        className="rounded-xl border border-credicus-line-default bg-white p-1.5 shadow-sm"
      >
        <div className="hidden items-center gap-1 lg:flex">
          {groups.map((group, groupIndex) => (
            <div key={group.id} className="flex items-center gap-1">
              {groupIndex > 0 ? <span className="ui-nav-separator" aria-hidden /> : null}
              <span className="hidden px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-credicus-gray lg:inline">
                {group.label}
              </span>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, allHrefs);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={linkClass(active)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {primaryItems.map((item) => {
            const active = isActive(pathname, item.href, allHrefs);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${linkClass(active, true)} shrink-0`}
              >
                {item.label}
              </Link>
            );
          })}

          {secondaryItems.length > 0 ? (
            <div className="relative ml-auto shrink-0">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-controls={menuId}
                onClick={() => setMoreOpen((open) => !open)}
                className={`${linkClass(secondaryActive || moreOpen, true)} gap-1 pr-2`}
              >
                More
                <ChevronDown className={`h-4 w-4 transition ${moreOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {moreOpen ? (
                <div
                  id={menuId}
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.35rem)] z-20 min-w-[11rem] animate-dropdown-in rounded-xl border border-credicus-line-default bg-white p-1.5 shadow-lg"
                >
                  {secondaryItems.map((item) => {
                    const active = isActive(pathname, item.href, allHrefs);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        className={`${linkClass(active, true)} w-full justify-start`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </nav>

      <p className="text-xs text-credicus-gray lg:sr-only">
        Tip: use <strong className="text-credicus-ink-secondary">More</strong> for import, invitations, and resumes.
      </p>
    </div>
  );
}
