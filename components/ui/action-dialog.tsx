"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, Info, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import PasswordInput from "@/components/ui/password-input";
import type { ActionDialogVariant } from "@/lib/action-feedback-types";

export type ActionDialogState =
  | {
      type: "confirm";
      title: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: ActionDialogVariant;
    }
  | {
      type: "prompt";
      title: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      placeholder?: string;
      defaultValue?: string;
      inputType?: "text" | "password";
      variant?: ActionDialogVariant;
    };

type ActionDialogProps = {
  open: boolean;
  state: ActionDialogState | null;
  promptValue: string;
  onPromptValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<
  ActionDialogVariant,
  { icon: typeof Info; iconWrap: string; confirmBtn: string }
> = {
  default: {
    icon: Info,
    iconWrap: "bg-credicus-primary-light text-credicus-ink",
    confirmBtn: "ui-button-primary",
  },
  danger: {
    icon: Trash2,
    iconWrap: "bg-red-50 text-red-600",
    confirmBtn: "inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-credicus-yellow-soft text-credicus-ink",
    confirmBtn: "ui-button-primary",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50 text-emerald-600",
    confirmBtn: "ui-button-primary",
  },
  info: {
    icon: HelpCircle,
    iconWrap: "bg-credicus-primary-light text-credicus-ink",
    confirmBtn: "ui-button-primary",
  },
};

export default function ActionDialog({
  open,
  state,
  promptValue,
  onPromptValueChange,
  onConfirm,
  onCancel,
}: ActionDialogProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const variant = state?.variant ?? (state?.type === "confirm" ? "default" : "default");
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (!open || state?.type !== "prompt") return;
    inputRef.current?.focus();
  }, [open, state?.type]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open || !state) return null;

  return (
    <div className="ui-action-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ui-action-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-credicus-ink-muted transition hover:bg-credicus-surface hover:text-credicus-ink"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${styles.iconWrap}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <h2 id={titleId} className="pr-8 text-lg font-semibold text-credicus-ink">
          {state.title}
        </h2>
        {state.message ? <p className="mt-2 text-sm leading-relaxed text-credicus-ink-secondary">{state.message}</p> : null}

        {state.type === "prompt" ? (
          <div className="mt-4">
            <label className="sr-only" htmlFor={`${titleId}-input`}>
              {state.placeholder ?? "Enter value"}
            </label>
            {state.inputType === "password" ? (
              <PasswordInput
                ref={inputRef}
                id={`${titleId}-input`}
                value={promptValue}
                onChange={(e) => onPromptValueChange(e.target.value)}
                placeholder={state.placeholder}
                autoComplete="new-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConfirm();
                }}
              />
            ) : (
              <input
                ref={inputRef}
                id={`${titleId}-input`}
                value={promptValue}
                onChange={(e) => onPromptValueChange(e.target.value)}
                placeholder={state.placeholder}
                className="ui-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConfirm();
                }}
              />
            )}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="ui-button-secondary min-h-[var(--touch-min)] px-5">
            {state.cancelLabel ?? "Cancel"}
          </button>
          <button type="button" onClick={onConfirm} className={`${styles.confirmBtn} min-h-[var(--touch-min)] px-5`}>
            {state.confirmLabel ?? (state.type === "prompt" ? "Save" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
