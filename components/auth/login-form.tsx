"use client";

import { useEffect, useState, type FormEvent } from "react";
import DemoAccountPicker from "@/components/auth/demo-account-picker";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { Field, FieldInput } from "@/components/ui/field";
import { type DemoAccount } from "@/lib/demo-accounts";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    void fetch("/api/auth/session", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean; redirectTo?: string }) => {
        if (data.authenticated && data.redirectTo) {
          window.location.assign(data.redirectTo);
        }
      })
      .catch(() => {
        // Ignore — show login form
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function performLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      let result: { error?: string; redirectTo?: string } = {};
      try {
        result = (await response.json()) as { error?: string; redirectTo?: string };
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }

      if (!response.ok || !result.redirectTo) {
        setError(result.error ?? "Incorrect email or password. Check your details and try again.");
        return;
      }

      setSuccessMessage("Signed in successfully. Opening your dashboard...");
      window.location.assign(result.redirectTo);
    } catch {
      setError("Unable to reach the login service. Check your connection and refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performLogin(email.trim(), password);
  }

  async function onDemoSelect(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
    await performLogin(account.email, account.password);
  }

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-2 text-sm text-credicus-gray">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-credicus-gray/30 border-t-credicus-black" />
          Checking your session...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <Field
          id="email"
          label="Work email"
          hint="Use the email address assigned by your administrator."
          required
        >
          <FieldInput
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            disabled={isLoading}
            invalid={Boolean(error)}
          />
        </Field>

        <Field id="password" label="Password" required>
          <div className="relative">
            <FieldInput
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-24"
              placeholder="Enter your password"
              disabled={isLoading}
              invalid={Boolean(error)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 inline-flex min-h-[2.25rem] min-w-[2.25rem] -translate-y-1/2 items-center justify-center rounded-md px-3 text-xs font-medium text-credicus-gray transition hover:bg-gray-100 hover:text-gray-900"
              disabled={isLoading}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        {error ? (
          <Alert variant="error" title="Sign-in failed" live="assertive">
            {error}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" live="polite">
            {successMessage}
          </Alert>
        ) : null}

        <Button type="submit" className="w-full" loading={isLoading} loadingLabel="Signing in...">
          Sign in
        </Button>
      </form>

      <div className="relative" role="separator" aria-label="Demo account options">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-white px-3 text-credicus-gray">Or try a demo account</span>
        </div>
      </div>

      <DemoAccountPicker activeEmail={email} isLoading={isLoading} onSelect={onDemoSelect} />
    </div>
  );
}
