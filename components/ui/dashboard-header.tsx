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
    <header className="animate-fade-in-up ui-section-header">
      <div className="flex items-start gap-4">
        <IconBadge icon={Icon} variant="primary" size="lg" />
        <div className="min-w-0">
          <h1 className="ui-page-title">{title}</h1>
          <p className="ui-page-subtitle mt-1 max-w-3xl">{description}</p>
        </div>
      </div>
      {tip ? (
        <aside role="note" className="ui-alert-info flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-credicus-yellow" aria-hidden />
          <p>{tip}</p>
        </aside>
      ) : null}
    </header>
  );
}
