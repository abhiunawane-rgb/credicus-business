"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import DashboardAccountActions from "@/components/dashboard/dashboard-account-actions";
import type { UserRole } from "@/lib/auth";
import { displayNameForEmail } from "@/lib/demo-accounts";
import { flattenNavItems, navGroupsForRole, type NavGroup, type NavItem } from "@/lib/dashboard-nav-config";
import { getDashboardIcon } from "@/lib/dashboard-icons";

type DashboardSidebarProps = {
  role: UserRole;
  email: string;
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  onClose: () => void;
};

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

function NavLink({
  item,
  pathname,
  allHrefs,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  allHrefs: string[];
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.href, allHrefs);
  const Icon = getDashboardIcon(item.icon);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-[var(--touch-comfortable)] items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors",
        active
          ? "bg-credicus-primary-light text-credicus-ink shadow-sm"
          : "text-credicus-ink-secondary hover:bg-credicus-primary-soft hover:text-credicus-ink",
      ].join(" ")}
    >
      <Icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${active ? "text-credicus-yellow" : "text-credicus-ink-muted"}`} />
      <span>{item.label}</span>
    </Link>
  );
}

function NavGroupSection({
  group,
  pathname,
  allHrefs,
  onNavigate,
  defaultOpen = true,
}: {
  group: NavGroup;
  pathname: string;
  allHrefs: string[];
  onNavigate?: () => void;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const hasActiveChild = group.items.some((item) => isActive(pathname, item.href, allHrefs));
  const isCollapsible = group.id !== "main";

  if (!isCollapsible) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} allHrefs={allHrefs} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-transparent">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="ui-nav-group-label flex w-full min-h-[2.25rem] items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-credicus-surface"
      >
        <span>{group.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded || hasActiveChild ? "rotate-180" : ""}`} />
      </button>
      {expanded || hasActiveChild ? (
        <div className="mt-1 space-y-1 border-l-2 border-credicus-primary/20 pl-2">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} allHrefs={allHrefs} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardSidebar({
  role,
  email,
  mobileOpen,
  desktopCollapsed,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const groups = navGroupsForRole(role);
  const allItems = flattenNavItems(groups);
  const allHrefs = allItems.map((item) => item.href);
  const displayName = displayNameForEmail(email);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [navQuery, setNavQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, navQuery]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 top-[var(--topbar-height)] z-40 bg-credicus-ink/25 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        aria-label="Application navigation"
        className={[
          "flex w-[var(--sidebar-width)] shrink-0 flex-col overflow-hidden border-r border-credicus-line-subtle bg-credicus-chrome",
          "fixed left-0 top-[var(--topbar-height)] z-50 h-[calc(100dvh-var(--topbar-height))] shadow-lg transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          desktopCollapsed ? "lg:hidden" : "lg:relative lg:translate-x-0 lg:shadow-none",
        ].join(" ")}
      >
        <div className="shrink-0 border-b border-credicus-line-subtle px-4 py-3">
          <div className="flex items-center gap-3 rounded-xl border border-credicus-line-subtle bg-white px-3 py-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-credicus-primary text-xs font-bold text-credicus-ink"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-credicus-ink">{displayName}</p>
              <p className="truncate text-xs text-credicus-ink-muted">{email}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-b border-credicus-line-subtle px-4 py-3">
          <label className="sr-only" htmlFor="sidebar-search">
            Search navigation
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-ink-muted" aria-hidden />
            <input
              id="sidebar-search"
              type="search"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search menu..."
              className="ui-input py-2 pl-10 text-sm"
            />
          </div>
        </div>

        <nav className="dashboard-nav-scroll min-h-0 flex-1 space-y-4 px-3 py-4">
          {filteredGroups.length === 0 ? (
            <p className="px-3 text-sm text-credicus-ink-muted">No menu items match your search.</p>
          ) : (
            filteredGroups.map((group) => (
              <NavGroupSection
                key={group.id}
                group={group}
                pathname={pathname}
                allHrefs={allHrefs}
                onNavigate={onClose}
                defaultOpen={group.id === "main" || navQuery.trim().length > 0}
              />
            ))
          )}
        </nav>

        <div className="shrink-0 border-t border-credicus-line-subtle bg-credicus-surface/50 p-3 pb-4">
          <DashboardAccountActions />
        </div>
      </aside>
    </>
  );
}
