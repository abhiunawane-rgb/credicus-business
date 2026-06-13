import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ id, label, hint, error, required, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field-group">
      <label htmlFor={id} className="ui-label">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="ui-field-hint">
          {hint}
        </p>
      ) : null}
      <div aria-describedby={describedBy}>{children}</div>
      {error ? (
        <p id={errorId} className="ui-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  variant?: "light" | "dark";
};

export function FieldInput({ invalid, variant = "light", className = "", ...props }: FieldInputProps) {
  const base = variant === "dark" ? "ui-input-dark" : "ui-input";
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${base} ${invalid ? "border-red-400 focus:border-red-400 focus:ring-red-400/30" : ""} ${className}`}
    />
  );
}

type FieldTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  variant?: "light" | "dark";
};

export function FieldTextarea({ invalid, variant = "light", className = "", ...props }: FieldTextareaProps) {
  const base = variant === "dark" ? "ui-input-dark" : "ui-input";
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${base} min-h-[7rem] resize-y ${invalid ? "border-red-400 focus:border-red-400 focus:ring-red-400/30" : ""} ${className}`}
    />
  );
}
