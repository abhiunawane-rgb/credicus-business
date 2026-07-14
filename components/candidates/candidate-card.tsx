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
import Link from "next/link";
import { useState } from "react";
import CommentSection from "@/components/candidates/comment-section";
import StageActions from "@/components/candidates/stage-actions";
import type { CandidateRecord, CandidateStage, CommentRecord } from "@/lib/candidate-types";
import { displayCandidateName, STAGE_LABELS } from "@/lib/candidate-types";
import { displayNameForEmail, emailsMatch } from "@/lib/demo-accounts";

type CandidateCardProps = {
  candidate: CandidateRecord;
  comments: CommentRecord[];
  currentUserEmail?: string;
  readOnly?: boolean;
  commentsExpanded?: boolean;
  showAddedBy?: boolean;
  addedByName?: string;
  enableTransferRequest?: boolean;
  variant?: "light" | "dark";
  onStageChange: (stage: CandidateStage, rejectionReason?: string) => Promise<void>;
  onAddComment: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onRequestTransfer?: () => Promise<void>;
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
  showAddedBy = false,
  addedByName,
  enableTransferRequest = false,
  variant = "light",
  onStageChange,
  onAddComment,
  onDelete,
  onRequestTransfer,
}: CandidateCardProps) {
  const [busy, setBusy] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const isDark = variant === "dark";
  const displayName = displayCandidateName(candidate);

  async function handleStage(stage: CandidateStage, rejectionReason?: string) {
    if (readOnly) return;
    setBusy(true);
    try {
      await onStageChange(stage, rejectionReason);
    } finally {
      setBusy(false);
    }
  }

  async function handleTransferRequest() {
    if (!onRequestTransfer || myPendingRequest || pendingTransfer || transferBusy) return;
    setTransferBusy(true);
    try {
      await onRequestTransfer();
    } finally {
      setTransferBusy(false);
    }
  }

  const isOwnCandidate = emailsMatch(currentUserEmail, candidate.created_by);
  const pendingTransfer = candidate.transfer_pending ?? null;
  const myPendingRequest = Boolean(
    pendingTransfer && emailsMatch(pendingTransfer.requested_by, currentUserEmail),
  );
  const needsMyApproval = Boolean(isOwnCandidate && pendingTransfer);

  return (
    <article
      className={`group/card relative overflow-visible hover:-translate-y-0.5 hover:border-credicus-yellow/40 hover:shadow-glow ${
        isDark ? "ui-panel-dark" : "ui-panel-light"
      }`}
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto_auto]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <input
              type="checkbox"
              className="mt-1.5 accent-credicus-yellow"
              aria-label={`Select ${displayName}`}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-credicus-ink">
                  {displayName}
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
            {candidate.aadhar_no ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Aadhar No.</dt>
                <dd className={isDark ? "text-gray-200" : "text-gray-800"}>{candidate.aadhar_no}</dd>
              </div>
            ) : null}
            {showAddedBy ? (
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <dt className={isDark ? "text-credicus-gray" : "text-credicus-gray"}>Added by</dt>
                <dd className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {addedByName ||
                    (candidate.created_by ? displayNameForEmail(candidate.created_by) : "Unknown")}
                </dd>
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
            isDark ? "border-credicus-line-default" : "border-gray-100"
          }`}
        >
          <div className="ui-avatar h-14 w-14 text-lg transition-transform duration-300 group-hover/card:scale-105">
            {initials(displayName)}
          </div>
          <p className={`max-w-[180px] text-center text-xs ${isDark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
            {candidate.process ? `${candidate.process} · ` : ""}
            Stage:{" "}
            <span className="font-medium text-credicus-primary">
              {STAGE_LABELS[candidate.status]}
            </span>
          </p>
          <div
            className={`flex overflow-hidden rounded-full border text-xs shadow-sm ${
              isDark ? "border-credicus-line-default" : "border-credicus-line-subtle"
            }`}
          >
            <a
              href={`tel:${candidate.mobile}`}
              className={`inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors active:scale-95 ${
                isDark
                  ? "bg-credicus-yellow/15 text-credicus-yellow hover:bg-credicus-yellow/25"
                  : "bg-credicus-yellow-soft text-credicus-ink hover:bg-credicus-yellow-muted"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              {candidate.mobile}
            </a>
          </div>
        </div>

        <div
          className={`flex flex-row gap-2 lg:flex-col lg:border-l lg:pl-3 ${
            isDark ? "border-credicus-line-default" : "border-gray-100"
          }`}
        >
          {candidate.email ? (
            <a
              href={`mailto:${candidate.email}`}
              className="ui-icon-btn inline-flex"
              aria-label={`Email ${displayName}`}
            >
              <Mail className="h-4 w-4" />
            </a>
          ) : (
            <span className="ui-icon-btn inline-flex opacity-40" aria-hidden>
              <Mail className="h-4 w-4" />
            </span>
          )}
          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Share"
            onClick={() => {
              const url = `${window.location.origin}/dashboard/recruiter/candidates/${candidate.id}`;
              void navigator.clipboard?.writeText(url);
            }}
          >
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
        className="border-t border-credicus-line-subtle bg-credicus-surface/80 px-4 py-3"
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
          className={`relative z-10 flex flex-wrap items-center justify-between gap-3 overflow-visible border-t px-4 py-3 ${
            isDark ? "border-credicus-line-default" : "border-gray-100"
          }`}
        >
          <p className={`text-xs ${isDark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
            Source: {candidate.source} {candidate.portal_id ? `· ${candidate.portal_id}` : ""}
          </p>
          <StageActions currentStage={candidate.status} onStageChange={handleStage} disabled={busy} variant={variant} />
        </div>
      ) : (
        <div
          className={`border-t px-4 py-3 ${
            isDark ? "ui-alert-info-dark border-x-0 border-b-0" : "ui-alert-info border-x-0 border-b-0"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs">
              {enableTransferRequest
                ? "Shared talent pool — request transfer to process this candidate in your list after owner approval."
                : "Read-only talent pool view."}
            </p>
            {enableTransferRequest && !isOwnCandidate ? (
              myPendingRequest ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  Transfer pending approval
                </span>
              ) : pendingTransfer ? (
                <span className="rounded-full border border-credicus-line-subtle bg-credicus-surface px-3 py-1.5 text-xs font-medium text-credicus-ink-secondary">
                  Transfer already requested
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleTransferRequest()}
                  disabled={transferBusy}
                  className="ui-button-primary px-3 py-1.5 text-xs"
                >
                  {transferBusy ? "Requesting..." : "Request transfer"}
                </button>
              )
            ) : null}
            {needsMyApproval ? (
              <Link
                href="/dashboard/recruiter/transfers"
                className="rounded-full border border-credicus-primary/40 bg-credicus-yellow-soft px-3 py-1.5 text-xs font-medium text-credicus-ink hover:bg-credicus-primary/20"
              >
                Approve transfer request
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
