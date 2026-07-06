"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { NotifyVariant } from "@/lib/action-feedback-types";

export type ToastItem = {
  id: string;
  variant: NotifyVariant;
  title?: string;
  message: string;
};

type ActionToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

const toastStyles: Record<NotifyVariant, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "ui-action-toast-success" },
  error: { icon: AlertCircle, className: "ui-action-toast-error" },
  info: { icon: Info, className: "ui-action-toast-info" },
  warning: { icon: AlertCircle, className: "ui-action-toast-warning" },
};

export default function ActionToastStack({ toasts, onDismiss }: ActionToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="ui-action-toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const style = toastStyles[toast.variant];
        const Icon = style.icon;
        return (
          <div key={toast.id} role="status" className={`ui-action-toast ${style.className}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
              <p className={toast.title ? "mt-0.5 text-sm" : "text-sm"}>{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
