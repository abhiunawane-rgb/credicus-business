import Link from "next/link";
import { Settings } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";

type DashboardAccountActionsProps = {
  variant?: "sidebar" | "topbar";
  className?: string;
};

export default function DashboardAccountActions({
  variant = "sidebar",
  className = "",
}: DashboardAccountActionsProps) {
  if (variant === "topbar") {
    return (
      <div className={`flex shrink-0 items-center gap-1.5 ${className}`.trim()}>
        <Link
          href="/dashboard/settings"
          className="ui-button-ghost-dark gap-1.5 px-2.5 text-xs sm:px-3 sm:text-sm"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <LogoutButton className="ui-button-ghost-dark min-w-0 flex-none gap-1.5 px-2.5 text-xs disabled:opacity-60 sm:px-3 sm:text-sm" />
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`.trim()}>
      <Link
        href="/dashboard/settings"
        className="ui-button-secondary flex min-h-[2.5rem] flex-1 items-center justify-center gap-1.5 px-3 text-xs"
        aria-label="Open settings"
      >
        <Settings className="h-3.5 w-3.5" />
        Settings
      </Link>
      <LogoutButton className="ui-button-secondary flex-1 text-xs" />
    </div>
  );
}
