"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CandidateCard from "@/components/candidates/candidate-card";
import type { CandidateRecord, CandidateStage, CommentRecord } from "@/lib/candidate-types";

type CandidateWorkbenchProps = {
  readOnly?: boolean;
  currentUserEmail?: string;
};

export default function CandidateWorkbench({ readOnly = false, currentUserEmail }: CandidateWorkbenchProps) {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentRecord[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCandidates = useCallback(async (q?: string) => {
    setLoading(true);
    setError("");
    try {
      const url = q?.trim() ? `/api/candidates?search=${encodeURIComponent(q)}` : "/api/candidates";
      const response = await fetch(url, { credentials: "same-origin" });
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
    if (response.ok) void loadCandidates(search);
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
      }
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this candidate?")) return;
    await fetch(`/api/candidates/${id}`, { method: "DELETE", credentials: "same-origin" });
    void loadCandidates(search);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-gray" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void loadCandidates(search);
          }}
          placeholder="Search candidates by name, mobile, email, skills..."
          className="ui-input-dark pl-10"
        />
      </div>

      {loading ? <p className="text-sm text-credicus-gray">Loading candidates...</p> : null}
      {error ? <p className="ui-alert-error-dark">{error}</p> : null}

      <div className="space-y-4">
        {!loading && candidates.length === 0 ? (
          <p className="rounded-xl border border-credicus-border bg-credicus-card p-6 text-sm text-credicus-gray">
            No candidates found. Add a new candidate to get started.
          </p>
        ) : null}

        {candidates.map((candidate, index) => (
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
            variant="dark"
            onStageChange={(stage, reason) => handleStageChange(candidate.id, stage, reason)}
            onAddComment={(content) => handleAddComment(candidate.id, content)}
            onDelete={readOnly ? undefined : () => handleDelete(candidate.id)}
          />
          </div>
        ))}
      </div>
    </div>
  );
}
