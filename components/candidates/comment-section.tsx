"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import type { CommentRecord } from "@/lib/candidate-types";

type CommentSectionProps = {
  candidateId: string;
  comments: CommentRecord[];
  currentUserEmail?: string;
  onAddComment: (content: string) => Promise<void>;
  variant?: "light" | "dark";
  defaultExpanded?: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CommentSection({
  comments,
  currentUserEmail,
  onAddComment,
  variant = "light",
  defaultExpanded = false,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isDark = variant === "dark";

  async function submit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onAddComment(content.trim());
      setContent("");
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-credicus-ink">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-3 inline-flex min-h-[2.25rem] items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-credicus-primary transition-colors hover:bg-credicus-primary-soft"
      >
        <MessageSquare className={`h-4 w-4 transition-transform ${expanded ? "scale-110" : ""}`} />
        {comments.length} comment{comments.length === 1 ? "" : "s"}
        <span className="text-xs opacity-70">{expanded ? "· Hide" : "· Show"}</span>
      </button>

      {expanded ? (
        <div className="animate-dropdown-in space-y-4 rounded-xl border border-credicus-line-subtle bg-credicus-surface p-4">
          <div className="flex gap-3">
            <div className="ui-avatar h-9 w-9 text-sm">
              {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="min-w-0 flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="Type your comment here"
                className="ui-input"
              />
              <button
                type="button"
                disabled={loading || !content.trim()}
                onClick={submit}
                className="ui-button-primary mt-2 text-xs"
              >
                {loading ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {comments.length === 0 ? (
              <li className={`text-sm ${isDark ? "text-credicus-gray" : "text-credicus-ink-muted"}`}>
                No comments yet. Add the first log entry.
              </li>
            ) : (
              comments.map((comment, index) => (
                <li
                  key={comment.id}
                  className="flex gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="ui-avatar h-8 w-8 text-xs">
                    {initials(comment.author_name)}
                  </div>
                  <div>
                    <p className="text-sm text-credicus-ink">{comment.content}</p>
                    <p className={`mt-0.5 text-xs ${isDark ? "text-credicus-gray" : "text-credicus-ink-muted"}`}>
                      by {comment.author_email === currentUserEmail ? "You" : comment.author_name} ·{" "}
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
