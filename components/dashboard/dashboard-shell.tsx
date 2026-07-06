"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Logo from "@/components/brand/logo";
import type { UserRole } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardTopBar from "@/components/dashboard/dashboard-topbar";

type DashboardShellProps = {
  role: UserRole;
  email: string;
  children: ReactNode;
};

export default function DashboardShell({ role, email, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-credicus-chrome">
      <header className="ui-site-chrome sticky top-0 z-40 flex h-[var(--topbar-height)] shrink-0 items-stretch border-b border-white/10">
        <div
          className={[
            "hidden h-full shrink-0 items-center justify-center border-r border-white/10 lg:flex",
            desktopNavCollapsed ? "lg:w-0 lg:overflow-hidden lg:border-r-0" : "lg:w-[var(--sidebar-width)]",
          ].join(" ")}
        >
          <Logo size="md" href="/" />
        </div>

        <DashboardTopBar
          role={role}
          pathname={pathname}
          desktopNavCollapsed={desktopNavCollapsed}
          onMenuClick={() => setMobileNavOpen(true)}
          onToggleDesktopNav={() => setDesktopNavCollapsed((value) => !value)}
        />
      </header>

      <div className="flex h-[calc(100vh-var(--topbar-height))] min-h-0 overflow-hidden">
        <DashboardSidebar
          role={role}
          email={email}
          mobileOpen={mobileNavOpen}
          desktopCollapsed={desktopNavCollapsed}
          onClose={() => setMobileNavOpen(false)}
        />

        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
