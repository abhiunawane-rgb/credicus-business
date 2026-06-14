"use client";

import { Calendar, CheckCircle, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import IconBadge from "@/components/ui/icon-badge";
import { getDashboardIcon, type DashboardIconName } from "@/lib/dashboard-icons";

const summaryIcons = {
  userPlus: UserPlus,
  calendar: Calendar,
  checkCircle: CheckCircle,
  users: Users,
} as const satisfies Record<string, LucideIcon>;

export type StatIconName = DashboardIconName | keyof typeof summaryIcons;

function resolveIcon(name: StatIconName): LucideIcon {
  if (name in summaryIcons) {
    return summaryIcons[name as keyof typeof summaryIcons];
  }
  return getDashboardIcon(name as DashboardIconName);
}

type StatCardProps = {
  label: string;
  value: string;
  iconName: StatIconName;
  trend?: string;
  dark?: boolean;
  delay?: number;
};

function useCountUp(target: string, duration = 600) {
  const numeric = parseInt(target.replace(/\D/g, ""), 10);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (Number.isNaN(numeric)) {
      setDisplay(target);
      return;
    }

    let start = 0;
    const step = Math.max(1, Math.ceil(numeric / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(String(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, numeric, duration]);

  return display;
}

export default function StatCard({ label, value, iconName, trend, dark = true, delay = 0 }: StatCardProps) {
  const animatedValue = useCountUp(value);
  const Icon = resolveIcon(iconName);

  return (
    <article
      aria-label={`${label}: ${value}${trend ? `. ${trend}` : ""}`}
      className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:border-credicus-yellow/50 hover:shadow-glow ${
        dark ? "ui-card-dark" : "ui-card"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 ui-shimmer opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-credicus-yellow/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-credicus-yellow/15" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-credicus-gray">{label}</p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums animate-count-up ${
              dark ? "text-credicus-yellow" : "text-gray-900"
            }`}
            aria-hidden
          >
            {animatedValue}
          </p>
          {trend ? <p className="mt-1 text-xs text-credicus-yellow">{trend}</p> : null}
        </div>
        <IconBadge
          icon={Icon}
          variant={dark ? "dark" : "light"}
          className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        />
      </div>
    </article>
  );
}
