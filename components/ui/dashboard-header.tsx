"use client";

import { Lightbulb } from "lucide-react";
import IconBadge from "@/components/ui/icon-badge";
import { getDashboardIcon, type DashboardIconName } from "@/lib/dashboard-icons";

type DashboardHeaderProps = {
  title: string;
  description: string;
  iconName: DashboardIconName;
  tip?: string;
};

export default function DashboardHeader({ title, description, iconName, tip }: DashboardHeaderProps) {
  const Icon = getDashboardIcon(iconName);

  return (
    <header className="animate-fade-in-up space-y-4">
      <div className="flex items-start gap-4">
        <IconBadge icon={Icon} variant="dark" size="lg" className="animate-pulse-glow" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-credicus-gray-light sm:text-base">{description}</p>
        </div>
      </div>
      {tip ? (
        <aside
          role="note"
          className="flex items-start gap-3 rounded-xl border border-credicus-yellow/30 bg-credicus-yellow/10 px-4 py-3 text-sm leading-relaxed text-gray-200 transition-all duration-300 hover:border-credicus-yellow/50 hover:shadow-glow"
        >
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-credicus-yellow" aria-hidden />
          <p>{tip}</p>
        </aside>
      ) : null}
    </header>
  );
}
