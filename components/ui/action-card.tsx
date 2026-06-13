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
      className="group ui-card-dark-interactive flex min-h-[var(--touch-comfortable)] items-start gap-4 p-5 focus-visible:ring-2 focus-visible:ring-credicus-yellow"
    >
      <IconBadge
        icon={icon}
        variant="dark"
        size="lg"
        className="transition-all duration-300 group-hover:scale-110 group-hover:bg-credicus-yellow/20"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-white transition-colors group-hover:text-credicus-yellow">{title}</p>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-credicus-gray transition-all duration-300 group-hover:translate-x-1 group-hover:text-credicus-yellow"
            aria-hidden
          />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-credicus-gray-light transition-colors group-hover:text-gray-300">
          {description}
        </p>
      </div>
    </Link>
  );
}
