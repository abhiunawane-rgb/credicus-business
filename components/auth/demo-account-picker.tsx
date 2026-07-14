"use client";

import { ArrowRight } from "lucide-react";
import { demoAccounts, type DemoAccount } from "@/lib/demo-accounts";

type DemoAccountPickerProps = {
  activeEmail: string;
  isLoading: boolean;
  onSelect: (account: DemoAccount) => void;
};

const roleStyles: Record<DemoAccount["role"], string> = {
  recruiter: "ui-badge-yellow",
  team_leader: "ui-badge-muted",
  admin: "ui-badge-success",
};

export default function DemoAccountPicker({ activeEmail, isLoading, onSelect }: DemoAccountPickerProps) {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">Admin login</p>
        <span className="rounded-full bg-credicus-primary-light px-2 py-0.5 text-[10px] font-semibold text-credicus-ink">
          Bootstrap
        </span>
      </div>
      <div className="grid gap-2" role="list">
        {demoAccounts.map((account, index) => {
          const isActive = activeEmail.toLowerCase() === account.email.toLowerCase();
          return (
            <button
              key={account.id}
              type="button"
              role="listitem"
              disabled={isLoading}
              onClick={() => onSelect(account)}
              style={{ animationDelay: `${index * 80}ms` }}
              aria-pressed={isActive}
              aria-label={`Sign in as ${account.roleLabel}: ${account.name}`}
              className={`group w-full min-h-[var(--touch-comfortable)] rounded-xl border p-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 animate-fade-in-up ${
                isActive
                  ? "border-credicus-primary bg-credicus-primary-soft shadow-md ring-2 ring-credicus-primary/20"
                  : "border-credicus-line-subtle bg-credicus-surface hover:border-credicus-primary/40 hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-credicus-ink transition-colors group-hover:text-credicus-primary">
                    {account.name}
                  </p>
                  <p className="truncate text-xs text-credicus-ink-muted">{account.email}</p>
                </div>
                <span className={`shrink-0 ${roleStyles[account.role]}`}>{account.roleLabel}</span>
              </div>
              <p className="mt-1.5 text-xs text-credicus-ink-secondary">{account.description}</p>
              <p className="mt-2 flex items-center justify-between text-[11px] font-medium text-credicus-ink-muted">
                <span>
                  Password: <span className="font-mono text-credicus-ink-secondary">{account.password}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
