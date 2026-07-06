"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbsProps = {
  dashboardRoot?: string;
};

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  recruiter: "Recruiter",
  "team-leader": "Team Leader",
  admin: "Admin",
  settings: "Settings",
  upload: "Import",
  resumes: "Resumes",
  candidates: "Candidates",
  "follow-ups": "Follow-ups",
  invitations: "Invitations",
  talentpool: "Talent Pool",
  employees: "Employees",
  reports: "Reports",
};

function normalizeLabel(segment: string): string {
  if (LABEL_MAP[segment]) {
    return LABEL_MAP[segment];
  }
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Breadcrumbs({ dashboardRoot = "/dashboard" }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (!pathname.startsWith("/dashboard")) {
    return null;
  }

  const dashboardSegments = segments.slice(1);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-credicus-gray sm:text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={dashboardRoot} className="inline-flex min-h-[2rem] items-center transition hover:text-credicus-accent">
            Dashboard
          </Link>
        </li>
        {dashboardSegments.map((segment, index) => {
          const href = `/dashboard/${dashboardSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === dashboardSegments.length - 1;
          return (
            <li key={href} className="flex items-center gap-2">
              <span aria-hidden className="text-credicus-gray-dark">
                /
              </span>
              {isLast ? (
                <span className="font-medium text-credicus-accent" aria-current="page">
                  {normalizeLabel(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="inline-flex min-h-[2rem] items-center transition hover:text-credicus-accent"
                >
                  {normalizeLabel(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
