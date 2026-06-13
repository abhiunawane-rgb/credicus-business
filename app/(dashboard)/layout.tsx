import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/brand/logo";
import LogoutButton from "@/components/auth/logout-button";
import Breadcrumbs from "@/components/breadcrumbs";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import DashboardPageShell from "@/components/dashboard/page-shell";
import { getRoleDashboardPath } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth-session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }

  const dashboardRoot = getRoleDashboardPath(session.role);

  return (
    <div className="min-h-screen bg-credicus-surface text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-credicus-border pb-4 sm:mb-8">
          <div className="flex items-center gap-4">
            <Logo size="sm" href="/" />
            <div className="hidden h-8 w-px bg-credicus-border sm:block" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">Recruitment CRM</h2>
              {session ? <p className="mt-0.5 text-xs text-credicus-gray">{session.email}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings" className="ui-button-ghost text-xs sm:text-sm">
              Settings
            </Link>
            <LogoutButton />
          </div>
        </header>
        <Breadcrumbs dashboardRoot={dashboardRoot} />
        {session ? <DashboardNav role={session.role} /> : null}
        <main id="main-content">
          <DashboardPageShell>{children}</DashboardPageShell>
        </main>
      </div>
    </div>
  );
}
