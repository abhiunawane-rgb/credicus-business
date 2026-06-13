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
        <p className="text-xs font-semibold uppercase tracking-wide text-credicus-gray">Quick demo login</p>
        <span className="rounded-full bg-credicus-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-credicus-black">
          One tap
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
              className={`group w-full min-h-[var(--touch-comfortable)] rounded-xl border p-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 animate-fade-in-up ${
                isActive
                  ? "border-credicus-yellow bg-credicus-yellow/10 shadow-glow ring-1 ring-credicus-yellow/40"
                  : "border-gray-200 bg-gray-50 hover:-translate-y-0.5 hover:border-credicus-yellow/60 hover:bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-credicus-black">
                    {account.name}
                  </p>
                  <p className="truncate text-xs text-credicus-gray">{account.email}</p>
                </div>
                <span className={`shrink-0 transition-transform group-hover:scale-105 ${roleStyles[account.role]}`}>
                  {account.roleLabel}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-600">{account.description}</p>
              <p className="mt-2 flex items-center justify-between text-[11px] font-medium text-credicus-gray transition group-hover:text-gray-800">
                <span>
                  Password: <span className="font-mono text-gray-800">{account.password}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 translate-x-0 opacity-70 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
