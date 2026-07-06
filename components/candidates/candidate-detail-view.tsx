"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import CandidateCard from "@/components/candidates/candidate-card";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import type { CandidateRecord, CandidateStage, CommentRecord } from "@/lib/candidate-types";
import { actionMessages } from "@/lib/action-messages";

type Props = {
  candidate: CandidateRecord;
  initialComments: CommentRecord[];
  currentUserEmail: string;
  readOnly?: boolean;
  backHref?: string;
};

export default function CandidateDetailView({
  candidate: initial,
  initialComments,
  currentUserEmail,
  readOnly,
  backHref = "/dashboard/recruiter/candidates",
}: Props) {
  const router = useRouter();
  const { confirm, notify } = useActionFeedback();
  const [candidate, setCandidate] = useState(initial);
  const [comments, setComments] = useState(initialComments);

  async function onStageChange(stage: CandidateStage, rejectionReason?: string) {
    const res = await fetch(`/api/candidates/${candidate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status: stage, rejection_reason: rejectionReason }),
    });
    const body = (await res.json()) as { data?: CandidateRecord };
    if (body.data) {
      setCandidate(body.data);
      notify.success(actionMessages.updated, "Stage updated");
    }
  }

  async function onAddComment(content: string) {
    const res = await fetch(`/api/candidates/${candidate.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content }),
    });
    const body = (await res.json()) as { data?: CommentRecord };
    if (body.data) {
      setComments((prev) => [body.data!, ...prev]);
      notify.success("Comment added successfully.");
    }
  }

  async function onDelete() {
    const approved = await confirm({
      title: actionMessages.deleteTitle(candidate.name),
      message: actionMessages.deleteMessage,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!approved) return;
    const res = await fetch(`/api/candidates/${candidate.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      notify.success(actionMessages.deleted(candidate.name));
      router.push(backHref);
      router.refresh();
    }
  }

  return (
    <section className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-credicus-ink-secondary hover:text-credicus-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Link>
      <CandidateCard
        candidate={candidate}
        comments={comments}
        currentUserEmail={currentUserEmail}
        readOnly={readOnly}
        onStageChange={onStageChange}
        onAddComment={onAddComment}
        onDelete={readOnly ? undefined : onDelete}
        commentsExpanded
      />
    </section>
  );
}
