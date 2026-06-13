"use client";

import { AlertTriangle, LayoutDashboard, RotateCcw } from "lucide-react";
import Button from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

type DashboardErrorProps = {
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-red-100">This dashboard view failed to load</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-100/90">
            A temporary error interrupted this page. Retry to reload the view, or go back to your dashboard home.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="primary" onClick={reset} className="gap-2 bg-white text-slate-900 hover:bg-gray-100">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Retry
            </Button>
            <ButtonLink href="/dashboard" variant="ghost" className="gap-2">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Dashboard home
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
