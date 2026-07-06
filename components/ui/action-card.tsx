import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import IconBadge from "@/components/ui/icon-badge";

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function ActionCard({ href, title, description, icon }: ActionCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${title}. ${description}`}
      className="group ui-card-interactive flex min-h-[var(--touch-comfortable)] items-start gap-4 p-5 focus-visible:ring-2 focus-visible:ring-credicus-primary"
    >
      <IconBadge
        icon={icon}
        variant="primary"
        size="lg"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-credicus-ink transition-colors group-hover:text-credicus-primary">
            {title}
          </p>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-credicus-ink-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-credicus-primary"
            aria-hidden
          />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-credicus-ink-secondary">{description}</p>
      </div>
    </Link>
  );
}
