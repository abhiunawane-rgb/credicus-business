"use client";

import { Check, ChevronDown, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import type { CandidateStage } from "@/lib/candidate-types";
import { STAGE_LABELS, STAGE_QUICK_ACTIONS } from "@/lib/candidate-types";

type StageActionsProps = {
  currentStage: CandidateStage;
  onStageChange: (stage: CandidateStage, rejectionReason?: string) => void;
  disabled?: boolean;
  variant?: "light" | "dark";
};

const dropdownStages: CandidateStage[] = [
  "shortlisted",
  "maybe",
  "interviewed",
  "offered",
  "hired",
  "rejected",
  "hold",
];

export default function StageActions({
  currentStage,
  onStageChange,
  disabled,
  variant = "light",
}: StageActionsProps) {
  const [open, setOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [justChanged, setJustChanged] = useState<CandidateStage | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";
  const { prompt } = useActionFeedback();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(stage: CandidateStage, reason?: string) {
    setJustChanged(stage);
    onStageChange(stage, reason);
    setTimeout(() => setJustChanged(null), 600);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGE_QUICK_ACTIONS.map((action) => {
        const isActive = currentStage === action.key;
        const justPicked = justChanged === action.key;
        const styles =
          action.color === "yellow"
            ? "ui-stage-shortlist"
            : action.color === "gray"
              ? isDark
                ? "ui-stage-maybe-dark"
                : "ui-stage-maybe"
              : "ui-stage-reject";
        const Icon =
          action.key === "shortlisted" ? Check : action.key === "maybe" ? MessageCircle : X;

        return (
          <button
            key={action.key}
            type="button"
            disabled={disabled}
            onClick={() => handleChange(action.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${styles} ${
              isActive ? "shadow-sm ring-1 ring-credicus-yellow/40" : "hover:-translate-y-0.5 hover:shadow-md"
            } ${justPicked ? "animate-scale-in ring-2 ring-credicus-yellow/50" : ""}`}
          >
            <Icon className={`h-3.5 w-3.5 transition-transform ${justPicked ? "scale-125" : ""}`} />
            {action.label}
          </button>
        );
      })}

      <div className={`relative ${open ? "z-50" : ""}`} ref={ref}>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex min-h-[2.25rem] items-center gap-1 rounded-full border border-credicus-line-subtle bg-white px-3.5 py-1.5 text-xs font-medium text-credicus-ink-secondary transition-all duration-200 hover:border-credicus-primary hover:shadow-sm active:scale-95 disabled:opacity-50 ${
            open ? "border-credicus-primary shadow-glow" : ""
          }`}
        >
          {STAGE_LABELS[currentStage]}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label="Change candidate stage"
            className={`absolute bottom-full right-0 z-50 mb-2 max-h-64 w-52 overflow-y-auto animate-dropdown-in rounded-xl border p-2 shadow-brand-lg ${
              isDark ? "border-credicus-line-default bg-credicus-card" : "border-credicus-line-subtle bg-white"
            }`}
          >
            <p className={`px-2 py-1 text-xs font-semibold ${isDark ? "text-credicus-gray" : "text-credicus-ink-muted"}`}>
              Change stage
            </p>
            {dropdownStages.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={async () => {
                  if (stage === "rejected") {
                    const reason =
                      (await prompt({
                        title: "Rejection reason",
                        message: "Add an optional note for the team.",
                        placeholder: "Enter reason (optional)",
                        confirmLabel: "Reject",
                        variant: "warning",
                      })) ?? "";
                    handleChange(stage, reason);
                  } else {
                    handleChange(stage);
                  }
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-all duration-150 active:scale-[0.98] ${
                  isDark ? "hover:bg-white/5" : "hover:bg-credicus-surface"
                } ${
                  currentStage === stage
                    ? "bg-credicus-yellow/10 font-semibold text-credicus-ink"
                    : "text-credicus-ink-secondary"
                }`}
              >
                {STAGE_LABELS[stage]}
                {currentStage === stage ? <Check className="h-4 w-4 text-credicus-yellow" /> : null}
              </button>
            ))}
            {currentStage === "rejected" ? (
              <div className={`mt-2 border-t px-2 pt-2 ${isDark ? "border-credicus-line-default" : "border-gray-100"}`}>
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason"
                  className={isDark ? "ui-input-dark text-xs" : "ui-input text-xs"}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
