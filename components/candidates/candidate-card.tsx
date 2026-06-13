"use client";

import {
  Briefcase,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import CommentSection from "@/components/candidates/comment-section";
import StageActions from "@/components/candidates/stage-actions";
import type { CandidateRecord, CandidateStage, CommentRecord } from "@/lib/candidate-types";
import { STAGE_LABELS } from "@/lib/candidate-types";

type CandidateCardProps = {
  candidate: CandidateRecord;
  comments: CommentRecord[];
  currentUserEmail?: string;
  readOnly?: boolean;
  commentsExpanded?: boolean;
  variant?: "light" | "dark";
  onStageChange: (stage: CandidateStage, rejectionReason?: string) => Promise<void>;
  onAddComment: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatExperience(years: number) {
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  if (y === 0) return `${m}m`;
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export default function CandidateCard({
  candidate,
  comments,
  currentUserEmail,
  readOnly = false,
  commentsExpanded = false,
  variant = "dark",
  onStageChange,
  onAddComment,
  onDelete,
}: CandidateCardProps) {
  const [busy, setBusy] = useState(false);
  const isDark = variant === "dark";

  async function handleStage(stage: CandidateStage, rejectionReason?: string) {
    if (readOnly) return;
    setBusy(true);
    try {
      await onStageChange(stage, rejectionReason);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={`group/card overflow-hidden hover:-translate-y-0.5 hover:border-credicus-yellow/40 hover:shadow-glow ${
        isDark ? "ui-panel-dark" : "ui-panel-light"
      }`}
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto_auto]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <input
              type="checkbox"
              className="mt-1.5 accent-credicus-yellow"
              aria-label={`Select ${candidate.name}`}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {candidate.name}
                </h3>
                {candidate.status === "shortlisted" ? (
                  <span className="ui-badge-success">Recommended</span>
                ) : null}
              </div>
              <div className={`mt-1 flex flex-wrap gap-3 text-xs ${isDark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-credicus-yellow" />
                  {formatExperience(candidate.experience)}
                </span>
                {candidate.salary ? (
                  <span className="inline-flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-credicus-yellow" />
                    {candidate.salary}
                  </span>
                ) : null}
                {candidate.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-credicus-yellow" />
                    {candidate.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="grid gap-1 text-sm">
            {candidate.current_company ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Previous</dt>
                <dd className={isDark ? "text-gray-200" : "text-gray-800"}>{candidate.current_company}</dd>
              </div>
            ) : null}
            {candidate.education ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Education</dt>
                <dd className={isDark ? "text-gray-200" : "text-gray-800"}>{candidate.education}</dd>
              </div>
            ) : null}
            {candidate.preferred_locations.length > 0 ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Pref. locations</dt>
                <dd className={isDark ? "text-gray-200" : "text-gray-800"}>
                  {candidate.preferred_locations.join(", ")}
                </dd>
              </div>
            ) : null}
            {candidate.skills.length > 0 ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Key skills</dt>
                <dd className={isDark ? "text-gray-200" : "text-gray-800"}>{candidate.skills.join(" | ")}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div
          className={`flex flex-col items-center gap-3 px-2 lg:border-l lg:pl-4 ${
            isDark ? "border-credicus-border" : "border-gray-100"
          }`}
        >
          <div className="ui-avatar h-14 w-14 text-lg transition-transform duration-300 group-hover/card:scale-105">
            {initials(candidate.name)}
          </div>
          <p className={`max-w-[180px] text-center text-xs ${isDark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
            {candidate.process ? `${candidate.process} · ` : ""}
            Stage:{" "}
            <span className={`font-medium ${isDark ? "text-credicus-yellow" : "text-credicus-black"}`}>
              {STAGE_LABELS[candidate.status]}
            </span>
          </p>
          <div
            className={`flex overflow-hidden rounded-full border text-xs shadow-sm ${
              isDark ? "border-credicus-border" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors active:scale-95 ${
                isDark
                  ? "bg-credicus-yellow/15 text-credicus-yellow hover:bg-credicus-yellow/25"
                  : "bg-credicus-yellow/15 text-credicus-black hover:bg-credicus-yellow/25"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Contact
            </button>
            <button
              type="button"
              className={`border-l px-3 py-1.5 transition-colors active:scale-95 ${
                isDark
                  ? "border-credicus-border text-credicus-gray-light hover:bg-white/5"
                  : "border-gray-200 text-credicus-gray hover:bg-gray-50"
              }`}
            >
              Status
            </button>
          </div>
          <button
            type="button"
            className="ui-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs"
          >
            <Phone className="h-3.5 w-3.5" />
            Call from app →
          </button>
        </div>

        <div
          className={`flex flex-row gap-2 lg:flex-col lg:border-l lg:pl-3 ${
            isDark ? "border-credicus-border" : "border-gray-100"
          }`}
        >
          <button type="button" className="ui-icon-btn" aria-label="Email">
            <Mail className="h-4 w-4" />
          </button>
          <button type="button" className="ui-icon-btn" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </button>
          {!readOnly && onDelete ? (
            <button type="button" onClick={onDelete} className="ui-icon-btn-danger" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={`border-t px-4 py-3 ${isDark ? "border-credicus-border bg-credicus-black/40" : "border-gray-100 bg-gray-50/80"}`}
      >
        <CommentSection
          candidateId={candidate.id}
          comments={comments}
          currentUserEmail={currentUserEmail}
          onAddComment={onAddComment}
          defaultExpanded={commentsExpanded}
          variant={variant}
        />
      </div>

      {!readOnly ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 ${
            isDark ? "border-credicus-border" : "border-gray-100"
          }`}
        >
          <p className={`text-xs ${isDark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
            Source: {candidate.source} {candidate.portal_id ? `· ${candidate.portal_id}` : ""}
          </p>
          <StageActions currentStage={candidate.status} onStageChange={handleStage} disabled={busy} variant={variant} />
        </div>
      ) : (
        <div
          className={`border-t px-4 py-2.5 text-xs ${
            isDark ? "ui-alert-info-dark border-x-0 border-b-0" : "ui-alert-info border-x-0 border-b-0"
          }`}
        >
          Read-only talent pool view — request Team Leader to update records.
        </div>
      )}
    </article>
  );
}
