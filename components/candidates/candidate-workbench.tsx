"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CandidateCard from "@/components/candidates/candidate-card";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import EmptyState from "@/components/ui/empty-state";
import type { CandidateRecord, CandidateStage, CommentRecord } from "@/lib/candidate-types";
import { displayCandidateName, STAGE_LABELS } from "@/lib/candidate-types";
import { actionMessages } from "@/lib/action-messages";
import { matchesSearch } from "@/lib/list-filters";

type CandidateWorkbenchProps = {
  readOnly?: boolean;
  currentUserEmail?: string;
};

export default function CandidateWorkbench({ readOnly = false, currentUserEmail }: CandidateWorkbenchProps) {
  const { confirm, notify } = useActionFeedback();
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentRecord[]>>({});
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/candidates", { credentials: "same-origin" });
      const payload = (await response.json()) as { data?: CandidateRecord[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load candidates.");
        return;
      }
      const list = payload.data ?? [];
      setCandidates(list);

      const commentEntries = await Promise.all(
        list.map(async (c) => {
          const res = await fetch(`/api/candidates/${c.id}/comments`, { credentials: "same-origin" });
          const body = (await res.json()) as { data?: CommentRecord[] };
          return [c.id, body.data ?? []] as const;
        }),
      );
      setCommentsMap(Object.fromEntries(commentEntries));
    } catch {
      setError("Unable to load candidates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const name = displayCandidateName(candidate);
      const matchesStage = stageFilter === "all" || candidate.status === stageFilter;
      const matchesText = matchesSearch(search, [
        name,
        candidate.mobile,
        candidate.email,
        candidate.location,
        candidate.skills?.join(" "),
      ]);
      return matchesStage && matchesText;
    });
  }, [candidates, search, stageFilter]);

  async function handleStageChange(id: string, stage: CandidateStage, rejectionReason?: string) {
    const response = await fetch(`/api/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        status: stage,
        rejection_reason: rejectionReason ?? undefined,
      }),
    });
    if (response.ok) {
      notify.success(actionMessages.updated, "Stage updated");
      void loadCandidates();
    }
  }

  async function handleAddComment(id: string, content: string) {
    const response = await fetch(`/api/candidates/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content }),
    });
    if (response.ok) {
      const body = (await response.json()) as { data?: CommentRecord };
      if (body.data) {
        setCommentsMap((prev) => ({
          ...prev,
          [id]: [body.data!, ...(prev[id] ?? [])],
        }));
        notify.success("Comment added successfully.");
      }
    }
  }

  async function handleDelete(id: string, name: string) {
    const approved = await confirm({
      title: actionMessages.deleteTitle(name),
      message: actionMessages.deleteMessage,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!approved) return;
    await fetch(`/api/candidates/${id}`, { method: "DELETE", credentials: "same-origin" });
    notify.success(actionMessages.deleted(name));
    void loadCandidates();
  }

  const stageOptions = [
    { value: "all", label: "All stages" },
    ...Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="space-y-4">
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name, mobile, email, or skills"
        onRefresh={() => void loadCandidates()}
        refreshing={loading}
        filters={[
          {
            id: "stage",
            label: "Stage",
            value: stageFilter,
            onChange: setStageFilter,
            options: stageOptions,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStageFilter("all");
        }}
        resultCount={filteredCandidates.length}
      />

      {loading ? (
        <p className="ui-loading-inline" role="status" aria-live="polite">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-credicus-yellow/30 border-t-credicus-yellow" />
          Loading candidates...
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="ui-alert-error">
          {error}
          <button type="button" onClick={() => void loadCandidates()} className="mt-2 ui-button-secondary ui-button-sm">
            Try again
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {!loading && !error && filteredCandidates.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title={search || stageFilter !== "all" ? "No matches found" : "No candidates yet"}
            description={
              search || stageFilter !== "all"
                ? "Try different filters or clear them to see all candidates."
                : "Add your first candidate to start tracking your hiring pipeline."
            }
            action={
              search || stageFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStageFilter("all");
                  }}
                  className="ui-button-secondary"
                >
                  Clear filters
                </button>
              ) : (
                <Link href="/dashboard/recruiter/candidates/new" className="ui-button-primary">
                  Add candidate
                </Link>
              )
            }
          />
        ) : null}

        {filteredCandidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
          >
            <CandidateCard
              candidate={candidate}
              comments={commentsMap[candidate.id] ?? []}
              currentUserEmail={currentUserEmail}
              readOnly={readOnly}
              variant="light"
              onStageChange={(stage, reason) => handleStageChange(candidate.id, stage, reason)}
              onAddComment={(content) => handleAddComment(candidate.id, content)}
              onDelete={readOnly ? undefined : () => handleDelete(candidate.id, displayCandidateName(candidate))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
