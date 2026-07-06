import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardPageShell from "@/components/dashboard/page-shell";
import { getAuthSession } from "@/lib/auth-session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell role={session.role} email={session.email}>
      <DashboardPageShell>{children}</DashboardPageShell>
    </DashboardShell>
  );
}
