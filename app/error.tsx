"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Button from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

type RootErrorProps = {
  reset: () => void;
};

export default function RootError({ reset }: RootErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="ui-card w-full max-w-lg p-6 text-center" role="alert">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This page could not load. You can try again or return to the home page — your data is safe.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
          <ButtonLink href="/" variant="secondary" className="gap-2">
            <Home className="h-4 w-4" aria-hidden />
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
