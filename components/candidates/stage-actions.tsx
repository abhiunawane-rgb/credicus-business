"use client";

import { Check, ChevronDown, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  variant = "dark",
}: StageActionsProps) {
  const [open, setOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [justChanged, setJustChanged] = useState<CandidateStage | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

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

      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-credicus-yellow hover:shadow-md active:scale-95 disabled:opacity-50 ${
            isDark
              ? "border-credicus-border bg-credicus-black text-gray-200"
              : "border-gray-300 bg-white text-gray-700"
          } ${open ? "border-credicus-yellow shadow-glow" : ""}`}
        >
          {STAGE_LABELS[currentStage]}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div
            className={`absolute right-0 z-30 mt-2 w-52 animate-dropdown-in rounded-xl border p-2 shadow-brand-lg ${
              isDark ? "border-credicus-border bg-credicus-card" : "border-gray-200 bg-white"
            }`}
          >
            <p className={`px-2 py-1 text-xs font-semibold ${isDark ? "text-credicus-gray" : "text-gray-500"}`}>
              Change stage
            </p>
            {dropdownStages.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => {
                  if (stage === "rejected") {
                    const reason = window.prompt("Rejection reason (optional):") ?? "";
                    handleChange(stage, reason);
                  } else {
                    handleChange(stage);
                  }
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-all duration-150 active:scale-[0.98] ${
                  isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                } ${
                  currentStage === stage
                    ? "bg-credicus-yellow/10 font-semibold text-credicus-yellow"
                    : isDark
                      ? "text-gray-200"
                      : "text-gray-700"
                }`}
              >
                {STAGE_LABELS[stage]}
                {currentStage === stage ? <Check className="h-4 w-4 text-credicus-yellow" /> : null}
              </button>
            ))}
            {currentStage === "rejected" ? (
              <div className={`mt-2 border-t px-2 pt-2 ${isDark ? "border-credicus-border" : "border-gray-100"}`}>
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
