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
  delay?: number;
  onClick?: () => void;
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

export default function StatCard({ label, value, iconName, trend, delay = 0, onClick }: StatCardProps) {
  const animatedValue = useCountUp(value);
  const Icon = resolveIcon(iconName);
  const clickable = Boolean(onClick);

  const content = (
    <>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-credicus-ink animate-count-up" aria-hidden>
            {animatedValue}
          </p>
          {trend ? <p className="mt-1 text-xs font-medium text-credicus-primary">{trend}</p> : null}
        </div>
        <IconBadge
          icon={Icon}
          variant="primary"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {clickable ? (
        <p className="mt-3 text-xs font-medium text-credicus-ink-muted group-hover:text-credicus-primary">
          Click to view details
        </p>
      ) : null}
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}: ${value}. Click to view details.`}
        className="group ui-card relative w-full overflow-hidden p-5 text-left transition-all hover:-translate-y-0.5 hover:border-credicus-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credicus-primary"
        style={{ animationDelay: `${delay}ms` }}
      >
        {content}
      </button>
    );
  }

  return (
    <article
      aria-label={`${label}: ${value}${trend ? `. ${trend}` : ""}`}
      className="group ui-card relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:border-credicus-primary/30 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      {content}
    </article>
  );
}
