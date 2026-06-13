import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type IconBadgeProps = {
  icon: LucideIcon;
  variant?: "yellow" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variantStyles = {
  yellow: "bg-credicus-yellow/15 text-credicus-yellow border-credicus-yellow/30",
  dark: "bg-white/5 text-credicus-yellow border-credicus-border",
  light: "bg-credicus-yellow/10 text-credicus-black border-credicus-yellow/20",
};

const sizeStyles = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
};

export default function IconBadge({
  icon: Icon,
  variant = "yellow",
  size = "md",
  className = "",
}: IconBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

type IconBadgeSlotProps = {
  children: ReactNode;
  variant?: "yellow" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function IconBadgeSlot({
  children,
  variant = "yellow",
  size = "md",
  className = "",
}: IconBadgeSlotProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}
