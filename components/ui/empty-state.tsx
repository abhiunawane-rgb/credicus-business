import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Recognition over recall — clear empty views with one next step (Hick's Law) */
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty-state" role="status">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-credicus-yellow-soft text-credicus-yellow">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-base font-semibold text-credicus-ink">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-credicus-ink-secondary">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
