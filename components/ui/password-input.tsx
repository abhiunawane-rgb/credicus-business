"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FieldInput } from "@/components/ui/field";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  invalid?: boolean;
  variant?: "light" | "dark";
};

/** Password field with show/hide eye toggle */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { invalid, variant = "light", className = "", disabled, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FieldInput
        {...props}
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        invalid={invalid}
        variant={variant}
        disabled={disabled}
        className={`pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        disabled={disabled}
        className="absolute right-1 top-1/2 inline-flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] -translate-y-1/2 items-center justify-center rounded-lg text-credicus-ink-muted transition-colors hover:bg-credicus-primary-soft hover:text-credicus-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credicus-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
});

export default PasswordInput;
