import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertVariant = "error" | "success" | "info";
type AlertTone = "light" | "dark";

type AlertProps = {
  variant: AlertVariant;
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  live?: "polite" | "assertive";
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const toneClasses: Record<AlertVariant, Record<AlertTone, string>> = {
  error: {
    light: "ui-alert-error",
    dark: "ui-alert-error-dark",
  },
  success: {
    light: "ui-alert-success",
    dark: "ui-alert-success-dark",
  },
  info: {
    light: "ui-alert-info",
    dark: "ui-alert-info-dark",
  },
};

export default function Alert({ variant, tone = "light", title, children, live = "polite" }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={live}
      className={`flex items-start gap-3 ${toneClasses[variant][tone]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={title ? "mt-1" : undefined}>{children}</p>
      </div>
    </div>
  );
}
