import type { ReactNode } from "react";

type DashboardPageShellProps = {
  children: ReactNode;
};

export default function DashboardPageShell({ children }: DashboardPageShellProps) {
  return <div className="animate-fade-in-up space-y-6">{children}</div>;
}
