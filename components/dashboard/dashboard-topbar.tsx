"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Logo from "@/components/brand/logo";
import DashboardAccountActions from "@/components/dashboard/dashboard-account-actions";
import type { UserRole } from "@/lib/auth";
import { pageTitleFromPath } from "@/lib/dashboard-nav-config";

type DashboardTopBarProps = {
  role: UserRole;
  pathname: string;
  desktopNavCollapsed: boolean;
  onMenuClick: () => void;
  onToggleDesktopNav: () => void;
};

export default function DashboardTopBar({
  role,
  pathname,
  desktopNavCollapsed,
  onMenuClick,
  onToggleDesktopNav,
}: DashboardTopBarProps) {
  const title = pageTitleFromPath(pathname, role);

  return (
    <div className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-3 sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="ui-button-ghost-dark lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5 lg:hidden">
        <Logo size="sm" href="/" />
      </div>

      <button
        type="button"
        onClick={onToggleDesktopNav}
        className="ui-button-ghost-dark hidden lg:inline-flex"
        aria-label={desktopNavCollapsed ? "Show navigation" : "Hide navigation"}
        aria-expanded={!desktopNavCollapsed}
      >
        {desktopNavCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      {desktopNavCollapsed ? (
        <div className="hidden lg:flex">
          <Logo size="sm" href="/" />
        </div>
      ) : null}

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h1>

      <DashboardAccountActions variant="topbar" />
    </div>
  );
}
